import React, { useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    TextInput, Alert, Modal, ScrollView, Pressable, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONT, GRADIENTS } from '../../src/constants/theme';
import { useCategories } from '../../src/context/CategoriesContext';
import { useTheme } from '../../src/context/ThemeContext';
import { Category } from '../../src/types';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../../src/constants/defaults';

const ALL_CAT_ID = 'all';

export default function CategoriesScreen() {
    const { categories, addCategory, removeCategory, updateCategory } = useCategories();
    const { theme, mode } = useTheme();
    const [showForm, setShowForm] = useState(false);
    const [editTarget, setEditTarget] = useState<Category | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [selectedColor, setSelectedColor] = useState(CATEGORY_COLORS[0]);
    const [selectedIcon, setSelectedIcon] = useState(CATEGORY_ICONS[0]);

    const openAddForm = () => {
        setEditTarget(null);
        setName('');
        setSelectedColor(CATEGORY_COLORS[0]);
        setSelectedIcon(CATEGORY_ICONS[0]);
        setShowForm(true);
    };

    const openEditForm = (cat: Category) => {
        setEditTarget(cat);
        setName(cat.name);
        setSelectedColor(cat.color);
        setSelectedIcon(cat.icon);
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Erreur', 'Le nom est requis.');
            return;
        }
        if (editTarget) {
            await updateCategory(editTarget.id, { name: name.trim(), color: selectedColor, icon: selectedIcon });
        } else {
            await addCategory({ name: name.trim(), color: selectedColor, icon: selectedIcon });
        }
        setShowForm(false);
    };

    const handleDelete = (cat: Category) => {
        if (cat.id === ALL_CAT_ID) {
            Alert.alert('Impossible', 'Cette catégorie système ne peut pas être supprimée.');
            return;
        }
        Alert.alert(
            `Supprimer "${cat.name}" ?`,
            'Les apps de cette catégorie ne seront pas supprimées.',
            [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Supprimer', style: 'destructive', onPress: () => removeCategory(cat.id) },
            ]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            {/* Header */}
            <LinearGradient colors={mode === 'dark' ? ['#0F1115', 'transparent'] : ['#FFFFFF', 'transparent']} style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Catégories</Text>
                <Text style={[styles.headerSub, { color: theme.textSecondary }]}>{categories.length} catégorie{categories.length !== 1 ? 's' : ''} personnalisée{categories.length !== 1 ? 's' : ''}</Text>
            </LinearGradient>

            <FlatList
                data={categories}
                keyExtractor={c => c.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <TouchableOpacity style={styles.addRow} onPress={openAddForm}>
                        <LinearGradient colors={GRADIENTS.accent} style={styles.addGrad}>
                            <Text style={styles.addText}>+ Nouvelle catégorie</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                }
                renderItem={({ item: cat }) => (
                    <View style={[styles.catRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <View style={[styles.catIconBubble, { backgroundColor: cat.color + '15', borderColor: cat.color + '33' }]}>
                            <Text style={styles.catIcon}>{cat.icon}</Text>
                        </View>
                        <View style={styles.catInfo}>
                            <Text style={[styles.catName, { color: theme.text }]}>{cat.name}</Text>
                            <View style={[styles.colorBadge, { backgroundColor: cat.color + '15' }]}>
                                <View style={[styles.colorDot, { backgroundColor: cat.color }]} />
                                <Text style={[styles.colorHex, { color: cat.color }]}>{cat.color.toUpperCase()}</Text>
                            </View>
                        </View>
                        <View style={styles.catActions}>
                            {cat.id !== ALL_CAT_ID ? (
                                <>
                                    <TouchableOpacity onPress={() => openEditForm(cat)} style={[styles.actionBtn, { backgroundColor: theme.surfaceDark }]}>
                                        <Text style={styles.actionEmoji}>✏️</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDelete(cat)} style={[styles.actionBtn, { backgroundColor: theme.surfaceDark }]}>
                                        <Text style={styles.actionEmoji}>🗑️</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <View style={[styles.lockedBadge, { backgroundColor: theme.surfaceDark }]}>
                                    <Text style={[styles.lockedText, { color: theme.textMuted }]}>🔒 Système</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}
            />

            {/* Add/Edit Modal */}
            <Modal visible={showForm} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <Pressable style={{ flex: 1 }} onPress={() => setShowForm(false)} />
                    <View style={[styles.modalSheet, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <View style={[styles.dragBar, { backgroundColor: theme.border }]} />
                        <Text style={[styles.modalTitle, { color: theme.text }]}>
                            {editTarget ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                        </Text>

                        <Text style={[styles.label, { color: theme.textSecondary }]}>Nom de la catégorie</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surfaceDark, color: theme.text, borderColor: theme.border }]}
                            value={name}
                            onChangeText={setName}
                            placeholder="Productivité, Jeux, Social..."
                            placeholderTextColor={theme.textMuted}
                        />

                        <Text style={[styles.label, { color: theme.textSecondary }]}>Icône représentative</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconRow}>
                            {CATEGORY_ICONS.map(icon => (
                                <TouchableOpacity
                                    key={icon}
                                    onPress={() => setSelectedIcon(icon)}
                                    style={[
                                        styles.iconOption,
                                        { backgroundColor: theme.surfaceDark },
                                        selectedIcon === icon && { backgroundColor: theme.accent + '22', borderColor: theme.accent }
                                    ]}
                                >
                                    <Text style={styles.iconOptionText}>{icon}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Text style={[styles.label, { color: theme.textSecondary }]}>Thème couleur</Text>
                        <View style={styles.colorGrid}>
                            {CATEGORY_COLORS.map(color => (
                                <TouchableOpacity
                                    key={color}
                                    onPress={() => setSelectedColor(color)}
                                    style={[
                                        styles.colorOption,
                                        { backgroundColor: color },
                                        selectedColor === color && { borderColor: theme.text, transform: [{ scale: 1.1 }] },
                                    ]}
                                />
                            ))}
                        </View>

                        {/* Preview Section */}
                        <Text style={[styles.label, { color: theme.textSecondary }]}>Aperçu du badge</Text>
                        <View style={[styles.preview, { borderColor: selectedColor + '44', backgroundColor: selectedColor + '08' }]}>
                            <View style={[styles.previewIcon, { backgroundColor: selectedColor + '22' }]}>
                                <Text style={styles.previewIconText}>{selectedIcon}</Text>
                            </View>
                            <Text style={[styles.previewName, { color: selectedColor }]}>
                                {name || 'Ma catégorie'}
                            </Text>
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: theme.surfaceDark }]} onPress={() => setShowForm(false)}>
                                <Text style={[styles.cancelText, { color: theme.textSecondary }]}>Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                                <LinearGradient colors={GRADIENTS.accent} style={styles.saveBtnGrad}>
                                    <Text style={styles.saveText}>
                                        {editTarget ? 'Mettre à jour' : 'Confirmer'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    list: {
        paddingHorizontal: 24,
        paddingBottom: 120,
    },
    addRow: {
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 20,
        elevation: 4,
    },
    addGrad: {
        padding: 16,
        alignItems: 'center',
    },
    addText: {
        fontFamily: FONT.bold,
        fontSize: 15,
        color: COLORS.white,
    },
    catRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        marginBottom: 12,
    },
    catIconBubble: {
        width: 52,
        height: 52,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        borderWidth: 1,
    },
    catIcon: { fontSize: 26 },
    catInfo: { flex: 1 },
    catName: {
        fontFamily: FONT.bold,
        fontSize: 16,
        marginBottom: 4,
    },
    colorBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        gap: 6,
    },
    colorDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    colorHex: {
        fontFamily: FONT.medium,
        fontSize: 10,
        opacity: 0.8,
    },
    catActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionEmoji: { fontSize: 16 },
    lockedBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    lockedText: {
        fontFamily: FONT.semiBold,
        fontSize: 11,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalSheet: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingTop: 12,
        borderTopWidth: 1,
    },
    dragBar: {
        width: 40,
        height: 5,
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontFamily: FONT.bold,
        fontSize: 22,
        marginBottom: 24,
    },
    label: {
        fontFamily: FONT.bold,
        fontSize: 13,
        marginBottom: 8,
        marginTop: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    input: {
        borderRadius: 16,
        padding: 16,
        fontFamily: FONT.regular,
        fontSize: 16,
        borderWidth: 1,
    },
    iconRow: { marginBottom: 8 },
    iconOption: {
        width: 50,
        height: 50,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    iconOptionText: { fontSize: 24 },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 12,
    },
    colorOption: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 3,
        borderColor: 'transparent',
    },
    preview: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1.5,
        marginBottom: 24,
        borderStyle: 'dashed',
    },
    previewIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    previewIconText: { fontSize: 24 },
    previewName: {
        fontFamily: FONT.bold,
        fontSize: 18,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
        marginBottom: Platform.OS === 'ios' ? 20 : 0,
    },
    cancelBtn: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    cancelText: {
        fontFamily: FONT.bold,
        fontSize: 15,
    },
    saveBtn: {
        flex: 2,
        borderRadius: 16,
        overflow: 'hidden',
    },
    saveBtnGrad: {
        padding: 16,
        alignItems: 'center',
    },
    saveText: {
        fontFamily: FONT.bold,
        fontSize: 15,
        color: COLORS.white,
    },
});
