import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category } from '../types';
import { DEFAULT_CATEGORIES } from '../constants/defaults';
import { client, getCategoriesQuery } from '../lib/sanity';

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
            // Récupérer les catégories de Sanity
            const remoteCategories = await client.fetch(getCategoriesQuery);

            // Convertir les catégories Sanity au format local
            const sanityCategories: Category[] = remoteCategories.map(cat => ({
                id: cat.name, // Utiliser name.current comme id
                name: cat.title,
                color: cat.color,
                icon: cat.icon,
            }));

            // Fusionner avec les catégories locales (en donnant priorité à Sanity)
            const localCategories = DEFAULT_CATEGORIES.filter(cat =>
                !sanityCategories.some(sanityCat => sanityCat.id === cat.id)
            );

            const allCategories = [...sanityCategories, ...localCategories];

            // Charger les catégories personnalisées locales
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            let customCategories: Category[] = [];
            if (stored) {
                customCategories = JSON.parse(stored).filter((cat: Category) =>
                    !allCategories.some(existingCat => existingCat.id === cat.id)
                );
            }

            const finalCategories = [...allCategories, ...customCategories];
            setCategories(finalCategories);

            // Sauvegarder les catégories fusionnées
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(finalCategories));

        } catch (e) {
            console.warn('[CategoriesContext] Erreur Sanity, chargement des catégories locales...', e);
            // Fallback aux catégories locales
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                setCategories(JSON.parse(stored));
            } else {
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CATEGORIES));
                setCategories(DEFAULT_CATEGORIES);
            }
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
