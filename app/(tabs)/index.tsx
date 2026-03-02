import React, { useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    TextInput, Alert, RefreshControl, Image,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT, GRADIENTS } from '../../src/constants/theme';
import { useApps } from '../../src/context/AppsContext';
import { useCategories } from '../../src/context/CategoriesContext';
import { useTheme } from '../../src/context/ThemeContext';
import { AppCard } from '../../src/components/AppCard';
import { MiniApp } from '../../src/types';

const ALL_CAT_ID = 'all';

export default function StoreScreen() {
    const { apps, loading, removeApp } = useApps();
    const { categories } = useCategories();
    const { theme, mode, toggleTheme } = useTheme();
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState(ALL_CAT_ID);
    const [searchFocused, setSearchFocused] = useState(false);

    const handleOpen = (app: MiniApp) => {
        router.push(`/viewer/${app.id}`);
    };

    const handleLongPress = (app: MiniApp) => {
        Alert.alert(
            `Supprimer "${app.name}" ?`,
            'Cette action est irréversible.',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: () => removeApp(app.id),
                },
            ]
        );
    };

    const filtered = apps.filter(app => {
        const matchCat = activeCategory === ALL_CAT_ID || app.categoryId === activeCategory;
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
                    <View style={styles.headerLeft}>
                        <View style={[styles.logoContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <Image
                                source={require('../../assets/Logo_CombiStore.png')}
                                style={styles.headerLogo}
                                resizeMode="contain"
                            />
                        </View>
                        <View>
                            <Text style={[styles.headerTitle, { color: theme.text }]}>CombiStore</Text>
                            <Text style={[styles.headerSlogan, { color: theme.textSecondary }]}>Vos apps à votre aise</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={toggleTheme}
                        style={[styles.themeToggle, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    >
                        <Text style={styles.themeToggleIcon}>{mode === 'dark' ? '☀️' : '🌙'}</Text>
                    </TouchableOpacity>
                </View>

                {/* Search bar with subtle animation feel */}
                <View style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }, searchFocused && { borderColor: theme.accent + '88' }]}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={[styles.searchInput, { color: theme.text }]}
                        placeholder="Rechercher une app..."
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
            </LinearGradient>

            {/* Category pills */}
            <View style={styles.pillsContainer}>
                <FlatList
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    data={categories.map(c =>
                        c.id === ALL_CAT_ID
                            ? { ...c, name: 'Toutes', icon: '🌟', color: theme.accent }
                            : c
                    )}
                    keyExtractor={c => c.id}
                    contentContainerStyle={styles.pills}
                    renderItem={({ item: cat }) => {
                        const active = activeCategory === cat.id;
                        return (
                            <TouchableOpacity
                                onPress={() => setActiveCategory(cat.id)}
                                style={[
                                    styles.pill,
                                    { backgroundColor: theme.surface, borderColor: theme.border },
                                    active && { backgroundColor: cat.color, borderColor: cat.color },
                                ]}
                            >
                                <Text style={[styles.pillText, { color: theme.textSecondary }, active && { color: COLORS.white }]}>
                                    {cat.icon} {cat.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>

            {/* App grid (Standard Grid) */}
            <FlatList
                data={filtered}
                keyExtractor={a => a.id}
                numColumns={2}
                contentContainerStyle={styles.grid}
                columnWrapperStyle={styles.row}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={loading} tintColor={theme.accent} />
                }
                ListHeaderComponent={
                    <View style={styles.statsBar}>
                        <Text style={[styles.countText, { color: theme.textMuted }]}>
                            {filtered.length} app{filtered.length !== 1 ? 's' : ''} trouvée{filtered.length !== 1 ? 's' : ''}
                        </Text>
                        <View style={[styles.statsLine, { backgroundColor: theme.border }]} />
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyIcon}>📭</Text>
                        <Text style={[styles.emptyTitle, { color: theme.text }]}>
                            {search || activeCategory !== ALL_CAT_ID ? 'Aucun résultat' : 'Aucune app'}
                        </Text>
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                            {search || activeCategory !== ALL_CAT_ID
                                ? 'Essayez une autre recherche ou catégorie.'
                                : 'Configurez vos apps dans l\'onglet Mes Apps !'}
                        </Text>
                        {!search && activeCategory === ALL_CAT_ID && (
                            <TouchableOpacity
                                style={styles.emptyBtn}
                                onPress={() => router.push('/(tabs)/manage')}
                            >
                                <LinearGradient colors={GRADIENTS.accent} style={styles.emptyBtnGrad}>
                                    <Text style={styles.emptyBtnText}>Ajouter ma première app</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                    </View>
                }
                renderItem={({ item }) => (
                    <AppCard
                        app={item}
                        category={getCategory(item.categoryId)}
                        onPress={() => handleOpen(item)}
                        onLongPress={() => handleLongPress(item)}
                    />
                )}
            />
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
        paddingTop: 64,
        paddingHorizontal: 24,
        paddingBottom: SPACING.lg,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    logoContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        padding: 8,
        borderWidth: 1,
    },
    headerLogo: {
        width: '100%',
        height: '100%',
    },
    headerTitle: {
        fontFamily: FONT.bold,
        fontSize: 28,
        letterSpacing: -0.8,
    },
    headerSlogan: {
        fontFamily: FONT.medium,
        fontSize: 13,
        marginTop: 1,
        opacity: 0.8,
    },
    themeToggle: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    themeToggleIcon: {
        fontSize: 20,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        height: 50,
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
    pillsContainer: {
        marginBottom: 8,
    },
    pills: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        gap: 10,
    },
    pill: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
    },
    pillText: {
        fontFamily: FONT.semiBold,
        fontSize: 13,
    },
    statsBar: {
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 8,
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
        paddingHorizontal: 24,
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
        fontSize: 22,
        marginBottom: 12,
        textAlign: 'center',
    },
    emptyText: {
        fontFamily: FONT.regular,
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    emptyBtn: {
        borderRadius: 100,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: COLORS.accent,
        shadowOpacity: 0.4,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 8 },
    },
    emptyBtnGrad: {
        paddingHorizontal: 32,
        paddingVertical: 16,
        alignItems: 'center',
    },
    emptyBtnText: {
        fontFamily: FONT.bold,
        fontSize: 16,
        color: COLORS.white,
    },
});
