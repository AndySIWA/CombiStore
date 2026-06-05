import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { ANIMATIONS } from '../constants/animations';

interface AnimatedBackgroundProps {
  colors: string[];
  children?: React.ReactNode;
  animate?: boolean;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  colors,
  children,
  animate = true,
}) => {
  const angle1 = useSharedValue(0);
  const angle2 = useSharedValue(90);

  useEffect(() => {
    if (!animate) return;

    // Animate gradient angles for subtle movement effect
    const startLoop1 = () => {
      angle1.value = withTiming(360, {
        duration: ANIMATIONS.durations.verySlowbg,
        easing: Easing.linear,
      });
      setTimeout(startLoop1, ANIMATIONS.durations.verySlowbg);
    };

    const startLoop2 = () => {
      angle2.value = withTiming(270, {
        duration: ANIMATIONS.durations.verySlowbg * 1.3,
        easing: Easing.linear,
      });
      setTimeout(startLoop2, ANIMATIONS.durations.verySlowbg * 1.3);
    };

    startLoop1();
    startLoop2();
  }, [animate]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: colors[0],
  }));

  return (
    <View style={styles.container}>
      {/* Base background with animated color pulse */}
      <Animated.View style={[styles.base, animatedStyle]} />

      {/* Animated gradient overlay */}
      <LinearGradient
        colors={[colors[0], colors[1]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />

      {/* Decorative animated circles */}
      <View style={[styles.circle, styles.circle1, { backgroundColor: colors[0] + '15' }]} />
      <View style={[styles.circle, styles.circle2, { backgroundColor: colors[1] + '10' }]} />

      {/* Content */}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  base: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.6,
  },
  circle: {
    position: 'absolute',
    borderRadius: 9999,
  },
  circle1: {
    width: 300,
    height: 300,
    top: -100,
    right: -100,
    opacity: 0.3,
  },
  circle2: {
    width: 200,
    height: 200,
    bottom: -50,
    left: -50,
    opacity: 0.2,
  },
});
