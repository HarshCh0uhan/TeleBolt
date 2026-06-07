export const animations = {
  duration: {
    fast: 0.15,
    normal: 0.25,
    slow: 0.4,
  },

  easing: [0.22, 1, 0.36, 1],

  fadeUp: {
    initial: {
      opacity: 0,
      y: 24,
    },
    whileInView: {
      opacity: 1,
      y: 0,
    },
    viewport: {
      once: true,
    },
    transition: {
      duration: 0.4,
    },
  },

  fadeIn: {
    initial: {
      opacity: 0,
    },
    whileInView: {
      opacity: 1,
    },
    viewport: {
      once: true,
    },
    transition: {
      duration: 0.4,
    },
  },
};

export default animations;