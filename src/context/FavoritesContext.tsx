import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../services/firebase';
import { useAuth } from './AuthContext';

const FAVORITES_STORAGE_KEY = '@combistore_favorites';

interface FavoritesContextType {
    favorites: string[];
    isFavorite: (appId: string) => boolean;
    toggleFavorite: (appId: string) => Promise<void>;
    favoritesCount: number;
    syncing: boolean;
    syncWithCloud: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState<string[]>([]);
    const [syncing, setSyncing] = useState(false);

    // 1. Initial local load from AsyncStorage
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
                console.error('[FavoritesContext] Error loading local favorites:', err);
            }
        };

        loadLocalFavorites();
    }, []);

    // 2. Sync with Cloud when user logs in or changes
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

                // Merge local & cloud favorites without duplicates
                const merged = Array.from(new Set([...currentLocal, ...cloudFavorites]));
                setFavorites(merged);
                await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(merged));

                // If merged contains local items not in cloud, update cloud
                if (merged.length !== cloudFavorites.length) {
                    await setDoc(userDocRef, { favorites: merged, updatedAt: Date.now() }, { merge: true });
                }
            } else {
                // First cloud sync: push current local favorites to Firestore
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
            console.error('[FavoritesContext] Cloud sync error:', err);
        } finally {
            setSyncing(false);
        }
    }, [user, favorites]);

    useEffect(() => {
        if (user) {
            syncWithCloud();
        }
    }, [user?.uid]);

    // 3. Toggle favorite
    const toggleFavorite = useCallback(async (appId: string) => {
        if (!appId) return;

        // Soft haptic feedback on action
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (_) { }

        setFavorites(prevFavorites => {
            const exists = prevFavorites.includes(appId);
            const updated = exists
                ? prevFavorites.filter(id => id !== appId)
                : [...prevFavorites, appId];

            // Save to AsyncStorage immediately (Offline-First)
            AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated)).catch(e => {
                console.error('[FavoritesContext] Error saving favorites to storage:', e);
            });

            // Save to Cloud Firestore if connected
            if (user && db && isFirebaseConfigured) {
                const userDocRef = doc(db, 'users', user.uid);
                setDoc(userDocRef, { favorites: updated, updatedAt: Date.now() }, { merge: true }).catch(e => {
                    console.error('[FavoritesContext] Error updating favorites in cloud:', e);
                });
            }

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

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
}
