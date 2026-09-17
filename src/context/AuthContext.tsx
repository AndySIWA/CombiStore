import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Platform } from 'react-native';
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

let GoogleOneTapSignIn: any = null;
let isSuccessResponse: any = null;
let isNoSavedCredentialFoundResponse: any = null;

if (Platform.OS !== 'web') {
    try {
        const nitroGoogle = require('react-native-nitro-google-signin');
        GoogleOneTapSignIn = nitroGoogle.GoogleOneTapSignIn;
        isSuccessResponse = nitroGoogle.isSuccessResponse;
        isNoSavedCredentialFoundResponse = nitroGoogle.isNoSavedCredentialFoundResponse;
    } catch (e) {
        console.warn('[AuthContext] Could not load react-native-nitro-google-signin:', e);
    }
}

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

    // Initialisation native de Google Sign-In (Android Credential Manager / iOS SDK)
    useEffect(() => {
        if (Platform.OS !== 'web' && GoogleOneTapSignIn) {
            const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
            if (webClientId) {
                try {
                    GoogleOneTapSignIn.configure({
                        webClientId,
                        offlineAccess: false,
                    });
                } catch (err) {
                    console.warn('[AuthContext] Nitro GoogleOneTapSignIn.configure error:', err);
                }
            }
        }
    }, []);

    // Écoute de l'état d'authentification Firebase (ou fallback AsyncStorage)
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

    const signInWithGoogle = useCallback(async () => {
        try {
            setLoading(true);

            if (Platform.OS === 'web') {
                // Navigateur Web : Popup Firebase OAuth officiel
                if (auth && isFirebaseConfigured) {
                    const provider = new GoogleAuthProvider();
                    provider.setCustomParameters({ prompt: 'select_account' });
                    await signInWithPopup(auth, provider);
                }
            } else {
                // Mobile Natif (Android / iOS) : Nitro One-Tap / Credential Manager
                if (!GoogleOneTapSignIn) {
                    console.warn('[AuthContext] GoogleOneTapSignIn module not loaded');
                    return;
                }

                // 1. Vérification des services Google Play
                try {
                    await GoogleOneTapSignIn.checkPlayServices(true);
                } catch (playErr) {
                    console.warn('[AuthContext] Play Services check warning:', playErr);
                }

                // 2. Présentation du sélecteur de compte natif
                let response = await GoogleOneTapSignIn.presentExplicitSignIn().catch((err: any) => {
                    console.warn('[AuthContext] presentExplicitSignIn error:', err);
                    return null;
                });

                // 3. Fallback si aucun identifiant sauvegardé
                if (!response || (isNoSavedCredentialFoundResponse && isNoSavedCredentialFoundResponse(response))) {
                    response = await GoogleOneTapSignIn.createAccount().catch(() => null);
                }

                // 4. Fallback vers la méthode signIn classique
                if (!response || (isSuccessResponse && !isSuccessResponse(response))) {
                    response = await GoogleOneTapSignIn.signIn().catch(() => null);
                }

                if (isSuccessResponse && isSuccessResponse(response) && response?.data) {
                    const { idToken, user: googleUser } = response.data;
                    let signedInWithFirebase = false;

                    if (auth && isFirebaseConfigured && idToken) {
                        try {
                            const credential = GoogleAuthProvider.credential(idToken);
                            await signInWithCredential(auth, credential);
                            signedInWithFirebase = true;
                        } catch (fbErr) {
                            console.warn('[AuthContext] Firebase signInWithCredential failed, using local user state:', fbErr);
                        }
                    }

                    // Mode local / fallback si Firebase n'a pas mis à jour l'utilisateur
                    if (!signedInWithFirebase && googleUser) {
                        const appUser: AppUser = {
                            uid: googleUser.id || 'google_' + Date.now(),
                            displayName: googleUser.name || googleUser.givenName || googleUser.email || 'Utilisateur Google',
                            email: googleUser.email || null,
                            photoURL: googleUser.photo || null,
                            isAnonymous: false,
                        };
                        setUser(appUser);
                        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(appUser));
                    }
                } else {
                    console.warn('[AuthContext] Google One-Tap response was not successful:', response);
                }
            }
        } catch (error: any) {
            console.error('[AuthContext] Google Sign-In error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const signOut = useCallback(async () => {
        try {
            setLoading(true);

            if (Platform.OS !== 'web') {
                await GoogleOneTapSignIn.signOut().catch(() => {});
            }

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
