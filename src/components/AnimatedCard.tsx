import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { FONT, COLORS } from '../constants/theme';
import { ANIMATIONS } from '../constants/animations';
import { MiniApp, Category } from '../types';
import { useTheme } from '../context/ThemeContext';

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
  const [isAnimationStarted, setIsAnimationStarted] = useState(false);

  // Animation values
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const scale = useSharedValue(0.95);
  const pressScale = useSharedValue(1);

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

  const iconValue = typeof app.icon === 'string' ? app.icon : '';
  const displayIcon = iconValue || '❔';
  const isImageIcon = iconValue.startsWith('http');
  const catColor = category?.color || theme.accent;
  const badgeColor = mode === 'dark' ? '#4B5563' : '#D1D5DB';

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
              {/* Installed badge */}
              {isInstalled && (
                <View style={[styles.installedIcon, { backgroundColor: badgeColor }]}>
                  <Text style={styles.installedCheckmark}>✓</Text>
                </View>
              )}

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

              {/* Text content */}
              <View style={styles.content}>
                <Text style={[styles.appName, { color: theme.text }]} numberOfLines={1}>
                  {app.name}
                </Text>
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
    padding: 18,
    borderWidth: 1,
    minHeight: 140,
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
  iconBubble: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
  },
  iconText: {
    fontSize: 32,
  },
  iconImage: {
    width: '60%',
    height: '60%',
    borderRadius: 8,
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
