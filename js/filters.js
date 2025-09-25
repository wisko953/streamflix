/* ========================================
   STREAMFLIX - SYSTÈME DE FILTRES ET TRI
   ======================================== */

class FilterManager {
  constructor() {
    this.filterButtons = document.querySelectorAll('.filter-btn');
    this.sortButtons = document.querySelectorAll('.sort-btn');
    this.movieCards = document.querySelectorAll('.movie-card');
    this.moviesGrid = document.querySelector('.movies-grid');
    
    this.currentFilter = 'all';
    this.currentSort = 'recent';
    this.isAnimating = false;
    this.dataManager = null;
    this.currentData = [];
    this.filteredData = [];
    
    this.init();
  }

  init() {
    this.setupDataManager();
    this.setupFilterButtons();
    this.setupSortButtons();
    this.setupSearchFunctionality();
    this.loadInitialData();
  }

  async setupDataManager() {
    // Attendre que le DataManager soit disponible
    if (window.StreamFlix?.dataManager) {
      this.dataManager = window.StreamFlix.dataManager;
    } else {
      // Réessayer après un délai
      setTimeout(() => this.setupDataManager(), 100);
    }
  }

  async loadInitialData() {
    if (!this.dataManager) {
      console.warn('DataManager non disponible pour le chargement des données');
      return;
    }

    try {
      // Charger les films populaires par défaut 
      const moviesData = await this.dataManager.getPopularMovies();
      this.currentData = moviesData.results || [];
      this.filteredData = [...this.currentData];
      
      // Mettre à jour l'affichage
      this.renderMovies(this.filteredData);
      
      console.log('📽️ Données initiales chargées:', this.currentData.length, 'films');
    } catch (error) {
      console.error('Erreur lors du chargement des données initiales:', error);
    }
  }

  setupFilterButtons() {
    this.filterButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const filter = e.target.dataset.filter;
        if (filter && filter !== this.currentFilter) {
          this.applyFilter(filter, e.target);
        }
      });
    });
  }

  setupSortButtons() {
    this.sortButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const sort = e.target.dataset.sort;
        if (sort && sort !== this.currentSort) {
          this.applySort(sort, e.target);
        }
      });
    });
  }

  renderMovies(movies) {
    if (!this.moviesGrid) return;

    // Vider la grille actuelle
    this.moviesGrid.innerHTML = '';

    // Créer les cartes pour chaque film
    movies.forEach(movie => {
      const movieCard = this.createMovieCard(movie);
      this.moviesGrid.appendChild(movieCard);
    });

    // Mettre à jour la référence aux cartes
    this.movieCards = this.moviesGrid.querySelectorAll('.movie-card');

    // Déclencher les animations d'apparition
    this.animateCardsIn();
  }

  createMovieCard(movie) {
    const formattedMovie = this.dataManager.formatMovieForDisplay(movie);
    
    const card = document.createElement('article');
    card.className = 'movie-card';
    card.dataset.category = this.getMovieCategory(movie);
    card.dataset.title = formattedMovie.title.toLowerCase();
    card.dataset.year = formattedMovie.year;
    card.dataset.rating = Math.floor(formattedMovie.rating || 0);
    card.dataset.dateAdded = movie.release_date || new Date().toISOString();

    const posterUrl = formattedMovie.posterUrl || '/assets/placeholder-poster.jpg';
    const backdropUrl = formattedMovie.backdropUrl || '/assets/placeholder-backdrop.jpg';

    card.innerHTML = `
      <div class="card-image">
        <img src="${posterUrl}" alt="${formattedMovie.title}" loading="lazy" />
        <div class="card-quality">${this.getQualityBadge(movie)}</div>
        <div class="card-overlay">
          <div class="card-actions">
            <button class="action-btn play-btn" aria-label="Lire" data-movie-id="${movie.id}">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
            <button class="action-btn like-btn" aria-label="J'aime" data-movie-id="${movie.id}">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
            <button class="action-btn add-btn" aria-label="Ajouter à ma liste" data-movie-id="${movie.id}">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div class="card-content">
        <h3 class="card-title">${formattedMovie.title}</h3>
        <div class="card-meta">
          <span class="card-year">${formattedMovie.year}</span>
          <span class="card-duration">${this.getFormattedDuration(movie)}</span>
        </div>
        <div class="card-rating">
          <div class="rating-stars">${this.generateStars(formattedMovie.rating)}</div>
          <span class="rating-text">${formattedMovie.formattedRating}</span>
        </div>
        <p class="card-description">${formattedMovie.truncatedOverview}</p>
        <div class="card-genres">
          ${formattedMovie.genres.slice(0, 2).map(genre => 
            `<span class="genre-tag">${genre}</span>`
          ).join('')}
        </div>
      </div>
    `;

    // Ajouter les événements aux boutons d'action
    this.setupCardEvents(card, movie);

    return card;
  }

  setupCardEvents(card, movie) {
    const playBtn = card.querySelector('.play-btn');
    const likeBtn = card.querySelector('.like-btn');
    const addBtn = card.querySelector('.add-btn');

    if (playBtn) {
      playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handlePlayMovie(movie);
      });
    }

    if (likeBtn) {
      likeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleLikeMovie(movie);
      });
    }

    if (addBtn) {
      addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleAddToList(movie);
      });
    }

    // Événement de clic sur la carte
    card.addEventListener('click', () => {
      this.handleCardClick(movie);
    });
  }

  getMovieCategory(movie) {
    if (!movie.genre_ids || movie.genre_ids.length === 0) return 'all';
    
    // Mapping des genres TMDB vers nos catégories
    const genreMapping = {
      28: 'action',     // Action
      12: 'action',     // Adventure
      35: 'comedy',     // Comedy
      18: 'drama',      // Drama
      27: 'horror',     // Horror
      53: 'thriller',   // Thriller
      80: 'crime',      // Crime
      9648: 'mystery',  // Mystery
      10749: 'romance', // Romance
      878: 'sci-fi'     // Science Fiction
    };

    // Retourner la première catégorie trouvée
    for (const genreId of movie.genre_ids) {
      if (genreMapping[genreId]) {
        return genreMapping[genreId];
      }
    }

    return 'all';
  }

  getQualityBadge(movie) {
    // Simuler la qualité basée sur la popularité et la note
    const rating = movie.vote_average || 0;
    const popularity = movie.popularity || 0;

    if (rating >= 8.5 && popularity > 100) return '4K';
    if (rating >= 7.0 && popularity > 50) return 'HD';
    return 'SD';
  }

  getFormattedDuration(movie) {
    // Pour les films, on peut estimer une durée basée sur le genre
    if (movie.runtime) {
      return this.dataManager.apiManager.utils.formatRuntime(movie.runtime);
    }
    
    // Estimation basée sur le genre
    const actionGenres = [28, 12, 53]; // Action, Adventure, Thriller
    const hasActionGenre = movie.genre_ids?.some(id => actionGenres.includes(id));
    
    return hasActionGenre ? '2h 15min' : '1h 45min';
  }

  generateStars(rating) {
    const stars = Math.round((rating || 0) / 2); // Convertir sur 5 étoiles
    const fullStars = '★'.repeat(stars);
    const emptyStars = '☆'.repeat(5 - stars);
    return fullStars + emptyStars;
  }

  handlePlayMovie(movie) {
    console.log('▶️ Lecture du film:', movie.title || movie.name);
    // Ici on pourrait ouvrir un modal de lecture ou rediriger
    this.showMovieModal(movie);
  }

  handleLikeMovie(movie) {
    console.log('❤️ Film aimé:', movie.title || movie.name);
    // Ici on pourrait sauvegarder dans les favoris
    this.toggleLike(movie);
  }

  handleAddToList(movie) {
    console.log('➕ Ajouté à la liste:', movie.title || movie.name);
    // Ici on pourrait ajouter à la liste personnelle
    this.addToWatchlist(movie);
  }

  handleCardClick(movie) {
    console.log('🎬 Détails du film:', movie.title || movie.name);
    // Ici on pourrait afficher les détails complets
    this.showMovieDetails(movie);
  }

  showMovieModal(movie) {
    // Implémentation future du modal de lecture
    alert(`Lecture de "${movie.title || movie.name}"`);
  }

  toggleLike(movie) {
    // Implémentation future du système de likes
    const likeBtn = document.querySelector(`[data-movie-id="${movie.id}"] .like-btn`);
    if (likeBtn) {
      likeBtn.classList.toggle('liked');
    }
  }

  addToWatchlist(movie) {
    // Implémentation future de la watchlist
    const addBtn = document.querySelector(`[data-movie-id="${movie.id}"] .add-btn`);
    if (addBtn) {
      addBtn.classList.toggle('added');
      addBtn.innerHTML = addBtn.classList.contains('added') ? 
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' :
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>';
    }
  }

  showMovieDetails(movie) {
    // Implémentation future des détails
    console.log('Affichage des détails pour:', movie);
  }

  setupSearchFunctionality() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
      let searchTimeout;
      
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.performSearch(e.target.value);
        }, 300);
      });
    }
  }

  async performSearch(query) {
    if (!this.dataManager) return;

    const normalizedQuery = query.toLowerCase().trim();
    
    if (normalizedQuery === '') {
      // Restaurer les données originales
      this.filteredData = [...this.currentData];
      this.renderMovies(this.filteredData);
      this.updateResultsCount('');
      return;
    }

    try {
      // Rechercher via l'API
      const searchResults = await this.dataManager.searchContent(normalizedQuery);
      
      // Filtrer seulement les films
      const movies = searchResults.results.filter(item => 
        item.media_type === 'movie' || !item.media_type
      );
      
      this.filteredData = movies;
      this.renderMovies(this.filteredData);
      this.updateResultsCount(normalizedQuery);
      
      console.log('🔍 Résultats de recherche:', movies.length, 'films trouvés');
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      // Fallback sur recherche locale
      this.performLocalSearch(normalizedQuery);
    }
  }

  performLocalSearch(query) {
    // Recherche locale dans les données actuelles
    this.filteredData = this.currentData.filter(movie => {
      const title = (movie.title || movie.name || '').toLowerCase();
      const overview = (movie.overview || '').toLowerCase();
      return title.includes(query) || overview.includes(query);
    });
    
    this.renderMovies(this.filteredData);
    this.updateResultsCount(query);
  }

  initializeCards() {
    // Ajouter des données de tri aux cartes si elles n'existent pas
    this.movieCards.forEach((card, index) => {
      if (!card.dataset.title) {
        const title = card.querySelector('.card-title')?.textContent || `Film ${index + 1}`;
        card.dataset.title = title.toLowerCase();
      }
      
      if (!card.dataset.year) {
        const year = card.querySelector('.card-year')?.textContent || '2024';
        card.dataset.year = year;
      }
      
      if (!card.dataset.rating) {
        const rating = this.calculateRating(card);
        card.dataset.rating = rating;
      }
      
      if (!card.dataset.dateAdded) {
        // Simuler une date d'ajout
        const daysAgo = Math.floor(Math.random() * 30);
        const dateAdded = new Date();
        dateAdded.setDate(dateAdded.getDate() - daysAgo);
        card.dataset.dateAdded = dateAdded.toISOString();
      }
    });
  }

  calculateRating(card) {
    const stars = card.querySelectorAll('.rating-stars');
    if (stars.length > 0) {
      const starText = stars[0].textContent;
      const filledStars = (starText.match(/★/g) || []).length;
      return filledStars.toString();
    }
    return Math.floor(Math.random() * 5 + 1).toString();
  }

  applyFilter(filter, button) {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    this.currentFilter = filter;
    
    // Mettre à jour les boutons
    this.updateFilterButtons(button);
    
    // Animer la sortie des cartes
    this.animateCardsOut(() => {
      // Filtrer les cartes
      this.filterCards(filter);
      
      // Animer l'entrée des cartes
      this.animateCardsIn(() => {
        this.isAnimating = false;
      });
    });
    
    // Déclencher événement personnalisé
    this.dispatchFilterEvent(filter);
  }

  applySort(sort, button) {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    this.currentSort = sort;
    
    // Mettre à jour les boutons
    this.updateSortButtons(button);
    
    // Animer la sortie des cartes
    this.animateCardsOut(() => {
      // Trier les cartes
      this.sortCards(sort);
      
      // Animer l'entrée des cartes
      this.animateCardsIn(() => {
        this.isAnimating = false;
      });
    });
    
    // Déclencher événement personnalisé
    this.dispatchSortEvent(sort);
  }

  applySearch(query) {
    const normalizedQuery = query.toLowerCase().trim();
    
    this.movieCards.forEach(card => {
      const title = card.dataset.title || '';
      const description = card.querySelector('.card-description')?.textContent.toLowerCase() || '';
      
      const matches = title.includes(normalizedQuery) || description.includes(normalizedQuery);
      
      if (matches || normalizedQuery === '') {
        card.style.display = 'block';
        card.classList.remove('search-hidden');
      } else {
        card.style.display = 'none';
        card.classList.add('search-hidden');
      }
    });
    
    // Mettre à jour le compteur de résultats
    this.updateResultsCount(normalizedQuery);
  }

  filterCards(filter) {
    this.movieCards.forEach(card => {
      const category = card.dataset.category || 'all';
      
      if (filter === 'all' || category === filter) {
        card.style.display = 'block';
        card.classList.remove('filter-hidden');
      } else {
        card.style.display = 'none';
        card.classList.add('filter-hidden');
      }
    });
  }

  sortCards(sort) {
    const visibleCards = Array.from(this.movieCards).filter(card => 
      card.style.display !== 'none'
    );
    
    visibleCards.sort((a, b) => {
      switch (sort) {
        case 'alphabetical':
          return a.dataset.title.localeCompare(b.dataset.title);
        
        case 'year':
          return parseInt(b.dataset.year) - parseInt(a.dataset.year);
        
        case 'rating':
          return parseInt(b.dataset.rating) - parseInt(a.dataset.rating);
        
        case 'recent':
        default:
          return new Date(b.dataset.dateAdded) - new Date(a.dataset.dateAdded);
      }
    });
    
    // Réorganiser les cartes dans le DOM
    visibleCards.forEach(card => {
      this.moviesGrid.appendChild(card);
    });
  }

  updateFilterButtons(activeButton) {
    this.filterButtons.forEach(button => {
      button.classList.remove('active');
      button.setAttribute('aria-pressed', 'false');
    });
    
    activeButton.classList.add('active');
    activeButton.setAttribute('aria-pressed', 'true');
  }

  updateSortButtons(activeButton) {
    this.sortButtons.forEach(button => {
      button.classList.remove('active');
      button.setAttribute('aria-pressed', 'false');
    });
    
    activeButton.classList.add('active');
    activeButton.setAttribute('aria-pressed', 'true');
  }

  animateCardsOut(callback) {
    const visibleCards = Array.from(this.movieCards).filter(card => 
      card.style.display !== 'none'
    );
    
    let animatedCount = 0;
    const totalCards = visibleCards.length;
    
    if (totalCards === 0) {
      callback();
      return;
    }
    
    visibleCards.forEach((card, index) => {
      setTimeout(() => {
        card.style.transition = 'all 0.3s ease-out';
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px) scale(0.95)';
        
        setTimeout(() => {
          animatedCount++;
          if (animatedCount === totalCards) {
            callback();
          }
        }, 300);
      }, index * 50);
    });
  }

  animateCardsIn(callback) {
    const visibleCards = Array.from(this.movieCards).filter(card => 
      card.style.display !== 'none'
    );
    
    let animatedCount = 0;
    const totalCards = visibleCards.length;
    
    if (totalCards === 0) {
      callback();
      return;
    }
    
    visibleCards.forEach((card, index) => {
      setTimeout(() => {
        card.style.transition = 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0) scale(1)';
        
        
      }, index * 100);
    });
  }

  updateResultsCount(query) {
    const visibleCards = Array.from(this.movieCards).filter(card => 
      card.style.display !== 'none'
    );
    
    // Créer ou mettre à jour le compteur de résultats
    let resultsCounter = document.querySelector('.results-counter');
    if (!resultsCounter) {
      resultsCounter = document.createElement('div');
      resultsCounter.className = 'results-counter';
      
      const sectionHeader = document.querySelector('.section-header');
      if (sectionHeader) {
        sectionHeader.appendChild(resultsCounter);
      }
    }
    
    if (query) {
      resultsCounter.textContent = `${visibleCards.length} résultat(s) pour "${query}"`;
      resultsCounter.style.display = 'block';
    } else {
      resultsCounter.style.display = 'none';
    }
  }

  dispatchFilterEvent(filter) {
    const event = new CustomEvent('filterchange', {
      detail: { filter, previousFilter: this.currentFilter }
    });
    document.dispatchEvent(event);
  }

  dispatchSortEvent(sort) {
    const event = new CustomEvent('sortchange', {
      detail: { sort, previousSort: this.currentSort }
    });
    document.dispatchEvent(event);
  }

  // Méthodes publiques
  getCurrentFilter() {
    return this.currentFilter;
  }

  getCurrentSort() {
    return this.currentSort;
  }

  resetFilters() {
    const allButton = document.querySelector('[data-filter="all"]');
    if (allButton) {
      this.applyFilter('all', allButton);
    }
  }

  resetSort() {
    const recentButton = document.querySelector('[data-sort="recent"]');
    if (recentButton) {
      this.applySort('recent', recentButton);
    }
  }
}

class AdvancedSearch {
  constructor() {
    this.searchInput = document.querySelector('.search-input');
    this.searchResults = null;
    this.searchHistory = this.loadSearchHistory();
    
    this.init();
  }

  init() {
    if (!this.searchInput) return;
    
    this.createSearchResults();
    this.setupSearchInput();
    this.setupSearchHistory();
  }

  createSearchResults() {
    this.searchResults = document.createElement('div');
    this.searchResults.className = 'search-results';
    this.searchResults.style.cssText = `
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--bg-card);
      border: 1px solid var(--border-primary);
      border-top: none;
      border-radius: 0 0 var(--radius-lg) var(--radius-lg);
      max-height: 300px;
      overflow-y: auto;
      z-index: 1000;
      display: none;
    `;
    
    this.searchInput.parentNode.appendChild(this.searchResults);
  }

  setupSearchInput() {
    let searchTimeout;
    
    this.searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value.trim();
      
      if (query.length >= 2) {
        searchTimeout = setTimeout(() => {
          this.performSearch(query);
        }, 300);
      } else {
        this.hideResults();
      }
    });
    
    this.searchInput.addEventListener('focus', () => {
      if (this.searchInput.value.length >= 2) {
        this.showResults();
      } else {
        this.showSearchHistory();
      }
    });
    
    this.searchInput.addEventListener('blur', () => {
      // Délai pour permettre les clics sur les résultats
      setTimeout(() => {
        this.hideResults();
      }, 200);
    });
    
    // Navigation au clavier
    this.searchInput.addEventListener('keydown', (e) => {
      this.handleKeyboardNavigation(e);
    });
  }

  setupSearchHistory() {
    // Sauvegarder l'historique quand une recherche est effectuée
    document.addEventListener('search', (e) => {
      this.addToHistory(e.detail.query);
    });
  }

  performSearch(query) {
    // Simuler une recherche avec suggestions
    const suggestions = this.generateSuggestions(query);
    this.displayResults(suggestions, query);
    this.showResults();
    
    // Déclencher événement de recherche
    const event = new CustomEvent('search', {
      detail: { query, suggestions }
    });
    document.dispatchEvent(event);
  }

  generateSuggestions(query) {
    const mockData = [
      { type: 'film', title: 'Action Hero', year: '2024', category: 'action' },
      { type: 'film', title: 'Comédie Romantique', year: '2024', category: 'comedy' },
      { type: 'film', title: 'Drame Intense', year: '2024', category: 'drama' },
      { type: 'série', title: 'Série Dramatique', year: '2024', category: 'drama' },
      { type: 'acteur', title: 'John Doe', category: 'person' },
      { type: 'réalisateur', title: 'Jane Smith', category: 'person' }
    ];
    
    return mockData.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
  }

  displayResults(results, query) {
    this.searchResults.innerHTML = '';
    
    if (results.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'search-no-results';
      noResults.textContent = `Aucun résultat pour "${query}"`;
      noResults.style.cssText = `
        padding: var(--space-md);
        color: var(--text-secondary);
        text-align: center;
      `;
      this.searchResults.appendChild(noResults);
      return;
    }
    
    results.forEach(result => {
      const item = document.createElement('div');
      item.className = 'search-result-item';
      item.style.cssText = `
        padding: var(--space-sm) var(--space-md);
        cursor: pointer;
        transition: background-color var(--transition-fast);
        display: flex;
        align-items: center;
        gap: var(--space-sm);
      `;
      
      item.innerHTML = `
        <span class="result-type">${result.type}</span>
        <span class="result-title">${result.title}</span>
        ${result.year ? `<span class="result-year">(${result.year})</span>` : ''}
      `;
      
      item.addEventListener('mouseenter', () => {
        item.style.backgroundColor = 'var(--bg-card-hover)';
      });
      
      item.addEventListener('mouseleave', () => {
        item.style.backgroundColor = 'transparent';
      });
      
      item.addEventListener('click', () => {
        this.selectResult(result);
      });
      
      this.searchResults.appendChild(item);
    });
  }

  showSearchHistory() {
    if (this.searchHistory.length === 0) return;
    
    this.searchResults.innerHTML = '';
    
    const historyTitle = document.createElement('div');
    historyTitle.className = 'search-history-title';
    historyTitle.textContent = 'Recherches récentes';
    historyTitle.style.cssText = `
      padding: var(--space-sm) var(--space-md);
      font-weight: 600;
      color: var(--text-secondary);
      border-bottom: 1px solid var(--border-primary);
    `;
    this.searchResults.appendChild(historyTitle);
    
    this.searchHistory.slice(0, 5).forEach(query => {
      const item = document.createElement('div');
      item.className = 'search-history-item';
      item.style.cssText = `
        padding: var(--space-sm) var(--space-md);
        cursor: pointer;
        transition: background-color var(--transition-fast);
        display: flex;
        align-items: center;
        gap: var(--space-sm);
      `;
      
      item.innerHTML = `
        <span class="history-icon">🕒</span>
        <span class="history-query">${query}</span>
      `;
      
      item.addEventListener('click', () => {
        this.searchInput.value = query;
        this.performSearch(query);
      });
      
      this.searchResults.appendChild(item);
    });
    
    this.showResults();
  }

  selectResult(result) {
    this.searchInput.value = result.title;
    this.hideResults();
    
    // Déclencher événement de sélection
    const event = new CustomEvent('searchselect', {
      detail: { result }
    });
    document.dispatchEvent(event);
  }

  showResults() {
    this.searchResults.style.display = 'block';
  }

  hideResults() {
    this.searchResults.style.display = 'none';
  }

  handleKeyboardNavigation(e) {
    const items = this.searchResults.querySelectorAll('.search-result-item, .search-history-item');
    const currentActive = this.searchResults.querySelector('.active');
    let activeIndex = -1;
    
    if (currentActive) {
      activeIndex = Array.from(items).indexOf(currentActive);
    }
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        activeIndex = Math.min(activeIndex + 1, items.length - 1);
        this.setActiveItem(items, activeIndex);
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        activeIndex = Math.max(activeIndex - 1, -1);
        this.setActiveItem(items, activeIndex);
        break;
      
      case 'Enter':
        e.preventDefault();
        if (currentActive) {
          currentActive.click();
        }
        break;
      
      case 'Escape':
        this.hideResults();
        this.searchInput.blur();
        break;
    }
  }

  setActiveItem(items, index) {
    items.forEach(item => item.classList.remove('active'));
    
    if (index >= 0 && index < items.length) {
      items[index].classList.add('active');
      items[index].style.backgroundColor = 'var(--bg-card-hover)';
    }
  }

  addToHistory(query) {
    if (!query || this.searchHistory.includes(query)) return;
    
    this.searchHistory.unshift(query);
    this.searchHistory = this.searchHistory.slice(0, 10); // Garder seulement 10 éléments
    this.saveSearchHistory();
  }

  loadSearchHistory() {
    try {
      return JSON.parse(localStorage.getItem('streamflix-search-history')) || [];
    } catch {
      return [];
    }
  }

  saveSearchHistory() {
    try {
      localStorage.setItem('streamflix-search-history', JSON.stringify(this.searchHistory));
    } catch (error) {
      console.warn('Impossible de sauvegarder l\'historique de recherche:', error);
    }
  }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  const filterManager = new FilterManager();
  const advancedSearch = new AdvancedSearch();

  // Exposer globalement
  window.StreamFlix = window.StreamFlix || {};
  window.StreamFlix.filters = {
    manager: filterManager,
    search: advancedSearch
  };
});

// Export pour les modules ES6
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FilterManager, AdvancedSearch };
}

