/* ========================================
   STREAMFLIX - SYSTÈME DE THÈMES AVANCÉ
   ======================================== */

class ThemeManager {
  constructor() {
    this.themes = ['dark', 'light', 'cinema'];
    this.currentTheme = this.getStoredTheme() || 'dark';
    this.themeToggles = document.querySelectorAll('.theme-toggle');
    
    this.init();
  }

  init() {
    // Appliquer le thème initial
    this.applyTheme(this.currentTheme);
    
    // Ajouter les écouteurs d'événements
    this.themeToggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        const theme = e.target.dataset.theme;
        if (theme && this.themes.includes(theme)) {
          this.switchTheme(theme);
        }
      });
    });

    // Écouter les changements de préférence système
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        if (!this.getStoredTheme()) {
          this.applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }

    // Animation d'initialisation
    this.animateThemeLoad();
  }

  getStoredTheme() {
    try {
      return localStorage.getItem('streamflix-theme');
    } catch (error) {
      console.warn('LocalStorage non disponible:', error);
      return null;
    }
  }

  setStoredTheme(theme) {
    try {
      localStorage.setItem('streamflix-theme', theme);
    } catch (error) {
      console.warn('Impossible de sauvegarder le thème:', error);
    }
  }

  switchTheme(newTheme) {
    if (newTheme === this.currentTheme) return;

    // Désactiver temporairement les transitions
    this.disableTransitions();

    // Appliquer le nouveau thème
    this.applyTheme(newTheme);
    
    // Sauvegarder le choix
    this.setStoredTheme(newTheme);
    
    // Animation de changement de thème
    this.animateThemeChange(newTheme);

    // Réactiver les transitions après un délai
    setTimeout(() => {
      this.enableTransitions();
    }, 100);

    this.currentTheme = newTheme;
  }

  applyTheme(theme) {
    const html = document.documentElement;
    
    // Supprimer tous les thèmes existants
    this.themes.forEach(t => {
      html.classList.remove(`theme-${t}`);
    });

    // Appliquer le nouveau thème
    html.setAttribute('data-theme', theme);
    html.classList.add(`theme-${theme}`);

    // Mettre à jour les boutons de thème
    this.updateThemeToggles(theme);

    // Déclencher un événement personnalisé
    this.dispatchThemeChangeEvent(theme);
  }

  updateThemeToggles(activeTheme) {
    this.themeToggles.forEach(toggle => {
      const theme = toggle.dataset.theme;
      if (theme === activeTheme) {
        toggle.classList.add('active');
        toggle.setAttribute('aria-pressed', 'true');
      } else {
        toggle.classList.remove('active');
        toggle.setAttribute('aria-pressed', 'false');
      }
    });
  }

  disableTransitions() {
    const style = document.createElement('style');
    style.id = 'disable-transitions';
    style.textContent = `
      .theme-transition-disable *,
      .theme-transition-disable *::before,
      .theme-transition-disable *::after {
        transition: none !important;
        animation: none !important;
      }
    `;
    document.head.appendChild(style);
    document.body.classList.add('theme-transition-disable');
  }

  enableTransitions() {
    const style = document.getElementById('disable-transitions');
    if (style) {
      style.remove();
    }
    document.body.classList.remove('theme-transition-disable');
  }

  animateThemeLoad() {
    // Animation d'apparition du sélecteur de thème
    const themeSelector = document.querySelector('.theme-selector');
    if (themeSelector) {
      themeSelector.style.opacity = '0';
      themeSelector.style.transform = 'translateY(-20px)';
      
      setTimeout(() => {
        themeSelector.style.transition = 'all 0.5s ease-out';
        themeSelector.style.opacity = '1';
        themeSelector.style.transform = 'translateY(0)';
      }, 500);
    }
  }

  animateThemeChange(newTheme) {
    // Animation de pulsation pour le bouton actif
    const activeToggle = document.querySelector(`[data-theme="${newTheme}"]`);
    if (activeToggle) {
      activeToggle.style.animation = 'themeActivate 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
      
      setTimeout(() => {
        activeToggle.style.animation = '';
      }, 600);
    }

    // Effet de vague colorée
    this.createColorWave(newTheme);
  }

  createColorWave(theme) {
    const wave = document.createElement('div');
    wave.className = 'theme-wave';
    wave.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
      transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    `;

    // Couleur selon le thème
    const colors = {
      dark: '#141414',
      light: '#ffffff',
      cinema: '#2c1810'
    };

    wave.style.backgroundColor = colors[theme] || colors.dark;
    document.body.appendChild(wave);

    // Animation de la vague
    requestAnimationFrame(() => {
      wave.style.width = '200vmax';
      wave.style.height = '200vmax';
      wave.style.opacity = '0.1';
    });

    // Nettoyer après l'animation
    setTimeout(() => {
      if (wave.parentNode) {
        wave.parentNode.removeChild(wave);
      }
    }, 800);
  }

  dispatchThemeChangeEvent(theme) {
    const event = new CustomEvent('themechange', {
      detail: { theme, previousTheme: this.currentTheme }
    });
    document.dispatchEvent(event);
  }

  // Méthode publique pour obtenir le thème actuel
  getCurrentTheme() {
    return this.currentTheme;
  }

  // Méthode publique pour changer de thème programmatiquement
  setTheme(theme) {
    if (this.themes.includes(theme)) {
      this.switchTheme(theme);
    }
  }

  // Cycle entre les thèmes (utile pour raccourci clavier)
  cycleTheme() {
    const currentIndex = this.themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % this.themes.length;
    this.switchTheme(this.themes[nextIndex]);
  }
}

// Variables CSS dynamiques pour les thèmes
class ThemeVariables {
  constructor() {
    this.root = document.documentElement;
    this.init();
  }

  init() {
    // Écouter les changements de thème
    document.addEventListener('themechange', (e) => {
      this.updateVariables(e.detail.theme);
    });
  }

  updateVariables(theme) {
    // Mettre à jour les variables CSS spécifiques au thème
    const themeVariables = this.getThemeVariables(theme);
    
    Object.entries(themeVariables).forEach(([property, value]) => {
      this.root.style.setProperty(property, value);
    });

    // Animation des variables
    this.animateVariableChange();
  }

  getThemeVariables(theme) {
    const variables = {
      dark: {
        '--color-primary-rgb': '229, 9, 20',
        '--bg-primary-rgb': '20, 20, 20',
        '--theme-transition-duration': '0.4s'
      },
      light: {
        '--color-primary-rgb': '229, 9, 20',
        '--bg-primary-rgb': '255, 255, 255',
        '--theme-transition-duration': '0.4s'
      },
      cinema: {
        '--color-primary-rgb': '212, 175, 55',
        '--bg-primary-rgb': '44, 24, 16',
        '--theme-transition-duration': '0.4s'
      }
    };

    return variables[theme] || variables.dark;
  }

  animateVariableChange() {
    // Animation subtile lors du changement de variables
    this.root.style.setProperty('--theme-changing', '1');
    
    setTimeout(() => {
      this.root.style.setProperty('--theme-changing', '0');
    }, 400);
  }
}

// Raccourcis clavier pour les thèmes
class ThemeKeyboardShortcuts {
  constructor(themeManager) {
    this.themeManager = themeManager;
    this.init();
  }

  init() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + Shift + T pour cycler les thèmes
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        this.themeManager.cycleTheme();
        this.showThemeNotification();
      }

      // Raccourcis numériques pour thèmes spécifiques
      if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            this.themeManager.setTheme('dark');
            break;
          case '2':
            e.preventDefault();
            this.themeManager.setTheme('light');
            break;
          case '3':
            e.preventDefault();
            this.themeManager.setTheme('cinema');
            break;
        }
      }
    });
  }

  showThemeNotification() {
    const notification = document.createElement('div');
    notification.className = 'theme-notification';
    notification.textContent = `Thème: ${this.themeManager.getCurrentTheme()}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--bg-card);
      color: var(--text-primary);
      padding: 12px 20px;
      border-radius: 8px;
      border: 1px solid var(--border-primary);
      z-index: 10000;
      font-size: 14px;
      font-weight: 500;
      opacity: 0;
      transform: translateY(-20px);
      transition: all 0.3s ease-out;
      backdrop-filter: blur(10px);
    `;

    document.body.appendChild(notification);

    // Animation d'apparition
    requestAnimationFrame(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateY(0)';
    });

    // Disparition automatique
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-20px)';
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 2000);
  }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  const themeManager = new ThemeManager();
  const themeVariables = new ThemeVariables();
  const themeKeyboardShortcuts = new ThemeKeyboardShortcuts(themeManager);

  // Exposer globalement pour les autres scripts
  window.StreamFlix = window.StreamFlix || {};
  window.StreamFlix.themeManager = themeManager;
});

// Export pour les modules ES6 si nécessaire
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ThemeManager, ThemeVariables, ThemeKeyboardShortcuts };
}

