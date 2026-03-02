import React from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, FlatList,
    Alert, Image,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONT, GRADIENTS } from '../../src/constants/theme';
import { useApps } from '../../src/context/AppsContext';
import { useCategories } from '../../src/context/CategoriesContext';
import { useTheme } from '../../src/context/ThemeContext';
import { MiniApp } from '../../src/types';

export default function ManageAppsScreen() {
    const { apps, removeApp } = useApps();
    const { categories } = useCategories();
    const { theme, mode } = useTheme();

    const getCategory = (id: string) => categories.find(c => c.id === id);

    const handleDelete = (app: MiniApp) => {
        Alert.alert(
            'Supprimer',
            `Voulez-vous vraiment supprimer "${app.name}" ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: () => removeApp(app.id)
                },
            ]
        );
    };

    const renderItem = ({ item: app }: { item: MiniApp }) => {
        const cat = getCategory(app.categoryId);
        return (
            <View style={[styles.appItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={[styles.appIconContainer, { backgroundColor: (cat?.color ?? theme.accent) + '15', borderColor: (cat?.color ?? theme.accent) + '33' }]}>
                    {app.icon.startsWith('http') ? (
                        <Image source={{ uri: app.icon }} style={styles.appIconImage} resizeMode="contain" />
                    ) : (
                        <Text style={styles.appIconText}>{app.icon}</Text>
                    )}
                </View>
                <View style={styles.appInfo}>
                    <Text style={[styles.appName, { color: theme.text }]} numberOfLines={1}>{app.name}</Text>
                    <View style={styles.metaRow}>
                        <View style={[styles.typeBadge, { backgroundColor: theme.surfaceDark, borderColor: theme.border }]}>
                            <Text style={[styles.typeText, { color: theme.textMuted }]}>{app.sourceType.toUpperCase()}</Text>
                        </View>
                        <Text style={[styles.catLabel, { color: cat?.color ?? theme.textSecondary }]}>
                            {cat?.icon} {cat?.name}
                        </Text>
                    </View>
                </View>
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                        onPress={() => router.push(`/manage-app?id=${app.id}`)}
                    >
                        <Text style={styles.actionEmoji}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.deleteBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                        onPress={() => handleDelete(app)}
                    >
                        <Text style={[styles.actionEmoji, { color: '#ff4444' }]}>🗑️</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <LinearGradient colors={mode === 'dark' ? ['#0F1115', 'transparent'] : ['#FFFFFF', 'transparent']} style={styles.header}>
                <View style={styles.headerRow}>
                    <View>
                        <Text style={[styles.headerTitle, { color: theme.text }]}>Mes Apps</Text>
                        <Text style={[styles.headerSub, { color: theme.textSecondary }]}>{apps.length} application{apps.length !== 1 ? 's' : ''} configurée{apps.length !== 1 ? 's' : ''}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => router.push('/manage-app')}
                    >
                        <LinearGradient colors={GRADIENTS.accent} style={styles.addGradient}>
                            <Text style={styles.addText}>+ Ajouter</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <FlatList
                data={apps}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <View style={[styles.emptyIconContainer, { backgroundColor: theme.surface }]}>
                            <Text style={styles.emptyIcon}>📂</Text>
                        </View>
                        <Text style={[styles.emptyTitle, { color: theme.text }]}>Votre store est vide</Text>
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Ajoutez vos sites web favoris ou des fichiers HTML pour créer votre store personnalisé.</Text>
                        <TouchableOpacity
                            onPress={() => router.push('/manage-app')}
                            style={styles.emptyBtn}
                        >
                            <LinearGradient colors={GRADIENTS.accent} style={styles.emptyBtnGrad}>
                                <Text style={styles.emptyBtnText}>Créer ma première app</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingTop: 64,
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontFamily: FONT.bold,
        fontSize: 30,
        letterSpacing: -1,
    },
    headerSub: {
        fontFamily: FONT.medium,
        fontSize: 14,
        marginTop: 4,
        opacity: 0.8,
    },
    addButton: {
        borderRadius: 14,
        overflow: 'hidden',
        elevation: 8,
    },
    addGradient: {
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    addText: {
        fontFamily: FONT.bold,
        fontSize: 14,
        color: COLORS.white,
    },
    list: {
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 120,
        gap: 12,
    },
    appItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
    },
    appIconContainer: {
        width: 52,
        height: 52,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    appIconText: { fontSize: 26 },
    appIconImage: {
        width: '60%',
        height: '60%',
        borderRadius: 8,
    },
    appInfo: {
        flex: 1,
        marginLeft: 16,
    },
    appName: {
        fontFamily: FONT.bold,
        fontSize: 17,
        marginBottom: 4,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
    },
    typeText: {
        fontFamily: FONT.bold,
        fontSize: 9,
        letterSpacing: 0.5,
    },
    catLabel: {
        fontFamily: FONT.semiBold,
        fontSize: 11,
        opacity: 0.8,
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        width: 38,
        height: 38,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    deleteBtn: {
        borderColor: 'rgba(255, 68, 68, 0.1)',
    },
    actionEmoji: { fontSize: 16 },
    empty: {
        alignItems: 'center',
        paddingTop: 100,
        paddingHorizontal: 40,
    },
    emptyIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    emptyIcon: { fontSize: 48, opacity: 0.5 },
    emptyTitle: {
        fontFamily: FONT.bold,
        fontSize: 22,
        marginBottom: 12,
    },
    emptyText: {
        fontFamily: FONT.regular,
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
        opacity: 0.7,
    },
    emptyBtn: {
        borderRadius: 100,
        overflow: 'hidden',
    },
    emptyBtnGrad: {
        paddingHorizontal: 24,
        paddingVertical: 14,
    },
    emptyBtnText: {
        fontFamily: FONT.bold,
        fontSize: 15,
        color: COLORS.white,
    },
});
