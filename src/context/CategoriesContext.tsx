import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category } from '../types';
import { DEFAULT_CATEGORIES } from '../constants/defaults';

const STORAGE_KEY = '@combistore_categories';

interface CategoriesContextType {
    categories: Category[];
    loading: boolean;
    addCategory: (cat: Omit<Category, 'id'>) => Promise<Category>;
    removeCategory: (id: string) => Promise<void>;
    updateCategory: (id: string, partial: Partial<Category>) => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export function CategoriesProvider({ children }: { children: ReactNode }) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const loadCategories = useCallback(async () => {
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
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

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
        setCategories(prev => {
            const updated = [...prev, newCat];
            saveCategories(updated);
            return updated;
        });
        return newCat;
    }, []);

    const removeCategory = useCallback(async (id: string) => {
        if (id === 'all') return;
        setCategories(prev => {
            const updated = prev.filter(c => c.id !== id);
            saveCategories(updated);
            return updated;
        });
    }, []);

    const updateCategory = useCallback(async (id: string, partial: Partial<Category>) => {
        setCategories(prev => {
            const updated = prev.map(c => c.id === id ? { ...c, ...partial } : c);
            saveCategories(updated);
            return updated;
        });
    }, []);

    return (
        <CategoriesContext.Provider value={{ categories, loading, addCategory, removeCategory, updateCategory }}>
            {children}
        </CategoriesContext.Provider>
    );
}

export function useCategories() {
    const context = useContext(CategoriesContext);
    if (!context) {
        throw new Error('useCategories must be used within a CategoriesProvider');
    }
    return context;
}
