import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { FONT } from '../constants/theme';
import { ANIMATIONS } from '../constants/animations';

interface AnimatedHeaderProps {
  title: string;
  subtitle?: string;
  onAnimationStart?: () => void;
  delay?: number;
}

export const AnimatedHeader: React.FC<AnimatedHeaderProps> = ({
  title,
  subtitle,
  onAnimationStart,
  delay = 0,
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    const timer = setTimeout(() => {
      opacity.value = withTiming(1, {
        duration: ANIMATIONS.durations.normal,
        easing: Easing.out(Easing.cubic),
      });

      translateY.value = withTiming(0, {
        duration: ANIMATIONS.durations.normal,
        easing: Easing.out(Easing.cubic),
      });

      onAnimationStart?.();
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: FONT.medium,
    fontSize: 14,
    color: '#CBD5E1',
    opacity: 0.8,
  },
});
