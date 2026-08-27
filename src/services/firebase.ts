import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
    initializeAuth,
    getAuth,
    Auth,
    // @ts-ignore
    getReactNativePersistence,
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDemoKeyPlaceholderForCombiStore',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'combistore-app.firebaseapp.com',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'combistore-app',
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'combistore-app.appspot.com',
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:1234567890:web:abcdef123456',
};

export const isFirebaseConfigured = Boolean(
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY &&
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID
);

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
    if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
        try {
            auth = initializeAuth(app, {
                persistence: getReactNativePersistence(AsyncStorage),
            });
        } catch {
            auth = getAuth(app);
        }
    } else {
        app = getApp();
        auth = getAuth(app);
    }
    db = getFirestore(app);
} catch (error) {
    console.warn('[Firebase] Initialization warning:', error);
    // @ts-ignore
    app = getApps()[0] || null;
    // @ts-ignore
    auth = null;
    // @ts-ignore
    db = null;
}

export { app, auth, db };
