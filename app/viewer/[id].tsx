import React, { useRef, useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { COLORS, FONT, RADII, SPACING } from '../../src/constants/theme';
import { useApps } from '../../src/hooks/useApps';

// Platform-conditional import
let WebView: any = null;
if (Platform.OS !== 'web') {
    WebView = require('react-native-webview').WebView;
}

export default function ViewerScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { apps } = useApps();
    const app = apps.find(a => a.id === id);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const webViewRef = useRef<any>(null);

    // Fade in top bar or maintain as minimal overlay
    if (!app) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorIcon}>🔍</Text>
                <Text style={styles.errorText}>App introuvable</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backText}>← Retour</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const topBar = (
        <View style={styles.topBarOverlay}>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>

            <View style={styles.topInfo}>
                <Text style={styles.appTitle} numberOfLines={1}>{app.name}</Text>
            </View>

            {Platform.OS !== 'web' && app.sourceType === 'url' && (
                <TouchableOpacity
                    style={styles.reloadBtn}
                    onPress={() => webViewRef.current?.reload()}
                >
                    <Text style={styles.reloadIcon}>↻</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    // Web platform: use iframe
    if (Platform.OS === 'web') {
        const iframeSrc = app.sourceType === 'url'
            ? app.source
            : `data:text/html;charset=utf-8,${encodeURIComponent(app.source)}`;
        return (
            <View style={styles.container}>
                {topBar}
                <iframe
                    src={iframeSrc}
                    style={{ flex: 1, border: 'none', width: '100%', height: '100%' }}
                    title={app.name}
                    onLoad={() => setLoading(false)}
                    onError={() => { setLoading(false); setError(true); }}
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
            </View>
        );
    }

    // Native: use react-native-webview
    const source = app.sourceType === 'url'
        ? { uri: app.source }
        : { html: app.source };

    return (
        <View style={styles.container}>
            {/* WebView is truly edge to edge */}
            {error ? (
                <View style={styles.center}>
                    <Text style={styles.errorIcon}>⚠️</Text>
                    <Text style={styles.errorText}>Impossible de charger cette app.</Text>
                    <TouchableOpacity
                        onPress={() => { setError(false); setLoading(true); webViewRef.current?.reload(); }}
                        style={styles.retryBtn}
                    >
                        <Text style={styles.retryText}>Réessayer</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={{ flex: 1 }}>
                    <WebView
                        ref={webViewRef}
                        source={source}
                        style={styles.webview}
                        onLoadEnd={() => setLoading(false)}
                        onError={() => { setLoading(false); setError(true); }}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        allowsInlineMediaPlayback={true}
                        mediaPlaybackRequiresUserAction={false}
                        originWhitelist={['*']}
                        scalesPageToFit={true}
                    />
                </View>
            )}

            {/* Top Bar as Overlay */}
            {topBar}

            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={COLORS.accent} />
                    <Text style={styles.loadingText}>Lancement de {app.name}...</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' }, // True black background for edge-to-edge
    topBarOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 54 : 36,
        paddingHorizontal: 16,
        paddingBottom: 12,
        backgroundColor: 'rgba(15, 17, 21, 0.4)', // Glassmorphism-style overlay
        zIndex: 10,
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    closeBtnText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: 'bold',
    },
    topInfo: {
        flex: 1,
        alignItems: 'center',
    },
    appTitle: {
        fontFamily: FONT.medium,
        fontSize: 15,
        color: COLORS.white,
        opacity: 0.9,
    },
    reloadBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    reloadIcon: {
        color: COLORS.white,
        fontSize: 18,
    },
    webview: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#0F1115',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        zIndex: 20,
    },
    loadingText: {
        fontFamily: FONT.medium,
        fontSize: 15,
        color: COLORS.textSecondary,
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
        backgroundColor: COLORS.bg,
    },
    errorIcon: { fontSize: 52, marginBottom: 20 },
    errorText: {
        fontFamily: FONT.bold,
        fontSize: 18,
        color: COLORS.text,
        marginBottom: 20,
        textAlign: 'center',
    },
    backBtn: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: COLORS.surface,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    backText: {
        fontFamily: FONT.medium,
        fontSize: 14,
        color: COLORS.accent,
    },
    retryBtn: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: COLORS.accent,
        borderRadius: 100,
    },
    retryText: {
        fontFamily: FONT.bold,
        fontSize: 14,
        color: COLORS.white,
    },
});
