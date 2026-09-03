import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { FONT, COLORS } from '../constants/theme';
import { MiniApp, Category } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';

interface AppCardProps {
    app: MiniApp;
    category?: Category;
    onPress: () => void;
    onLongPress?: () => void;
    isInstalled?: boolean;
    actionLabel?: string;
    onAction?: () => void;
}

export const AppCard = ({ app, category, onPress, onLongPress, isInstalled, actionLabel, onAction }: AppCardProps) => {
    const { theme, mode } = useTheme();
    const { isFavorite, toggleFavorite } = useFavorites();
    const isFeatured = false;
    const favorite = isFavorite(app.id);

    const iconValue = typeof app.icon === 'string' ? app.icon : '';
    const displayIcon = iconValue || '❔';
    const isImageIcon = iconValue.startsWith('http');

    const catColor = category?.color || theme.accent;
    const badgeColor = mode === 'dark' ? '#4B5563' : '#D1D5DB';
    const isOfflineReady = app.sourceType === 'html';

    return (
        <TouchableOpacity
            onPress={onPress}
            onLongPress={onLongPress}
            style={[styles.wrapper, isFeatured && styles.wrapperFeatured]}
            activeOpacity={0.7}
        >
            <View style={styles.touch}>
                <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, isFeatured && styles.cardFeatured]}>
                    <View style={styles.glassHighlight} />

                    <View style={isFeatured ? styles.contentRowFeatured : styles.contentDefault}>
                        <View style={styles.headerRow}>
                            {/* Icon Bubble */}
                            <View style={[
                                styles.iconBubble,
                                { backgroundColor: catColor + '15', borderColor: catColor + '30' },
                                isFeatured && styles.iconBubbleFeatured
                            ]}>
                                {isImageIcon ? (
                                    <Image
                                        source={{ uri: iconValue }}
                                        style={[styles.iconImage, isFeatured && styles.iconImageFeatured]}
                                        resizeMode="contain"
                                    />
                                ) : (
                                    <Text style={[styles.iconText, isFeatured && styles.iconTextFeatured]}>{displayIcon}</Text>
                                )}
                            </View>

                            {/* Top Right Badges & Favorite (Compact Icons Only) */}
                            <View style={styles.topRightActions}>
                                <TouchableOpacity
                                    onPress={() => toggleFavorite(app.id)}
                                    style={[
                                        styles.favButton,
                                        {
                                            backgroundColor: favorite
                                                ? 'rgba(239, 68, 68, 0.15)'
                                                : theme.surface,
                                            borderColor: favorite
                                                ? 'rgba(239, 68, 68, 0.35)'
                                                : theme.border,
                                        },
                                    ]}
                                    activeOpacity={0.7}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                    <FontAwesome6
                                        name="heart"
                                        size={12}
                                        color={favorite ? '#EF4444' : theme.textMuted}
                                        solid={favorite}
                                    />
                                </TouchableOpacity>

                                {/* Compact Offline/Online Icon Badge */}
                                <View style={[
                                    styles.modeTag,
                                    isOfflineReady
                                        ? { backgroundColor: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.25)' }
                                        : { backgroundColor: 'rgba(59, 130, 246, 0.12)', borderColor: 'rgba(59, 130, 246, 0.25)' }
                                ]}>
                                    {isOfflineReady ? (
                                        <FontAwesome6 name="bolt" size={10} color="#10B981" />
                                    ) : (
                                        <FontAwesome6 name="globe" size={10} color="#60A5FA" />
                                    )}
                                </View>
                            </View>
                        </View>

                        {/* Text Content */}
                        <View style={styles.content}>
                            <View style={styles.titleRow}>
                                <Text style={[styles.appName, { color: theme.text }]} numberOfLines={1}>{app.name}</Text>
                                {isInstalled && (
                                    <View style={[styles.installedBadge, { backgroundColor: badgeColor }]}>
                                        <Text style={styles.installedCheckmark}>✓</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={[styles.appDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                                {app.description}
                            </Text>
                        </View>
                    </View>

                    {actionLabel && onAction && (
                        <TouchableOpacity onPress={onAction} style={[styles.actionBtn, { borderColor: theme.border, backgroundColor: theme.surface }]} activeOpacity={0.8}>
                            <Text style={[styles.actionBtnText, { color: theme.text }]}>{actionLabel}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        width: '48.2%',
        marginBottom: 16,
    },
    wrapperFeatured: {
        width: '100%',
        marginBottom: 20,
    },
    touch: {
        borderRadius: 22,
        overflow: 'hidden',
    },
    card: {
        borderRadius: 22,
        padding: 13,
        borderWidth: 1,
        minHeight: 146,
        position: 'relative',
    },
    cardFeatured: {
        minHeight: 130,
    },
    glassHighlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '45%',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderBottomLeftRadius: 100,
        borderBottomRightRadius: 100,
    },
    contentDefault: {
        flex: 1,
    },
    contentRowFeatured: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    topRightActions: {
        alignItems: 'flex-end',
        gap: 6,
    },
    favButton: {
        width: 26,
        height: 26,
        borderRadius: 13,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconBubble: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
    },
    iconBubbleFeatured: {
        marginBottom: 0,
        width: 60,
        height: 60,
    },
    iconText: {
        fontSize: 26,
    },
    iconTextFeatured: {
        fontSize: 30,
    },
    iconImage: {
        width: '60%',
        height: '60%',
        borderRadius: 8,
    },
    iconImageFeatured: {
        width: '70%',
        height: '70%',
    },
    modeTag: {
        width: 26,
        height: 26,
        borderRadius: 13,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 4,
        marginBottom: 4,
    },
    appName: {
        fontFamily: FONT.bold,
        fontSize: 14.5,
        flex: 1,
    },
    installedBadge: {
        width: 16,
        height: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    installedCheckmark: {
        fontFamily: FONT.bold,
        fontSize: 9,
        color: COLORS.white,
        lineHeight: 11,
    },
    appDesc: {
        fontFamily: FONT.medium,
        fontSize: 11.5,
        lineHeight: 15,
        opacity: 0.85,
    },
    actionBtn: {
        marginTop: 10,
        paddingVertical: 7,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    actionBtnText: {
        fontFamily: FONT.bold,
        fontSize: 12,
    },
});
