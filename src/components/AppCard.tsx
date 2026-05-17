import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { FONT, COLORS } from '../constants/theme';
import { MiniApp, Category } from '../types';
import { useTheme } from '../context/ThemeContext';

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
    const isFeatured = false; // logic for featured can be added later
    const iconValue = typeof app.icon === 'string' ? app.icon : '';
    const displayIcon = iconValue || '❔';
    const isImageIcon = iconValue.startsWith('http');

    const catColor = category?.color || theme.accent;
    const badgeColor = mode === 'dark' ? '#4B5563' : '#D1D5DB';

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
                        {/* Status Icon */}
                        {isInstalled && (
                            <View style={[styles.installedIcon, { backgroundColor: badgeColor }]}>
                                <Text style={styles.installedCheckmark}>✓</Text>
                            </View>
                        )}

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

                        {/* Text Content */}
                        <View style={styles.content}>
                            <Text style={[styles.appName, { color: theme.text }]} numberOfLines={1}>{app.name}</Text>
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
        padding: 18,
        borderWidth: 1,
        minHeight: 140,
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
    installedIcon: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    installedCheckmark: {
        fontFamily: FONT.bold,
        fontSize: 14,
        color: COLORS.white,
        lineHeight: 16,
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
    iconBubble: {
        width: 58,
        height: 58,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
        borderWidth: 1.5,
    },
    iconBubbleFeatured: {
        marginBottom: 0,
        width: 68,
        height: 68,
    },
    iconText: {
        fontSize: 32,
    },
    iconTextFeatured: {
        fontSize: 36,
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
    content: {
        flex: 1,
    },
    appName: {
        fontFamily: FONT.bold,
        fontSize: 16,
        marginBottom: 4,
    },
    appDesc: {
        fontFamily: FONT.medium,
        fontSize: 13,
        lineHeight: 18,
        opacity: 0.85,
    },
    actionBtn: {
        marginTop: 10,
        paddingVertical: 8,
        borderRadius: 14,
        borderWidth: 1,
        alignItems: 'center',
    },
    actionBtnText: {
        fontFamily: FONT.bold,
        fontSize: 13,
    },
});
