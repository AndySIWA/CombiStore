import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput,
    ScrollView, Alert, Platform, ActivityIndicator,
    KeyboardAvoidingView, Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { COLORS, RADII, SPACING, FONT, GRADIENTS } from '../src/constants/theme';
import { useApps } from '../src/context/AppsContext';
import { useCategories } from '../src/context/CategoriesContext';
import { useTheme } from '../src/context/ThemeContext';
import { CATEGORY_ICONS } from '../src/constants/defaults';

type TabSource = 'url' | 'html';

export default function ManageAppScreen() {
    const { id } = useLocalSearchParams<{ id?: string }>();
    const { apps, addApp, updateApp } = useApps();
    const { categories } = useCategories();
    const { theme, mode } = useTheme();

    const [tab, setTab] = useState<TabSource>('url');
    const [saving, setSaving] = useState(false);
    const [isFetchingIcon, setIsFetchingIcon] = useState(false);

    // Form fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState(categories[1]?.id ?? 'games');
    const [icon, setIcon] = useState('🌐');
    const [url, setUrl] = useState('');
    const [htmlContent, setHtmlContent] = useState('');
    const [htmlFileName, setHtmlFileName] = useState('');

    const isEditing = !!id;
    const editableCategories = categories.filter(c => c.id !== 'all');

    useEffect(() => {
        if (isEditing) {
            const app = apps.find(a => a.id === id);
            if (app) {
                setName(app.name);
                setDescription(app.description);
                setCategoryId(app.categoryId);
                setIcon(app.icon);
                setTab(app.sourceType as TabSource);
                if (app.sourceType === 'url') {
                    setUrl(app.source);
                } else {
                    setHtmlContent(app.source);
                    setHtmlFileName('Fichier importé');
                }
            }
        }
    }, [id, apps]);

    const fetchFavicon = async (targetUrl: string) => {
        const cleanUrl = targetUrl.trim();
        if (!cleanUrl || cleanUrl.length < 4) return;

        setIsFetchingIcon(true);
        try {
            // Extract domain
            let domain = cleanUrl.replace('https://', '').replace('http://', '').split('/')[0];
            if (domain) {
                const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
                setIcon(faviconUrl);
            }
        } catch (e) {
            console.error('Error fetching icon:', e);
        } finally {
            setIsFetchingIcon(false);
        }
    };

    const handlePickHtml = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['text/html', 'application/octet-stream', '*/*'],
                copyToCacheDirectory: true,
            });
            if (result.canceled) return;
            const file = result.assets[0];
            setHtmlFileName(file.name ?? 'fichier.html');
            if (!name) setName(file.name?.replace('.html', '') ?? '');
            const content = await FileSystem.readAsStringAsync(file.uri);
            setHtmlContent(content);
        } catch (e) {
            Alert.alert('Erreur', 'Impossible de lire ce fichier.');
        }
    };

    const validate = (): string | null => {
        if (!name.trim()) return 'Le nom est requis.';
        if (tab === 'url') {
            if (!url.trim()) return "L'URL est requise.";
            if (!url.startsWith('http://') && !url.startsWith('https://')) return "L'URL doit commencer par http:// ou https://";
        } else {
            if (!htmlContent) return 'Veuillez importer un fichier HTML.';
        }
        return null;
    };

    const handleSave = async () => {
        const err = validate();
        if (err) { Alert.alert('Erreur', err); return; }
        setSaving(true);
        try {
            const appData = {
                name: name.trim(),
                description: description.trim() || `Mini app ${tab === 'url' ? 'en ligne' : 'locale'}`,
                categoryId,
                sourceType: tab,
                source: tab === 'url' ? url.trim() : htmlContent,
                icon,
            };

            if (isEditing) {
                await updateApp(id!, appData);
            } else {
                await addApp(appData);
            }
            router.back();
        } catch (e) {
            Alert.alert('Erreur', `Impossible d'${isEditing ? 'enregistrer' : 'ajouter'} l'app.`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            <View style={[styles.container, { backgroundColor: theme.bg }]}>
                <LinearGradient colors={mode === 'dark' ? ['#0F1115', 'transparent'] : ['#FFFFFF', 'transparent']} style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <View style={styles.backBtnContent}>
                            <Text style={[styles.backArrow, { color: theme.accent }]}>←</Text>
                            <Text style={[styles.backText, { color: theme.accent }]}>Gérer les apps</Text>
                        </View>
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>{isEditing ? 'Configuration' : 'Nouvelle App'}</Text>
                    <Text style={[styles.headerSub, { color: theme.textSecondary }]}>{isEditing ? `Modifier "${name}"` : 'Créez votre mini-application personnalisée'}</Text>
                </LinearGradient>

                <ScrollView
                    contentContainerStyle={styles.body}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Tab switcher */}
                    {!isEditing && (
                        <View style={[styles.tabRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            {(['url', 'html'] as TabSource[]).map(t => (
                                <TouchableOpacity
                                    key={t}
                                    style={[styles.tabBtn, tab === t && { backgroundColor: theme.surfaceDark }]}
                                    onPress={() => setTab(t)}
                                >
                                    <View style={styles.tabContent}>
                                        <Text style={[styles.tabText, { color: theme.textSecondary }, tab === t && { color: theme.text }]}>
                                            {t === 'url' ? 'Application URL' : 'Fichier HTML'}
                                        </Text>
                                        {tab === t && <View style={[styles.activeDot, { backgroundColor: theme.accent }]} />}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    <View style={styles.formSection}>
                        {/* Icon Picker */}
                        <Text style={[styles.label, { color: theme.textSecondary }]}>Icône de l'app</Text>

                        <View style={styles.iconSelectionArea}>
                            {/* Icon Preview */}
                            <View style={[styles.iconPreview, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                {icon.startsWith('http') ? (
                                    <Image source={{ uri: icon }} style={styles.iconPreviewImg} resizeMode="contain" />
                                ) : (
                                    <Text style={styles.iconPreviewText}>{icon}</Text>
                                )}
                                {isFetchingIcon && (
                                    <View style={styles.iconLoadingOverlay}>
                                        <ActivityIndicator size="small" color={theme.accent} />
                                    </View>
                                )}
                            </View>

                            <View style={styles.iconInputs}>
                                <Text style={[styles.tinyLabel, { color: theme.textMuted }]}>Emoji ou URL d'image</Text>
                                <TextInput
                                    style={[styles.miniInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                    value={icon}
                                    onChangeText={setIcon}
                                    placeholder="Emoji ou lien d'image..."
                                    placeholderTextColor={theme.textMuted}
                                />
                                {tab === 'url' && url.length > 8 && (
                                    <TouchableOpacity
                                        style={[styles.autoFetchBtn, { borderColor: theme.accent }]}
                                        onPress={() => fetchFavicon(url)}
                                    >
                                        <Text style={[styles.autoFetchText, { color: theme.accent }]}>✨ Récupérer du site</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconRow}>
                            {CATEGORY_ICONS.map(ic => (
                                <TouchableOpacity
                                    key={ic}
                                    onPress={() => setIcon(ic)}
                                    style={[
                                        styles.iconOption,
                                        { backgroundColor: theme.surface },
                                        icon === ic && { backgroundColor: theme.accent + '22', borderColor: theme.accent }
                                    ]}
                                >
                                    <Text style={styles.iconText}>{ic}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Basic Info */}
                        <Text style={[styles.label, { color: theme.textSecondary }]}>Nom de l'app</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                            value={name}
                            onChangeText={setName}
                            placeholder="Ex: 2048, ChatGPT, Mon Script..."
                            placeholderTextColor={theme.textMuted}
                        />

                        <Text style={[styles.label, { color: theme.textSecondary }]}>Description (optionnel)</Text>
                        <TextInput
                            style={[styles.input, styles.inputMulti, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="De quoi s'agit-il ?"
                            placeholderTextColor={theme.textMuted}
                            multiline={true}
                            numberOfLines={2}
                        />

                        {/* Category */}
                        <Text style={[styles.label, { color: theme.textSecondary }]}>Classification</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                            {editableCategories.map(cat => (
                                <TouchableOpacity
                                    key={cat.id}
                                    onPress={() => setCategoryId(cat.id)}
                                    style={[
                                        styles.catPill,
                                        { backgroundColor: theme.surface, borderColor: theme.border },
                                        categoryId === cat.id && { backgroundColor: cat.color + '22', borderColor: cat.color },
                                    ]}
                                >
                                    <Text style={[styles.catPillText, { color: theme.textSecondary }, categoryId === cat.id && { color: cat.color }]}>
                                        {cat.icon} {cat.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Source Configuration */}
                        <View style={styles.divider} />

                        {tab === 'url' ? (
                            <>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>Adresse Web (URL)</Text>
                                <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                    <Text style={[styles.inputPrefix, { color: theme.textMuted }]}>https://</Text>
                                    <TextInput
                                        style={[styles.input, styles.inputWithPrefix, { color: theme.text }]}
                                        value={url.replace(/^https?:\/\//, '')}
                                        onChangeText={(text) => {
                                            const newUrl = `https://${text}`;
                                            setUrl(newUrl);
                                        }}
                                        placeholder="exemple.com"
                                        placeholderTextColor={theme.textMuted}
                                        autoCapitalize="none"
                                        keyboardType="url"
                                        onBlur={() => !icon.startsWith('http') && fetchFavicon(url)}
                                    />
                                </View>
                            </>
                        ) : (
                            <>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>Code Source HTML</Text>
                                <TouchableOpacity
                                    style={[styles.pickBtn, htmlFileName ? styles.pickBtnSuccess : null]}
                                    onPress={handlePickHtml}
                                >
                                    <LinearGradient
                                        colors={htmlFileName ? ['rgba(16, 185, 129, 0.1)', 'rgba(16, 185, 129, 0.05)'] : ['rgba(139, 92, 246, 0.1)', 'rgba(139, 92, 246, 0.05)']}
                                        style={styles.pickBtnGrad}
                                    >
                                        <Text style={[styles.pickBtnEmoji, htmlFileName && { color: '#10b981' }]}>
                                            {htmlFileName ? '✓' : '📂'}
                                        </Text>
                                        <Text style={[styles.pickBtnText, htmlFileName && { color: '#10b981' }]}>
                                            {htmlFileName ? htmlFileName : 'Importer un fichier .html'}
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>

                    {/* Action */}
                    <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveBtn}>
                        <LinearGradient colors={GRADIENTS.accent} style={styles.saveBtnGrad}>
                            {saving ? (
                                <ActivityIndicator color={theme.white} />
                            ) : (
                                <Text style={styles.saveBtnText}>
                                    {isEditing ? 'Enregistrer les modifications' : 'Créer l\'application'}
                                </Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingTop: 64,
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    backBtn: { marginBottom: 12 },
    backBtnContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    backArrow: {
        fontSize: 18,
        fontFamily: FONT.bold,
    },
    backText: {
        fontFamily: FONT.bold,
        fontSize: 13,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    headerTitle: {
        fontFamily: FONT.bold,
        fontSize: 32,
        letterSpacing: -1,
    },
    headerSub: {
        fontFamily: FONT.medium,
        fontSize: 14,
        marginTop: 4,
        opacity: 0.8,
    },
    body: {
        paddingHorizontal: 24,
        paddingBottom: 60,
    },
    tabRow: {
        flexDirection: 'row',
        borderRadius: 20,
        padding: 6,
        marginBottom: 24,
        borderWidth: 1,
    },
    tabBtn: {
        flex: 1,
        padding: 14,
        borderRadius: 14,
        alignItems: 'center',
    },
    tabContent: {
        alignItems: 'center',
    },
    tabText: {
        fontFamily: FONT.bold,
        fontSize: 14,
    },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginTop: 4,
    },
    formSection: {
        gap: 8,
    },
    label: {
        fontFamily: FONT.bold,
        fontSize: 13,
        marginBottom: 8,
        marginTop: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    tinyLabel: {
        fontFamily: FONT.medium,
        fontSize: 11,
        marginBottom: 4,
    },
    input: {
        borderRadius: 16,
        padding: 16,
        fontFamily: FONT.regular,
        fontSize: 16,
        borderWidth: 1,
    },
    inputMulti: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
    },
    inputPrefix: {
        paddingLeft: 16,
        fontFamily: FONT.medium,
        fontSize: 16,
    },
    inputWithPrefix: {
        flex: 1,
        borderWidth: 0,
        backgroundColor: 'transparent',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        marginVertical: 24,
    },
    iconSelectionArea: {
        flexDirection: 'row',
        gap: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    iconPreview: {
        width: 80,
        height: 80,
        borderRadius: 24,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    iconPreviewImg: {
        width: '60%',
        height: '60%',
    },
    iconPreviewText: {
        fontSize: 40,
    },
    iconLoadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconInputs: {
        flex: 1,
        gap: 6,
    },
    miniInput: {
        borderRadius: 12,
        padding: 10,
        fontFamily: FONT.regular,
        fontSize: 14,
        borderWidth: 1,
    },
    autoFetchBtn: {
        alignSelf: 'flex-start',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    autoFetchText: {
        fontFamily: FONT.bold,
        fontSize: 11,
    },
    iconRow: { marginBottom: 8 },
    iconOption: {
        width: 54,
        height: 54,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    iconText: { fontSize: 26 },
    catScroll: { marginBottom: 8 },
    catPill: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
        borderWidth: 1,
        marginRight: 10,
    },
    catPillText: {
        fontFamily: FONT.bold,
        fontSize: 14,
    },
    pickBtn: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 2,
        borderStyle: 'dashed',
    },
    pickBtnSuccess: {
        borderStyle: 'solid',
    },
    pickBtnGrad: {
        padding: 24,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
    },
    pickBtnEmoji: {
        fontSize: 24,
    },
    pickBtnText: {
        fontFamily: FONT.bold,
        fontSize: 16,
    },
    saveBtn: {
        marginTop: 40,
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 8,
    },
    saveBtnGrad: {
        padding: 20,
        alignItems: 'center',
    },
    saveBtnText: {
        fontFamily: FONT.bold,
        fontSize: 16,
        color: COLORS.white,
    },
});
