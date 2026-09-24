/**
 * Constantes d'animation et configurations de timing pour React Native Reanimated.
 */
export const ANIMATIONS = {
  /** Durées d'animation en millisecondes */
  durations: {
    fast: 200,
    normal: 300,
    slow: 500,
    verySlowbg: 3000,
  },

  /** Configurations de ressort (spring) et de timing */
  timingConfigs: {
    /** Ressort standard pour boutons et cartes */
    spring: {
      damping: 10,
      mass: 1,
      stiffness: 100,
      overshootClamping: false,
      restSpeedThreshold: 2,
      restDisplacementThreshold: 2,
    },
    /** Ressort rebondissant (effet élastique) */
    springBouncy: {
      damping: 6,
      mass: 1,
      stiffness: 100,
      overshootClamping: false,
    },
    
    /** Animation d'entrée progressive des cartes */
    cardEntrance: {
      duration: 400,
      damping: 12,
    },
    
    /** Animation de transition des onglets de la barre de navigation */
    tabAnimation: {
      damping: 10,
      stiffness: 100,
    },
  },

  /** Facteurs d'échelle (scale) pour les micro-interactions */
  scales: {
    inactive: 1,
    hover: 1.02,
    pressed: 0.95,
    interactive: 1.05,
  },

  /** Niveaux d'opacité prédéfinis */
  opacity: {
    disabled: 0.5,
    secondary: 0.7,
    primary: 1,
  },
};

/** Délais d'apparition en cascade (stagger) pour les listes d'éléments */
export const ANIMATION_DELAYS = {
  /** Décalage standard en millisecondes */
  stagger: 50,
  /** Décalage spécifique pour la grille de cartes */
  cardStagger: 40,
};
