import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MiniApp, RemoteApp } from '../types';
import { SAMPLE_APPS } from '../constants/defaults';
import { client, getRemoteAppsQuery } from '../lib/sanity';

const STORAGE_KEY = '@combistore_apps';
const CUSTOM_APPS_KEY = '@combistore_custom_apps';
const INITIALIZED_KEY = '@combistore_initialized';
const REMOTE_CACHE_KEY = '@combistore_remote_apps_cache';

/**
 * Synchronise la liste des applications locales déjà importées avec les données fraîches du CMS distant Sanity.
 */
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

/**
 * Interface définissant les propriétés et méthodes fournies par le contexte des applications.
 */
interface AppsContextType {
    /** Liste des applications installées/présentes localement */
    apps: MiniApp[];
    /** Liste des applications disponibles sur le catalogue distant (Sanity) */
    remoteApps: RemoteApp[];
    /** Indique si le chargement initial est en cours */
    loading: boolean;
    /** Indique si le rafraîchissement depuis Sanity est en cours */
    refreshingRemote: boolean;
    /** Indique si l'application est actuellement en mode hors-ligne */
    isOffline: boolean;
    /** Ajoute une nouvelle application personnalisée */
    addApp: (app: Omit<MiniApp, 'id' | 'addedAt'>) => Promise<MiniApp>;
    /** Supprime une application installée par son identifiant */
    removeApp: (id: string) => Promise<void>;
    /** Met à jour les propriétés d'une application */
    updateApp: (id: string, partial: Partial<MiniApp>) => Promise<void>;
    /** Force la récupération des applications distantes depuis Sanity CMS */
    fetchRemoteApps: () => Promise<void>;
    /** Importe une application distante dans la liste des applications locales */
    importRemoteApp: (remoteApp: RemoteApp) => Promise<MiniApp | null>;
}

const AppsContext = createContext<AppsContextType | undefined>(undefined);

/**
 * Provider gérant l'état global du catalogue d'applications, le stockage local AsyncStorage,
 * et la synchronisation avec Sanity CMS.
 */
export function AppsProvider({ children }: { children: ReactNode }) {
    const [apps, setApps] = useState<MiniApp[]>([]);
    const [remoteApps, setRemoteApps] = useState<RemoteApp[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshingRemote, setRefreshingRemote] = useState(false);
    const [isOffline, setIsOffline] = useState(false);

    /** Sauvegarde la liste des applications dans le stockage local AsyncStorage */
    const saveApps = async (newApps: MiniApp[]) => {
        try {
            if (!Array.isArray(newApps)) {
                console.error('[AppsContext] saveApps appelé avec une valeur non-tableau :', newApps);
                return;
            }
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newApps));
        } catch (e) {
            console.error('Erreur lors de la sauvegarde des apps :', e);
        }
    };

    /** Sauvegarde la mise en cache des applications distantes */
    const saveRemoteAppsCache = async (cached: RemoteApp[]) => {
        try {
            if (Array.isArray(cached)) {
                await AsyncStorage.setItem(REMOTE_CACHE_KEY, JSON.stringify(cached));
            }
        } catch (e) {
            console.error('Erreur lors de la sauvegarde du cache remote apps :', e);
        }
    };

    /** Charge les applications locales et le cache distant au démarrage */
    const loadApps = useCallback(async () => {
        try {
            // 1. Charger les apps locales enregistrées
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            let parsedApps: MiniApp[] = [];
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    parsedApps = parsed;
                    setApps(parsedApps);
                }
            }

            // 2. Charger le cache persistant des remote apps
            const storedRemote = await AsyncStorage.getItem(REMOTE_CACHE_KEY);
            if (storedRemote) {
                const parsedRemote = JSON.parse(storedRemote);
                if (Array.isArray(parsedRemote) && parsedRemote.length > 0) {
                    setRemoteApps(parsedRemote);
                }
            } else if (parsedApps.length === 0) {
                // Premier démarrage hors-ligne sans cache : charger les apps démo intégrées
                setApps(SAMPLE_APPS);
                saveApps(SAMPLE_APPS);
            }

            return parsedApps;
        } catch (e) {
            console.error('Erreur lors du chargement des apps :', e);
            setApps(SAMPLE_APPS);
            return SAMPLE_APPS;
        } finally {
            setLoading(false);
        }
    }, []);

    /** Récupère les applications distantes depuis Sanity CMS */
    const fetchRemoteApps = useCallback(async (baseApps?: MiniApp[]) => {
        setRefreshingRemote(true);
        try {
            // Requête Sanity avec timeout pour éviter les blocages infinis en cas de réseau lent
            const fetchPromise = client.fetch<RemoteApp[]>(getRemoteAppsQuery);
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Sanity fetch timeout')), 8000)
            );

            const data = await Promise.race([fetchPromise, timeoutPromise]);

            if (data && data.length > 0) {
                setRemoteApps(data);
                saveRemoteAppsCache(data);
                setIsOffline(false);

                // Charger les apps personnalisées créées par l'utilisateur
                const customStored = await AsyncStorage.getItem(CUSTOM_APPS_KEY);
                let customApps: MiniApp[] = [];
                if (customStored) {
                    const parsed = JSON.parse(customStored);
                    if (Array.isArray(parsed)) {
                        customApps = parsed;
                    }
                }

                // Synchroniser les apps déjà installées avec les métadonnées Sanity fraîches
                const currentLocal = baseApps !== undefined ? baseApps : apps;
                const importedApps = syncImportedApps(currentLocal, data);
                const combined = [...importedApps, ...customApps];

                setApps(combined);
                saveApps(combined);
                await AsyncStorage.setItem(INITIALIZED_KEY, 'true');
            } else {
                throw new Error('Aucune app trouvée dans Sanity');
            }
        } catch (e) {
            console.warn('[AppsContext] Mode hors-ligne actif (Sanity inaccessible) :', e);
            setIsOffline(true);

            // En cas d'échec : préserver absolument les apps en cache local
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            const storedRemote = await AsyncStorage.getItem(REMOTE_CACHE_KEY);

            let currentApps: MiniApp[] = [];
            if (stored) {
                try { currentApps = JSON.parse(stored); } catch (_) {}
            }

            if (storedRemote) {
                try {
                    const parsedRemote = JSON.parse(storedRemote);
                    if (Array.isArray(parsedRemote) && parsedRemote.length > 0) {
                        setRemoteApps(parsedRemote);
                    }
                } catch (_) {}
            }

            if (currentApps.length === 0 && (!storedRemote || JSON.parse(storedRemote).length === 0)) {
                setApps(SAMPLE_APPS);
                saveApps(SAMPLE_APPS);
            }
        } finally {
            setRefreshingRemote(false);
        }
    }, [apps]);

    useEffect(() => {
        const initializeApps = async () => {
            const loadedApps = await loadApps();
            await fetchRemoteApps(loadedApps);
        };

        initializeApps();
    }, [loadApps]);

    /** Ajoute une application personnalisée créée par l'utilisateur */
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

    /** Importe une application depuis le catalogue distant dans le magasin local */
    const importRemoteApp = useCallback(async (remoteApp: RemoteApp) => {
        const exists = apps.some(a => a.remoteId === remoteApp.id);
        if (exists) return null;

        const iconValue = remoteApp.icon?.trim() || '🌐';
        const newApp: MiniApp = {
            ...remoteApp,
            icon: iconValue,
            id: `app_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            remoteId: remoteApp.id,
            addedAt: Date.now(),
        };

        setApps(prevApps => {
            const updated = [newApp, ...prevApps];
            saveApps(updated);
            return updated;
        });

        return newApp;
    }, [apps]);

    /** Supprime une application de la liste locale */
    const removeApp = useCallback(async (id: string) => {
        setApps(prevApps => {
            const updated = prevApps.filter(a => a.id !== id);
            saveApps(updated);
            return updated;
        });

        const stored = await AsyncStorage.getItem(CUSTOM_APPS_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                const updated = parsed.filter((a: MiniApp) => a.id !== id);
                await AsyncStorage.setItem(CUSTOM_APPS_KEY, JSON.stringify(updated));
            }
        }
    }, []);

    /** Mettre à jour partiellement les informations d'une application */
    const updateApp = useCallback(async (id: string, partial: Partial<MiniApp>) => {
        setApps(prevApps => {
            const updated = prevApps.map(a => a.id === id ? { ...a, ...partial } : a);
            saveApps(updated);
            return updated;
        });

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
            isOffline,
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

/**
 * Hook personnalisé permettant d'accéder aux fonctionnalités du contexte Apps.
 */
export function useApps() {
    const context = useContext(AppsContext);
    if (!context) {
        throw new Error("useApps doit être utilisé à l'intérieur d'un AppsProvider");
    }
    return context;
}
