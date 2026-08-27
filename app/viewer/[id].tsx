import React, { useRef, useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Linking,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import { COLORS, FONT, RADII, SPACING } from '../../src/constants/theme';
import { useApps } from '../../src/context/AppsContext';
import { useFavorites } from '../../src/context/FavoritesContext';

// Platform-conditional import
let WebView: any = null;
if (Platform.OS !== 'web') {
    WebView = require('react-native-webview').WebView;
}

export default function ViewerScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { apps, remoteApps } = useApps();
    const { isFavorite, toggleFavorite } = useFavorites();
    const app = apps.find(a => a.id === id) || remoteApps.find(a => a.id === id);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const webViewRef = useRef<any>(null);

    const favorite = app ? isFavorite(app.id) : false;

    const openExternal = async () => {
        if (!app || app.sourceType !== 'url') return;
        const url = app.source.trim();
        if (!url) return;

        if (Platform.OS === 'web' && typeof window !== 'undefined') {
            window.open(url, '_blank', 'noopener,noreferrer');
            return;
        }
        await Linking.openURL(url);
    };

    // Open URL apps in new tab on web
    React.useEffect(() => {
        if (Platform.OS === 'web' && app?.sourceType === 'url' && typeof window !== 'undefined') {
            window.open(app.source, '_blank', 'noopener,noreferrer');
        }
    }, [app?.source, app?.sourceType]);

    if (!app) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorIcon}>🔍</Text>
                <Text style={styles.errorText}>App introuvable</Text>
                <TouchableOpacity onPress={() => {
                    try {
                        router.back();
                    } catch (e) {
                        router.replace('/(tabs)');
                    }
                }} style={styles.backBtn}>
                    <Text style={styles.backText}>← Retour aux apps</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const topBar = (
        <View style={styles.topBarOverlay}>
            <TouchableOpacity onPress={() => {
                try {
                    router.back();
                } catch (e) {
                    router.replace('/(tabs)');
                }
            }} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>

            <View style={styles.topInfo}>
                <Text style={styles.appTitle} numberOfLines={1}>{app.name}</Text>
                <View style={styles.badgeRow}>
                    <Text style={[styles.modeBadge, { color: app.sourceType === 'html' ? '#10b981' : '#60a5fa' }]}>
                        {app.sourceType === 'html' ? '⚡ 100% Hors-ligne' : '🌐 Web App'}
                    </Text>
                </View>
            </View>

            <View style={styles.topRightActions}>
                {/* Favorite toggle */}
                <TouchableOpacity
                    style={[
                        styles.iconBtn,
                        favorite && { backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.4)' }
                    ]}
                    onPress={() => toggleFavorite(app.id)}
                    activeOpacity={0.7}
                >
                    <FontAwesome6
                        name="heart"
                        size={15}
                        color={favorite ? '#EF4444' : COLORS.white}
                        solid={favorite}
                    />
                </TouchableOpacity>

                {Platform.OS !== 'web' && (
                    <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={() => {
                            setError(false);
                            setLoading(true);
                            webViewRef.current?.reload();
                        }}
                    >
                        <Text style={styles.reloadIcon}>↻</Text>
                    </TouchableOpacity>
                )}

                {app.sourceType === 'url' && (
                    <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={openExternal}
                    >
                        <Text style={styles.reloadIcon}>🌐</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    // Formatter le HTML si nécessaire pour garantir un rendu responsive et encodé
    const formatHtmlSource = (rawHtml: string) => {
        if (rawHtml.includes('<!DOCTYPE html>') || rawHtml.includes('<html')) {
            return rawHtml;
        }
        return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    body { margin: 0; padding: 16px; font-family: -apple-system, system-ui, sans-serif; background: #0f172a; color: #f8fafc; }
  </style>
</head>
<body>
  ${rawHtml}
</body>
</html>`;
    };

    // Web platform
    if (Platform.OS === 'web') {
        if (app.sourceType === 'url') {
            return (
                <View style={styles.center}>
                    <Text style={styles.loadingText}>Redirection vers {app.name}...</Text>
                    <ActivityIndicator size="large" color={COLORS.accent} style={{ marginTop: 20 }} />
                </View>
            );
        }

        const formattedHtml = formatHtmlSource(app.source);
        const htmlDataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(formattedHtml)}`;
        return (
            <View style={styles.container}>
                {topBar}
                <iframe
                    src={htmlDataUrl}
                    style={{ flex: 1, border: 'none', width: '100%', height: '100%' }}
                    title={app.name}
                    onLoad={() => setLoading(false)}
                    onError={() => { setLoading(false); setError(true); }}
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                />
            </View>
        );
    }

    // Native: react-native-webview avec stratégie de cache agressif
    const source = app.sourceType === 'url'
        ? { uri: app.source }
        : { html: formatHtmlSource(app.source) };

    return (
        <View style={styles.container}>
            {error ? (
                <View style={styles.center}>
                    <Text style={styles.errorIcon}>{app.sourceType === 'url' ? '📡' : '⚠️'}</Text>
                    <Text style={styles.errorTitle}>
                        {app.sourceType === 'url' ? 'Connexion Internet Requise' : 'Erreur de chargement'}
                    </Text>
                    <Text style={styles.errorText}>
                        {app.sourceType === 'url'
                            ? `"${app.name}" est un site web en ligne qui nécessite une connexion réseau active pour être chargé.`
                            : `Impossible d'exécuter le code de l'application "${app.name}".`}
                    </Text>
                    <View style={styles.errorActions}>
                        <TouchableOpacity
                            onPress={() => { setError(false); setLoading(true); webViewRef.current?.reload(); }}
                            style={styles.retryBtn}
                        >
                            <Text style={styles.retryText}>Réessayer ↺</Text>
                        </TouchableOpacity>

                        {app.sourceType === 'url' && (
                            <TouchableOpacity onPress={openExternal} style={styles.openExternalBtn}>
                                <Text style={styles.openExternalText}>Ouvrir dans le navigateur</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            onPress={() => {
                                try { router.back(); } catch (_) { router.replace('/(tabs)'); }
                            }}
                            style={styles.backBtn}
                        >
                            <Text style={styles.backText}>← Revenir au catalogue</Text>
                        </TouchableOpacity>
                    </View>
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
                        cacheEnabled={true}
                        cacheMode="LOAD_CACHE_ELSE_NETWORK"
                        sharedCookiesEnabled={true}
                        allowsInlineMediaPlayback={true}
                        mediaPlaybackRequiresUserAction={false}
                        originWhitelist={['*']}
                        scalesPageToFit={true}
                    />
                </View>
            )}

            {/* Top Bar as Glassmorphism Overlay */}
            {topBar}

            {loading && !error && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={COLORS.accent} />
                    <Text style={styles.loadingText}>Lancement de {app.name}...</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#090D16' },
    topBarOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 54 : 38,
        paddingHorizontal: 16,
        paddingBottom: 12,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.08)',
        zIndex: 10,
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
    },
    closeBtnText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: 'bold',
    },
    topInfo: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    appTitle: {
        fontFamily: FONT.bold,
        fontSize: 15,
        color: COLORS.white,
    },
    badgeRow: {
        flexDirection: 'row',
        marginTop: 2,
    },
    modeBadge: {
        fontFamily: FONT.medium,
        fontSize: 11,
        opacity: 0.9,
    },
    topRightActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
    },
    reloadIcon: {
        color: COLORS.white,
        fontSize: 17,
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
        backgroundColor: '#0F1115',
    },
    errorIcon: { fontSize: 56, marginBottom: 16 },
    errorTitle: {
        fontFamily: FONT.bold,
        fontSize: 20,
        color: COLORS.white,
        marginBottom: 8,
        textAlign: 'center',
    },
    errorText: {
        fontFamily: FONT.regular,
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 28,
        textAlign: 'center',
        lineHeight: 20,
        maxWidth: 320,
    },
    errorActions: {
        width: '100%',
        maxWidth: 280,
        gap: 12,
        alignItems: 'stretch',
    },
    retryBtn: {
        paddingVertical: 14,
        backgroundColor: COLORS.accent,
        borderRadius: 100,
        alignItems: 'center',
    },
    retryText: {
        fontFamily: FONT.bold,
        fontSize: 14,
        color: COLORS.white,
    },
    openExternalBtn: {
        paddingVertical: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 100,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
    },
    openExternalText: {
        fontFamily: FONT.bold,
        fontSize: 14,
        color: COLORS.accent,
    },
    backBtn: {
        paddingVertical: 14,
        backgroundColor: 'transparent',
        alignItems: 'center',
    },
    backText: {
        fontFamily: FONT.medium,
        fontSize: 14,
        color: COLORS.textMuted,
    },
});
