import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

/** Propriétés de l'en-tête à effet Parallaxe */
interface ParallaxHeaderProps {
  /** Valeur partagée de défilement Y */
  scrollY: any;
  /** Éléments de l'en-tête */
  children: React.ReactNode;
  /** Hauteur maximale de l'en-tête */
  parallaxHeight?: number;
  /** Intensité du déplacement parallaxe */
  parallaxStrength?: number;
  /** Couleur de fond */
  backgroundColor?: string;
}

/**
 * Composant d'en-tête animée avec effet de décalage parallaxe lors du défilement.
 */
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

/** Propriétés de la vue défilante avec suivi Parallaxe */
interface ParallaxFlatListProps {
  children: React.ReactNode;
  onScroll?: (scrollY: number) => void;
}

/**
 * Vue défilante ScrollView avec suivi des événements de défilement Reanimated.
 */
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
