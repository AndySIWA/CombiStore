import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { ANIMATIONS } from '../constants/animations';
import { FONT } from '../constants/theme';

/** Propriétés du bouton lumineux avec effet Glow */
interface GlowButtonProps {
  /** Libellé du bouton */
  label: string;
  /** Action au clic */
  onPress: () => void;
  /** Couleur principale du bouton et du halo */
  color?: string;
  /** Taille du bouton (small, medium, large) */
  size?: 'small' | 'medium' | 'large';
  /** État désactivé */
  disabled?: boolean;
  /** Styles personnalisés */
  style?: any;
}

/**
 * Bouton d'action principal avec effet de halo lumineux (glow) à l'appui.
 */
export const GlowButton: React.FC<GlowButtonProps> = ({
  label,
  onPress,
  color = '#A78BFA',
  size = 'medium',
  disabled = false,
  style,
}) => {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  const onPressIn = () => {
    if (disabled) return;
    scale.value = withSpring(0.95, ANIMATIONS.timingConfigs.spring);
    glowOpacity.value = withSpring(1, ANIMATIONS.timingConfigs.spring);
  };

  const onPressOut = () => {
    scale.value = withSpring(1, ANIMATIONS.timingConfigs.spring);
    glowOpacity.value = withSpring(0, ANIMATIONS.timingConfigs.spring);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    shadowColor: color,
    shadowOpacity: glowOpacity.value,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 0 },
    elevation: glowOpacity.value * 10,
  }));

  const sizeStyles = {
    small: styles.buttonSmall,
    medium: styles.buttonMedium,
    large: styles.buttonLarge,
  };

  const textSizeStyles = {
    small: styles.textSmall,
    medium: styles.textMedium,
    large: styles.textLarge,
  };

  return (
    <Animated.View style={[glowStyle]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled}
        activeOpacity={1}
      >
        <Animated.View
          style={[
            styles.button,
            sizeStyles[size],
            {
              backgroundColor: color,
              opacity: disabled ? 0.5 : 1,
            },
            animatedStyle,
          ]}
        >
          <Text style={[styles.text, textSizeStyles[size], { color: '#fff' }]}>
            {label}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    fontWeight: 'bold',
  },
  buttonSmall: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  buttonMedium: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  buttonLarge: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  text: {
    fontFamily: FONT.bold,
  },
  textSmall: {
    fontSize: 12,
  },
  textMedium: {
    fontSize: 14,
  },
  textLarge: {
    fontSize: 16,
  },
});
