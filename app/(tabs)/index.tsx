import React, { useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    TextInput, Alert, RefreshControl, Image, Modal, Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT, GRADIENTS } from '../../src/constants/theme';
import { useApps } from '../../src/context/AppsContext';
import { useCategories } from '../../src/context/CategoriesContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { useFavorites } from '../../src/context/FavoritesContext';
import { AnimatedCard } from '../../src/components/AnimatedCard';
import { MiniApp, RemoteApp } from '../../src/types';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withRepeat,
    withSequence,
    Easing,
} from 'react-native-reanimated';
import { FontAwesome6 } from '@expo/vector-icons';

const ALL_CAT_ID = 'all';
const FAVORITES_CAT_ID = 'favorites';
const OFFLINE_CAT_ID = 'offline_filter';

export default function StoreScreen() {
    const { apps, remoteApps, refreshingRemote, isOffline, fetchRemoteApps, importRemoteApp } = useApps();
    const { categories } = useCategories();
    const { theme, mode, toggleTheme } = useTheme();
    const { user, signInWithGoogle, signOut, loading: authLoading } = useAuth();
    const { isFavorite, favoritesCount, syncing, syncWithCloud } = useFavorites();

    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState(ALL_CAT_ID);
    const [searchFocused, setSearchFocused] = useState(false);
    const [profileModalVisible, setProfileModalVisible] = useState(false);

    // Animation values for the app logo
    const logoScale = useSharedValue(0.3);
    const logoRotate = useSharedValue(-30);
    const logoTranslateY = useSharedValue(0);

    React.useEffect(() => {
        // Entrance animation: scale up to 1 and rotate back to 0 with a nice spring bounce
        logoScale.value = withSpring(1, { damping: 10, stiffness: 90 });
        logoRotate.value = withSpring(0, { damping: 10, stiffness: 90 }, (finished) => {
            if (finished) {
                // Loop animations start once the entrance is complete
                logoScale.value = withRepeat(
                    withTiming(1.04, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
                    -1,
                    true
                );
                logoTranslateY.value = withRepeat(
                    withTiming(3, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                    -1,
                    true
                );
            }
        });
    }, []);

    const handleLogoPress = () => {
        logoScale.value = withSequence(
            withTiming(1.25, { duration: 150, easing: Easing.out(Easing.ease) }),
            withSpring(1, { damping: 8, stiffness: 100 })
        );
        logoRotate.value = 0;
        logoRotate.value = withTiming(360, { duration: 550, easing: Easing.out(Easing.back()) }, (finished) => {
            if (finished) {
                logoRotate.value = 0;
            }
        });

        setTimeout(() => {
            router.push('/info');
        }, 150);
    };

    const logoAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: logoScale.value },
                { rotate: `${logoRotate.value}deg` },
                { translateY: logoTranslateY.value },
            ],
        };
    });

    const handleOpen = (app: MiniApp | RemoteApp) => {
        const isLocal = 'addedAt' in app;
        if (isLocal) {
            router.push(`/viewer/${app.id}`);
            return;
        }

        const isInstalled = apps.some(a => a.remoteId === app.id);
        if (isInstalled) {
            const installedApp = apps.find(a => a.remoteId === app.id);
            if (installedApp) router.push(`/viewer/${installedApp.id}`);
            return;
        }

        router.push(`/viewer/${app.id}`);
    };

    const handleInstall = async (app: RemoteApp) => {
        await importRemoteApp(app);
    };

    const isAppInstalled = (app: MiniApp | RemoteApp) => {
        if ('addedAt' in app) return true;
        return apps.some(a => a.remoteId === app.id);
    };

    const combinedApps = [
        ...apps,
        ...remoteApps.filter(remote => !apps.some(local => local.remoteId === remote.id)),
    ];

    const filtered = combinedApps.filter(app => {
        let matchCat = true;
        if (activeCategory === FAVORITES_CAT_ID) {
            matchCat = isFavorite(app.id);
        } else if (activeCategory === OFFLINE_CAT_ID) {
            matchCat = app.sourceType === 'html';
        } else if (activeCategory !== ALL_CAT_ID) {
            matchCat = app.categoryId === activeCategory;
        }

        const matchSearch = search.length === 0 ||
            app.name.toLowerCase().includes(search.toLowerCase()) ||
            app.description.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    const getCategory = (id: string) => categories.find(c => c.id === id);

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            {/* Background Decorative Elements for Glassmorphism */}
            <View style={[styles.bgCircle1, { backgroundColor: theme.accent + '20' }]} />
            <View style={[styles.bgCircle2, { backgroundColor: theme.accentSecondary + '15' }]} />

            {/* Header with Glassmorphism feel */}
            <LinearGradient
                colors={mode === 'dark' ? ['rgba(22, 25, 30, 0.95)', 'rgba(22, 25, 30, 0)'] : ['rgba(248, 250, 252, 0.95)', 'rgba(248, 250, 252, 0)']}
                style={styles.header}
            >
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        style={styles.headerLeft}
                        onPress={handleLogoPress}
                        activeOpacity={0.7}
                    >
                        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
                            <Image
                                source={require('../../assets/Logo_CombiStore.png')}
                                style={styles.headerLogo}
                                resizeMode="contain"
                            />
                        </Animated.View>
                        <View style={styles.headerTitleWrap}>
                            <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>Explorer</Text>
                            <Text style={[styles.headerSlogan, { color: theme.textSecondary }]} numberOfLines={1}>
                                {isOffline ? '⚡ Mode Hors-Ligne' : 'Nouveautés publiées'}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.headerRight}>
                        {/* Auth / Profile Button (Compact Icon Only) */}
                        {user ? (
                            <TouchableOpacity
                                onPress={() => setProfileModalVisible(true)}
                                style={[
                                    styles.userAvatarBtn,
                                    { borderColor: theme.accent + '60', backgroundColor: theme.surface }
                                ]}
                                activeOpacity={0.7}
                            >
                                {user.photoURL ? (
                                    <Image source={{ uri: user.photoURL }} style={styles.userAvatarImg} />
                                ) : (
                                    <Text style={[styles.userInitials, { color: theme.accent }]}>
                                        {user.displayName ? user.displayName[0].toUpperCase() : '👤'}
                                    </Text>
                                )}
                                {syncing && (
                                    <View style={styles.syncBadge}>
                                        <Text style={styles.syncBadgeText}>🔄</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                onPress={signInWithGoogle}
                                disabled={authLoading}
                                style={[
                                    styles.headerIconBtn,
                                    { backgroundColor: theme.surface, borderColor: theme.border }
                                ]}
                                activeOpacity={0.7}
                            >
                                <FontAwesome6 name="google" size={16} color="#EA4335" />
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            onPress={fetchRemoteApps}
                            disabled={refreshingRemote}
                            style={[styles.headerIconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                        >
                            <FontAwesome6
                                name="arrows-rotate"
                                size={16}
                                color={theme.text}
                                style={refreshingRemote ? { opacity: 0.4 } : undefined}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={toggleTheme}
                            style={[styles.headerIconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                        >
                            <Text style={styles.headerIconText}>{mode === 'dark' ? '☀️' : '🌙'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Search bar with subtle animation feel */}
                <View style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }, searchFocused && { borderColor: theme.accent + '88' }]}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={[styles.searchInput, { color: theme.text }]}
                        placeholder="Rechercher une application..."
                        placeholderTextColor={theme.textMuted}
                        value={search}
                        onChangeText={setSearch}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <Text style={[styles.clearBtn, { color: theme.textMuted }]}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Offline banner notification if offline */}
                {isOffline && (
                    <View style={[styles.offlineBanner, { backgroundColor: theme.surface, borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
                        <Text style={styles.offlineBannerIcon}>⚡</Text>
                        <Text style={[styles.offlineBannerText, { color: theme.textSecondary }]} numberOfLines={1}>
                            Mode hors-ligne : catalogue local
                        </Text>
                    </View>
                )}
            </LinearGradient>

            {/* Category pills with Favorites integration (Icon only for Favorites) */}
            <View style={styles.pillsContainer}>
                <FlatList
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    data={[
                        { id: ALL_CAT_ID, name: 'Toutes', icon: '🌟', color: theme.accent },
                        {
                            id: FAVORITES_CAT_ID,
                            name: '',
                            icon: '❤️',
                            color: '#EF4444'
                        },
                        { id: OFFLINE_CAT_ID, name: 'Hors-ligne', icon: '⚡', color: '#10B981' },
                        ...categories.filter(c => c.id !== ALL_CAT_ID)
                    ]}
                    keyExtractor={c => c.id}
                    contentContainerStyle={styles.pills}
                    renderItem={({ item: cat }) => {
                        const active = activeCategory === cat.id;
                        const isFav = cat.id === FAVORITES_CAT_ID;
                        return (
                            <TouchableOpacity
                                onPress={() => setActiveCategory(cat.id)}
                                style={[
                                    styles.pill,
                                    isFav && styles.favPill,
                                    { backgroundColor: theme.surface, borderColor: theme.border },
                                    active && { backgroundColor: cat.color, borderColor: cat.color },
                                ]}
                            >
                                <Text style={[styles.pillText, { color: theme.textSecondary }, active && { color: COLORS.white }]}>
                                    {cat.icon}{cat.name ? ` ${cat.name}` : ''}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>

            {/* App grid */}
            <FlatList
                data={filtered}
                keyExtractor={a => a.id}
                numColumns={2}
                contentContainerStyle={styles.grid}
                columnWrapperStyle={styles.row}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshingRemote} onRefresh={fetchRemoteApps} tintColor={theme.accent} />
                }
                ListHeaderComponent={
                    <View style={styles.statsBar}>
                        <Text style={[styles.countText, { color: theme.textMuted }]}>
                            {filtered.length} app{filtered.length !== 1 ? 's' : ''} {activeCategory === FAVORITES_CAT_ID ? 'favorite' : 'disponible'}{filtered.length !== 1 ? 's' : ''}
                        </Text>
                        <View style={[styles.statsLine, { backgroundColor: theme.border }]} />
                    </View>
                }
                ListEmptyComponent={
                    activeCategory === FAVORITES_CAT_ID ? (
                        <View style={styles.emptyFavorites}>
                            <View style={[styles.emptyHeartBubble, { backgroundColor: 'rgba(239, 68, 68, 0.12)', borderColor: 'rgba(239, 68, 68, 0.3)' }]}>
                                <FontAwesome6 name="heart" size={36} color="#EF4444" solid />
                            </View>
                            <Text style={[styles.emptyTitle, { color: theme.text }]}>
                                Aucun favori pour le moment
                            </Text>
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                                Cliquez sur le cœur ❤️ d'une application pour l'ajouter à vos favoris et la retrouver ici instantanément.
                            </Text>
                            <TouchableOpacity
                                onPress={() => setActiveCategory(ALL_CAT_ID)}
                                style={[styles.emptyActionBtn, { backgroundColor: theme.accent }]}
                            >
                                <Text style={styles.emptyActionBtnText}>Explorer les applications</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.empty}>
                            <Text style={styles.emptyIcon}>⚡</Text>
                            <Text style={[styles.emptyTitle, { color: theme.text }]}>
                                {search || activeCategory !== ALL_CAT_ID ? 'Aucun résultat' : 'Catalogue en préparation'}
                            </Text>
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                                {search || activeCategory !== ALL_CAT_ID
                                    ? 'Essayez une autre recherche ou filtre.'
                                    : 'De nouvelles applications hors-ligne seront disponibles sous peu.'}
                            </Text>
                        </View>
                    )
                }
                renderItem={({ item, index }) => {
                    const installed = isAppInstalled(item);
                    const isRemote = !('addedAt' in item);
                    return (
                        <AnimatedCard
                            app={item as MiniApp}
                            category={getCategory(item.categoryId)}
                            onPress={() => handleOpen(item)}
                            isInstalled={installed}
                            actionLabel={isRemote && !installed ? 'Ajouter' : undefined}
                            onAction={isRemote && !installed ? () => handleInstall(item as RemoteApp) : undefined}
                            delay={index * 40}
                        />
                    );
                }}
            />

            {/* User Profile Modal */}
            <Modal
                visible={profileModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setProfileModalVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setProfileModalVisible(false)}
                >
                    <Pressable
                        style={[styles.profileCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                        onPress={(e) => e.stopPropagation()}
                    >
                        {/* Header with Avatar */}
                        <View style={styles.profileHeader}>
                            <View style={[styles.profileAvatarWrapper, { borderColor: theme.accent }]}>
                                {user?.photoURL ? (
                                    <Image source={{ uri: user.photoURL }} style={styles.profileAvatarLarge} />
                                ) : (
                                    <Text style={[styles.profileAvatarInitial, { color: theme.accent }]}>
                                        {user?.displayName ? user.displayName[0].toUpperCase() : '👤'}
                                    </Text>
                                )}
                            </View>
                            <Text style={[styles.profileName, { color: theme.text }]}>
                                {user?.displayName || 'Utilisateur'}
                            </Text>
                            {user?.email && (
                                <Text style={[styles.profileEmail, { color: theme.textSecondary }]}>
                                    {user.email}
                                </Text>
                            )}

                            <View style={styles.cloudBadge}>
                                <Text style={styles.cloudBadgeText}>🟢 Synchronisation Cloud Active</Text>
                            </View>
                        </View>

                        {/* User Stats Card */}
                        <View style={[styles.statsBox, { backgroundColor: theme.bg, borderColor: theme.border }]}>
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: '#EF4444' }]}>{favoritesCount}</Text>
                                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Favoris ❤️</Text>
                            </View>
                            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: theme.accent }]}>{apps.length}</Text>
                                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Apps installées</Text>
                            </View>
                        </View>

                        {/* Modal Actions */}
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                onPress={async () => {
                                    await syncWithCloud();
                                    Alert.alert('Synchronisation', 'Vos favoris et préférences sont à jour dans le cloud.');
                                }}
                                style={[styles.modalBtn, { backgroundColor: theme.accent + '20', borderColor: theme.accent + '50' }]}
                            >
                                <FontAwesome6 name="arrows-rotate" size={14} color={theme.accent} style={{ marginRight: 8 }} />
                                <Text style={[styles.modalBtnText, { color: theme.accent }]}>Synchroniser maintenant</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={async () => {
                                    setProfileModalVisible(false);
                                    await signOut();
                                }}
                                style={[styles.modalBtn, styles.logoutBtn]}
                            >
                                <FontAwesome6 name="arrow-right-from-bracket" size={14} color="#EF4444" style={{ marginRight: 8 }} />
                                <Text style={[styles.modalBtnText, { color: '#EF4444' }]}>Se déconnecter</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    bgCircle1: {
        position: 'absolute',
        top: -50,
        right: -50,
        width: 250,
        height: 250,
        borderRadius: 125,
        opacity: 0.4,
    },
    bgCircle2: {
        position: 'absolute',
        bottom: 100,
        left: -80,
        width: 300,
        height: 300,
        borderRadius: 150,
        opacity: 0.3,
    },
    header: {
        paddingTop: 48,
        paddingHorizontal: 20,
        paddingBottom: SPACING.md,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
        marginRight: 8,
    },
    logoContainer: {
        width: 48,
        height: 48,
    },
    headerLogo: {
        width: '100%',
        height: '100%',
    },
    headerTitleWrap: {
        flex: 1,
    },
    headerTitle: {
        fontFamily: FONT.bold,
        fontSize: 21,
        letterSpacing: -0.6,
    },
    headerSlogan: {
        fontFamily: FONT.medium,
        fontSize: 12,
        marginTop: 1,
        opacity: 0.8,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    userAvatarBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
    },
    userAvatarImg: {
        width: '100%',
        height: '100%',
        borderRadius: 19,
    },
    userInitials: {
        fontFamily: FONT.bold,
        fontSize: 15,
    },
    syncBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: '#FFFFFF',
        borderRadius: 6,
        padding: 1,
    },
    syncBadgeText: {
        fontSize: 8,
    },
    headerIconBtn: {
        width: 38,
        height: 38,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    headerIconText: {
        fontSize: 17,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        height: 44,
    },
    searchIcon: {
        fontSize: 18,
        marginRight: 10,
        opacity: 0.6,
    },
    searchInput: {
        flex: 1,
        fontFamily: FONT.regular,
        fontSize: 15,
    },
    clearBtn: {
        fontSize: 16,
        paddingLeft: 10,
    },
    offlineBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        paddingVertical: 7,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8,
    },
    offlineBannerIcon: {
        fontSize: 13,
        color: '#10B981',
    },
    offlineBannerText: {
        fontFamily: FONT.medium,
        fontSize: 11,
        flex: 1,
    },
    pillsContainer: {
        marginBottom: 4,
    },
    pills: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        gap: 8,
    },
    pill: {
        paddingHorizontal: 15,
        paddingVertical: 7.5,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    favPill: {
        paddingHorizontal: 13,
        minWidth: 42,
    },
    pillText: {
        fontFamily: FONT.semiBold,
        fontSize: 12,
    },
    statsBar: {
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 4,
    },
    countText: {
        fontFamily: FONT.medium,
        fontSize: 13,
        letterSpacing: 0.5,
    },
    statsLine: {
        flex: 1,
        height: 1,
    },
    grid: {
        paddingHorizontal: 20,
        paddingBottom: 120,
    },
    row: {
        justifyContent: 'space-between',
    },
    empty: {
        alignItems: 'center',
        paddingTop: 80,
        paddingHorizontal: 40,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 24,
        opacity: 0.5,
    },
    emptyTitle: {
        fontFamily: FONT.bold,
        fontSize: 20,
        marginBottom: 10,
        textAlign: 'center',
    },
    emptyText: {
        fontFamily: FONT.regular,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 21,
        marginBottom: 24,
    },
    emptyFavorites: {
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 32,
    },
    emptyHeartBubble: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    emptyActionBtn: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 16,
    },
    emptyActionBtnText: {
        fontFamily: FONT.bold,
        fontSize: 14,
        color: COLORS.white,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    profileCard: {
        width: '100%',
        maxWidth: 360,
        borderRadius: 28,
        borderWidth: 1,
        padding: 24,
        alignItems: 'center',
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileAvatarWrapper: {
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 3,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        overflow: 'hidden',
    },
    profileAvatarLarge: {
        width: '100%',
        height: '100%',
    },
    profileAvatarInitial: {
        fontFamily: FONT.bold,
        fontSize: 32,
    },
    profileName: {
        fontFamily: FONT.bold,
        fontSize: 19,
        marginBottom: 4,
    },
    profileEmail: {
        fontFamily: FONT.medium,
        fontSize: 13,
        marginBottom: 10,
    },
    cloudBadge: {
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.25)',
    },
    cloudBadgeText: {
        fontFamily: FONT.semiBold,
        fontSize: 11,
        color: '#10B981',
    },
    statsBox: {
        flexDirection: 'row',
        width: '100%',
        borderRadius: 18,
        borderWidth: 1,
        paddingVertical: 14,
        marginBottom: 20,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontFamily: FONT.bold,
        fontSize: 20,
        marginBottom: 2,
    },
    statLabel: {
        fontFamily: FONT.medium,
        fontSize: 12,
    },
    statDivider: {
        width: 1,
        height: '80%',
        alignSelf: 'center',
    },
    modalActions: {
        width: '100%',
        gap: 10,
    },
    modalBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingVertical: 13,
        borderRadius: 16,
        borderWidth: 1,
    },
    modalBtnText: {
        fontFamily: FONT.bold,
        fontSize: 14,
    },
    logoutBtn: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderColor: 'rgba(239, 68, 68, 0.25)',
    },
});
