import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DARK_COLORS, LIGHT_COLORS } from '../constants/theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
    theme: typeof DARK_COLORS;
    mode: ThemeMode;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

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

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
