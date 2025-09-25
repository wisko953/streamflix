/* ========================================
   STREAMFLIX - ANIMATIONS JAVASCRIPT AVANCÉES
   ======================================== */

class ParallaxManager {
  constructor() {
    this.parallaxElements = document.querySelectorAll('[data-parallax]');
    this.isScrolling = false;
    this.lastScrollY = window.scrollY;
    
    this.init();
  }

  init() {
    if (this.parallaxElements.length === 0) return;

    // Vérifier si l'utilisateur préfère les animations réduites
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    this.setupParallax();
    this.setupScrollListener();
  }

  setupParallax() {
    // Initialiser les éléments parallax
    this.parallaxElements.forEach(element => {
      element.style.willChange = 'transform';
      element.style.transform = 'translate3d(0, 0, 0)';
    });
  }

  setupScrollListener() {
    let ticking = false;

    const updateParallax = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;

      this.parallaxElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const speed = parseFloat(element.dataset.parallax) || 0.5;
        
        // Calculer si l'élément est visible
        const isVisible = rect.bottom >= 0 && rect.top <= windowHeight;
        
        if (isVisible) {
          // Calculer le décalage parallax
          const yPos = -(scrollY * speed);
          const transform = `translate3d(0, ${yPos}px, 0)`;
          
          element.style.transform = transform;
        }
      });

      this.lastScrollY = scrollY;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });

    // Mise à jour initiale
    updateParallax();
  }
}

class StaggeredAnimations {
  constructor() {
    this.staggerContainers = document.querySelectorAll('[data-stagger="true"]');
    this.observedElements = new Set();
    
    this.init();
  }

  init() {
    if (this.staggerContainers.length === 0) return;

    this.setupIntersectionObserver();
  }

  setupIntersectionObserver() {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.observedElements.has(entry.target)) {
          this.animateStaggeredItems(entry.target);
          this.observedElements.add(entry.target);
        }
      });
    }, observerOptions);

    this.staggerContainers.forEach(container => {
      observer.observe(container);
    });
  }

  animateStaggeredItems(container) {
    const items = container.querySelectorAll('[data-stagger-item]');
    
    items.forEach((item, index) => {
      // Réinitialiser l'état
      item.style.opacity = '0';
      item.style.transform = 'translateY(30px)';
      
      // Animer avec délai
      setTimeout(() => {
        item.style.transition = 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, index * 100);
    });
  }

  // Méthode pour déclencher manuellement l'animation
  triggerAnimation(container) {
    if (container && !this.observedElements.has(container)) {
      this.animateStaggeredItems(container);
      this.observedElements.add(container);
    }
  }
}

class Card3DEffects {
  constructor() {
    this.cards = document.querySelectorAll('.movie-card');
    this.init();
  }

  init() {
    if (this.cards.length === 0) return;

    this.cards.forEach(card => {
      this.setupCard3D(card);
    });
  }

  setupCard3D(card) {
    card.addEventListener('mouseenter', (e) => {
      this.handleMouseEnter(e.currentTarget);
    });

    card.addEventListener('mousemove', (e) => {
      this.handleMouseMove(e);
    });

    card.addEventListener('mouseleave', (e) => {
      this.handleMouseLeave(e.currentTarget);
    });
  }

  handleMouseEnter(card) {
    card.style.transition = 'transform 0.1s ease-out';
  }

  handleMouseMove(e) {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / centerY * -10;
    const rotateY = (x - centerX) / centerX * 10;
    
    const transform = `
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateY(-12px)
      scale3d(1.02, 1.02, 1.02)
    `;
    
    card.style.transform = transform;
  }

  handleMouseLeave(card) {
    card.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale3d(1, 1, 1)';
  }
}

class LoadingAnimations {
  constructor() {
    this.loader = document.getElementById('loader');
    this.init();
  }

  init() {
    // Simuler le chargement
    this.simulateLoading();
  }

  simulateLoading() {
    // Masquer le loader après le chargement du contenu
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.hideLoader();
      }, 1000);
    });

    // Fallback si l'événement load ne se déclenche pas
    setTimeout(() => {
      this.hideLoader();
    }, 3000);
  }

  hideLoader() {
    if (this.loader) {
      this.loader.classList.add('hidden');
      
      // Supprimer du DOM après l'animation
      setTimeout(() => {
        if (this.loader.parentNode) {
          this.loader.parentNode.removeChild(this.loader);
        }
      }, 500);
    }
  }

  showLoader() {
    if (this.loader) {
      this.loader.classList.remove('hidden');
    }
  }
}

class ScrollAnimations {
  constructor() {
    this.animatedElements = document.querySelectorAll('[data-animate]');
    this.init();
  }

  init() {
    if (this.animatedElements.length === 0) return;

    this.setupScrollObserver();
  }

  setupScrollObserver() {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -20% 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateElement(entry.target);
        }
      });
    }, observerOptions);

    this.animatedElements.forEach(element => {
      observer.observe(element);
    });
  }

  animateElement(element) {
    const animationType = element.dataset.animate;
    const delay = parseInt(element.dataset.delay) || 0;

    setTimeout(() => {
      element.classList.add('animated', `animate-${animationType}`);
    }, delay);
  }
}

class HoverEffects {
  constructor() {
    this.init();
  }

  init() {
    this.setupButtonEffects();
    this.setupCardEffects();
    this.setupLinkEffects();
  }

  setupButtonEffects() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
      button.addEventListener('mouseenter', (e) => {
        this.createRipple(e);
      });
    });
  }

  setupCardEffects() {
    const cards = document.querySelectorAll('.movie-card');
    
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        this.animateCardHover(card, true);
      });
      
      card.addEventListener('mouseleave', () => {
        this.animateCardHover(card, false);
      });
    });
  }

  setupLinkEffects() {
    const links = document.querySelectorAll('.nav-link, .footer-link');
    
    links.forEach(link => {
      link.addEventListener('mouseenter', () => {
        this.animateLinkHover(link, true);
      });
      
      link.addEventListener('mouseleave', () => {
        this.animateLinkHover(link, false);
      });
    });
  }

  createRipple(e) {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s ease-out;
      pointer-events: none;
    `;
    
    button.appendChild(ripple);
    
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 600);
  }

  animateCardHover(card, isHovering) {
    const image = card.querySelector('.card-image img');
    const overlay = card.querySelector('.card-overlay');
    const actions = card.querySelector('.card-actions');
    
    if (isHovering) {
      if (image) {
        image.style.transform = 'scale(1.1)';
      }
      if (overlay) {
        overlay.style.opacity = '1';
      }
      if (actions) {
        actions.style.transform = 'translateY(0)';
        actions.style.opacity = '1';
      }
    } else {
      if (image) {
        image.style.transform = 'scale(1)';
      }
      if (overlay) {
        overlay.style.opacity = '0';
      }
      if (actions) {
        actions.style.transform = 'translateY(20px)';
        actions.style.opacity = '0';
      }
    }
  }

  animateLinkHover(link, isHovering) {
    if (isHovering) {
      link.style.transform = 'translateX(4px)';
    } else {
      link.style.transform = 'translateX(0)';
    }
  }
}

class PerformanceOptimizer {
  constructor() {
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.isMobile = window.innerWidth <= 768;
    
    this.init();
  }

  init() {
    this.optimizeForDevice();
    this.setupResizeListener();
  }

  optimizeForDevice() {
    if (this.isReducedMotion) {
      this.disableAnimations();
    }
    
    if (this.isMobile) {
      this.optimizeForMobile();
    }
  }

  disableAnimations() {
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    `;
    document.head.appendChild(style);
  }

  optimizeForMobile() {
    // Réduire la complexité des animations sur mobile
    const cards = document.querySelectorAll('.movie-card');
    cards.forEach(card => {
      card.style.willChange = 'auto';
    });
  }

  setupResizeListener() {
    let resizeTimer;
    
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.isMobile = window.innerWidth <= 768;
        this.optimizeForDevice();
      }, 250);
    });
  }
}

// Ajout des styles CSS pour les animations
const addAnimationStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes fadeInLeft {
      from {
        opacity: 0;
        transform: translateX(-30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes fadeInRight {
      from {
        opacity: 0;
        transform: translateX(30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.8);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    
    .animate-fadeInUp {
      animation: fadeInUp 0.6s ease-out;
    }
    
    .animate-fadeInLeft {
      animation: fadeInLeft 0.6s ease-out;
    }
    
    .animate-fadeInRight {
      animation: fadeInRight 0.6s ease-out;
    }
    
    .animate-scaleIn {
      animation: scaleIn 0.6s ease-out;
    }
    
    .btn {
      position: relative;
      overflow: hidden;
    }
  `;
  document.head.appendChild(style);
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  addAnimationStyles();
  
  const parallaxManager = new ParallaxManager();
  const staggeredAnimations = new StaggeredAnimations();
  const card3DEffects = new Card3DEffects();
  const loadingAnimations = new LoadingAnimations();
  const scrollAnimations = new ScrollAnimations();
  const hoverEffects = new HoverEffects();
  const performanceOptimizer = new PerformanceOptimizer();

  // Exposer globalement
  window.StreamFlix = window.StreamFlix || {};
  window.StreamFlix.animations = {
    parallax: parallaxManager,
    staggered: staggeredAnimations,
    card3D: card3DEffects,
    loading: loadingAnimations,
    scroll: scrollAnimations,
    hover: hoverEffects,
    performance: performanceOptimizer
  };
});

// Export pour les modules ES6
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ParallaxManager,
    StaggeredAnimations,
    Card3DEffects,
    LoadingAnimations,
    ScrollAnimations,
    HoverEffects,
    PerformanceOptimizer
  };
}

