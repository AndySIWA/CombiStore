import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MiniApp } from '../types';
import { SAMPLE_APPS } from '../constants/defaults';

const STORAGE_KEY = '@combistore_apps';

export function useApps() {
    const [apps, setApps] = useState<MiniApp[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadApps();
    }, []);

    const loadApps = async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                setApps(JSON.parse(stored));
            } else {
                // First launch — seed with sample apps
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_APPS));
                setApps(SAMPLE_APPS);
            }
        } catch (e) {
            console.error('Error loading apps:', e);
            setApps(SAMPLE_APPS);
        } finally {
            setLoading(false);
        }
    };

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
        const updated = [newApp, ...apps];
        setApps(updated);
        await saveApps(updated);
        return newApp;
    }, [apps]);

    const removeApp = useCallback(async (id: string) => {
        const updated = apps.filter(a => a.id !== id);
        setApps(updated);
        await saveApps(updated);
    }, [apps]);

    const updateApp = useCallback(async (id: string, partial: Partial<MiniApp>) => {
        const updated = apps.map(a => a.id === id ? { ...a, ...partial } : a);
        setApps(updated);
        await saveApps(updated);
    }, [apps]);

    return { apps, loading, addApp, removeApp, updateApp };
}
