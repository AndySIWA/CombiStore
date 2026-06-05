import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

interface ParallaxHeaderProps {
  scrollY: any;
  children: React.ReactNode;
  parallaxHeight?: number;
  parallaxStrength?: number;
  backgroundColor?: string;
}

export const ParallaxHeader: React.FC<ParallaxHeaderProps> = ({
  scrollY,
  children,
  parallaxHeight = 100,
  parallaxStrength = 0.5,
  backgroundColor = 'transparent',
}) => {
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, parallaxHeight],
      [0, parallaxHeight * parallaxStrength],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollY.value,
      [0, parallaxHeight],
      [1, 0.8],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { height: parallaxHeight, backgroundColor },
        headerAnimatedStyle,
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// FlatList with parallax scroll tracking
interface ParallaxFlatListProps {
  children: React.ReactNode;
  onScroll?: (scrollY: number) => void;
}

export const ParallaxScrollView: React.FC<ParallaxFlatListProps> = ({
  children,
  onScroll,
}) => {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      onScroll?.(event.contentOffset.y);
    },
  });

  return (
    <Animated.ScrollView
      scrollEventThrottle={16}
      onScroll={scrollHandler}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </Animated.ScrollView>
  );
};
