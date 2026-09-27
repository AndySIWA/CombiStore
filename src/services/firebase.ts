import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
    initializeAuth,
    getAuth,
    Auth,
    // @ts-ignore
    getReactNativePersistence,
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Configuration du projet Firebase lue depuis les variables d'environnement.
 */

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Indique si les variables d'environnement Firebase valides sont configurées.
 */
export const isFirebaseConfigured = Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId,
);

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
    if (!isFirebaseConfigured) {
        console.warn(
            '[Firebase] Configuration absente. Firebase est désactivé.',
        );
    } else {
        if (getApps().length === 0) {
            app = initializeApp(firebaseConfig);
            if (Platform.OS === 'web') {
                auth = getAuth(app);
            } else {
                try {
                    auth = initializeAuth(app, {
                        persistence: getReactNativePersistence(AsyncStorage),
                    });
                } catch {
                    auth = getAuth(app);
                }
            }
        } else {
            app = getApp();
            auth = getAuth(app);
        }
        db = getFirestore(app);
    }
} catch (error) {
    console.warn("[Firebase] Erreur lors de l'initialisation :", error);
    // @ts-ignore
    app = null;
    // @ts-ignore
    auth = null;
    // @ts-ignore
    db = null;
}

/** Instance Firebase App */
export { app };
/** Service d'Authentification Firebase Auth */
export { auth };
/** Base de données Cloud Firestore */
export { db };
