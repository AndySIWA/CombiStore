import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withDelay,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

interface ShimmerProps {
  width?: number;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const Shimmer: React.FC<ShimmerProps> = ({
  width = '100%',
  height = 100,
  borderRadius = 12,
  style,
}) => {
  const shimmerPosition = useSharedValue(-1);

  useEffect(() => {
    shimmerPosition.value = withTiming(1, {
      duration: 1500,
      easing: Easing.inOut(Easing.ease),
    });

    const interval = setInterval(() => {
      shimmerPosition.value = withTiming(-1, {
        duration: 0,
      });
      shimmerPosition.value = withTiming(1, {
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerPosition.value,
      [-1, 1],
      [-width as number * 2, width as number * 2],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View style={[styles.container, { width, height, borderRadius }, style]}>
      <View style={[styles.baseShimmer, { borderRadius }]} />
      <Animated.View
        style={[
          styles.shimmerOverlay,
          {
            borderRadius,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  baseShimmer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
    opacity: 0.6,
  },
  skeletonCard: {
    width: '48.2%',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  } as any,
  skeletonIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    marginBottom: 12,
  },
  skeletonContent: {
    gap: 8,
  } as any,
  spinnerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    borderWidth: 3,
    width: '100%',
    height: '100%',
  },
});

// Skeleton loading card
interface SkeletonCardProps {
  delay?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ delay = 0 }) => {
  return (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonIcon}>
        <Shimmer width={54} height={54} borderRadius={16} />
      </View>
      <View style={styles.skeletonContent}>
        <Shimmer width={150} height={16} borderRadius={8} style={{ marginBottom: 8 }} />
        <Shimmer width={180} height={12} borderRadius={6} style={{ marginBottom: 4 }} />
        <Shimmer width={160} height={12} borderRadius={6} />
      </View>
    </View>
  );
};

// Loading spinner
interface LoadingSpinnerProps {
  size?: number;
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  color = '#A78BFA',
}) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    const startRotationLoop = () => {
      rotation.value = withTiming(360, {
        duration: 1500,
        easing: Easing.linear,
      });

      setTimeout(startRotationLoop, 1500);
    };

    startRotationLoop();
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={[styles.spinnerContainer, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.spinner,
          { borderColor: color + '30', borderTopColor: color, borderRadius: size / 2 },
          animatedStyle,
        ]}
      />
    </View>
  );
};
