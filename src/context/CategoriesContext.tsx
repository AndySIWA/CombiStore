import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category } from '../types';
import { DEFAULT_CATEGORIES } from '../constants/defaults';
import { client, getCategoriesQuery } from '../lib/sanity';

const STORAGE_KEY = '@combistore_categories';
const CUSTOM_CATEGORIES_KEY = '@combistore_custom_categories';

/** Interface des méthodes et valeurs exposées par le contexte des catégories */
interface CategoriesContextType {
    /** Liste des catégories enregistrées */
    categories: Category[];
    /** Indique si le chargement des catégories est en cours */
    loading: boolean;
    /** Ajoute une catégorie personnalisée */
    addCategory: (cat: Omit<Category, 'id'>) => Promise<Category>;
    /** Supprime une catégorie par son identifiant */
    removeCategory: (id: string) => Promise<void>;
    /** Met à jour les propriétés d'une catégorie */
    updateCategory: (id: string, partial: Partial<Category>) => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

type SanityCategory = {
    id?: string;
    name?: string | { current?: string };
    title?: string;
    color?: string;
    icon?: string;
};

/** Extrait l'identifiant normalisé d'une catégorie Sanity */
const getSanityCategoryId = (cat: SanityCategory) => {
    let id: string | undefined;
    if (typeof cat.name === 'string') id = cat.name;
    else if (cat.name?.current) id = cat.name.current;
    else id = cat.id;

    return id?.toLowerCase() || cat.id;
};

/**
 * Provider gérant l'état des catégories (chargement initial local, mise à jour Sanity, et catégories personnalisées).
 */
export function CategoriesProvider({ children }: { children: ReactNode }) {
    const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
    const [loading, setLoading] = useState(true);

    /** Charge les catégories depuis AsyncStorage et rafraîchit en arrière-plan depuis Sanity CMS */
    const loadCategories = useCallback(async () => {
        // 1. Charger immédiatement le cache local
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setCategories(parsed);
                }
            }
        } catch (_) {}

        // 2. Tenter de rafraîchir avec Sanity en arrière-plan
        try {
            const fetchPromise = client.fetch<SanityCategory[]>(getCategoriesQuery);
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Sanity categories timeout')), 8000),
            );

            const remoteCategories = await Promise.race([fetchPromise, timeoutPromise]);

            if (remoteCategories && Array.isArray(remoteCategories) && remoteCategories.length > 0) {
                const sanityCategories: Category[] = remoteCategories
                    .map(cat => ({
                        id: getSanityCategoryId(cat),
                        name: cat.title,
                        color: cat.color,
                        icon: cat.icon,
                    }))
                    .filter((cat): cat is Category =>
                        Boolean(cat.id && cat.name && cat.color && cat.icon),
                    );

                const customStored = await AsyncStorage.getItem(CUSTOM_CATEGORIES_KEY);
                let customCategories: Category[] = [];
                if (customStored) {
                    const parsed = JSON.parse(customStored);
                    if (Array.isArray(parsed)) {
                        customCategories = parsed;
                    }
                }

                const baseCategories = sanityCategories.length > 0
                    ? sanityCategories
                    : DEFAULT_CATEGORIES;

                const finalCategories = [...baseCategories, ...customCategories];
                setCategories(finalCategories);
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(finalCategories));
            }
        } catch (e) {
            console.warn('[CategoriesContext] Utilisation des catégories en cache / défaut :', e);
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (!stored) {
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
            if (!Array.isArray(cats)) {
                console.error('[CategoriesContext] saveCategories appelé avec un élément non-tableau :', cats);
                return;
            }
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
        } catch (e) {
            console.error('Erreur de sauvegarde des catégories :', e);
        }
    };

    /** Ajoute une catégorie personnalisée */
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

        const stored = await AsyncStorage.getItem(CUSTOM_CATEGORIES_KEY);
        let customCats: Category[] = [];
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                customCats = parsed;
            }
        }
        customCats.push(newCat);
        await AsyncStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(customCats));

        return newCat;
    }, []);

    /** Supprime une catégorie personnalisée */
    const removeCategory = useCallback(async (id: string) => {
        if (id === 'all') return;
        setCategories(prev => {
            const updated = prev.filter(c => c.id !== id);
            saveCategories(updated);
            return updated;
        });

        const stored = await AsyncStorage.getItem(CUSTOM_CATEGORIES_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                const updated = parsed.filter((c: Category) => c.id !== id);
                await AsyncStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(updated));
            }
        }
    }, []);

    /** Met à jour une catégorie */
    const updateCategory = useCallback(async (id: string, partial: Partial<Category>) => {
        setCategories(prev => {
            const updated = prev.map(c => c.id === id ? { ...c, ...partial } : c);
            saveCategories(updated);
            return updated;
        });

        const stored = await AsyncStorage.getItem(CUSTOM_CATEGORIES_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                const updated = parsed.map((c: Category) =>
                    c.id === id ? { ...c, ...partial } : c,
                );
                await AsyncStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(updated));
            }
        }
    }, []);

    return (
        <CategoriesContext.Provider value={{ categories, loading, addCategory, removeCategory, updateCategory }}>
            {children}
        </CategoriesContext.Provider>
    );
}

/**
 * Hook d'accès aux catégories de l'application.
 */
export function useCategories() {
    const context = useContext(CategoriesContext);
    if (!context) {
        throw new Error("useCategories doit être utilisé à l'intérieur d'un CategoriesProvider");
    }
    return context;
}
