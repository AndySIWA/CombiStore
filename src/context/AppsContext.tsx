import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MiniApp, RemoteApp } from '../types';
import { SAMPLE_APPS } from '../constants/defaults';
import { DEMO_APPS } from '../constants/demoApps';
import { client, getRemoteAppsQuery } from '../lib/sanity';

const STORAGE_KEY = '@combistore_apps';

const syncImportedApps = (localApps: MiniApp[], remoteApps: RemoteApp[]) => {
    const remoteById = new Map(remoteApps.map(app => [app.id, app]));

    return localApps.map(localApp => {
        if (!localApp.remoteId) return localApp;

        const remoteApp = remoteById.get(localApp.remoteId);
        if (!remoteApp) return localApp;

        return {
            ...localApp,
            name: remoteApp.name,
            description: remoteApp.description,
            categoryId: remoteApp.categoryId,
            sourceType: remoteApp.sourceType,
            source: remoteApp.source,
            icon: remoteApp.icon?.trim() || localApp.icon,
            version: remoteApp.version,
            lastUpdated: remoteApp.lastUpdated,
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
                const parsedApps = JSON.parse(stored) as MiniApp[];
                setApps(parsedApps);
                return parsedApps;
            } else {
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_APPS));
                setApps(SAMPLE_APPS);
                return SAMPLE_APPS;
            }
        } catch (e) {
            console.error('Error loading apps:', e);
            setApps(SAMPLE_APPS);
            return SAMPLE_APPS;
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
                setApps(prevApps => {
                    const updated = syncImportedApps(baseApps ?? prevApps, data);
                    saveApps(updated);
                    return updated;
                });
            } else {
                //alert('Aucune app trouvée dans Sanity');
                throw new Error('Aucune app trouvée dans Sanity');
            }
        } catch (e) {
            console.warn('[AppsContext] Erreur Sanity, chargement des démos...', e);
            setRemoteApps(DEMO_APPS);
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
    }, []);

    const updateApp = useCallback(async (id: string, partial: Partial<MiniApp>) => {
        setApps(prevApps => {
            const updated = prevApps.map(a => a.id === id ? { ...a, ...partial } : a);
            saveApps(updated);
            return updated;
        });
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
