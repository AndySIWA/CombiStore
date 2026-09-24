import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { FONT } from '../constants/theme';
import { ANIMATIONS } from '../constants/animations';

/** Propriétés de la pilule de catégorie animée */
interface AnimatedPillProps {
  /** Libellé de la catégorie */
  label: string;
  /** Emoji ou nom de l'icône */
  icon: string;
  /** Couleur active associée */
  color: string;
  /** Indique si cette catégorie est actuellement sélectionnée */
  isActive: boolean;
  /** Handler de sélection */
  onPress: () => void;
  /** Délai d'apparition initiale en ms */
  delay?: number;
}

/**
 * Composant de filtre sous forme de pilule animée pour le choix des catégories.
 */
export const AnimatedPill: React.FC<AnimatedPillProps> = ({
  label,
  icon,
  color,
  isActive,
  onPress,
  delay = 0,
}) => {
  const scale = useSharedValue(isActive ? 1 : 0.9);
  const opacity = useSharedValue(0);
  const backgroundColor = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    // Animation d'entrée
    setTimeout(() => {
      opacity.value = withTiming(1, {
        duration: ANIMATIONS.durations.normal,
        easing: Easing.out(Easing.cubic),
      });
    }, delay);
  }, []);

  useEffect(() => {
    // Transition d'état Actif / Inactif
    if (isActive) {
      scale.value = withSpring(1, ANIMATIONS.timingConfigs.spring);
      backgroundColor.value = withTiming(1, {
        duration: ANIMATIONS.durations.fast,
      });
    } else {
      scale.value = withSpring(0.95, ANIMATIONS.timingConfigs.spring);
      backgroundColor.value = withTiming(0, {
        duration: ANIMATIONS.durations.fast,
      });
    }
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const bgAnimatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: isActive ? color : 'rgba(255, 255, 255, 0.08)',
    };
  });

  return (
    <Animated.View style={[animatedStyle]}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[styles.pill, bgAnimatedStyle]}
      >
        <Text style={styles.pillText}>
          {icon} {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 6,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillText: {
    fontFamily: FONT.semiBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
});
