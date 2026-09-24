import { useSharedValue, useAnimatedStyle, withSpring, withTiming, Easing } from 'react-native-reanimated';
import { ANIMATIONS } from '../constants/animations';

/**
 * Hook personnalisé pour animer le facteur d'échelle (scale) lors d'un appui (press-in / press-out).
 * Utile pour les boutons dynamiques et cartes interactives.
 */
export const useScaleAnimation = (initialScale = 1) => {
  const scale = useSharedValue(initialScale);

  const onPressIn = () => {
    scale.value = withSpring(ANIMATIONS.scales.pressed, ANIMATIONS.timingConfigs.spring);
  };

  const onPressOut = () => {
    scale.value = withSpring(initialScale, ANIMATIONS.timingConfigs.spring);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { animatedStyle, onPressIn, onPressOut };
};

/**
 * Hook personnalisé pour animer l'opacité (fondu d'apparition / fade-in).
 */
export const useFadeInAnimation = (initialOpacity = 0) => {
  const opacity = useSharedValue(initialOpacity);

  const startAnimation = (duration = ANIMATIONS.durations.normal) => {
    opacity.value = withTiming(1, { duration, easing: Easing.out(Easing.cubic) });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return { animatedStyle, startAnimation };
};

/**
 * Hook personnalisé pour une animation de glissement vertical (slide-in).
 */
export const useSlideAnimation = (initialTranslate = 50) => {
  const translateY = useSharedValue(initialTranslate);

  const startAnimation = (duration = ANIMATIONS.durations.normal) => {
    translateY.value = withTiming(0, { duration, easing: Easing.out(Easing.cubic) });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return { animatedStyle, startAnimation };
};

/**
 * Hook personnalisé combinant apparition en fondu et glissement vertical (effet d'entrée d'élément).
 */
export const useEntranceAnimation = () => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  const startAnimation = (delay = 0, duration = ANIMATIONS.durations.normal) => {
    setTimeout(() => {
      opacity.value = withTiming(1, {
        duration,
        easing: Easing.out(Easing.cubic),
      });
      translateY.value = withSpring(0, ANIMATIONS.timingConfigs.spring);
    }, delay);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return { animatedStyle, startAnimation };
};

/**
 * Hook personnalisé pour une animation de rotation continue ou ponctuelle.
 */
export const useRotationAnimation = (duration = 2000) => {
  const rotation = useSharedValue(0);

  const startAnimation = () => {
    rotation.value = withTiming(360, {
      duration,
      easing: Easing.linear,
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${rotation.value}deg`,
      },
    ],
  }));

  return { animatedStyle, startAnimation };
};

/**
 * Hook personnalisé pour un effet de pulsation visuelle (agrandissement puis rétrécissement).
 */
export const usePulseAnimation = (minScale = 1, maxScale = 1.1) => {
  const scale = useSharedValue(minScale);

  const startAnimation = () => {
    scale.value = withTiming(maxScale, {
      duration: ANIMATIONS.durations.slow,
      easing: Easing.inOut(Easing.quad),
    });
    
    setTimeout(() => {
      scale.value = withTiming(minScale, {
        duration: ANIMATIONS.durations.slow,
        easing: Easing.inOut(Easing.quad),
      });
    }, ANIMATIONS.durations.slow);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { animatedStyle, startAnimation };
};
