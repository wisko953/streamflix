/**
 * Configuration API TMDB pour Streamflix
 * @author Streamflix
 * @description Configuration et constantes pour l'API The Movie Database
 */

// Configuration API TMDB
const TMDB_CONFIG = {
  API_KEY: 'e4b90327227c88daac14c0bd0c1f93cd',
  BASE_URL: 'https://api.themoviedb.org/3',
  IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
  
  // Tailles d'images disponibles
  IMAGE_SIZES: {
    POSTER: {
      SMALL: 'w185',
      MEDIUM: 'w342',
      LARGE: 'w500',
      XLARGE: 'w780',
      ORIGINAL: 'original'
    },
    BACKDROP: {
      SMALL: 'w300',
      MEDIUM: 'w780',
      LARGE: 'w1280',
      ORIGINAL: 'original'
    },
    PROFILE: {
      SMALL: 'w45',
      MEDIUM: 'w185',
      LARGE: 'h632',
      ORIGINAL: 'original'
    }
  },
  
  // Paramètres par défaut
  DEFAULT_PARAMS: {
    language: 'fr-FR',
    region: 'FR',
    include_adult: false
  },
  
  // Endpoints principaux
  ENDPOINTS: {
    // Films
    MOVIE_POPULAR: '/movie/popular',
    MOVIE_TOP_RATED: '/movie/top_rated',
    MOVIE_NOW_PLAYING: '/movie/now_playing',
    MOVIE_UPCOMING: '/movie/upcoming',
    MOVIE_DETAILS: '/movie',
    MOVIE_VIDEOS: '/movie/{movie_id}/videos',
    MOVIE_CREDITS: '/movie/{movie_id}/credits',
    MOVIE_RECOMMENDATIONS: '/movie/{movie_id}/recommendations',
    MOVIE_SIMILAR: '/movie/{movie_id}/similar',
    
    // Séries TV
    TV_POPULAR: '/tv/popular',
    TV_TOP_RATED: '/tv/top_rated',
    TV_ON_THE_AIR: '/tv/on_the_air',
    TV_AIRING_TODAY: '/tv/airing_today',
    TV_DETAILS: '/tv',
    TV_VIDEOS: '/tv/{tv_id}/videos',
    TV_CREDITS: '/tv/{tv_id}/credits',
    TV_RECOMMENDATIONS: '/tv/{tv_id}/recommendations',
    TV_SIMILAR: '/tv/{tv_id}/similar',
    
    // Recherche
    SEARCH_MULTI: '/search/multi',
    SEARCH_MOVIE: '/search/movie',
    SEARCH_TV: '/search/tv',
    SEARCH_PERSON: '/search/person',
    
    // Tendances
    TRENDING_ALL: '/trending/all',
    TRENDING_MOVIE: '/trending/movie',
    TRENDING_TV: '/trending/tv',
    TRENDING_PERSON: '/trending/person',
    
    // Genres
    GENRE_MOVIE_LIST: '/genre/movie/list',
    GENRE_TV_LIST: '/genre/tv/list',
    
    // Découverte
    DISCOVER_MOVIE: '/discover/movie',
    DISCOVER_TV: '/discover/tv',
    
    // Configuration
    CONFIGURATION: '/configuration'
  }
};

// Utilitaires pour construire les URLs
const TMDBUtils = {
  /**
   * Construit l'URL complète pour l'API
   * @param {string} endpoint - L'endpoint de l'API
   * @param {Object} params - Paramètres de requête additionnels
   * @returns {string} URL complète
   */
  buildAPIUrl(endpoint, params = {}) {
    const url = new URL(TMDB_CONFIG.BASE_URL + endpoint);
    
    // Ajouter la clé API
    url.searchParams.append('api_key', TMDB_CONFIG.API_KEY);
    
    // Ajouter les paramètres par défaut
    Object.entries(TMDB_CONFIG.DEFAULT_PARAMS).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    
    // Ajouter les paramètres personnalisés
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.append(key, value);
      }
    });
    console.log(url.toString())
    return url.toString();
  },
  
  /**
   * Construit l'URL pour une image
   * @param {string} path - Chemin de l'image
   * @param {string} size - Taille de l'image
   * @returns {string} URL complète de l'image
   */
  buildImageUrl(path, size = 'w500') {
    if (!path) return null;
    return `${TMDB_CONFIG.IMAGE_BASE_URL}/${size}${path}`;
  },
  
  /**
   * Construit l'URL d'un endpoint avec des paramètres de route
   * @param {string} endpoint - L'endpoint avec des placeholders
   * @param {Object} routeParams - Paramètres à remplacer dans l'endpoint
   * @returns {string} Endpoint avec les paramètres remplacés
   */
  buildEndpoint(endpoint, routeParams = {}) {
    let processedEndpoint = endpoint;
    
    Object.entries(routeParams).forEach(([key, value]) => {
      processedEndpoint = processedEndpoint.replace(`{${key}}`, value);
    });
    
    return processedEndpoint;
  },
  
  /**
   * Formate la date au format français
   * @param {string} dateString - Date au format ISO
   * @returns {string} Date formatée
   */
  formatDate(dateString) {
    if (!dateString) return 'Date inconnue';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },
  
  /**
   * Formate l'année depuis une date
   * @param {string} dateString - Date au format ISO
   * @returns {string} Année
   */
  getYear(dateString) {
    if (!dateString) return 'Année inconnue';
    return new Date(dateString).getFullYear().toString();
  },
  
  /**
   * Formate la durée en heures et minutes
   * @param {number} minutes - Durée en minutes
   * @returns {string} Durée formatée
   */
  formatRuntime(minutes) {
    if (!minutes) return 'Durée inconnue';
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
      return `${remainingMinutes}min`;
    }
    
    return `${hours}h ${remainingMinutes}min`;
  },
  
  /**
   * Tronque un texte à une longueur donnée
   * @param {string} text - Texte à tronquer
   * @param {number} maxLength - Longueur maximale
   * @returns {string} Texte tronqué
   */
  truncateText(text, maxLength = 150) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  },
  
  /**
   * Obtient la certification d'âge appropriée
   * @param {Array} releaseDates - Données des dates de sortie
   * @returns {string} Certification d'âge
   */
  getAgeCertification(releaseDates) {
    if (!releaseDates || !releaseDates.results) return '';
    
    // Chercher la certification française en priorité
    const frRelease = releaseDates.results.find(r => r.iso_3166_1 === 'FR');
    if (frRelease && frRelease.release_dates.length > 0) {
      const certification = frRelease.release_dates[0].certification;
      if (certification) return certification;
    }
    
    // Fallback sur la certification US
    const usRelease = releaseDates.results.find(r => r.iso_3166_1 === 'US');
    if (usRelease && usRelease.release_dates.length > 0) {
      const certification = usRelease.release_dates[0].certification;
      if (certification) return certification;
    }
    
    return '';
  }
};

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TMDB_CONFIG, TMDBUtils };
}

