import 'react-native-url-polyfill/auto';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
    useFonts,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
} from '@expo-google-fonts/inter';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { AuthProvider } from '../src/context/AuthContext';
import { FavoritesProvider } from '../src/context/FavoritesContext';
import { AppsProvider } from '../src/context/AppsContext';
import { CategoriesProvider } from '../src/context/CategoriesContext';
import { checkForAppUpdates } from '../src/services/updatesService';

// Empêche le masquage automatique de l'écran de démarrage tant que les polices ne sont pas chargées
SplashScreen.preventAutoHideAsync();

/**
 * Composant de navigation Stack principale de l'application.
 */
function StackLayout() {
    const { theme, mode } = useTheme();

    return (
        <>
            <StatusBar style={mode === 'light' ? 'dark' : 'light'} translucent={true} />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: theme.bg },
                    animation: 'slide_from_right',
                }}
            >
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                    name="manage-app"
                    options={{
                        presentation: 'modal',
                        animation: 'slide_from_bottom',
                    }}
                />
                <Stack.Screen
                    name="viewer/[id]"
                    options={{
                        animation: 'slide_from_right',
                    }}
                />
            </Stack>
        </>
    );
}

/**
 * Layout racine encapsulant tous les Providers de contexte d'état (Thème, Auth, Favoris, Apps, Catégories)
 * et chargeant les polices d'écriture Google Fonts.
 */
export default function RootLayout() {
    const [fontsLoaded, fontError] = useFonts({
        Inter_400Regular,
        Inter_500Medium,
        Inter_600SemiBold,
        Inter_700Bold,
    });

    useEffect(() => {
        if (fontsLoaded || fontError) {
            SplashScreen.hideAsync();
            checkForAppUpdates();
        }
    }, [fontsLoaded, fontError]);

    if (!fontsLoaded && !fontError) {
        return null;
    }

    return (
        <ThemeProvider>
            <AuthProvider>
                <FavoritesProvider>
                    <AppsProvider>
                        <CategoriesProvider>
                            <StackLayout />
                        </CategoriesProvider>
                    </AppsProvider>
                </FavoritesProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
