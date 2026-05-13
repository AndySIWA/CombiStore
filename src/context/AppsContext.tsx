import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MiniApp, RemoteApp } from '../types';
import { SAMPLE_APPS } from '../constants/defaults';
import { DEMO_APPS } from '../constants/demoApps';
import { client, getRemoteAppsQuery } from '../lib/sanity';

const STORAGE_KEY = '@combistore_apps';

interface AppsContextType {
    apps: MiniApp[];
    remoteApps: RemoteApp[];
    loading: boolean;
    refreshingRemote: boolean;
    addApp: (app: Omit<MiniApp, 'id' | 'addedAt'>) => Promise<MiniApp>;
    removeApp: (id: string) => Promise<void>;
    updateApp: (id: string, partial: Partial<MiniApp>) => Promise<void>;
    fetchRemoteApps: () => Promise<void>;
    importRemoteApp: (remoteApp: RemoteApp) => Promise<void>;
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
                setApps(JSON.parse(stored));
            } else {
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_APPS));
                setApps(SAMPLE_APPS);
            }
        } catch (e) {
            console.error('Error loading apps:', e);
            setApps(SAMPLE_APPS);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRemoteApps = useCallback(async () => {
        setRefreshingRemote(true);
        try {
            const data = await client.fetch(getRemoteAppsQuery);
            if (data && data.length > 0) {
                setRemoteApps(data);
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
        loadApps();
        fetchRemoteApps();
    }, [loadApps, fetchRemoteApps]);

    const saveApps = async (newApps: MiniApp[]) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newApps));
        } catch (e) {
            console.error('Error saving apps:', e);
        }
    };

    const addApp = useCallback(async (app: Omit<MiniApp, 'id' | 'addedAt'>) => {
        const newApp: MiniApp = {
            ...app,
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
        if (exists) return;

        const newApp: MiniApp = {
            ...remoteApp,
            id: `app_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            remoteId: remoteApp.id, // On garde la trace du remoteId
            addedAt: Date.now(),
        };

        setApps(prevApps => {
            const updated = [newApp, ...prevApps];
            saveApps(updated);
            return updated;
        });
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
