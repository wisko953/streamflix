/* ========================================
   STREAMFLIX - NAVIGATION ADAPTIVE INTELLIGENTE
   ======================================== */

class AdaptiveNavigation {
  constructor() {
    this.header = document.getElementById('header');
    this.navbar = document.querySelector('.navbar');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.sections = document.querySelectorAll('section[id]');
    this.breadcrumb = document.querySelector('.breadcrumb-list');
    
    this.lastScrollY = window.scrollY;
    this.isScrollingDown = false;
    this.isHeaderHidden = false;
    
    this.init();
  }

  init() {
    this.setupScrollBehavior();
    this.setupIntersectionObserver();
    this.setupActiveNavigation();
    this.setupMobileMenu();
    this.setupSearchToggle();
  }

  setupScrollBehavior() {
    let ticking = false;

    const updateHeader = () => {
      const currentScrollY = window.scrollY;
      const scrollDifference = currentScrollY - this.lastScrollY;

      // Déterminer la direction du scroll
      this.isScrollingDown = scrollDifference > 0;

      // Masquer/afficher le header selon le scroll
      if (currentScrollY > 100) {
        if (this.isScrollingDown && !this.isHeaderHidden) {
          this.hideHeader();
        } else if (!this.isScrollingDown && this.isHeaderHidden) {
          this.showHeader();
        }
      } else {
        this.showHeader();
      }

      // Ajouter classe scrolled pour les effets visuels
      if (currentScrollY > 50) {
        this.header.classList.add('scrolled');
      } else {
        this.header.classList.remove('scrolled');
      }

      this.lastScrollY = currentScrollY;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }, { passive: true });
  }

  hideHeader() {
    this.header.style.transform = 'translateY(-100%)';
    this.isHeaderHidden = true;
    this.header.classList.add('header-hidden');
  }

  showHeader() {
    this.header.style.transform = 'translateY(0)';
    this.isHeaderHidden = false;
    this.header.classList.remove('header-hidden');
  }

  setupIntersectionObserver() {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.updateActiveNavigation(entry.target.id);
          this.updateBreadcrumb(entry.target);
        }
      });
    }, observerOptions);

    this.sections.forEach(section => {
      observer.observe(section);
    });
  }

  updateActiveNavigation(sectionId) {
    // Supprimer la classe active de tous les liens
    this.navLinks.forEach(link => {
      link.classList.remove('active');
      link.setAttribute('aria-current', 'false');
    });

    // Ajouter la classe active au lien correspondant
    const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
      activeLink.setAttribute('aria-current', 'page');
      
      // Animation de l'indicateur
      this.animateNavIndicator(activeLink);
    }
  }

  animateNavIndicator(activeLink) {
    const indicator = activeLink.querySelector('.nav-indicator');
    if (indicator) {
      // Animation de pulsation
      indicator.style.animation = 'none';
      indicator.offsetHeight; // Force reflow
      indicator.style.animation = 'navIndicatorPulse 0.3s ease-out';
    }
  }

  setupActiveNavigation() {
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        const sectionId = link.getAttribute('data-section');
        const targetSection = document.getElementById(sectionId);
        
        if (targetSection) {
          // Scroll fluide vers la section
          const headerHeight = this.header.offsetHeight;
          const targetPosition = targetSection.offsetTop - headerHeight - 20;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });

          // Fermer le menu mobile si ouvert
          this.closeMobileMenu();
        }
      });
    });
  }

  setupBreadcrumbGeneration() {
    // Générer automatiquement le breadcrumb selon la section visible
    document.addEventListener('sectionchange', (e) => {
      this.generateBreadcrumb(e.detail.section);
    });
  }

  updateBreadcrumb(section) {
    if (!this.breadcrumb) return;

    const sectionTitle = this.getSectionTitle(section);
    const breadcrumbItems = [
      { text: 'Accueil', href: '#accueil' },
      { text: sectionTitle, href: `#${section.id}`, active: true }
    ];

    this.renderBreadcrumb(breadcrumbItems);

    // Déclencher événement de changement de section
    const event = new CustomEvent('sectionchange', {
      detail: { section: section.id, title: sectionTitle }
    });
    document.dispatchEvent(event);
  }

  getSectionTitle(section) {
    const titleMap = {
      'accueil': 'Accueil',
      'films': 'Films populaires',
      'series': 'Séries populaires',
      'nouveautes': 'Nouveautés',
      'ma-liste': 'Ma Liste'
    };

    return titleMap[section.id] || section.id;
  }

  renderBreadcrumb(items) {
    this.breadcrumb.innerHTML = '';

    items.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = `breadcrumb-item ${item.active ? 'active' : ''}`;

      if (item.active) {
        li.setAttribute('aria-current', 'page');
        li.innerHTML = `<span class="breadcrumb-text">${item.text}</span>`;
      } else {
        li.innerHTML = `<a href="${item.href}" class="breadcrumb-link">${item.text}</a>`;
      }

      this.breadcrumb.appendChild(li);
    });

    // Animation d'apparition
    this.animateBreadcrumb();
  }

  animateBreadcrumb() {
    const items = this.breadcrumb.querySelectorAll('.breadcrumb-item');
    items.forEach((item, index) => {
      item.style.opacity = '0';
      item.style.transform = 'translateX(-20px)';
      
      setTimeout(() => {
        item.style.transition = 'all 0.3s ease-out';
        item.style.opacity = '1';
        item.style.transform = 'translateX(0)';
      }, index * 100);
    });
  }

  setupMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.navbar-nav');

    if (mobileToggle && navMenu) {
      mobileToggle.addEventListener('click', () => {
        const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
        
        mobileToggle.setAttribute('aria-expanded', !isExpanded);
        navMenu.classList.toggle('active');
        
        // Animation du hamburger
        this.animateHamburger(mobileToggle, !isExpanded);
      });

      // Fermer le menu en cliquant à l'extérieur
      document.addEventListener('click', (e) => {
        if (!this.navbar.contains(e.target)) {
          this.closeMobileMenu();
        }
      });

      // Fermer le menu sur redimensionnement
      window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) {
          this.closeMobileMenu();
        }
      });
    }
  }

  closeMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.navbar-nav');

    if (mobileToggle && navMenu) {
      mobileToggle.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('active');
      this.animateHamburger(mobileToggle, false);
    }
  }

  animateHamburger(toggle, isOpen) {
    const lines = toggle.querySelectorAll('.hamburger-line');
    
    if (isOpen) {
      toggle.classList.add('active');
    } else {
      toggle.classList.remove('active');
    }
  }

  setupSearchToggle() {
    const searchToggle = document.querySelector('.search-toggle');
    const searchBar = document.getElementById('searchBar');
    const searchInput = document.querySelector('.search-input');

    if (searchToggle && searchBar) {
      searchToggle.addEventListener('click', () => {
        const isActive = searchBar.classList.contains('active');
        
        if (isActive) {
          this.hideSearchBar();
        } else {
          this.showSearchBar();
        }
      });

      // Fermer la recherche avec Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchBar.classList.contains('active')) {
          this.hideSearchBar();
        }
      });

      // Fermer en cliquant à l'extérieur
      document.addEventListener('click', (e) => {
        if (!searchBar.contains(e.target) && !searchToggle.contains(e.target)) {
          this.hideSearchBar();
        }
      });
    }
  }

  showSearchBar() {
    const searchBar = document.getElementById('searchBar');
    const searchInput = document.querySelector('.search-input');
    
    searchBar.classList.add('active');
    
    // Focus sur l'input après l'animation
    setTimeout(() => {
      if (searchInput) {
        searchInput.focus();
      }
    }, 300);
  }

  hideSearchBar() {
    const searchBar = document.getElementById('searchBar');
    const searchInput = document.querySelector('.search-input');
    
    searchBar.classList.remove('active');
    
    if (searchInput) {
      searchInput.blur();
    }
  }
}

// Navigation par onglets avec indicateur animé
class TabNavigation {
  constructor() {
    this.tabContainers = document.querySelectorAll('.section-tabs');
    this.init();
  }

  init() {
    this.tabContainers.forEach(container => {
      this.setupTabContainer(container);
    });
  }

  setupTabContainer(container) {
    const tabs = container.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('[data-tab-content]');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabId = tab.dataset.tab;
        this.switchTab(container, tabs, contents, tabId);
      });
    });

    // Initialiser l'indicateur
    this.updateTabIndicator(container, container.querySelector('.tab-btn.active'));
  }

  switchTab(container, tabs, contents, activeTabId) {
    // Désactiver tous les onglets
    tabs.forEach(tab => {
      tab.classList.remove('active');
      tab.setAttribute('aria-selected', 'false');
    });

    // Masquer tous les contenus
    contents.forEach(content => {
      content.classList.remove('active');
    });

    // Activer l'onglet sélectionné
    const activeTab = container.querySelector(`[data-tab="${activeTabId}"]`);
    const activeContent = document.querySelector(`[data-tab-content="${activeTabId}"]`);

    if (activeTab) {
      activeTab.classList.add('active');
      activeTab.setAttribute('aria-selected', 'true');
      this.updateTabIndicator(container, activeTab);
    }

    if (activeContent) {
      activeContent.classList.add('active');
    }
  }

  updateTabIndicator(container, activeTab) {
    if (!activeTab) return;

    const rect = activeTab.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    const x = rect.left - containerRect.left;
    const width = rect.width;

    container.style.setProperty('--tab-indicator-x', `${x}px`);
    container.style.setProperty('--tab-indicator-width', `${width}px`);
  }
}

// Gestion des notifications
class NotificationManager {
  constructor() {
    this.notificationToggle = document.querySelector('.notifications-toggle');
    this.init();
  }

  init() {
    if (this.notificationToggle) {
      this.notificationToggle.addEventListener('click', () => {
        this.showNotifications();
      });
    }
  }

  showNotifications() {
    // Simulation d'affichage des notifications
    console.log('Affichage des notifications');
    
    // Animation du badge
    const badge = document.querySelector('.notification-badge');
    if (badge) {
      badge.style.animation = 'notificationPulse 0.5s ease-out';
      setTimeout(() => {
        badge.style.animation = '';
      }, 500);
    }
  }
}

// Ajout des styles CSS pour les animations
const addNavigationStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes navIndicatorPulse {
      0% { transform: translateX(-50%) scaleX(0.8); }
      50% { transform: translateX(-50%) scaleX(1.2); }
      100% { transform: translateX(-50%) scaleX(1); }
    }
    
    .header {
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .navbar-nav {
      transition: all 0.3s ease-out;
    }
    
    .search-bar {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .breadcrumb-item {
      transition: all 0.3s ease-out;
    }
  `;
  document.head.appendChild(style);
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  addNavigationStyles();
  
  const adaptiveNavigation = new AdaptiveNavigation();
  const tabNavigation = new TabNavigation();
  const notificationManager = new NotificationManager();

  // Exposer globalement
  window.StreamFlix = window.StreamFlix || {};
  window.StreamFlix.navigation = {
    adaptive: adaptiveNavigation,
    tabs: tabNavigation,
    notifications: notificationManager
  };
});

// Export pour les modules ES6
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AdaptiveNavigation, TabNavigation, NotificationManager };
}

