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
import { COLORS } from '../src/constants/theme';
import { AppsProvider } from '../src/context/AppsContext';
import { CategoriesProvider } from '../src/context/CategoriesContext';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';

SplashScreen.preventAutoHideAsync();

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
        }
    }, [fontsLoaded, fontError]);

    if (!fontsLoaded && !fontError) {
        return null;
    }

    return (
        <ThemeProvider>
            <AppsProvider>
                <CategoriesProvider>
                    <StackLayout />
                </CategoriesProvider>
            </AppsProvider>
        </ThemeProvider>
    );
}
