import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  Easing,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { FontAwesome6 } from '@expo/vector-icons';
import { FONT, COLORS } from '../constants/theme';
import { ANIMATIONS } from '../constants/animations';
import { MiniApp, Category } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';

interface AnimatedCardProps {
  app: MiniApp;
  category?: Category;
  onPress: () => void;
  onLongPress?: () => void;
  isInstalled?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  delay?: number;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  app,
  category,
  onPress,
  onLongPress,
  isInstalled,
  actionLabel,
  onAction,
  delay = 0,
}) => {
  const { theme, mode } = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isAnimationStarted, setIsAnimationStarted] = useState(false);

  const favorite = isFavorite(app.id);

  // Animation values
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const scale = useSharedValue(0.95);
  const pressScale = useSharedValue(1);
  const heartScale = useSharedValue(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Entrance animation
      opacity.value = withTiming(1, {
        duration: ANIMATIONS.durations.normal,
        easing: Easing.out(Easing.cubic),
      });

      translateY.value = withSpring(0, ANIMATIONS.timingConfigs.spring);
      scale.value = withSpring(1, ANIMATIONS.timingConfigs.spring);
      setIsAnimationStarted(true);
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  const onPressIn = () => {
    pressScale.value = withSpring(0.95, ANIMATIONS.timingConfigs.spring);
  };

  const onPressOut = () => {
    pressScale.value = withSpring(1, ANIMATIONS.timingConfigs.spring);
  };

  const handleFavoritePress = () => {
    heartScale.value = withSequence(
      withTiming(1.35, { duration: 120, easing: Easing.out(Easing.ease) }),
      withSpring(1, { damping: 8, stiffness: 120 })
    );
    toggleFavorite(app.id);
  };

  const iconValue = typeof app.icon === 'string' ? app.icon : '';
  const displayIcon = iconValue || '❔';
  const isImageIcon = iconValue.startsWith('http');
  const catColor = category?.color || theme.accent;
  const badgeColor = mode === 'dark' ? '#4B5563' : '#D1D5DB';
  const isOfflineReady = app.sourceType === 'html';

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: interpolate(scale.value, [0.95, 1], [0.95, 1], Extrapolate.CLAMP) },
    ],
  }));

  const pressAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const iconPulseStyle = useAnimatedStyle(() => {
    const pulseScale = interpolate(opacity.value, [0, 0.5, 1], [0.8, 0.95, 1], Extrapolate.CLAMP);
    return {
      transform: [{ scale: pulseScale }],
    };
  });

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  return (
    <Animated.View style={[styles.wrapper, containerAnimatedStyle]}>
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        <Animated.View style={[styles.touch, pressAnimatedStyle]}>
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {/* Glow effect layer */}
            <View
              style={[
                styles.glowLayer,
                {
                  backgroundColor: catColor + '08',
                  borderColor: catColor + '20',
                },
              ]}
            />

            {/* Glass highlight */}
            <View style={styles.glassHighlight} />

            <View style={styles.contentDefault}>
              {/* Header row with Icon and Badges */}
              <View style={styles.headerRow}>
                {/* Icon bubble with animation */}
                <Animated.View
                  style={[
                    styles.iconBubble,
                    {
                      backgroundColor: catColor + '15',
                      borderColor: catColor + '30',
                    },
                    iconPulseStyle,
                  ]}
                >
                  {isImageIcon ? (
                    <Image
                      source={{ uri: iconValue }}
                      style={styles.iconImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={styles.iconText}>{displayIcon}</Text>
                  )}
                </Animated.View>

                {/* Badges and Favorite Button */}
                <View style={styles.topRightActions}>
                  <TouchableOpacity
                    onPress={handleFavoritePress}
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
                    <Animated.View style={heartAnimatedStyle}>
                      <FontAwesome6
                        name="heart"
                        size={13}
                        color={favorite ? '#EF4444' : theme.textMuted}
                        solid={favorite}
                      />
                    </Animated.View>
                  </TouchableOpacity>

                  {/* Offline/Online Badge Tag */}
                  <View style={[
                    styles.modeTag,
                    isOfflineReady
                      ? { backgroundColor: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.25)' }
                      : { backgroundColor: 'rgba(59, 130, 246, 0.12)', borderColor: 'rgba(59, 130, 246, 0.25)' }
                  ]}>
                    <Text style={[
                      styles.modeTagText,
                      { color: isOfflineReady ? '#10b981' : '#60a5fa' }
                    ]}>
                      {isOfflineReady ? '⚡ Offline' : '🌐 Web'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Text content */}
              <View style={styles.content}>
                <View style={styles.titleRow}>
                  <Text style={[styles.appName, { color: theme.text }]} numberOfLines={1}>
                    {app.name}
                  </Text>
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

            {/* Action button */}
            {actionLabel && onAction && (
              <TouchableOpacity
                onPress={onAction}
                style={[
                  styles.actionBtn,
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.surface,
                  },
                ]}
                activeOpacity={0.8}
              >
                <Text style={[styles.actionBtnText, { color: theme.text }]}>{actionLabel}</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '48.2%',
    marginBottom: 16,
  },
  touch: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  card: {
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    minHeight: 146,
    position: 'relative',
  },
  glowLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 22,
    borderWidth: 1,
    zIndex: -1,
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
    width: 28,
    height: 28,
    borderRadius: 14,
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
  iconText: {
    fontSize: 26,
  },
  iconImage: {
    width: '60%',
    height: '60%',
    borderRadius: 8,
  },
  modeTag: {
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 7,
    borderWidth: 1,
  },
  modeTagText: {
    fontFamily: FONT.bold,
    fontSize: 9.5,
    letterSpacing: 0.2,
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
