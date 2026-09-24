import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../services/firebase';
import { useAuth } from './AuthContext';

const FAVORITES_STORAGE_KEY = '@combistore_favorites';

/**
 * Interface définissant les propriétés et méthodes du contexte des favoris.
 */
interface FavoritesContextType {
    /** Liste des identifiants d'applications ajoutées aux favoris */
    favorites: string[];
    /** Vérifie si une application spécifique est marquée comme favorite */
    isFavorite: (appId: string) => boolean;
    /** Bascule l'état favori d'une application (avec retour haptique et sync cloud) */
    toggleFavorite: (appId: string) => Promise<void>;
    /** Nombre total d'applications favorites */
    favoritesCount: number;
    /** Indique si la synchronisation cloud Firestore est en cours */
    syncing: boolean;
    /** Force la synchronisation de la liste locale des favoris avec Firestore */
    syncWithCloud: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

/**
 * Provider gérant les favoris de l'utilisateur avec persistance AsyncStorage
 * et synchronisation cloud temps réel avec Firebase Firestore.
 */
export function FavoritesProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState<string[]>([]);
    const [syncing, setSyncing] = useState(false);

    // 1. Chargement initial des favoris enregistrés en local dans AsyncStorage
    useEffect(() => {
        const loadLocalFavorites = async () => {
            try {
                const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed)) {
                        setFavorites(parsed);
                    }
                }
            } catch (err) {
                console.error('[FavoritesContext] Erreur de chargement des favoris locaux :', err);
            }
        };

        loadLocalFavorites();
    }, []);

    // 2. Synchronisation Cloud lorsque l'utilisateur se connecte
    const syncWithCloud = useCallback(async () => {
        if (!user || !db || !isFirebaseConfigured) return;

        try {
            setSyncing(true);
            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);

            let currentLocal = favorites;
            const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) currentLocal = parsed;
            }

            if (userDocSnap.exists()) {
                const cloudData = userDocSnap.data();
                const cloudFavorites: string[] = Array.isArray(cloudData?.favorites) ? cloudData.favorites : [];

                // Fusion sans doublons des favoris locaux et distants
                const merged = Array.from(new Set([...currentLocal, ...cloudFavorites]));
                setFavorites(merged);
                await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(merged));

                if (merged.length !== cloudFavorites.length) {
                    await setDoc(userDocRef, { favorites: merged, updatedAt: Date.now() }, { merge: true });
                }
            } else {
                // Premier sync cloud : pousser la liste locale sur Firestore
                await setDoc(
                    userDocRef,
                    {
                        favorites: currentLocal,
                        displayName: user.displayName,
                        email: user.email,
                        updatedAt: Date.now(),
                    },
                    { merge: true }
                );
            }
        } catch (err) {
            console.error('[FavoritesContext] Erreur de synchronisation cloud :', err);
        } finally {
            setSyncing(false);
        }
    }, [user, favorites]);

    useEffect(() => {
        if (user) {
            syncWithCloud();
        }
    }, [user?.uid]);

    // 3. Basculer l'état favori d'une application (Ajout / Retrait)
    const toggleFavorite = useCallback(async (appId: string) => {
        if (!appId) return;

        // Effet haptique léger lors de l'action
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (_) { }

        setFavorites(prevFavorites => {
            const exists = prevFavorites.includes(appId);
            const updated = exists
                ? prevFavorites.filter(id => id !== appId)
                : [...prevFavorites, appId];

            // Exécution asynchrone des effets de bord hors du rendu React
            setTimeout(() => {
                AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated)).catch(e => {
                    console.error('[FavoritesContext] Erreur lors de la sauvegarde des favoris :', e);
                });

                if (user && db && isFirebaseConfigured) {
                    const userDocRef = doc(db, 'users', user.uid);
                    setDoc(userDocRef, { favorites: updated, updatedAt: Date.now() }, { merge: true }).catch(e => {
                        console.error('[FavoritesContext] Erreur lors de la mise à jour cloud des favoris :', e);
                    });
                }
            }, 0);

            return updated;
        });
    }, [user]);

    const isFavorite = useCallback((appId: string) => {
        return favorites.includes(appId);
    }, [favorites]);

    return (
        <FavoritesContext.Provider
            value={{
                favorites,
                isFavorite,
                toggleFavorite,
                favoritesCount: favorites.length,
                syncing,
                syncWithCloud,
            }}
        >
            {children}
        </FavoritesContext.Provider>
    );
}

/**
 * Hook personnalisé d'accès au contexte des favoris.
 */
export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error("useFavorites doit être utilisé à l'intérieur d'un FavoritesProvider");
    }
    return context;
}
