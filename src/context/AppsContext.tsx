import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MiniApp, RemoteApp } from '../types';
import { SAMPLE_APPS } from '../constants/defaults';
import { DEMO_APPS } from '../constants/demoApps';
import { client, getRemoteAppsQuery } from '../lib/sanity';

const STORAGE_KEY = '@combistore_apps';
const CUSTOM_APPS_KEY = '@combistore_custom_apps';
const INITIALIZED_KEY = '@combistore_initialized';

const syncImportedApps = (localApps: MiniApp[] = [], remoteApps: RemoteApp[] = []) => {
    const safeLocalApps = Array.isArray(localApps) ? localApps : [];
    const safeRemoteApps = Array.isArray(remoteApps) ? remoteApps : [];

    const remoteById = new Map(
        safeRemoteApps
            .filter(app => app && typeof app.id === 'string')
            .map(app => [app.id, app])
    );

    return safeLocalApps.map(localApp => {
        if (!localApp || !localApp.remoteId) return localApp;

        const remoteApp = remoteById.get(localApp.remoteId);
        if (!remoteApp) return localApp;

        return {
            ...localApp,
            name: remoteApp.name || localApp.name,
            description: remoteApp.description || localApp.description,
            categoryId: remoteApp.categoryId || localApp.categoryId,
            sourceType: remoteApp.sourceType || localApp.sourceType,
            source: remoteApp.source || localApp.source,
            icon: remoteApp.icon?.trim() || localApp.icon,
            version: remoteApp.version || localApp.version,
            lastUpdated: remoteApp.lastUpdated || localApp.lastUpdated,
        };
    });
};

interface AppsContextType {
    apps: MiniApp[];
    remoteApps: RemoteApp[];
    loading: boolean;
    refreshingRemote: boolean;
    addApp: (app: Omit<MiniApp, 'id' | 'addedAt'>) => Promise<MiniApp>;
    removeApp: (id: string) => Promise<void>;
    updateApp: (id: string, partial: Partial<MiniApp>) => Promise<void>;
    fetchRemoteApps: () => Promise<void>;
    importRemoteApp: (remoteApp: RemoteApp) => Promise<MiniApp | null>;
}

const AppsContext = createContext<AppsContextType | undefined>(undefined);

export function AppsProvider({ children }: { children: ReactNode }) {
    const [apps, setApps] = useState<MiniApp[]>([]);
    const [remoteApps, setRemoteApps] = useState<RemoteApp[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshingRemote, setRefreshingRemote] = useState(false);

    const loadApps = useCallback(async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsedApps = JSON.parse(stored);
                if (Array.isArray(parsedApps)) {
                    setApps(parsedApps);
                    return parsedApps;
                }
            }
            // Ne pas initialiser avec SAMPLE_APPS ici - on laisse Sanity faire le premier chargement
            setApps([]);
            return [];
        } catch (e) {
            console.error('Error loading apps:', e);
            setApps([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRemoteApps = useCallback(async (baseApps?: MiniApp[]) => {
        setRefreshingRemote(true);
        try {
            const data = await client.fetch<RemoteApp[]>(getRemoteAppsQuery);
            if (data && data.length > 0) {
                setRemoteApps(data);

                // Charger les apps personnalisées créées par l'utilisateur
                const customStored = await AsyncStorage.getItem(CUSTOM_APPS_KEY);
                let customApps: MiniApp[] = [];
                if (customStored) {
                    const parsed = JSON.parse(customStored);
                    if (Array.isArray(parsed)) {
                        customApps = parsed;
                    }
                }

                // Mettre à jour les apps importées avec les données Sanity
                const importedApps = syncImportedApps(baseApps ?? [], data);
                // Combiner : apps importées (mises à jour) + apps personnalisées créées
                // IMPORTANT: ne PAS inclure SAMPLE_APPS ici !
                const combined = [...importedApps, ...customApps];

                setApps(combined);
                saveApps(combined);
                
                // Marquer comme initialisé
                await AsyncStorage.setItem(INITIALIZED_KEY, 'true');
            } else {
                throw new Error('Aucune app trouvée dans Sanity');
            }
        } catch (e) {
            console.warn('[AppsContext] Erreur Sanity, chargement des démos...', e);
            setRemoteApps(DEMO_APPS);
            
            // Seulement charger SAMPLE_APPS en fallback si pas encore initialisé
            const isInitialized = await AsyncStorage.getItem(INITIALIZED_KEY);
            if (!isInitialized) {
                setApps(SAMPLE_APPS);
                saveApps(SAMPLE_APPS);
                await AsyncStorage.setItem(INITIALIZED_KEY, 'true');
            }
        } finally {
            setRefreshingRemote(false);
        }
    }, []);

    useEffect(() => {
        const initializeApps = async () => {
            const loadedApps = await loadApps();
            await fetchRemoteApps(loadedApps);
        };

        initializeApps();
    }, [loadApps, fetchRemoteApps]);

    const saveApps = async (newApps: MiniApp[]) => {
        try {
            if (!Array.isArray(newApps)) {
                console.error('[AppsContext] saveApps called with non-array:', newApps);
                return;
            }
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newApps));
        } catch (e) {
            console.error('Error saving apps:', e);
        }
    };

    const addApp = useCallback(async (app: Omit<MiniApp, 'id' | 'addedAt'>) => {
        const iconValue = app.icon?.trim() || '🌐';
        const newApp: MiniApp = {
            ...app,
            icon: iconValue,
            id: `app_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            addedAt: Date.now(),
        };
        setApps(prevApps => {
            const updated = [newApp, ...prevApps];
            saveApps(updated);
            return updated;
        });

        // Sauvegarder dans les custom apps
        const stored = await AsyncStorage.getItem(CUSTOM_APPS_KEY);
        let customApps: MiniApp[] = [];
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                customApps = parsed;
            }
        }
        customApps.push(newApp);
        await AsyncStorage.setItem(CUSTOM_APPS_KEY, JSON.stringify(customApps));

        return newApp;
    }, []);

    const importRemoteApp = useCallback(async (remoteApp: RemoteApp) => {
        // Vérifier si déjà importé pour éviter les doublons avec le même remoteId
        const exists = apps.some(a => a.remoteId === remoteApp.id);
        if (exists) return null;

        const iconValue = remoteApp.icon?.trim() || '🌐';
        const newApp: MiniApp = {
            ...remoteApp,
            icon: iconValue,
            id: `app_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            remoteId: remoteApp.id, // On garde la trace du remoteId
            addedAt: Date.now(),
        };

        setApps(prevApps => {
            const updated = [newApp, ...prevApps];
            saveApps(updated);
            return updated;
        });

        return newApp;
    }, [apps]);

    const removeApp = useCallback(async (id: string) => {
        setApps(prevApps => {
            const updated = prevApps.filter(a => a.id !== id);
            saveApps(updated);
            return updated;
        });

        // Retirer des custom apps si présente
        const stored = await AsyncStorage.getItem(CUSTOM_APPS_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                const updated = parsed.filter((a: MiniApp) => a.id !== id);
                await AsyncStorage.setItem(CUSTOM_APPS_KEY, JSON.stringify(updated));
            }
        }
    }, []);

    const updateApp = useCallback(async (id: string, partial: Partial<MiniApp>) => {
        setApps(prevApps => {
            const updated = prevApps.map(a => a.id === id ? { ...a, ...partial } : a);
            saveApps(updated);
            return updated;
        });

        // Mettre à jour dans les custom apps si présente
        const stored = await AsyncStorage.getItem(CUSTOM_APPS_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                const updated = parsed.map((a: MiniApp) => 
                    a.id === id ? { ...a, ...partial } : a
                );
                await AsyncStorage.setItem(CUSTOM_APPS_KEY, JSON.stringify(updated));
            }
        }
    }, []);

    return (
        <AppsContext.Provider value={{
            apps,
            remoteApps,
            loading,
            refreshingRemote,
            addApp,
            removeApp,
            updateApp,
            fetchRemoteApps,
            importRemoteApp
        }}>
            {children}
        </AppsContext.Provider>
    );
}

export function useApps() {
    const context = useContext(AppsContext);
    if (!context) {
        throw new Error('useApps must be used within an AppsProvider');
    }
    return context;
}
