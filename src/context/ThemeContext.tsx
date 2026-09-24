import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DARK_COLORS, LIGHT_COLORS } from '../constants/theme';

type ThemeMode = 'light' | 'dark';

/**
 * Interface définissant les données et méthodes du contexte de thème.
 */
interface ThemeContextType {
    /** Palette de couleurs active */
    theme: typeof DARK_COLORS;
    /** Mode de thème actuel ('light' ou 'dark') */
    mode: ThemeMode;
    /** Bascule entre le mode Sombre et le mode Clair */
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Provider gérant le thème de l'application (Sombre / Clair) avec détection du système et persistance AsyncStorage.
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [mode, setMode] = useState<ThemeMode>(systemColorScheme === 'light' ? 'light' : 'dark');

    useEffect(() => {
        const loadTheme = async () => {
            const savedTheme = await AsyncStorage.getItem('theme_preference');
            if (savedTheme) {
                setMode(savedTheme as ThemeMode);
            }
        };
        loadTheme();
    }, []);

    /** Alterne entre le mode clair et sombre et sauvegarde la préférence */
    const toggleTheme = async () => {
        const newMode = mode === 'light' ? 'dark' : 'light';
        setMode(newMode);
        await AsyncStorage.setItem('theme_preference', newMode);
    };

    const theme = mode === 'light' ? LIGHT_COLORS : DARK_COLORS;

    return (
        <ThemeContext.Provider value={{ theme, mode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

/**
 * Hook personnalisé d'accès au thème graphique de l'application.
 */
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme doit être utilisé à l'intérieur d'un ThemeProvider");
    }
    return context;
};
