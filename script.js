// My Restaurants — Main logic

/* =====================================================================
   TRANSLATIONS
   ===================================================================== */

var TRANSLATIONS = {
  en: {
    title:        'Explore',
    tagline:      'Discover the best restaurants around the world and their must-try dishes',
    metaDescription: 'My favourite restaurants around the world — search by city and discover must-try dishes',
    tabExplore:   'Explore',
    tabFavourites:'My Favourites',
    placeholder:  'Search by city... (e.g. Seville, Paris, Tokyo)',
    heroText:     'Search a city to start exploring',
    emptyBefore:  'No restaurants found in ',
    emptyAfter:   '.',
    emptyHint:    'Try another city.',
    emptyFav:     'No favourites yet',
    emptyFavHint: 'Tap ♥ on any restaurant to save it here.',
    suggestionsKicker: 'Suggestions',
    suggestionsTitle: 'Cities with the most reviews',
    suggestionsSubtitle: 'Start with the destinations where I have saved the most restaurant reviews.',
    suggestionBadge: 'Most reviewed',
    suggestionTap: 'Tap to explore',
    searchAria:   'Search restaurants by city',
    favouriteAria:'Add to favourites',
    emptyName:    'Unnamed',
    viewOf:       'View of',
    languageName: { en: 'English', es: 'Spanish' },
    languageSwitchAria: function(langCode) {
      return 'Switch to ' + this.languageName[langCode];
    },
    footer:       'Made with ❤️ · Updated from Notion',
    mustTry:      'Must-try dishes',
    reviewCountLabel: function(n) {
      return n + ' review' + (n !== 1 ? 's' : '');
    },
    resultCount:  function(n, q) {
      return n + ' restaurant' + (n !== 1 ? 's' : '') + ' found in "' + q + '"';
    }
  },
  es: {
    title:        'Explore',
    tagline:      'Descubre los mejores restaurantes del mundo y sus platos imprescindibles',
    metaDescription: 'Mis restaurantes favoritos por el mundo — busca por ciudad y descubre platos imprescindibles',
    tabExplore:   'Explorar',
    tabFavourites:'Mis Favoritos',
    placeholder:  'Busca por ciudad... (ej: Sevilla, París, Tokyo)',
    heroText:     'Busca una ciudad para empezar a descubrir',
    emptyBefore:  'No se encontraron restaurantes en ',
    emptyAfter:   '.',
    emptyHint:    'Prueba con otra ciudad.',
    emptyFav:     'Aún no tienes favoritos',
    emptyFavHint: 'Toca ♥ en cualquier restaurante para guardarlo aquí.',
    suggestionsKicker: 'Sugerencias',
    suggestionsTitle: 'Ciudades con más reseñas',
    suggestionsSubtitle: 'Empieza por los destinos donde he guardado más reseñas de restaurantes.',
    suggestionBadge: 'Más reseñada',
    suggestionTap: 'Toca para explorar',
    searchAria:   'Buscar restaurantes por ciudad',
    favouriteAria:'Añadir a favoritos',
    emptyName:    'Sin nombre',
    viewOf:       'Vista de',
    languageName: { en: 'Inglés', es: 'Español' },
    languageSwitchAria: function(langCode) {
      return 'Cambiar a ' + this.languageName[langCode];
    },
    footer:       'Hecho con ❤️ · Actualizado desde Notion',
    mustTry:      'Platos imprescindibles',
    reviewCountLabel: function(n) {
      return n + ' reseña' + (n !== 1 ? 's' : '');
    },
    resultCount:  function(n, q) {
      return 'Se encontraron ' + n + ' restaurante' + (n !== 1 ? 's' : '') + ' en "' + q + '"';
    }
  }
};

var currentLang = 'en';
var currentTab = 'explore';
var FAVS_KEY = 'restaurant-favs';

function getFavs() {
  try { return JSON.parse(localStorage.getItem(FAVS_KEY) || '{}'); } catch(e) { return {}; }
}

function setFav(nombre, on) {
  var favs = getFavs();
  if (on) favs[nombre] = true;
  else delete favs[nombre];
  localStorage.setItem(FAVS_KEY, JSON.stringify(favs));
}

function isFav(nombre) {
  return !!getFavs()[nombre];
}

function t(key) {
  return TRANSLATIONS[currentLang][key];
}

/* =====================================================================
   APPLY TRANSLATIONS TO DOM
   ===================================================================== */

function applyTranslations() {
  var lang = TRANSLATIONS[currentLang];
  var metaDescription = document.querySelector('meta[name="description"]');
  var searchButton = document.querySelector('.search-btn');

  // data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key = el.getAttribute('data-i18n');
    if (typeof lang[key] === 'string') el.textContent = lang[key];
  });

  // Search placeholder
  var input = document.getElementById('search-input');
  if (input) input.placeholder = lang.placeholder;

  // Page title
  document.title = lang.title;
  if (metaDescription) metaDescription.setAttribute('content', lang.metaDescription);

  // html lang attribute
  document.documentElement.lang = currentLang;

  if (searchButton) searchButton.setAttribute('aria-label', lang.searchAria);

  // Active flag button
  document.querySelectorAll('.lang-btn').forEach(function(btn) {
    var buttonLang = btn.dataset.lang;
    var flag = btn.querySelector('.lang-flag');
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
    btn.title = lang.languageName[buttonLang];
    btn.setAttribute('aria-label', lang.languageSwitchAria(buttonLang));
    if (flag) flag.setAttribute('alt', lang.languageName[buttonLang]);
  });

  renderSuggestions();

  // Re-render current results (if any search active)
  var query = input ? input.value.trim() : '';
  var results = query.length >= 2 ? searchRestaurants(query) : [];
  renderResults(results, query);

  if (currentTab === 'favourites') renderFavourites();
}

/* =====================================================================
   CITY NAME MAPPING — Spanish/local → English
   ===================================================================== */

var CITY_MAP = {
  // Spain
  'A brea (Galicia)':            'A Brea (Galicia)',
  'Badajoz':                     'Badajoz',
  'Baeza':                       'Baeza',
  'Baeza (Jaén)':                'Baeza (Jaén)',
  'Bormujos':                    'Bormujos',
  'Brujas':                      'Bruges',
  'Bruselas':                    'Brussels',
  'Caceres':                     'Cáceres',
  'Castilleja de la cuesta':     'Castilleja de la Cuesta',
  'Cartagena':                   'Cartagena',
  'Corralejo':                   'Corralejo',
  'Corralejo (Fuerteventura)':   'Corralejo (Fuerteventura)',
  'Cádiz':                       'Cádiz',
  'Córdoba':                     'Córdoba',
  'Dos Hermanas (Sevilla)':      'Dos Hermanas (Seville)',
  'El Cotillo':                  'El Cotillo',
  'El Ejido (Almería)':          'El Ejido (Almería)',
  'Isla Cristina':               'Isla Cristina',
  'Islantilla':                  'Islantilla',
  'Jerez de la Frontera':        'Jerez de la Frontera',
  'La Antilla (Huelva)':         'La Antilla (Huelva)',
  'La antilla':                  'La Antilla',
  'Madrid':                      'Madrid',
  'Mairena del Aljarafe':        'Mairena del Aljarafe',
  'Málaga':                      'Málaga',
  'Melide':                      'Melide',
  'Melide (Galicia)':            'Melide (Galicia)',
  'Puerto de Santa María':       'El Puerto de Santa María',
  'Puerto del Rosario':          'Puerto del Rosario',
  'Santiago de Compostela':      'Santiago de Compostela',
  'Sarria (Galicia)':            'Sarria (Galicia)',
  'Sevilla':                     'Seville',
  'Telde (Gran Canaria)':        'Telde (Gran Canaria)',
  'Toledo':                      'Toledo',
  'Tomares':                     'Tomares',
  'Valencia':                    'Valencia',
  // Poland
  'Cracovia':                    'Kraków',
  'Gdańsk':                      'Gdańsk',
  'Gdańsk (Polonia)':            'Gdańsk (Poland)',
  'Praga':                       'Prague',
  'Varsovia':                    'Warsaw',
  'Wroclaw':                     'Wrocław',
  'Wrocław':                     'Wrocław',
  'Zakopane':                    'Zakopane',
  'Szczawnica':                  'Szczawnica',
  // Greece
  'Atenas':                      'Athens',
  'Atenas (Grecia)':             'Athens (Greece)',
  'Nafplio (Grecia)':            'Nafplio (Greece)',
  'Rodas (Grecia)':              'Rhodes (Greece)',
  'Serifos (Grecia)':            'Serifos (Greece)',
  'Thessaloniki (Grecia)':       'Thessaloniki (Greece)',
  // Turkey
  'Estambul (Turquía)':          'Istanbul (Turkey)',
  'Ankara (Turquía)':            'Ankara (Turkey)',
  'Antalya (Turquía)':           'Antalya (Turkey)',
  'Çeşme (Turquía)':             'Çeşme (Turkey)',
  // Portugal
  'Lisboa':                      'Lisbon',
  'Porto':                       'Porto',
  'Évora (Portugal)':            'Évora (Portugal)',
  'Montemor-o-Novo':             'Montemor-o-Novo',
  'Paço de Arcos':               'Paço de Arcos',
  'Sagres':                      'Sagres',
  // Austria
  'Viena':                       'Vienna',
  // Netherlands
  'Amsterdam (Países Bajos)':    'Amsterdam (Netherlands)',
  'La Haya (Países Bajos)':      'The Hague (Netherlands)',
  // Cyprus
  'Nicosia (Chipre)':            'Nicosia (Cyprus)',
  'Pafos (Chipre)':              'Paphos (Cyprus)',
  'Platres (Chipre)':            'Platres (Cyprus)',
  // Latvia
  'Krimuldas (Letonia)':         'Krimulda (Latvia)',
  // Colombia
  'Finlandia (Colombia)':        'Finlandia (Colombia)',
  // Peru
  'Arequipa (Perú)':             'Arequipa (Peru)',
  'Cuzco (Perú)':                'Cusco (Peru)',
  'Lima (Perú)':                 'Lima (Peru)',
  'Ollantaytambo (Perú)':        'Ollantaytambo (Peru)',
  // Greece (local script)
  'Ανάληψη':                     'Analipsi',
  'Θερμοπύλες':                  'Thermopylae',
};

function getCityName(restaurant) {
  if (currentLang === 'es') return restaurant.Ciudad;
  return restaurant.CityEN;
}

/* =====================================================================
   CSV LOADING
   ===================================================================== */

function loadRestaurants() {
  Papa.parse('data/restaurants.csv', {
    download: true,
    header: true,
    encoding: 'UTF-8',
    skipEmptyLines: true,
    complete: function(results) {
      var k = '';
      window['allRestaurants'] = results.data.map(function(r) {
        var cleaned = {};
        for (var key in r) {
          k = key.trim();
          cleaned[k] = typeof r[key] === 'string' ? r[key].trim() : r[key];
        }
        cleaned.CityEN = CITY_MAP[cleaned.Ciudad] || cleaned.Ciudad;
        return cleaned;
      });
      window['citySuggestions'] = buildCitySuggestions(window['allRestaurants']);
      // Apply initial translations now that data is ready
      applyTranslations();
    },
    error: function(error) {
      console.error('Error loading CSV:', error);
    }
  });
}

/* =====================================================================
   SEARCH
   ===================================================================== */

function normalizeText(text) {
  return (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function searchRestaurants(query) {
  var normalizedQuery = normalizeText(query);
  if (!normalizedQuery || normalizedQuery.length < 2) return [];
  var allRestaurants = window['allRestaurants'] || [];
  return allRestaurants.filter(function(r) {
    var city = normalizeText(getCityName(r));
    return city.includes(normalizedQuery);
  });
}

var CITY_IMAGE_MAP = {
  'Kraków': {
    url: 'images/landmarks/krakow-wawel-castle.jpg',
    monument: { en: 'Wawel Castle', es: 'Castillo de Wawel' }
  },
  'Seville': {
    url: 'images/landmarks/seville-giralda.jpg',
    monument: { en: 'Giralda Cathedral', es: 'Catedral de la Giralda' }
  },
  'Athens': {
    url: 'images/landmarks/athens-parthenon.jpg',
    monument: { en: 'Parthenon Acropolis', es: 'Partenón de la Acrópolis' }
  },
  'Madrid': {
    url: 'images/landmarks/madrid-puerta-del-sol.jpg',
    monument: { en: 'Puerta del Sol', es: 'Puerta del Sol' }
  },
  'Chania': {
    url: 'images/landmarks/chania-venetian-lighthouse.jpg',
    monument: { en: 'Venetian Lighthouse', es: 'Faro veneciano' }
  },
  'Riga': {
    url: 'images/landmarks/riga-freedom-monument.jpg',
    monument: { en: 'Freedom Monument', es: 'Monumento a la Libertad' }
  },
  'Warsaw': {
    url: 'images/landmarks/warsaw-old-town.jpg',
    monument: { en: 'Old Town Market Square', es: 'Plaza del Mercado del Casco Antiguo' }
  },
  'Palermo': {
    url: 'images/landmarks/palermo-cathedral.jpg',
    monument: { en: 'Palermo Cathedral', es: 'Catedral de Palermo' }
  },
  'Wrocław': {
    url: 'images/landmarks/wroclaw-town-hall.jpg',
    monument: { en: 'Town Hall Market Square', es: 'Ayuntamiento de la Plaza del Mercado' }
  },
  'Amsterdam': {
    url: 'images/landmarks/amsterdam-canal.jpg',
    monument: { en: 'Canal Houses', es: 'Casas de los canales' }
  },
  'Jaipur': {
    url: 'images/landmarks/jaipur-hawa-mahal.jpg',
    monument: { en: 'Hawa Mahal Palace', es: 'Palacio Hawa Mahal' }
  },
  'Göreme': {
    url: 'images/landmarks/goreme-fairy-chimneys.jpg',
    monument: { en: 'Fairy Chimneys', es: 'Chimeneas de hadas' }
  }
};

function getCityMonumentName(cityImage) {
  if (!cityImage || !cityImage.monument) return '';
  if (typeof cityImage.monument === 'string') return cityImage.monument;
  return cityImage.monument[currentLang] || cityImage.monument.en || '';
}

function parseRating(value) {
  var rating = parseFloat(String(value || '').replace(',', '.'));
  return isNaN(rating) ? null : rating;
}

function splitCityLabel(label) {
  var cityLabel = label || '';
  var match = cityLabel.match(/^(.*?)\s*\((.*?)\)$/);
  if (!match) {
    return { primary: cityLabel, secondary: '' };
  }

  return {
    primary: match[1].trim(),
    secondary: match[2].trim()
  };
}

function buildCitySuggestions(restaurants) {
  var grouped = {};

  restaurants.forEach(function(restaurant) {
    var cityEN = (restaurant.CityEN || restaurant.Ciudad || '').trim();
    var cityES = (restaurant.Ciudad || restaurant.CityEN || '').trim();
    var key = cityEN || cityES;

    if (!key) return;

    if (!grouped[key]) {
      grouped[key] = {
        key: key,
        cityEN: cityEN,
        cityES: cityES,
        count: 0,
        ratingTotal: 0,
        ratingCount: 0
      };
    }

    grouped[key].count += 1;

    var rating = parseRating(restaurant['Valoración']);
    if (rating !== null) {
      grouped[key].ratingTotal += rating;
      grouped[key].ratingCount += 1;
    }
  });

  return Object.keys(grouped)
    .map(function(key) {
      var item = grouped[key];
      item.avgRating = item.ratingCount ? (item.ratingTotal / item.ratingCount) : null;
      return item;
    })
    .sort(function(a, b) {
      if (b.count !== a.count) return b.count - a.count;
      return (b.avgRating || 0) - (a.avgRating || 0);
    })
    .slice(0, 6);
}

function getSuggestionCityName(cityInfo) {
  return currentLang === 'es' ? cityInfo.cityES : cityInfo.cityEN;
}

function getCityImage(cityInfo) {
  var cityName = splitCityLabel(cityInfo.cityEN || cityInfo.cityES).primary;
  return CITY_IMAGE_MAP[cityName] || null;
}

function getCityImageUrl(cityInfo) {
  var cityImage = getCityImage(cityInfo);
  return cityImage ? cityImage.url : getCityFallbackImageUrl(cityInfo);
}

function getCityFallbackImageUrl(cityInfo) {
  var cityName = splitCityLabel(cityInfo.cityEN || cityInfo.cityES).primary;
  var cityImage = CITY_IMAGE_MAP[cityName];
  return cityImage ? cityImage.url : 'images/space-exploration.png';
}

function renderSuggestions() {
  var grid = document.getElementById('suggestions-grid');
  if (!grid) return;

  var suggestions = window['citySuggestions'] || [];
  if (!suggestions.length) {
    grid.innerHTML = '';
    return;
  }

  grid.innerHTML = suggestions.map(function(cityInfo) {
    var cityImage = getCityImage(cityInfo);
    var monumentName = getCityMonumentName(cityImage);
    var label = splitCityLabel(getSuggestionCityName(cityInfo));
    var query = escapeHtml(getSuggestionCityName(cityInfo));
    var reviews = escapeHtml(t('reviewCountLabel')(cityInfo.count));
    var rating = cityInfo.avgRating ? cityInfo.avgRating.toFixed(1) : '—';
    var cityPhotoAlt = t('viewOf') + ' ' + label.primary + (monumentName ? ', ' + monumentName : '');

    return (
      '<button class="suggestion-card" type="button" data-city-query="' + query + '">' +
        '<span class="suggestion-media">' +
          '<img class="suggestion-image" src="' + escapeHtml(getCityImageUrl(cityInfo)) + '" data-fallback-src="' + escapeHtml(getCityFallbackImageUrl(cityInfo)) + '" alt="' + escapeHtml(cityPhotoAlt) + '">' +
        '</span>' +
        '<span class="suggestion-scrim"></span>' +
        '<span class="suggestion-badge">' + escapeHtml(t('suggestionBadge')) + '</span>' +
        '<span class="suggestion-rating">★ ' + escapeHtml(rating) + '</span>' +
        '<span class="suggestion-content">' +
          '<span class="suggestion-city">' + escapeHtml(label.primary) + '</span>' +
          (label.secondary ? '<span class="suggestion-region">' + escapeHtml(label.secondary) + '</span>' : '') +
          '<span class="suggestion-footer">' +
            '<span class="suggestion-reviews">' + reviews + '</span>' +
            '<span class="suggestion-cta">' + escapeHtml(t('suggestionTap')) + '</span>' +
          '</span>' +
        '</span>' +
      '</button>'
    );
  }).join('');

  bindSuggestionImages();
}

function bindSuggestionImages() {
  document.querySelectorAll('.suggestion-image').forEach(function(img) {
    if (img.dataset.bound === '1') return;

    img.dataset.bound = '1';

    img.addEventListener('error', function() {
      var fallback = img.dataset.fallbackSrc;

      if (fallback && img.dataset.fallbackApplied !== '1') {
        img.dataset.fallbackApplied = '1';
        img.src = fallback;
        return;
      }

      var card = img.closest('.suggestion-card');
      if (card) card.classList.add('suggestion-card--fallback');
      img.remove();
    });
  });
}

/* =====================================================================
   CARD RENDERING
   ===================================================================== */

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderBadges(value) {
  if (!value) return '';
  return value.split(',')
    .map(function(p) { return p.trim(); })
    .filter(Boolean)
    .map(function(p) { return '<span class="badge">' + escapeHtml(p) + '</span>'; })
    .join('');
}

function renderDishes(restaurant) {
  var dishes = [restaurant.Plato1, restaurant.Plato2, restaurant.Plato3]
    .filter(function(p) { return p && p.trim(); });
  if (dishes.length === 0) return '';
  return (
    '<section class="must-try">' +
      '<h3 class="must-try-title">🍽️ ' + t('mustTry') + '</h3>' +
      '<ol class="must-try-list">' +
        dishes.map(function(d) { return '<li>' + escapeHtml(d) + '</li>'; }).join('') +
      '</ol>' +
    '</section>'
  );
}

function renderCard(restaurant) {
  var nombre    = escapeHtml(restaurant.Nombre) || t('emptyName');
  var avatar    = (restaurant.Nombre || 'R').charAt(0).toUpperCase();
  var ciudad    = escapeHtml(getCityName(restaurant));
  var tipo      = renderBadges(restaurant.Tipo);
  var precio    = renderBadges(restaurant.Precio);
  var direccion = escapeHtml(restaurant['Dirección'] || '');
  var notes     = escapeHtml(restaurant.Notes || '');
  var dishes    = renderDishes(restaurant);

  var metaRow = '';
  if (tipo)   metaRow += '<div class="card-badges tipo-badges">'  + tipo   + '</div>';
  if (precio) metaRow += '<div class="card-badges precio-badges">' + precio + '</div>';

  var extra = '';
  if (direccion) extra += '<p class="card-address">📍 ' + direccion + '</p>';
  if (notes)     extra += '<blockquote class="card-notes">📝 ' + notes + '</blockquote>';

  return (
    '<article class="restaurant-card">' +
      '<div class="card-avatar" aria-hidden="true">' + avatar + '</div>' +
      '<div class="card-body">' +
        '<header class="card-header">' +
          '<button class="fav-btn' + (isFav(restaurant.Nombre) ? ' is-fav' : '') + '" data-nombre="' + escapeHtml(restaurant.Nombre) + '" aria-label="' + escapeHtml(t('favouriteAria')) + '">&#9829;</button>' +
          '<h2 class="card-name">' + nombre + '</h2>' +
          (ciudad ? '<p class="card-city">' + ciudad + '</p>' : '') +
        '</header>' +
        (metaRow ? '<div class="card-meta">' + metaRow + '</div>' : '') +
        extra +
        dishes +
      '</div>' +
    '</article>'
  );
}

/* =====================================================================
   STATE MANAGEMENT
   ===================================================================== */

function showElement(id) { var el = document.getElementById(id); if (el) el.removeAttribute('hidden'); }
function hideElement(id) { var el = document.getElementById(id); if (el) el.setAttribute('hidden', ''); }

function renderResults(restaurants, query) {
  var container   = document.getElementById('cards-container');
  var resultCount = document.getElementById('result-count');
  var emptyQuery  = document.getElementById('empty-query');
  var normalized  = normalizeText(query);

  if (!normalized || normalized.length < 2) {
    showElement('hero-state');
    hideElement('empty-state');
    hideElement('result-count');
    container.innerHTML = '';
    return;
  }

  hideElement('hero-state');

  if (restaurants.length === 0) {
    hideElement('result-count');
    if (emptyQuery) emptyQuery.textContent = query;
    showElement('empty-state');
    container.innerHTML = '';
    return;
  }

  hideElement('empty-state');
  showElement('result-count');
  resultCount.textContent = t('resultCount')(restaurants.length, query);
  container.innerHTML = restaurants.map(renderCard).join('');
}

function switchTab(tab) {
  currentTab = tab;
  var input = document.getElementById('search-input');
  document.querySelectorAll('.tab-btn').forEach(function(btn) {
    var active = btn.dataset.tab === tab;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', active ? 'true' : 'false');
  });

  var searchPanel = document.getElementById('panel-explore-search');
  var heroEl = document.getElementById('hero-state');
  var emptyEl = document.getElementById('empty-state');
  var countEl = document.getElementById('result-count');
  var cardsEl = document.getElementById('cards-container');
  var favsPanel = document.getElementById('panel-favourites');

  if (tab === 'explore') {
    if (searchPanel) searchPanel.style.display = '';
    if (heroEl) heroEl.removeAttribute('hidden');
    if (emptyEl) emptyEl.setAttribute('hidden', '');
    if (countEl) countEl.setAttribute('hidden', '');
    if (cardsEl) cardsEl.innerHTML = '';
    if (favsPanel) favsPanel.style.display = 'none';
    if (input) {
      input.value = '';
      renderResults([], '');
    }
  } else {
    if (searchPanel) searchPanel.style.display = 'none';
    if (heroEl) heroEl.setAttribute('hidden', '');
    if (emptyEl) emptyEl.setAttribute('hidden', '');
    if (countEl) countEl.setAttribute('hidden', '');
    if (cardsEl) cardsEl.innerHTML = '';
    if (favsPanel) {
      favsPanel.style.display = '';
      renderFavourites();
    }
  }
}

function renderFavourites() {
  var panel = document.getElementById('panel-favourites');
  if (!panel) return;

  var favs = getFavs();
  var allRestaurants = window['allRestaurants'] || [];
  var favList = allRestaurants.filter(function(r) {
    return favs[r.Nombre];
  });

  if (favList.length === 0) {
    panel.innerHTML = (
      '<div class="fav-empty-state">' +
        '<span class="fav-empty-emoji">&#9829;</span>' +
        '<p class="empty-text">' + escapeHtml(t('emptyFav')) + '</p>' +
        '<p class="empty-hint">' + escapeHtml(t('emptyFavHint')) + '</p>' +
      '</div>'
    );
    return;
  }

  panel.innerHTML = '<div class="cards-grid" id="fav-cards-container">' + favList.map(renderCard).join('') + '</div>';
}

function handleFavClick(e) {
  var btn = e.target.closest ? e.target.closest('.fav-btn') : null;
  if (!btn) return;
  e.stopPropagation();

  var nombre = btn.dataset.nombre;
  var nowFav = !isFav(nombre);
  setFav(nombre, nowFav);
  btn.classList.toggle('is-fav', nowFav);

  if (currentTab === 'favourites') renderFavourites();
}

function handleSuggestionClick(e) {
  var card = e.target.closest ? e.target.closest('.suggestion-card') : null;
  var input = document.getElementById('search-input');
  var query = '';
  if (!card) return;

  query = card.dataset.cityQuery || '';
  if (input) {
    input.value = query;
    input.focus();
  }

  renderResults(searchRestaurants(query), query);
}

function handleSearchButtonClick() {
  var input = document.getElementById('search-input');
  var query = input ? input.value.trim() : '';
  renderResults(query.length >= 2 ? searchRestaurants(query) : [], query);
}

/* =====================================================================
   INIT
   ===================================================================== */

document.addEventListener('DOMContentLoaded', function() {
  // Apply translations to static elements immediately (before CSV loads)
  applyTranslations();

  // Load CSV
  loadRestaurants();

  // Search input
  var input = document.getElementById('search-input');
  if (input) {
    input.addEventListener('input', function() {
      if (currentTab !== 'explore') return;
      var query = this.value.trim();
      renderResults(query.length >= 2 ? searchRestaurants(query) : [], query);
    });
  }

  var searchButton = document.querySelector('.search-btn');
  if (searchButton) {
    searchButton.addEventListener('click', handleSearchButtonClick);
  }

  document.querySelectorAll('.tab-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      switchTab(this.dataset.tab);
    });
  });

  document.addEventListener('click', handleFavClick);
  document.addEventListener('click', handleSuggestionClick);

  // Language buttons
  document.querySelectorAll('.lang-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      if (this.dataset.lang === currentLang) return;
      currentLang = this.dataset.lang;
      applyTranslations();
    });
  });
});
