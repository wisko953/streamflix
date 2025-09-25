/* ========================================
   STREAMFLIX - SCRIPT PRINCIPAL
   ======================================== */

// Attendre que l'API soit chargée
document.addEventListener('DOMContentLoaded', () => {
  // Vérifier que les dépendances sont disponibles
  if (typeof TMDB_CONFIG === 'undefined' || typeof TMDBUtils === 'undefined') {
    console.error('❌ API TMDB non disponible');
    return;
  }

  class APIManager {
    constructor() {
      this.config = TMDB_CONFIG;
      this.utils = TMDBUtils;
    }

    async fetchAPI(endpoint, params = {}) {
      try {
        const url = this.utils.buildAPIUrl(endpoint, params);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error("Erreur lors de la récupération des données de l'API:", error);
        throw error;
      }
    }

    async getPopularMovies(page = 1) {
      return this.fetchAPI(this.config.ENDPOINTS.MOVIE_POPULAR, { page });
    }

    async getTrendingMovies(time_window = 'week', page = 1) {
      return this.fetchAPI(`${this.config.ENDPOINTS.TRENDING_MOVIE}/${time_window}`, { page });
    }

    async getPopularTVShows(page = 1) {
      return this.fetchAPI(this.config.ENDPOINTS.TV_POPULAR, { page });
    }

    async getMovieDetails(movieId) {
      const endpoint = this.utils.buildEndpoint(this.config.ENDPOINTS.MOVIE_DETAILS, { movie_id: movieId });
      return this.fetchAPI(endpoint, { append_to_response: 'videos,credits,release_dates' });
    }

    async getTVShowDetails(tvId) {
      const endpoint = this.utils.buildEndpoint(this.config.ENDPOINTS.TV_DETAILS, { tv_id: tvId });
      return this.fetchAPI(endpoint, { append_to_response: 'videos,credits,content_ratings' });
    }

    async searchMulti(query, page = 1) {
      return this.fetchAPI(this.config.ENDPOINTS.SEARCH_MULTI, { query, page });
    }

    async getMovieGenres() {
      return this.fetchAPI(this.config.ENDPOINTS.GENRE_MOVIE_LIST);
    }

    async getTVGenres() {
      return this.fetchAPI(this.config.ENDPOINTS.GENRE_TV_LIST);
    }
  }

  class StreamFlixApp {
    constructor() {
      this.isInitialized = false;
      this.modules = {};
      this.eventListeners = new Map();
      this.apiManager = new APIManager(); // Initialiser l'APIManager

      this.init();
    }

    async init() {
      try {
        // Attendre que le DOM soit chargé
        if (document.readyState === 'loading') {
          await new Promise(resolve => {
            document.addEventListener('DOMContentLoaded', resolve);
          });
        }

        // Initialiser les modules dans l'ordre
        await this.initializeModules();

        // Configurer les événements globaux
        this.setupGlobalEvents();

        // Configurer les utilitaires
        this.setupUtilities();

        // Marquer comme initialisé
        this.isInitialized = true;

        // Déclencher événement d'initialisation
        this.dispatchInitEvent();

        console.log('🎬 StreamFlix initialisé avec succès');

      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation de StreamFlix:', error);
      }
    }

    async initializeModules() {
      // Vérifier que les modules sont disponibles
      const requiredModules = ['themeManager', 'navigation', 'animations', 'carousel', 'filters'];
      const missingModules = requiredModules.filter(module => !window.StreamFlix?.[module]);

      if (missingModules.length > 0) {
        console.warn('⚠️ Modules manquants:', missingModules);
      }

      // Stocker les références aux modules
      this.modules = {
        theme: window.StreamFlix?.themeManager,
        navigation: window.StreamFlix?.navigation,
        animations: window.StreamFlix?.animations,
        carousel: window.StreamFlix?.carousel,
        filters: window.StreamFlix?.filters
      };
    }

    setupGlobalEvents() {
      // Gestion des erreurs globales
      window.addEventListener('error', (e) => {
        console.error('Erreur JavaScript:', e.error);
        this.handleError(e.error);
      });

      // Gestion des erreurs de promesses non capturées
      window.addEventListener('unhandledrejection', (e) => {
        console.error('Promesse rejetée:', e.reason);
        this.handleError(e.reason);
      });

      // Gestion du redimensionnement
      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          this.handleResize();
        }, 250);
      });

      // Gestion de la visibilité de la page
      document.addEventListener('visibilitychange', () => {
        this.handleVisibilityChange();
      });

      // Gestion des raccourcis clavier globaux
      document.addEventListener('keydown', (e) => {
        this.handleGlobalKeyboard(e);
      });

      // Gestion des événements personnalisés
      this.setupCustomEvents();
    }

    setupCustomEvents() {
      // Écouter les changements de thème
      document.addEventListener('themechange', (e) => {
        console.log('🎨 Thème changé:', e.detail.theme);
        this.handleThemeChange(e.detail);
      });

      // Écouter les changements de section
      document.addEventListener('sectionchange', (e) => {
        console.log('📍 Section changée:', e.detail.section);
        this.handleSectionChange(e.detail);
      });

      // Écouter les changements de filtre
      document.addEventListener('filterchange', (e) => {
        console.log('🔍 Filtre changé:', e.detail.filter);
        this.handleFilterChange(e.detail);
      });

      // Écouter les recherches
      document.addEventListener('search', (e) => {
        console.log('🔎 Recherche:', e.detail.query);
        this.handleSearch(e.detail);
      });
    }

    setupUtilities() {
      // Utilitaires de performance
      this.setupPerformanceMonitoring();

      // Utilitaires d'accessibilité
      this.setupAccessibilityFeatures();

      // Utilitaires de débogage (en développement)
      if (this.isDevelopment()) {
        this.setupDebugTools();
      }
    }

    setupPerformanceMonitoring() {
      // Surveiller les performances
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'measure') {
              console.log(`⏱️ ${entry.name}: ${entry.duration.toFixed(2)}ms`);
            }
          }
        });

        observer.observe({ entryTypes: ['measure'] });
      }

      // Mesurer le temps de chargement initial
      window.addEventListener('load', () => {
        const loadTime = performance.now();
        console.log(`🚀 Temps de chargement: ${loadTime.toFixed(2)}ms`);
      });
    }

    setupAccessibilityFeatures() {
      // Gestion du focus pour l'accessibilité
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          document.body.classList.add('keyboard-navigation');
        }
      });

      document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
      });

      // Annonces pour les lecteurs d'écran
      this.createAriaLiveRegion();
    }

    createAriaLiveRegion() {
      const liveRegion = document.createElement('div');
      liveRegion.id = 'aria-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
      document.body.appendChild(liveRegion);

      this.ariaLiveRegion = liveRegion;
    }

    announceToScreenReader(message) {
      if (this.ariaLiveRegion) {
        this.ariaLiveRegion.textContent = message;
      }
    }

    setupDebugTools() {
      // Console de débogage
      console.log('🔧 Mode développement activé');

      // Raccourcis de débogage
      window.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey) {
          switch (e.key) {
            case 'D':
              e.preventDefault();
              this.toggleDebugMode();
              break;
            case 'R':
              e.preventDefault();
              this.reloadModules();
              break;
            case 'I':
              e.preventDefault();
              this.showAppInfo();
              break;
          }
        }
      });

      // Exposer l'app globalement pour le débogage
      window.StreamFlixApp = this;
    }

    handleError(error) {
      // Gestion gracieuse des erreurs
      console.error('Erreur capturée:', error);

      // Afficher une notification d'erreur à l'utilisateur
      this.showErrorNotification('Une erreur est survenue. Veuillez rafraîchir la page.');
    }

    handleResize() {
      // Notifier les modules du redimensionnement
      if (this.modules.carousel?.manager) {
        this.modules.carousel.manager.refreshAllCarousels();
      }

      // Recalculer les animations si nécessaire
      if (this.modules.animations?.parallax) {
        // Le parallax se met à jour automatiquement
      }

      console.log('📐 Redimensionnement détecté');
    }

    handleVisibilityChange() {
      if (document.hidden) {
        // Page cachée - pause des animations
        if (this.modules.carousel?.manager) {
          this.modules.carousel.manager.pauseAllCarousels();
        }
        console.log('⏸️ Page cachée - animations en pause');
      } else {
        // Page visible - reprise des animations
        if (this.modules.carousel?.manager) {
          this.modules.carousel.manager.resumeAllCarousels();
        }
        console.log('▶️ Page visible - animations reprises');
      }
    }

    handleGlobalKeyboard(e) {
      // Raccourcis clavier globaux
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            this.focusSearch();
            break;
          case '/':
            e.preventDefault();
            this.focusSearch();
            break;
        }
      }

      // Échapper pour fermer les modales/overlays
      if (e.key === 'Escape') {
        this.closeAllOverlays();
      }
    }

    handleThemeChange(detail) {
      // Annoncer le changement de thème
      this.announceToScreenReader(`Thème changé vers ${detail.theme}`);

      // Sauvegarder les préférences utilisateur
      this.saveUserPreferences();
    }

    handleSectionChange(detail) {
      // Mettre à jour l'URL sans recharger la page
      if (history.pushState) {
        const newUrl = `${window.location.pathname}#${detail.section}`;
        history.pushState(null, '', newUrl);
      }

      // Annoncer le changement de section
      this.announceToScreenReader(`Navigation vers ${detail.title}`);
    }

    handleFilterChange(detail) {
      // Annoncer le changement de filtre
      const filterName = detail.filter === 'all' ? 'tous les contenus' : detail.filter;
      this.announceToScreenReader(`Filtre appliqué: ${filterName}`);
    }

    handleSearch(detail) {
      // Annoncer les résultats de recherche
      const resultCount = detail.suggestions?.length || 0;
      this.announceToScreenReader(`${resultCount} résultat(s) trouvé(s) pour "${detail.query}"`);
    }

    focusSearch() {
      const searchInput = document.querySelector('.search-input');
      if (searchInput) {
        searchInput.focus();

        // Ouvrir la barre de recherche si elle est fermée
        const searchBar = document.getElementById('searchBar');
        if (searchBar && !searchBar.classList.contains('active')) {
          searchBar.classList.add('active');
        }
      }
    }

    closeAllOverlays() {
      // Fermer la recherche
      const searchBar = document.getElementById('searchBar');
      if (searchBar?.classList.contains('active')) {
        searchBar.classList.remove('active');
      }

      // Fermer le menu mobile
      const mobileMenu = document.querySelector('.navbar-nav');
      const mobileToggle = document.querySelector('.mobile-menu-toggle');
      if (mobileMenu?.classList.contains('active')) {
        mobileMenu.classList.remove('active');
        mobileToggle?.setAttribute('aria-expanded', 'false');
      }
    }

    showErrorNotification(message) {
      const notification = document.createElement('div');
      notification.className = 'error-notification';
      notification.textContent = message;
      notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--color-error);
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      z-index: 10000;
      font-weight: 500;
      box-shadow: var(--shadow-xl);
      animation: slideInRight 0.3s ease-out;
    `;

      document.body.appendChild(notification);

      // Supprimer automatiquement après 5 secondes
      setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }, 5000);
    }

    saveUserPreferences() {
      const preferences = {
        theme: this.modules.theme?.getCurrentTheme(),
        timestamp: Date.now()
      };

      try {
        localStorage.setItem('streamflix-preferences', JSON.stringify(preferences));
      } catch (error) {
        console.warn('Impossible de sauvegarder les préférences:', error);
      }
    }

    loadUserPreferences() {
      try {
        const preferences = JSON.parse(localStorage.getItem('streamflix-preferences'));
        return preferences || {};
      } catch {
        return {};
      }
    }

    isDevelopment() {
      return window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.search.includes('debug=true');
    }

    toggleDebugMode() {
      document.body.classList.toggle('debug-mode');
      console.log('🔧 Mode debug basculé');
    }

    reloadModules() {
      console.log('🔄 Rechargement des modules...');
      window.location.reload();
    }

    showAppInfo() {
      console.group('📱 Informations StreamFlix');
      console.log('Version:', '1.0.0');
      console.log('Modules chargés:', Object.keys(this.modules));
      console.log('Thème actuel:', this.modules.theme?.getCurrentTheme());
      console.log('Performances:', performance.now().toFixed(2) + 'ms');
      console.groupEnd();
    }

    dispatchInitEvent() {
      const event = new CustomEvent('streamflixready', {
        detail: {
          app: this,
          modules: this.modules,
          timestamp: Date.now()
        }
      });
      document.dispatchEvent(event);
    }

    // API publique
    getModule(name) {
      return this.modules[name];
    }

    isReady() {
      return this.isInitialized;
    }

    destroy() {
      // Nettoyer les événements et modules
      this.eventListeners.forEach((listener, element) => {
        element.removeEventListener(...listener);
      });

      this.eventListeners.clear();
      this.isInitialized = false;

      console.log('🧹 StreamFlix nettoyé');
    }
  }

  // Styles pour les animations et notifications
  const addMainStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
    
    .keyboard-navigation *:focus {
      outline: 2px solid var(--color-primary) !important;
      outline-offset: 2px !important;
    }
    
    .debug-mode {
      position: relative;
    }
    
    .debug-mode::before {
      content: '🔧 DEBUG MODE';
      position: fixed;
      top: 10px;
      left: 10px;
      background: #ff6b35;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      z-index: 10000;
    }
  `;
    document.head.appendChild(style);
  };

  // Initialisation automatique
  (() => {
    addMainStyles();

    // Créer l'instance de l'application
    const app = new StreamFlixApp();

    // Exposer globalement
    window.StreamFlix = window.StreamFlix || {};
    window.StreamFlix.app = app;

    // Message de bienvenue
    console.log(`
    🎬 StreamFlix
    ═══════════════════════════════════════
    Plateforme de streaming moderne
    Développé avec HTML5, CSS3 et JavaScript
    ═══════════════════════════════════════
  `);
  })();

  // Export pour les modules ES6
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StreamFlixApp };
  }

  document.addEventListener("streamflixready", async (e) => {
    const app = e.detail.app;
    const api = app.apiManager;

    // Sélecteurs adaptés à ton HTML
    const moviesGrid = document.querySelector("#films .movies-grid");
    const seriesTrack = document.querySelector("#series .carousel-track");

    try {
      // --- FILMS POPULAIRES ---
      const movieResponse = await api.getPopularMovies();
      moviesGrid.innerHTML = ""; // On supprime le placeholder

      movieResponse.results.forEach(movie => {
        const card = document.createElement("article");
        card.className = "movie-card";
        card.innerHTML = `
        <div class="card-image">
          <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" 
               alt="${movie.title}" loading="lazy">
        </div>
        <div class="card-content">
          <h3 class="card-title">${movie.title}</h3>
          <p class="card-meta">${(movie.release_date || "").slice(0, 4)} • ⭐ ${movie.vote_average.toFixed(1)}</p>
        </div>
      `;
        moviesGrid.appendChild(card);
      });

      // --- SERIES POPULAIRES ---
      const tvResponse = await api.getPopularTVShows();
      seriesTrack.innerHTML = ""; // Supprimer le contenu statique

      tvResponse.results.forEach(show => {
        const card = document.createElement("article");
        card.className = "movie-card series-card";
        card.innerHTML = `
        <div class="card-image">
          <img src="https://image.tmdb.org/t/p/w500${show.poster_path}" 
               alt="${show.name}" loading="lazy">
        </div>
        <div class="card-content">
          <h3 class="card-title">${show.name}</h3>
          <p class="card-meta">${(show.first_air_date || "").slice(0, 4)} • ⭐ ${show.vote_average.toFixed(1)}</p>
        </div>
      `;
        seriesTrack.appendChild(card);
      });

    } catch (error) {
      console.error("❌ Impossible de charger les contenus :", error);
    }
  });

}); // Fin du DOMContentLoaded

