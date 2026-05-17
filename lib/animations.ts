/**
 * Animation utilities and keyframes for modern UI effects
 */

export const animationClasses = {
  // Fade animations
  fadeIn: 'animate-fade-in',
  fadeOut: 'animate-fade-out',
  
  // Slide animations
  slideInUp: 'animate-slide-in-up',
  slideInDown: 'animate-slide-in-down',
  slideInLeft: 'animate-slide-in-left',
  slideInRight: 'animate-slide-in-right',
  
  // Scale animations
  scaleIn: 'animate-scale-in',
  scaleOut: 'animate-scale-out',
  
  // Bounce animations
  bounce: 'animate-bounce',
  bounceIn: 'animate-bounce-in',
  
  // Pulse animations
  pulse: 'animate-pulse',
  
  // Rotate animations
  spin: 'animate-spin',
  
  // Gradient animations
  gradientShift: 'animate-gradient-shift',
};

/**
 * Tailwind CSS animations configuration to add to tailwind.config.ts
 * Add this to your theme.extend.animation object:
 */
export const tailwindAnimationConfig = {
  'fade-in': 'fadeIn 0.3s ease-in',
  'fade-out': 'fadeOut 0.3s ease-out',
  'slide-in-up': 'slideInUp 0.4s ease-out',
  'slide-in-down': 'slideInDown 0.4s ease-out',
  'slide-in-left': 'slideInLeft 0.4s ease-out',
  'slide-in-right': 'slideInRight 0.4s ease-out',
  'scale-in': 'scaleIn 0.3s ease-out',
  'scale-out': 'scaleOut 0.3s ease-in',
  'bounce-in': 'bounceIn 0.6s ease-out',
  'gradient-shift': 'gradientShift 3s ease infinite',
};

/**
 * Keyframes to add to your CSS or tailwind config
 */
export const keyframes = `
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  @keyframes slideInUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideInDown {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideInLeft {
    from {
      transform: translateX(-20px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideInRight {
    from {
      transform: translateX(20px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes scaleIn {
    from {
      transform: scale(0.9);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes scaleOut {
    from {
      transform: scale(1);
      opacity: 1;
    }
    to {
      transform: scale(0.9);
      opacity: 0;
    }
  }

  @keyframes bounceIn {
    0% {
      transform: scale(0.8);
      opacity: 0;
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes gradientShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`;

/**
 * Helper functions to add animations to elements
 */
export function addAnimationClass(element: HTMLElement, animation: keyof typeof animationClasses) {
  element.classList.add(animationClasses[animation]);
}

export function fadeInOnScroll() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('[data-fade-in]').forEach((el) => {
    observer.observe(el);
  });

  return observer;
}

export function slideInOnScroll() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const direction = (entry.target as HTMLElement).dataset.slideIn || 'up';
        entry.target.classList.add(`animate-slide-in-${direction}`);
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('[data-slide-in]').forEach((el) => {
    observer.observe(el);
  });

  return observer;
}
