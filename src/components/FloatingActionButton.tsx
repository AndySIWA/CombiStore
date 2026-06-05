import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';

interface FloatingActionButtonProps {
  icon: string;
  onPress: () => void;
  color?: string;
  position?: 'bottom-right' | 'bottom-left' | 'center';
  animated?: boolean;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onPress,
  color = '#A78BFA',
  position = 'bottom-right',
  animated = true,
}) => {
  const scale = useSharedValue(0);
  const floatOffset = useSharedValue(0);

  useEffect(() => {
    if (!animated) {
      scale.value = 1;
      return;
    }

    // Entrance animation
    scale.value = withSpring(1, {
      damping: 8,
      stiffness: 100,
    });

    // Float animation loop
    const startFloatLoop = () => {
      floatOffset.value = withTiming(15, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      });

      setTimeout(() => {
        floatOffset.value = withTiming(0, {
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
        });
      }, 1000);

      setTimeout(startFloatLoop, 2000);
    };

    startFloatLoop();
  }, [animated]);

  const scaleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const floatAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -floatOffset.value }],
  }));

  const positionStyles: Record<typeof position, any> = {
    'bottom-right': { bottom: 20, right: 20 },
    'bottom-left': { bottom: 20, left: 20 },
    'center': { bottom: '50%', alignSelf: 'center' },
  };

  return (
    <Animated.View
      style={[
        styles.container,
        positionStyles[position],
        scaleAnimatedStyle,
        floatAnimatedStyle,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        style={[styles.fab, { backgroundColor: color }]}
        activeOpacity={0.8}
      >
        <View style={styles.innerContainer}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 99,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  innerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 28,
  },
});
