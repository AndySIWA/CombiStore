import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MiniApp } from '../types';
import { SAMPLE_APPS } from '../constants/defaults';

const STORAGE_KEY = '@combistore_apps';

interface AppsContextType {
    apps: MiniApp[];
    loading: boolean;
    addApp: (app: Omit<MiniApp, 'id' | 'addedAt'>) => Promise<MiniApp>;
    removeApp: (id: string) => Promise<void>;
    updateApp: (id: string, partial: Partial<MiniApp>) => Promise<void>;
}

const AppsContext = createContext<AppsContextType | undefined>(undefined);

export function AppsProvider({ children }: { children: ReactNode }) {
    const [apps, setApps] = useState<MiniApp[]>([]);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        loadApps();
    }, [loadApps]);

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
        <AppsContext.Provider value={{ apps, loading, addApp, removeApp, updateApp }}>
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
