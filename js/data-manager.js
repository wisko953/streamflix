/* ========================================
   STREAMFLIX - GESTIONNAIRE DE DONNÉES API
   ======================================== */

function createDeferredPromise() {
  let resolve, reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

class DataManager {
  constructor() {
    this.apiManager = null;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000;
    this.genres = { movie: [], tv: [] };

    // Create a deferred promise for initialization
    const { promise, resolve } = createDeferredPromise();
    this.isReadyPromise = promise;
    this.resolveIsReady = resolve;

    // Auto-wrap des méthodes publiques
    const asyncMethods = [
      'getPopularMovies',
      'getTrendingMovies',
      'getPopularTVShows',
      'searchContent',
      'getMovieDetails',
      'getTVShowDetails'
    ];

    asyncMethods.forEach(method => {
      const original = this[method];
      this[method] = async (...args) => {
        await this.isReadyPromise;
        return original.apply(this, args);
      };
    });

    this.init();
  }

  async init() {
    if (window.StreamFlix?.app?.apiManager) {
      this.apiManager = window.StreamFlix.app.apiManager;
      await this.loadGenres();
      console.log(this.apiManager)
      // Resolve the promise to signal that initialization is complete
      this.resolveIsReady(); 
    } else {
      setTimeout(() => this.init(), 100);
    }
  }

  async loadGenres() {
    try {
      const [movieGenres, tvGenres] = await Promise.all([
        this.apiManager.getMovieGenres(),
        this.apiManager.getTVGenres()
      ]);
      
      this.genres.movie = movieGenres.genres || [];
      this.genres.tv = tvGenres.genres || [];
      
      console.log('📚 Genres chargés:', this.genres);
    } catch (error) {
      console.error('Erreur lors du chargement des genres:', error);
    }
  }

  // Méthodes de cache
  getCacheKey(endpoint, params) {
    return `${endpoint}_${JSON.stringify(params)}`;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  getCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > this.cacheTimeout;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  // Méthodes pour récupérer les données
  async getPopularMovies(page = 1) {
    const cacheKey = this.getCacheKey('popular_movies', { page });
    const cached = this.getCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const data = await this.apiManager.getPopularMovies(page);
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des films populaires:', error);
      return this.getFallbackMovies();
    }
  }

  async getTrendingMovies(timeWindow = 'week', page = 1) {
    const cacheKey = this.getCacheKey('trending_movies', { timeWindow, page });
    const cached = this.getCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const data = await this.apiManager.getTrendingMovies(timeWindow, page);
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des films tendance:', error);
      return this.getFallbackMovies();
    }
  }

  async getPopularTVShows(page = 1) {
    const cacheKey = this.getCacheKey('popular_tv', { page });
    const cached = this.getCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const data = await this.apiManager.getPopularTVShows(page);
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des séries populaires:', error);
      return this.getFallbackTVShows();
    }
  }

  async searchContent(query, page = 1) {
    if (!query.trim()) return { results: [] };

    const cacheKey = this.getCacheKey('search', { query, page });
    const cached = this.getCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const data = await this.apiManager.searchMulti(query, page);
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      return { results: [] };
    }
  }

  async getMovieDetails(movieId) {
    const cacheKey = this.getCacheKey('movie_details', { movieId });
    const cached = this.getCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const data = await this.apiManager.getMovieDetails(movieId);
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du film:', error);
      return null;
    }
  }

  async getTVShowDetails(tvId) {
    const cacheKey = this.getCacheKey('tv_details', { tvId });
    const cached = this.getCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const data = await this.apiManager.getTVShowDetails(tvId);
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de la série:', error);
      return null;
    }
  }

  // Méthodes utilitaires
  getGenreName(genreId, type = 'movie') {
    const genreList = this.genres[type] || [];
    const genre = genreList.find(g => g.id === genreId);
    return genre ? genre.name : 'Genre inconnu';
  }

  getGenreNames(genreIds, type = 'movie') {
    return genreIds.map(id => this.getGenreName(id, type));
  }

  formatMovieForDisplay(movie) {
    if (!movie) return null;

    return {
      id: movie.id,
      title: movie.title || movie.name,
      originalTitle: movie.original_title || movie.original_name,
      overview: movie.overview,
      releaseDate: movie.release_date || movie.first_air_date,
      year: this.apiManager.utils.getYear(movie.release_date || movie.first_air_date),
      rating: movie.vote_average,
      voteCount: movie.vote_count,
      popularity: movie.popularity,
      posterPath: movie.poster_path,
      backdropPath: movie.backdrop_path,
      genreIds: movie.genre_ids || [],
      genres: this.getGenreNames(movie.genre_ids || [], 'movie'),
      adult: movie.adult,
      originalLanguage: movie.original_language,
      mediaType: movie.media_type || 'movie',
      
      // URLs d'images
      posterUrl: this.apiManager.utils.buildImageUrl(movie.poster_path, 'w500'),
      backdropUrl: this.apiManager.utils.buildImageUrl(movie.backdrop_path, 'w1280'),
      thumbnailUrl: this.apiManager.utils.buildImageUrl(movie.poster_path, 'w342'),
      
      // Formatage pour l'affichage
      formattedRating: movie.vote_average ? `${movie.vote_average.toFixed(1)}/10` : 'Non noté',
      formattedDate: this.apiManager.utils.formatDate(movie.release_date || movie.first_air_date),
      truncatedOverview: this.apiManager.utils.truncateText(movie.overview, 150)
    };
  }

  formatTVShowForDisplay(tvShow) {
    if (!tvShow) return null;

    return {
      id: tvShow.id,
      title: tvShow.name || tvShow.title,
      originalTitle: tvShow.original_name || tvShow.original_title,
      overview: tvShow.overview,
      firstAirDate: tvShow.first_air_date,
      year: this.apiManager.utils.getYear(tvShow.first_air_date),
      rating: tvShow.vote_average,
      voteCount: tvShow.vote_count,
      popularity: tvShow.popularity,
      posterPath: tvShow.poster_path,
      backdropPath: tvShow.backdrop_path,
      genreIds: tvShow.genre_ids || [],
      genres: this.getGenreNames(tvShow.genre_ids || [], 'tv'),
      adult: tvShow.adult,
      originalLanguage: tvShow.original_language,
      mediaType: tvShow.media_type || 'tv',
      originCountry: tvShow.origin_country,
      
      // URLs d'images
      posterUrl: this.apiManager.utils.buildImageUrl(tvShow.poster_path, 'w500'),
      backdropUrl: this.apiManager.utils.buildImageUrl(tvShow.backdrop_path, 'w1280'),
      thumbnailUrl: this.apiManager.utils.buildImageUrl(tvShow.poster_path, 'w342'),
      
      // Formatage pour l'affichage
      formattedRating: tvShow.vote_average ? `${tvShow.vote_average.toFixed(1)}/10` : 'Non noté',
      formattedDate: this.apiManager.utils.formatDate(tvShow.first_air_date),
      truncatedOverview: this.apiManager.utils.truncateText(tvShow.overview, 150)
    };
  }

  // Données de fallback en cas d'erreur API
  getFallbackMovies() {
    return {
      results: [
        {
          id: 1,
          title: "Film d'Action",
          overview: "Un film d'action palpitant avec des effets spéciaux époustouflants.",
          release_date: "2024-01-15",
          vote_average: 8.5,
          poster_path: null,
          backdrop_path: null,
          genre_ids: [28, 12]
        },
        {
          id: 2,
          title: "Comédie Romantique",
          overview: "Une comédie romantique pleine d'humour et d'émotion.",
          release_date: "2024-02-14",
          vote_average: 7.8,
          poster_path: null,
          backdrop_path: null,
          genre_ids: [35, 10749]
        },
        {
          id: 3,
          title: "Drame Intense",
          overview: "Un drame poignant qui explore les profondeurs de l'âme humaine.",
          release_date: "2024-03-10",
          vote_average: 9.1,
          poster_path: null,
          backdrop_path: null,
          genre_ids: [18]
        }
      ],
      total_pages: 1,
      total_results: 3
    };
  }

  getFallbackTVShows() {
    return {
      results: [
        {
          id: 1,
          name: "Série Dramatique",
          overview: "Une série captivante avec des personnages complexes et une intrigue prenante.",
          first_air_date: "2024-01-01",
          vote_average: 8.7,
          poster_path: null,
          backdrop_path: null,
          genre_ids: [18, 9648]
        },
        {
          id: 2,
          name: "Thriller Psychologique",
          overview: "Un thriller psychologique qui vous tiendra en haleine.",
          first_air_date: "2024-02-01",
          vote_average: 8.2,
          poster_path: null,
          backdrop_path: null,
          genre_ids: [53, 80]
        }
      ],
      total_pages: 1,
      total_results: 2
    };
  }

  // Méthodes pour filtrer les contenus
  filterByGenre(items, genreId) {
    return items.filter(item => 
      item.genre_ids && item.genre_ids.includes(genreId)
    );
  }

  filterByRating(items, minRating = 7.0) {
    return items.filter(item => 
      item.vote_average >= minRating
    );
  }

  filterByYear(items, year) {
    return items.filter(item => {
      const itemYear = this.apiManager.utils.getYear(
        item.release_date || item.first_air_date
      );
      return itemYear === year.toString();
    });
  }

  sortByPopularity(items, ascending = false) {
    return [...items].sort((a, b) => {
      const comparison = b.popularity - a.popularity;
      return ascending ? -comparison : comparison;
    });
  }

  sortByRating(items, ascending = false) {
    return [...items].sort((a, b) => {
      const comparison = b.vote_average - a.vote_average;
      return ascending ? -comparison : comparison;
    });
  }

  sortByDate(items, ascending = false) {
    return [...items].sort((a, b) => {
      const dateA = new Date(a.release_date || a.first_air_date || '1970-01-01');
      const dateB = new Date(b.release_date || b.first_air_date || '1970-01-01');
      const comparison = dateB - dateA;
      return ascending ? -comparison : comparison;
    });
  }

  // Méthode pour nettoyer le cache
  clearCache() {
    this.cache.clear();
    console.log('🧹 Cache nettoyé');
  }

  // Méthode pour obtenir les statistiques du cache
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  const dataManager = new DataManager();

  // Exposer globalement
  window.StreamFlix = window.StreamFlix || {};
  window.StreamFlix.dataManager = dataManager;
});

// Export pour les modules ES6
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DataManager };
}

