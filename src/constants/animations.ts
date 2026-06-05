// Animation timing and configuration constants
export const ANIMATIONS = {
  // Durations (in milliseconds)
  durations: {
    fast: 200,
    normal: 300,
    slow: 500,
    verySlowbg: 3000,
  },

  // Easing functions
  timingConfigs: {
    // Spring animations
    spring: {
      damping: 10,
      mass: 1,
      stiffness: 100,
      overshootClamping: false,
      restSpeedThreshold: 2,
      restDisplacementThreshold: 2,
    },
    springBouncy: {
      damping: 6,
      mass: 1,
      stiffness: 100,
      overshootClamping: false,
    },
    
    // Card entrance animation
    cardEntrance: {
      duration: 400,
      damping: 12,
    },
    
    // Tab bar animation
    tabAnimation: {
      damping: 10,
      stiffness: 100,
    },
  },

  // Scale values for interactions
  scales: {
    inactive: 1,
    hover: 1.02,
    pressed: 0.95,
    interactive: 1.05,
  },

  // Opacity values
  opacity: {
    disabled: 0.5,
    secondary: 0.7,
    primary: 1,
  },
};

export const ANIMATION_DELAYS = {
  stagger: 50, // milliseconds between animated items
  cardStagger: 40,
};
