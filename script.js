// My Restaurants — Main logic

/* =====================================================================
   TRANSLATIONS
   ===================================================================== */

var TRANSLATIONS = {
  en: {
    title:        'My Restaurants',
    tagline:      'Discover the best restaurants around the world and their must-try dishes',
    placeholder:  'Search by city... (e.g. Seville, Paris, Tokyo)',
    heroText:     'Search a city to start exploring',
    emptyBefore:  'No restaurants found in ',
    emptyAfter:   '.',
    emptyHint:    'Try another city.',
    footer:       'Made with ❤️ · Updated from Notion',
    mustTry:      'Must-try dishes',
    resultCount:  function(n, q) {
      return n + ' restaurant' + (n !== 1 ? 's' : '') + ' found in "' + q + '"';
    }
  },
  es: {
    title:        'Mis Restaurantes',
    tagline:      'Descubre los mejores restaurantes del mundo y sus platos imprescindibles',
    placeholder:  'Busca por ciudad... (ej: Sevilla, París, Tokyo)',
    heroText:     'Busca una ciudad para empezar a descubrir',
    emptyBefore:  'No se encontraron restaurantes en ',
    emptyAfter:   '.',
    emptyHint:    'Prueba con otra ciudad.',
    footer:       'Hecho con ❤️ · Actualizado desde Notion',
    mustTry:      'Platos imprescindibles',
    resultCount:  function(n, q) {
      return 'Se encontraron ' + n + ' restaurante' + (n !== 1 ? 's' : '') + ' en "' + q + '"';
    }
  }
};

var currentLang = 'en';

function t(key) {
  return TRANSLATIONS[currentLang][key];
}

/* =====================================================================
   APPLY TRANSLATIONS TO DOM
   ===================================================================== */

function applyTranslations() {
  var lang = TRANSLATIONS[currentLang];

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

  // html lang attribute
  document.documentElement.lang = currentLang;

  // Active flag button
  document.querySelectorAll('.lang-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });

  // Re-render current results (if any search active)
  var query = input ? input.value.trim() : '';
  var results = query.length >= 2 ? searchRestaurants(query) : [];
  renderResults(results, query);
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
      window.allRestaurants = results.data.map(function(r) {
        var cleaned = {};
        for (var key in r) {
          var k = key.trim();
          cleaned[k] = typeof r[key] === 'string' ? r[key].trim() : r[key];
        }
        cleaned.CityEN = CITY_MAP[cleaned.Ciudad] || cleaned.Ciudad;
        return cleaned;
      });
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
  return (window.allRestaurants || []).filter(function(r) {
    var city = normalizeText(getCityName(r));
    return city.includes(normalizedQuery);
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
  var nombre    = escapeHtml(restaurant.Nombre) || (currentLang === 'es' ? 'Sin nombre' : 'Unnamed');
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
      var query = this.value.trim();
      renderResults(query.length >= 2 ? searchRestaurants(query) : [], query);
    });
  }

  // Language buttons
  document.querySelectorAll('.lang-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      if (this.dataset.lang === currentLang) return;
      currentLang = this.dataset.lang;
      applyTranslations();
    });
  });
});
