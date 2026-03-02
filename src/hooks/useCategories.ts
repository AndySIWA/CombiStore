import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category } from '../types';
import { DEFAULT_CATEGORIES } from '../constants/defaults';

const STORAGE_KEY = '@combistore_categories';

// 'all' category is always present and can't be deleted
export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                setCategories(JSON.parse(stored));
            } else {
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CATEGORIES));
                setCategories(DEFAULT_CATEGORIES);
            }
        } catch (e) {
            console.error('Error loading categories:', e);
            setCategories(DEFAULT_CATEGORIES);
        } finally {
            setLoading(false);
        }
    };

    const saveCategories = async (cats: Category[]) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
        } catch (e) {
            console.error('Error saving categories:', e);
        }
    };

    const addCategory = useCallback(async (cat: Omit<Category, 'id'>) => {
        const newCat: Category = {
            ...cat,
            id: `cat_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        };
        const updated = [...categories, newCat];
        setCategories(updated);
        await saveCategories(updated);
        return newCat;
    }, [categories]);

    const removeCategory = useCallback(async (id: string) => {
        if (id === 'all') return; // protect the "all" pseudo-category
        const updated = categories.filter(c => c.id !== id);
        setCategories(updated);
        await saveCategories(updated);
    }, [categories]);

    const updateCategory = useCallback(async (id: string, partial: Partial<Category>) => {
        const updated = categories.map(c => c.id === id ? { ...c, ...partial } : c);
        setCategories(updated);
        await saveCategories(updated);
    }, [categories]);

    return { categories, loading, addCategory, removeCategory, updateCategory };
}
