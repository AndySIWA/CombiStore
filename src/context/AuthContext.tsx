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
        console.warn('[AuthContext] Impossible de charger react-native-nitro-google-signin :', e);
    }
}

/**
 * Représentation du profil de l'utilisateur connecté dans l'application.
 */
export interface AppUser {
    /** Identifiant unique Firebase */
    uid: string;
    /** Nom d'affichage de l'utilisateur */
    displayName: string | null;
    /** Adresse email de l'utilisateur */
    email: string | null;
    /** URL de l'image de profil / avatar */
    photoURL: string | null;
    /** Indique si l'utilisateur est anonyme */
    isAnonymous: boolean;
}

/**
 * Interface définissant l'état et les méthodes d'authentification.
 */
interface AuthContextType {
    /** Utilisateur actuellement connecté ou null */
    user: AppUser | null;
    /** Indique si l'initialisation ou la connexion est en cours */
    loading: boolean;
    /** Indique si les identifiants Firebase sont valides */
    isConfigured: boolean;
    /** Lance le processus de connexion via Google OAuth */
    signInWithGoogle: () => Promise<void>;
    /** Déconnecte l'utilisateur actuel */
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provider gérant l'état d'authentification de l'utilisateur (Firebase & Google OAuth).
 */
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
                    console.warn('[AuthContext] Erreur de configuration Nitro GoogleOneTapSignIn :', err);
                }
            }
        }
    }, []);

    // Écoute de l'état d'authentification Firebase
    useEffect(() => {
    let unsubscribe: (() => void) | undefined;

        const initAuth = async () => {
            try {
                if (!auth || !isFirebaseConfigured) {
                    setUser(null);
                    setLoading(false);
                    return;
                }

                unsubscribe = onAuthStateChanged(
                    auth,
                    (fbUser: FirebaseUser | null) => {
                        if (fbUser) {
                            const appUser: AppUser = {
                                uid: fbUser.uid,
                                displayName: fbUser.displayName || 'Utilisateur',
                                email: fbUser.email,
                                photoURL: fbUser.photoURL,
                                isAnonymous: fbUser.isAnonymous,
                            };

                            setUser(appUser);
                        } else {
                            setUser(null);
                        }

                        setLoading(false);
                    },
                );
            } catch (err) {
                console.error(
                    '[AuthContext] Erreur d\'initialisation auth :',
                    err,
                );

                setUser(null);
                setLoading(false);
            }
        };

        initAuth();

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []);

    /** Déclenche la connexion via Google (Popup sur Web, Credential Manager sur Mobile) */
    const signInWithGoogle = useCallback(async () => {
        try {
            setLoading(true);

            if (Platform.OS === 'web') {
                if (auth && isFirebaseConfigured) {
                    const provider = new GoogleAuthProvider();
                    provider.setCustomParameters({ prompt: 'select_account' });
                    await signInWithPopup(auth, provider);
                }
            } else {
                if (!GoogleOneTapSignIn) {
                    console.warn("[AuthContext] Le module GoogleOneTapSignIn n'est pas disponible");
                    return;
                }

                try {
                    await GoogleOneTapSignIn.checkPlayServices(true);
                } catch (playErr) {
                    console.warn('[AuthContext] Avertissement Play Services :', playErr);
                }

                let response = await GoogleOneTapSignIn.presentExplicitSignIn().catch((err: any) => {
                    console.warn('[AuthContext] Erreur presentExplicitSignIn :', err);
                    return null;
                });

                if (!response || (isNoSavedCredentialFoundResponse && isNoSavedCredentialFoundResponse(response))) {
                    response = await GoogleOneTapSignIn.createAccount().catch(() => null);
                }

                if (!response || (isSuccessResponse && !isSuccessResponse(response))) {
                    response = await GoogleOneTapSignIn.signIn().catch(() => null);
                }

                if (isSuccessResponse && isSuccessResponse(response) && response?.data) {
                    const { idToken, user: googleUser } = response.data;
                    
                    if (!auth || !isFirebaseConfigured) {
                        throw new Error(
                            'Firebase Auth n\'est pas configuré. Connexion impossible.',
                        );
                    }

                    if (!idToken) {
                        throw new Error(
                            'Google n\'a pas fourni de token d\'authentification.',
                        );
                    }

                    const credential = GoogleAuthProvider.credential(idToken);

                    await signInWithCredential(auth, credential);
                    
                } else {
                    console.warn("[AuthContext] La réponse Google One-Tap n'est pas un succès :", response);
                }
            }
        } catch (error: any) {
            console.error('[AuthContext] Erreur Google Sign-In :', error);
        } finally {
            setLoading(false);
        }
    }, []);

    /** Déconnecte l'utilisateur et détruit la session locale */
    const signOut = useCallback(async () => {
        try {
            setLoading(true);

            if (Platform.OS !== 'web' && GoogleOneTapSignIn) {
                await GoogleOneTapSignIn.signOut().catch(() => {});
            }

            if (auth && isFirebaseConfigured) {
                await firebaseSignOut(auth);
            }

            if (auth && isFirebaseConfigured) {
                await firebaseSignOut(auth);
            }
            setUser(null);
        } catch (error) {
            console.error('[AuthContext] Erreur lors de la déconnexion :', error);
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

/**
 * Hook personnalisé permettant d'accéder à l'état d'authentification utilisateur.
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
    }
    return context;
}
