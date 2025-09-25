/* ========================================
   STREAMFLIX - CAROUSEL SYSTÈME
   ======================================== */

class Carousel {
  constructor(container) {
    this.container = container;
    this.track = container.querySelector('.carousel-track');
    this.prevBtn = container.querySelector('.carousel-prev');
    this.nextBtn = container.querySelector('.carousel-next');
    this.items = container.querySelectorAll('.series-card');
    
    this.currentIndex = 0;
    this.itemsPerView = this.calculateItemsPerView();
    this.maxIndex = Math.max(0, this.items.length - this.itemsPerView);
    
    this.isAnimating = false;
    this.autoplayInterval = null;
    this.autoplayDelay = 5000;
    
    this.init();
  }

  init() {
    if (this.items.length === 0) return;

    this.setupEventListeners();
    this.setupTouchEvents();
    this.setupKeyboardNavigation();
    this.setupAutoplay();
    this.updateButtonStates();
    this.setupResizeListener();
  }

  calculateItemsPerView() {
    const containerWidth = this.container.offsetWidth;
    const itemWidth = 320; // Largeur d'une carte + gap
    return Math.floor(containerWidth / itemWidth) || 1;
  }

  setupEventListeners() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => {
        this.prev();
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        this.next();
      });
    }

    // Pause autoplay au hover
    this.container.addEventListener('mouseenter', () => {
      this.pauseAutoplay();
    });

    this.container.addEventListener('mouseleave', () => {
      this.resumeAutoplay();
    });
  }

  setupTouchEvents() {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    this.track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      this.pauseAutoplay();
    }, { passive: true });

    this.track.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      
      currentX = e.touches[0].clientX;
      const diffX = startX - currentX;
      
      // Feedback visuel pendant le drag
      const translateX = -this.currentIndex * (100 / this.itemsPerView) - (diffX / this.container.offsetWidth) * 20;
      this.track.style.transform = `translateX(${translateX}%)`;
    }, { passive: true });

    this.track.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      
      const diffX = startX - currentX;
      const threshold = 50;
      
      if (Math.abs(diffX) > threshold) {
        if (diffX > 0) {
          this.next();
        } else {
          this.prev();
        }
      } else {
        this.updatePosition();
      }
      
      isDragging = false;
      this.resumeAutoplay();
    });
  }

  setupKeyboardNavigation() {
    this.container.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          this.prev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.next();
          break;
        case ' ':
          e.preventDefault();
          this.toggleAutoplay();
          break;
      }
    });

    // Rendre le carousel focusable
    this.container.setAttribute('tabindex', '0');
  }

  setupAutoplay() {
    if (this.items.length <= this.itemsPerView) return;

    this.autoplayInterval = setInterval(() => {
      this.next();
    }, this.autoplayDelay);
  }

  pauseAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  resumeAutoplay() {
    if (!this.autoplayInterval && this.items.length > this.itemsPerView) {
      this.autoplayInterval = setInterval(() => {
        this.next();
      }, this.autoplayDelay);
    }
  }

  toggleAutoplay() {
    if (this.autoplayInterval) {
      this.pauseAutoplay();
    } else {
      this.resumeAutoplay();
    }
  }

  prev() {
    if (this.isAnimating) return;
    
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.maxIndex; // Boucle vers la fin
    }
    
    this.updatePosition();
  }

  next() {
    if (this.isAnimating) return;
    
    if (this.currentIndex < this.maxIndex) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0; // Boucle vers le début
    }
    
    this.updatePosition();
  }

  goTo(index) {
    if (this.isAnimating || index === this.currentIndex) return;
    
    this.currentIndex = Math.max(0, Math.min(index, this.maxIndex));
    this.updatePosition();
  }

  updatePosition() {
    if (!this.track) return;

    this.isAnimating = true;
    
    const translateX = -this.currentIndex * (100 / this.itemsPerView);
    this.track.style.transform = `translateX(${translateX}%)`;
    
    // Animation terminée
    setTimeout(() => {
      this.isAnimating = false;
    }, 500);

    this.updateButtonStates();
    this.updateItemStates();
    
    // Déclencher événement personnalisé
    this.dispatchChangeEvent();
  }

  updateButtonStates() {
    if (this.prevBtn) {
      this.prevBtn.disabled = this.currentIndex === 0 && this.items.length <= this.itemsPerView;
      this.prevBtn.setAttribute('aria-disabled', this.prevBtn.disabled);
    }

    if (this.nextBtn) {
      this.nextBtn.disabled = this.currentIndex === this.maxIndex && this.items.length <= this.itemsPerView;
      this.nextBtn.setAttribute('aria-disabled', this.nextBtn.disabled);
    }
  }

  updateItemStates() {
    this.items.forEach((item, index) => {
      const isVisible = index >= this.currentIndex && index < this.currentIndex + this.itemsPerView;
      item.setAttribute('aria-hidden', !isVisible);
      
      if (isVisible) {
        item.classList.add('visible');
      } else {
        item.classList.remove('visible');
      }
    });
  }

  setupResizeListener() {
    let resizeTimer;
    
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const newItemsPerView = this.calculateItemsPerView();
        
        if (newItemsPerView !== this.itemsPerView) {
          this.itemsPerView = newItemsPerView;
          this.maxIndex = Math.max(0, this.items.length - this.itemsPerView);
          this.currentIndex = Math.min(this.currentIndex, this.maxIndex);
          this.updatePosition();
        }
      }, 250);
    });
  }

  dispatchChangeEvent() {
    const event = new CustomEvent('carouselchange', {
      detail: {
        currentIndex: this.currentIndex,
        itemsPerView: this.itemsPerView,
        totalItems: this.items.length
      }
    });
    this.container.dispatchEvent(event);
  }

  // Méthodes publiques
  destroy() {
    this.pauseAutoplay();
    // Nettoyer les événements si nécessaire
  }

  refresh() {
    this.items = this.container.querySelectorAll('.series-card');
    this.itemsPerView = this.calculateItemsPerView();
    this.maxIndex = Math.max(0, this.items.length - this.itemsPerView);
    this.currentIndex = Math.min(this.currentIndex, this.maxIndex);
    this.updatePosition();
  }
}

class CarouselManager {
  constructor() {
    this.carousels = new Map();
    this.init();
  }

  init() {
    this.initializeCarousels();
    this.setupGlobalEvents();
  }

  initializeCarousels() {
    const carouselContainers = document.querySelectorAll('.series-carousel');
    
    carouselContainers.forEach((container, index) => {
      const carousel = new Carousel(container);
      this.carousels.set(`carousel-${index}`, carousel);
      
      // Ajouter un ID unique si pas présent
      if (!container.id) {
        container.id = `carousel-${index}`;
      }
    });
  }

  setupGlobalEvents() {
    // Pause tous les carousels quand l'onglet n'est pas visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseAllCarousels();
      } else {
        this.resumeAllCarousels();
      }
    });

    // Gestion des raccourcis clavier globaux
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            this.prevAllCarousels();
            break;
          case 'ArrowRight':
            e.preventDefault();
            this.nextAllCarousels();
            break;
        }
      }
    });
  }

  pauseAllCarousels() {
    this.carousels.forEach(carousel => {
      carousel.pauseAutoplay();
    });
  }

  resumeAllCarousels() {
    this.carousels.forEach(carousel => {
      carousel.resumeAutoplay();
    });
  }

  prevAllCarousels() {
    this.carousels.forEach(carousel => {
      carousel.prev();
    });
  }

  nextAllCarousels() {
    this.carousels.forEach(carousel => {
      carousel.next();
    });
  }

  getCarousel(id) {
    return this.carousels.get(id);
  }

  refreshAllCarousels() {
    this.carousels.forEach(carousel => {
      carousel.refresh();
    });
  }

  destroyAllCarousels() {
    this.carousels.forEach(carousel => {
      carousel.destroy();
    });
    this.carousels.clear();
  }
}

// Carousel avec indicateurs de pagination
class CarouselWithDots extends Carousel {
  constructor(container) {
    super(container);
    this.createDots();
  }

  createDots() {
    if (this.items.length <= this.itemsPerView) return;

    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'carousel-dots';
    
    const totalPages = Math.ceil(this.items.length / this.itemsPerView);
    
    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', `Aller à la page ${i + 1}`);
      dot.addEventListener('click', () => {
        this.goTo(i);
      });
      
      dotsContainer.appendChild(dot);
    }
    
    this.container.appendChild(dotsContainer);
    this.dots = dotsContainer.querySelectorAll('.carousel-dot');
    this.updateDots();
  }

  updatePosition() {
    super.updatePosition();
    this.updateDots();
  }

  updateDots() {
    if (!this.dots) return;

    this.dots.forEach((dot, index) => {
      if (index === this.currentIndex) {
        dot.classList.add('active');
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.classList.remove('active');
        dot.setAttribute('aria-current', 'false');
      }
    });
  }
}

// Ajout des styles CSS pour le carousel
const addCarouselStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    .carousel-dots {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-top: 20px;
    }
    
    .carousel-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      border: none;
      background-color: var(--text-muted);
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .carousel-dot:hover {
      background-color: var(--text-secondary);
      transform: scale(1.2);
    }
    
    .carousel-dot.active {
      background-color: var(--color-primary);
      transform: scale(1.3);
    }
    
    .series-card.visible {
      opacity: 1;
    }
    
    .series-card:not(.visible) {
      opacity: 0.7;
    }
    
    .carousel-track {
      transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
    }
    
    @media (max-width: 768px) {
      .carousel-track {
        transition-duration: 0.3s;
      }
    }
  `;
  document.head.appendChild(style);
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  addCarouselStyles();
  
  const carouselManager = new CarouselManager();

  // Exposer globalement
  window.StreamFlix = window.StreamFlix || {};
  window.StreamFlix.carousel = {
    manager: carouselManager,
    Carousel,
    CarouselWithDots
  };
});

// Export pour les modules ES6
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Carousel, CarouselManager, CarouselWithDots };
}

