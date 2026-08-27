import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    onAuthStateChanged,
    signOut as firebaseSignOut,
    GoogleAuthProvider,
    signInWithCredential,
    signInWithPopup,
    User as FirebaseUser,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../services/firebase';

WebBrowser.maybeCompleteAuthSession();

export interface AppUser {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    isAnonymous: boolean;
}

interface AuthContextType {
    user: AppUser | null;
    loading: boolean;
    isConfigured: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const USER_STORAGE_KEY = '@combistore_user';
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);

    const [request, response, promptAsync] = Google.useAuthRequest({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '1234567890-web.apps.googleusercontent.com',
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    });

    // Load initial user state (Firebase listener or AsyncStorage fallback)
    useEffect(() => {
        let unsubscribe: (() => void) | undefined;

        const initAuth = async () => {
            try {
                if (auth && isFirebaseConfigured) {
                    unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
                        if (fbUser) {
                            const appUser: AppUser = {
                                uid: fbUser.uid,
                                displayName: fbUser.displayName || 'Utilisateur',
                                email: fbUser.email,
                                photoURL: fbUser.photoURL,
                                isAnonymous: fbUser.isAnonymous,
                            };
                            setUser(appUser);
                            AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(appUser));
                        } else {
                            setUser(null);
                            AsyncStorage.removeItem(USER_STORAGE_KEY);
                        }
                        setLoading(false);
                    });
                } else {
                    // Fallback to local stored session
                    const localUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
                    if (localUser) {
                        setUser(JSON.parse(localUser));
                    }
                    setLoading(false);
                }
            } catch (err) {
                console.error('[AuthContext] Init error:', err);
                setLoading(false);
            }
        };

        initAuth();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    // Handle Google OAuth response on mobile
    useEffect(() => {
        const handleGoogleResponse = async () => {
            if (response?.type === 'success') {
                const { id_token, access_token } = response.params;

                try {
                    setLoading(true);
                    if (auth && isFirebaseConfigured && id_token) {
                        // Sign in to Firebase with Google Credential
                        const credential = GoogleAuthProvider.credential(id_token);
                        await signInWithCredential(auth, credential);
                    } else if (access_token) {
                        // Fetch user info directly from Google API if Firebase is in offline/mock mode
                        const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
                            headers: { Authorization: `Bearer ${access_token}` },
                        });
                        const googleUser = await userInfoResponse.json();

                        const appUser: AppUser = {
                            uid: googleUser.id || 'google_' + Date.now(),
                            displayName: googleUser.name || googleUser.given_name || 'Utilisateur Google',
                            email: googleUser.email || null,
                            photoURL: googleUser.picture || null,
                            isAnonymous: false,
                        };

                        setUser(appUser);
                        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(appUser));
                    }
                } catch (error) {
                    console.error('[AuthContext] Google sign-in error:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        handleGoogleResponse();
    }, [response]);

    const signInWithGoogle = useCallback(async () => {
        try {
            setLoading(true);
            // Sur le Web, utiliser directement le popup natif Firebase pour éviter les erreurs d'URI de redirection
            if (Platform.OS === 'web' && auth && isFirebaseConfigured) {
                const provider = new GoogleAuthProvider();
                provider.setCustomParameters({ prompt: 'select_account' });
                await signInWithPopup(auth, provider);
            } else {
                await promptAsync();
            }
        } catch (error: any) {
            console.error('[AuthContext] Prompt Google error:', error);
            // Si le popup web est bloqué ou échoue, fallback sur promptAsync
            if (Platform.OS === 'web' && error?.code !== 'auth/popup-closed-by-user') {
                try {
                    await promptAsync();
                } catch (fallbackError) {
                    console.error('[AuthContext] Fallback promptAsync error:', fallbackError);
                }
            }
        } finally {
            setLoading(false);
        }
    }, [promptAsync]);

    const signOut = useCallback(async () => {
        try {
            setLoading(true);
            if (auth && isFirebaseConfigured) {
                await firebaseSignOut(auth);
            }
            await AsyncStorage.removeItem(USER_STORAGE_KEY);
            setUser(null);
        } catch (error) {
            console.error('[AuthContext] SignOut error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isConfigured: isFirebaseConfigured,
                signInWithGoogle,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
