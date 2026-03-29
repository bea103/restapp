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
    suggestionsTitle: 'Explore by country',
    suggestionsSubtitle: 'Start with the destinations where I have saved the most restaurant reviews.',
    suggestionBadge: 'Most reviewed',
    suggestionTap: 'Tap to explore',
    carouselPrev: 'Previous',
    carouselNext: 'Next',
    searchAria:   'Search restaurants by city',
    favouriteAria:'Add to favourites',
    emptyName:    'Unnamed',
    viewOf:       'View of',
    languageName: { en: 'English', es: 'Spanish' },
    languageSwitchAria: function(langCode) {
      return 'Switch to ' + this.languageName[langCode];
    },
    footer:       'Made with ❤️ · Updated from Notion',
    restaurantsIn: function(city) { return 'Restaurants in ' + city; },
    mustTry:      'Must-try dishes',
    reviewCountLabel: function(n) {
      return n + ' review' + (n !== 1 ? 's' : '');
    },
    detailClose:   'Close',
    detailAddress: 'Address',
    detailLocation:'Location',
    detailNotes:   'My review',
    detailCuisine: 'Cuisine',
    detailPrice:   'Price',
    resultCount:  function(n, q) {
      return n + ' restaurant' + (n !== 1 ? 's' : '') + ' found in "' + q + '"';
    },
    resultCountVisible: function(visible, total, q) {
      return visible + ' of ' + total + ' restaurant' + (total !== 1 ? 's' : '') + ' visible in "' + q + '"';
    },
    didYouMean:   'Did you mean?'
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
    suggestionsTitle: 'Explora por país',
    suggestionsSubtitle: 'Empieza por los destinos donde he guardado más reseñas de restaurantes.',
    suggestionBadge: 'Más reseñada',
    suggestionTap: 'Toca para explorar',
    carouselPrev: 'Anterior',
    carouselNext: 'Siguiente',
    searchAria:   'Buscar restaurantes por ciudad',
    favouriteAria:'Añadir a favoritos',
    emptyName:    'Sin nombre',
    viewOf:       'Vista de',
    languageName: { en: 'Inglés', es: 'Español' },
    languageSwitchAria: function(langCode) {
      return 'Cambiar a ' + this.languageName[langCode];
    },
    footer:       'Hecho con ❤️ · Actualizado desde Notion',
    restaurantsIn: function(city) { return 'Restaurantes en ' + city; },
    mustTry:      'Platos imprescindibles',
    reviewCountLabel: function(n) {
      return n + ' reseña' + (n !== 1 ? 's' : '');
    },
    detailClose:   'Cerrar',
    detailAddress: 'Dirección',
    detailLocation:'Ubicación',
    detailNotes:   'Mi reseña',
    detailCuisine: 'Cocina',
    detailPrice:   'Precio',
    resultCount:  function(n, q) {
      return 'Se encontraron ' + n + ' restaurante' + (n !== 1 ? 's' : '') + ' en "' + q + '"';
    },
    resultCountVisible: function(visible, total, q) {
      return visible + ' de ' + total + ' restaurante' + (total !== 1 ? 's' : '') + ' visibles en "' + q + '"';
    },
    didYouMean:   '¿Quizás quisiste decir?'
  }
};

var currentLang = 'en';
var currentTab = 'explore';
var FAVS_KEY = 'restaurant-favs';
var currentViewedRestaurants = [];

var SUGGESTIONS_PAGE_SIZE = 6;
var SUGGESTIONS_MAX = 25;
var currentSuggestions = [];
var suggestionsPage = 0;
var suggestionsObserver = null;

var mapInstance = null;
var mapMarkers = {};
var geocodeCache = {};
var geocodeQueue = [];
var geocodeRunning = false;
var detailMapInstance = null;
var detailCloseTimer = null;
var detailMapRequestId = 0;

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
  var detailCloseBtn = document.querySelector('.detail-close-btn');
  var translatedCity = '';

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
  if (detailCloseBtn) detailCloseBtn.setAttribute('aria-label', lang.detailClose);

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

  var query = input ? input.value.trim() : '';

  if (currentViewedRestaurants.length > 0) {
    translatedCity = getCityName(currentViewedRestaurants[0]).replace(/\s*\(.*\)$/, '');
    if (input) input.value = translatedCity;
    query = translatedCity;
  }

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

var CITY_COUNTRY_MAP = {
  'Seville': 'ES',
  'Castilleja de la Cuesta': 'ES',
  'Bormujos': 'ES',
  'Dos Hermanas': 'ES',
  'Mairena del Aljarafe': 'ES',
  'Tomares': 'ES',
  'Córdoba': 'ES',
  'Cádiz': 'ES',
  'Madrid': 'ES',
  'Málaga': 'ES',
  'Toledo': 'ES',
  'Valencia': 'ES',
  'Jerez de la Frontera': 'ES',
  'El Puerto de Santa María': 'ES',
  'Cartagena': 'ES',
  'Badajoz': 'ES',
  'Cáceres': 'ES',
  'Baeza': 'ES',
  'El Ejido': 'ES',
  'Isla Cristina': 'ES',
  'Islantilla': 'ES',
  'La Antilla': 'ES',
  'Corralejo': 'ES',
  'El Cotillo': 'ES',
  'Puerto del Rosario': 'ES',
  'Telde': 'ES',
  'Santiago de Compostela': 'ES',
  'Melide': 'ES',
  'Sarria': 'ES',
  'A Brea': 'ES',
  'Betanzos': 'ES',
  'Portomarín': 'ES',
  'Arzúa': 'ES',
  'Santa Irene': 'ES',

  'Kraków': 'PL',
  'Warsaw': 'PL',
  'Wrocław': 'PL',
  'Gdańsk': 'PL',
  'Zakopane': 'PL',
  'Szczawnica': 'PL',

  'Athens': 'GR',
  'Chania': 'GR',
  'Thessaloniki': 'GR',
  'Nafplio': 'GR',
  'Rhodes': 'GR',
  'Serifos': 'GR',
  'Chios': 'GR',
  'Emporios': 'GR',
  'Kefalonia': 'GR',
  'Zakynthos': 'GR',
  'Skopelos': 'GR',
  'Spetses': 'GR',
  'Arachova': 'GR',
  'Kalambaka': 'GR',
  'Kamena Vourla': 'GR',
  'Livadia': 'GR',
  'Apollonia': 'GR',
  'Arkesini': 'GR',
  'Katapola': 'GR',
  'Analipsi': 'GR',
  'Thermopylae': 'GR',

  'Istanbul': 'TR',
  'Ankara': 'TR',
  'Antalya': 'TR',
  'Çeşme': 'TR',
  'Alanya': 'TR',
  'Bodrum': 'TR',
  'Fethiye': 'TR',
  'Göreme': 'TR',
  'Kas': 'TR',

  'Lisbon': 'PT',
  'Porto': 'PT',
  'Évora': 'PT',
  'Montemor-o-Novo': 'PT',
  'Paço de Arcos': 'PT',
  'Sagres': 'PT',
  'Lagos': 'PT',

  'Palermo': 'IT',
  'Siracusa': 'IT',
  'Noto': 'IT',
  'Caltagirone': 'IT',
  'Cefalù': 'IT',
  'Nicolosi': 'IT',
  'Aci Castello': 'IT',
  'Lipari': 'IT',
  'Portoferraio': 'IT',

  'Nicosia': 'CY',
  'Paphos': 'CY',
  'Platres': 'CY',
  'Ayia Napa': 'CY',
  'Peyia': 'CY',
  'Frenaros': 'CY',

  'Cospicua': 'MT',
  'Marsaxlokk': 'MT',

  'Riga': 'LV',
  'Krimulda': 'LV',

  'Amsterdam': 'NL',
  'The Hague': 'NL',

  'Vienna': 'AT',

  'Bruges': 'BE',
  'Brussels': 'BE',
  'Ghent': 'BE',
  'Gante': 'BE',

  'Prague': 'CZ',

  'Finlandia': 'CO',
  'Salento': 'CO',
  'Bucaramanga': 'CO',
  'Aratoca': 'CO',
  'Barichara': 'CO',
  'San Andrés': 'CO',

  'Lima': 'PE',
  'Cusco': 'PE',
  'Arequipa': 'PE',
  'Ollantaytambo': 'PE',

  'Jaipur': 'IN',
  'Delhi': 'IN',
  'Bangalore': 'IN',
  'Haridwar': 'IN',
  'Rishikesh': 'IN',

  'Amman': 'JO',

  'Tirana': 'AL',
  'Sarandë': 'AL',
  'Kavaje': 'AL',

  'Camarillo': 'US',
  'San Jose': 'US',
  'San Diego': 'US'
};

var COUNTRY_NAMES = {
  en: { ES: 'Spain', PL: 'Poland', GR: 'Greece', TR: 'Turkey', PT: 'Portugal', IT: 'Italy', CY: 'Cyprus', MT: 'Malta', LV: 'Latvia', NL: 'Netherlands', AT: 'Austria', BE: 'Belgium', CZ: 'Czech Republic', CO: 'Colombia', PE: 'Peru', IN: 'India', JO: 'Jordan', AL: 'Albania', US: 'United States' },
  es: { ES: 'España', PL: 'Polonia', GR: 'Grecia', TR: 'Turquía', PT: 'Portugal', IT: 'Italia', CY: 'Chipre', MT: 'Malta', LV: 'Letonia', NL: 'Países Bajos', AT: 'Austria', BE: 'Bélgica', CZ: 'República Checa', CO: 'Colombia', PE: 'Perú', IN: 'India', JO: 'Jordania', AL: 'Albania', US: 'Estados Unidos' }
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
  }).sort(function(a, b) {
    return (parseRating(b['Valoración']) || 0) - (parseRating(a['Valoración']) || 0);
  });
}

var CITY_IMAGE_MAP = {
  'Kraków': {
    url: 'https://images.unsplash.com/photo-1519197924294-4ba991a11128?w=800',
    monument: { en: 'Wawel Castle', es: 'Castillo de Wawel' }
  },
  'Seville': {
    url: 'https://images.unsplash.com/photo-1558642084-fd07fae5282e?w=800',
    monument: { en: 'Giralda Cathedral', es: 'Catedral de la Giralda' }
  },
  'Athens': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/The_Parthenon_in_Athens.jpg/1280px-The_Parthenon_in_Athens.jpg',
    monument: { en: 'Parthenon Acropolis', es: 'Partenón de la Acrópolis' }
  },
  'Madrid': {
    url: 'https://images.unsplash.com/photo-1543785734-4b6e564642f8?w=800',
    monument: { en: 'Puerta de Alcalá', es: 'Puerta de Alcalá' }
  },
  'Chania': {
    url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800',
    monument: { en: 'Venetian Lighthouse', es: 'Faro veneciano' }
  },
  'Riga': {
    url: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=800',
    monument: { en: 'Freedom Monument', es: 'Monumento a la Libertad' }
  },
  'Warsaw': {
    url: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800',
    monument: { en: 'Old Town Market Square', es: 'Plaza del Mercado del Casco Antiguo' }
  },
  'Palermo': {
    url: 'https://images.unsplash.com/photo-1605543667606-52b0f1d4b6b4?w=800',
    monument: { en: 'Palermo Cathedral', es: 'Catedral de Palermo' }
  },
  'Wrocław': {
    url: 'https://images.unsplash.com/photo-1561484930-998b6a7b22e8?w=800',
    monument: { en: 'Town Hall Market Square', es: 'Ayuntamiento de la Plaza del Mercado' }
  },
  'Amsterdam': {
    url: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800',
    monument: { en: 'Canal Houses', es: 'Casas de los canales' }
  },
  'Jaipur': {
    url: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800',
    monument: { en: 'Hawa Mahal Palace', es: 'Palacio Hawa Mahal' }
  },
  'Göreme': {
    url: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=800',
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
    .slice(0, SUGGESTIONS_MAX);
}

function buildCountryCarouselData(restaurants) {
  var countryGroups = {};

  (restaurants || []).forEach(function(restaurant) {
    var cityEN = (restaurant.CityEN || restaurant.Ciudad || '').trim();
    var cityES = (restaurant.Ciudad || restaurant.CityEN || '').trim();
    var cityParts = splitCityLabel(cityEN || cityES);
    var cityPrimary = cityParts.primary;
    var countryCode = CITY_COUNTRY_MAP[cityPrimary];
    var cityKey = cityEN || cityES;
    var rating;

    if (!countryCode || !cityKey) return;

    if (!countryGroups[countryCode]) {
      countryGroups[countryCode] = {
        countryCode: countryCode,
        totalCount: 0,
        citiesByKey: {}
      };
    }

    countryGroups[countryCode].totalCount += 1;

    if (!countryGroups[countryCode].citiesByKey[cityKey]) {
      countryGroups[countryCode].citiesByKey[cityKey] = {
        key: cityKey,
        cityEN: cityEN,
        cityES: cityES,
        count: 0,
        ratingTotal: 0,
        ratingCount: 0
      };
    }

    countryGroups[countryCode].citiesByKey[cityKey].count += 1;
    rating = parseRating(restaurant['Valoración']);
    if (rating !== null) {
      countryGroups[countryCode].citiesByKey[cityKey].ratingTotal += rating;
      countryGroups[countryCode].citiesByKey[cityKey].ratingCount += 1;
    }
  });

  return Object.keys(countryGroups)
    .map(function(countryCode) {
      var group = countryGroups[countryCode];
      var cities = Object.keys(group.citiesByKey)
        .map(function(cityKey) {
          var city = group.citiesByKey[cityKey];
          city.avgRating = city.ratingCount ? (city.ratingTotal / city.ratingCount) : null;
          return city;
        })
        .sort(function(a, b) {
          if (b.count !== a.count) return b.count - a.count;
          return (b.avgRating || 0) - (a.avgRating || 0);
        })
        .slice(0, 15);

      return {
        countryCode: countryCode,
        totalCount: group.totalCount,
        cities: cities
      };
    })
    .sort(function(a, b) {
      return b.totalCount - a.totalCount;
    });
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

var wikiImageCache = {};

function fetchWikiCityImage(cityName, callback) {
  if (wikiImageCache[cityName] !== undefined) {
    callback(wikiImageCache[cityName]);
    return;
  }
  var url = 'https://en.wikipedia.org/w/api.php?action=query&titles=' +
    encodeURIComponent(cityName) +
    '&prop=pageimages&format=json&pithumbsize=800&origin=*';
  fetch(url)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var pages = data && data.query && data.query.pages;
      if (!pages) { wikiImageCache[cityName] = null; callback(null); return; }
      var page = Object.values(pages)[0];
      var src = page && page.thumbnail ? page.thumbnail.source : null;
      wikiImageCache[cityName] = src;
      callback(src);
    })
    .catch(function() {
      wikiImageCache[cityName] = null;
      callback(null);
    });
}

function renderSuggestions() {
  var grid = document.getElementById('suggestions-grid');
  var allRestaurants = window['allRestaurants'] || [];
  var europeanCodes = { ES: true, PL: true, GR: true, TR: true, PT: true, IT: true, CY: true, MT: true, LV: true, NL: true, AT: true, BE: true, CZ: true, AL: true };
  var countryRows;
  if (!grid) return;

  currentSuggestions = window['citySuggestions'] || [];
  suggestionsPage = 0;
  disconnectSuggestionsObserver();

  countryRows = buildCountryCarouselData(allRestaurants)
    .filter(function(row) { return !!europeanCodes[row.countryCode]; })
    .slice(0, 3);

  if (!countryRows.length) {
    grid.innerHTML = '';
    return;
  }

  grid.innerHTML = countryRows.map(function(row, rowIndex) {
    var countryName = (COUNTRY_NAMES[currentLang] && COUNTRY_NAMES[currentLang][row.countryCode]) || row.countryCode;
    var cards = row.cities.map(function(cityInfo) {
      return renderSuggestionCard(cityInfo);
    }).join('');

    return (
      '<div class="carousel-row" data-country-code="' + escapeHtml(row.countryCode) + '">' +
        '<h3 class="carousel-country-name">' + escapeHtml(countryName) + '</h3>' +
        '<div class="carousel-container">' +
          '<button class="carousel-btn carousel-btn-prev" type="button" aria-label="' + escapeHtml(t('carouselPrev')) + '" disabled>&lsaquo;</button>' +
          '<div class="carousel-track" data-carousel-row="' + rowIndex + '">' + cards + '</div>' +
          '<button class="carousel-btn carousel-btn-next" type="button" aria-label="' + escapeHtml(t('carouselNext')) + '">&rsaquo;</button>' +
        '</div>' +
      '</div>'
    );
  }).join('');

  bindSuggestionImages();
  bindCarousels();
}

function renderSuggestionCard(cityInfo) {
  var cityImage = getCityImage(cityInfo);
  var monumentName = getCityMonumentName(cityImage);
  var label = splitCityLabel(getSuggestionCityName(cityInfo));
  var query = escapeHtml(getSuggestionCityName(cityInfo));
  var reviews = escapeHtml(t('reviewCountLabel')(cityInfo.count));
  var cityPhotoAlt = t('viewOf') + ' ' + label.primary + (monumentName ? ', ' + monumentName : '');

  return (
    '<button class="suggestion-card" type="button" data-city-query="' + query + '">' +
      '<span class="suggestion-media">' +
        '<img class="suggestion-image" src="' + escapeHtml(getCityImageUrl(cityInfo)) + '" data-fallback-src="' + escapeHtml(getCityFallbackImageUrl(cityInfo)) + '" data-city-name="' + escapeHtml(splitCityLabel(cityInfo.cityEN || cityInfo.cityES).primary) + '" alt="' + escapeHtml(cityPhotoAlt) + '">' +
      '</span>' +
      '<span class="suggestion-scrim"></span>' +
      '<span class="suggestion-badge">' + escapeHtml(t('suggestionBadge')) + '</span>' +
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
}

function bindCarousels() {
  document.querySelectorAll('.carousel-row').forEach(function(row) {
    var track = row.querySelector('.carousel-track');
    var prevBtn = row.querySelector('.carousel-btn-prev');
    var nextBtn = row.querySelector('.carousel-btn-next');

    if (!track || !prevBtn || !nextBtn) return;

    function getCardWidth() {
      var firstCard = track.querySelector('.suggestion-card');
      if (!firstCard) return track.clientWidth;
      return firstCard.getBoundingClientRect().width + 16;
    }

    function updateButtons() {
      var atStart = track.scrollLeft <= 1;
      var atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;

      prevBtn.disabled = atStart;
      nextBtn.disabled = atEnd;
    }

    prevBtn.addEventListener('click', function() {
      track.scrollBy({ left: -getCardWidth(), behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', function() {
      track.scrollBy({ left: getCardWidth(), behavior: 'smooth' });
    });

    track.addEventListener('scroll', updateButtons, { passive: true });
    window.addEventListener('resize', updateButtons);
    updateButtons();
  });
}

function appendSuggestionsPage(grid) {
  var start = suggestionsPage * SUGGESTIONS_PAGE_SIZE;
  var end   = Math.min(start + SUGGESTIONS_PAGE_SIZE, currentSuggestions.length);
  var slice = currentSuggestions.slice(start, end);

  slice.forEach(function(cityInfo) {
    var cityImage    = getCityImage(cityInfo);
    var monumentName = getCityMonumentName(cityImage);
    var label        = splitCityLabel(getSuggestionCityName(cityInfo));
    var query        = escapeHtml(getSuggestionCityName(cityInfo));
    var reviews      = escapeHtml(t('reviewCountLabel')(cityInfo.count));
    var cityPhotoAlt = t('viewOf') + ' ' + label.primary + (monumentName ? ', ' + monumentName : '');

    var card = (
      '<button class="suggestion-card" type="button" data-city-query="' + query + '">' +
        '<span class="suggestion-media">' +
          '<img class="suggestion-image" src="' + escapeHtml(getCityImageUrl(cityInfo)) + '" data-fallback-src="' + escapeHtml(getCityFallbackImageUrl(cityInfo)) + '" data-city-name="' + escapeHtml(splitCityLabel(cityInfo.cityEN || cityInfo.cityES).primary) + '" alt="' + escapeHtml(cityPhotoAlt) + '">' +
        '</span>' +
        '<span class="suggestion-scrim"></span>' +
        '<span class="suggestion-badge">' + escapeHtml(t('suggestionBadge')) + '</span>' +
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
    grid.insertAdjacentHTML('beforeend', card);
  });

  bindSuggestionImages();
  suggestionsPage++;

  var hasMore = suggestionsPage * SUGGESTIONS_PAGE_SIZE < currentSuggestions.length;

  if (hasMore) {
    setupSuggestionsObserver(grid);
  } else {
    disconnectSuggestionsObserver();
  }
}

function setupSuggestionsObserver(grid) {
  var loader;
  disconnectSuggestionsObserver();

  function onScroll() {
    var scrollBottom = window.scrollY + window.innerHeight;
    var pageBottom   = document.body.scrollHeight;
    if (scrollBottom >= pageBottom - 200) {
      disconnectSuggestionsObserver();
      loader = document.getElementById('scroll-loader');
      if (loader) loader.hidden = false;
      setTimeout(function() {
        if (loader) loader.hidden = true;
        appendSuggestionsPage(grid);
      }, 700);
    }
  }

  suggestionsObserver = onScroll;
  window.addEventListener('scroll', onScroll, { passive: true });
}

function disconnectSuggestionsObserver() {
  if (suggestionsObserver) {
    window.removeEventListener('scroll', suggestionsObserver);
    suggestionsObserver = null;
  }
  var loader = document.getElementById('scroll-loader');
  if (loader) loader.hidden = true;
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

    var cityName = img.dataset.cityName;
    var isPlaceholder = img.src && img.src.indexOf('space-exploration') !== -1;
    if (cityName && isPlaceholder) {
      fetchWikiCityImage(cityName, function(wikiUrl) {
        if (wikiUrl && img.parentNode) {
          img.src = wikiUrl;
        }
      });
    }
  });
}

/* =====================================================================
   GEOCODING (Nominatim, 1 req/sec)
   ===================================================================== */

function sanitizeAddress(raw) {
  return (raw || '')
    .replace(/\s*\(.*?\)/g, '')
    .replace(/,/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function sanitizeCity(city) {
  return (city || '').replace(/\s*\((.*?)\)/, ', $1');
}

function geocodeRestaurant(restaurant, callback) {
  var rawDir = restaurant['Dirección'] || '';
  var rawCity = restaurant.CityEN || restaurant.Ciudad || '';
  var dir = sanitizeAddress(rawDir);
  var city = sanitizeCity(rawCity);
  var addr = [dir, city].filter(Boolean).join(', ');
  var fallback = dir ? city : '';

  if (!addr) { callback(null); return; }

  if (geocodeCache[addr] !== undefined) {
    callback(geocodeCache[addr]);
    return;
  }

  geocodeQueue.push({ addr: addr, fallback: fallback, callback: callback });
  if (!geocodeRunning) processGeocodeQueue();
}

async function geocodeFetch(query) {
  var response = await fetch(
    'https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(query) + '&format=json&limit=1',
    { headers: { 'User-Agent': 'RestaurantReviews/1.0' } }
  );
  return response.json();
}

function processGeocodeQueue() {
  if (geocodeQueue.length === 0) { geocodeRunning = false; return; }
  geocodeRunning = true;
  var item = geocodeQueue.shift();
  var result = null;

  geocodeFetch(item.addr)
  .then(function(data) {
    if (data && data[0]) {
      result = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      geocodeCache[item.addr] = result;
      item.callback(result);
      setTimeout(processGeocodeQueue, 1100);
      return;
    }
    if (item.fallback) {
      setTimeout(function() {
        geocodeFetch(item.fallback)
        .then(function(data2) {
          var result2 = (data2 && data2[0])
            ? { lat: parseFloat(data2[0].lat), lng: parseFloat(data2[0].lon) }
            : null;
          geocodeCache[item.addr] = result2;
          item.callback(result2);
        })
        .catch(function() {
          geocodeCache[item.addr] = null;
          item.callback(null);
        })
        .finally(function() {
          setTimeout(processGeocodeQueue, 1100);
        });
      }, 1100);
      return;
    }
    geocodeCache[item.addr] = null;
    item.callback(null);
    setTimeout(processGeocodeQueue, 1100);
  })
  .catch(function() {
    geocodeCache[item.addr] = null;
    item.callback(null);
    setTimeout(processGeocodeQueue, 1100);
  });
}

/* =====================================================================
   MAP (Leaflet)
   ===================================================================== */

function initMap(lat, lng, zoom) {
  var mapEl = document.getElementById('split-map');
  if (!mapEl) return;

  var mapDiv = document.getElementById('map-instance');
  if (!mapDiv) {
    mapDiv = document.createElement('div');
    mapDiv.id = 'map-instance';
    mapEl.appendChild(mapDiv);
  }

  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }

  mapInstance = L.map('map-instance', {
    center: [lat, lng],
    zoom: zoom || 13,
    zoomControl: true
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(mapInstance);

  mapInstance.on('moveend', syncCardsToMapBounds);

  setTimeout(function() {
    if (mapInstance) mapInstance.invalidateSize();
  }, 100);

  mapMarkers = {};
}

function destroyMap() {
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }
  mapMarkers = {};
  var mapDiv = document.getElementById('map-instance');
  if (mapDiv) mapDiv.remove();
}

function addMapMarker(restaurant, index, lat, lng) {
  if (!mapInstance) return;

  var rating = parseRating(restaurant['Valoración']);
  var label = rating !== null ? rating.toFixed(1) : '·';

  var icon = L.divIcon({
    className: 'map-pin',
    html: label,
    iconSize: null
  });

  var marker = L.marker([lat, lng], { icon: icon }).addTo(mapInstance);

  marker.on('click', function() {
    highlightRestaurant(index, false);
    var entry = mapMarkers[index];
    if (entry && entry.cardEl) {
      entry.cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  var tooltipContent = '<strong>' + (restaurant['Nombre'] || '') + '</strong>';
  if (rating !== null) {
    tooltipContent += '<br>' + '★ ' + rating.toFixed(1);
  }
  marker.bindTooltip(tooltipContent, {
    className: 'restaurant-tooltip',
    direction: 'top',
    offset: [0, -8]
  });

  mapMarkers[index] = { marker: marker, cardEl: null };
}

function highlightRestaurant(index, flyToMarker) {
  document.querySelectorAll('.restaurant-card--mini.is-active').forEach(function(el) {
    el.classList.remove('is-active');
  });
  Object.keys(mapMarkers).forEach(function(i) {
    var pinEl = mapMarkers[i].marker.getElement();
    if (pinEl) pinEl.classList.remove('is-active');
  });

  var entry = mapMarkers[index];
  if (!entry) return;

  if (entry.cardEl) entry.cardEl.classList.add('is-active');

  var pinEl = entry.marker.getElement();
  if (pinEl) pinEl.classList.add('is-active');

  if (flyToMarker !== false && mapInstance) {
    mapInstance.flyTo(entry.marker.getLatLng(), Math.max(mapInstance.getZoom(), 15), { duration: 0.5 });
  }
}

var currentResultsTotal = 0;
var currentResultsQuery = '';

function syncCardsToMapBounds() {
  if (!mapInstance) return;
  var bounds = mapInstance.getBounds();
  var splitCards = document.getElementById('split-cards');
  var resultCount = document.getElementById('result-count');
  if (!splitCards) return;

  var allCards = splitCards.querySelectorAll('.restaurant-card--mini');
  var visible = 0;

  allCards.forEach(function(cardEl) {
    var idx = cardEl.getAttribute('data-index');
    var entry = mapMarkers[idx];
    var inView = false;
    if (entry && entry.marker) {
      inView = bounds.contains(entry.marker.getLatLng());
      cardEl.style.display = inView ? '' : 'none';
      if (inView) visible++;
    } else {
      cardEl.style.display = '';
      visible++;
    }
  });

  if (resultCount && currentResultsTotal > 0) {
    if (visible === currentResultsTotal) {
      resultCount.textContent = t('resultCount')(currentResultsTotal, currentResultsQuery);
    } else {
      resultCount.textContent = t('resultCountVisible')(visible, currentResultsTotal, currentResultsQuery);
    }
  }
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

function getRestaurantGeocodeKey(restaurant) {
  var rawDir = restaurant && restaurant['Dirección'] ? restaurant['Dirección'] : '';
  var rawCity = restaurant ? (restaurant.CityEN || restaurant.Ciudad || '') : '';
  var dir = sanitizeAddress(rawDir);
  var city = sanitizeCity(rawCity);
  return [dir, city].filter(Boolean).join(', ');
}

function destroyDetailMap() {
  if (detailMapInstance) {
    detailMapInstance.remove();
    detailMapInstance = null;
  }
}

function renderDetailMiniMap(coords) {
  var mapEl = document.getElementById('detail-mini-map');
  if (!mapEl) return;

  destroyDetailMap();

  if (!coords) {
    mapEl.innerHTML = '<div class="detail-map-empty">' + escapeHtml(t('detailLocation')) + '</div>';
    return;
  }

  mapEl.innerHTML = '';
  detailMapInstance = L.map('detail-mini-map', {
    center: [coords.lat, coords.lng],
    zoom: 16,
    zoomControl: false,
    dragging: true,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false,
    tap: false
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(detailMapInstance);

  L.marker([coords.lat, coords.lng]).addTo(detailMapInstance);

  setTimeout(function() {
    if (detailMapInstance) detailMapInstance.invalidateSize();
  }, 120);
}

function openRestaurantDetail(restaurant, index) {
  var overlay = document.getElementById('restaurant-detail-overlay');
  var content = document.getElementById('detail-content');
  var cityLabel = '';
  var cityParts;
  var cityImage;
  var rating;
  var ratingHtml = '';
  var tipoHtml = renderBadges(restaurant.Tipo);
  var precioHtml = renderBadges(restaurant.Precio);
  var dishes = [restaurant.Plato1, restaurant.Plato2, restaurant.Plato3].filter(function(p) {
    return p && p.trim();
  });
  var dishesHtml = '';
  var notes = restaurant.Notes || '';
  var address = restaurant['Dirección'] || '';
  var cityKey;
  var heroMedia = '';
  var geocodeKey;
  var cachedCoords;
  var requestId;
  var favBtn;

  if (!overlay || !content || !restaurant) return;

  detailMapRequestId += 1;
  requestId = detailMapRequestId;

  cityLabel = getCityName(restaurant) || '';
  cityParts = splitCityLabel(restaurant.CityEN || restaurant.Ciudad || cityLabel);
  cityKey = cityParts.primary;
  cityImage = CITY_IMAGE_MAP[cityKey] || null;

  rating = parseRating(restaurant['Valoración']);
  if (rating !== null) {
    ratingHtml = '<span class="detail-rating">★ ' + rating.toFixed(1) + '</span>';
  }

  if (cityImage && cityImage.url) {
    heroMedia =
      '<div class="detail-hero-media">' +
        '<img class="detail-hero-image" src="' + escapeHtml(cityImage.url) + '" alt="' + escapeHtml(t('viewOf') + ' ' + cityParts.primary) + '">' +
      '</div>';
  } else {
    heroMedia =
      '<div class="detail-hero-media detail-hero-media--placeholder">' +
        '<span class="detail-hero-placeholder-name">' + escapeHtml(restaurant.Nombre || t('emptyName')) + '</span>' +
      '</div>';
  }

  if (dishes.length) {
    dishesHtml =
      '<section class="must-try detail-must-try">' +
        '<h3 class="must-try-title">🍽️ ' + escapeHtml(t('mustTry')) + '</h3>' +
        '<ol class="must-try-list">' +
          dishes.map(function(dish) { return '<li>' + escapeHtml(dish) + '</li>'; }).join('') +
        '</ol>' +
      '</section>';
  } else {
    dishesHtml =
      '<section class="must-try detail-must-try">' +
        '<h3 class="must-try-title">🍽️ ' + escapeHtml(t('mustTry')) + '</h3>' +
        '<ol class="must-try-list"><li>—</li></ol>' +
      '</section>';
  }

  content.innerHTML =
    '<article class="detail-article" data-index="' + index + '">' +
      '<section class="detail-hero">' +
        heroMedia +
      '</section>' +
      '<section class="detail-header">' +
        '<div class="detail-header-main">' +
          '<p class="detail-city">' + escapeHtml(cityLabel) + '</p>' +
          '<h2 class="detail-name">' + escapeHtml(restaurant.Nombre || t('emptyName')) + '</h2>' +
          '<div class="detail-header-meta">' + ratingHtml + '</div>' +
        '</div>' +
        '<button type="button" class="detail-fav-btn' + (isFav(restaurant.Nombre) ? ' is-fav' : '') + '" data-nombre="' + escapeHtml(restaurant.Nombre) + '" aria-label="' + escapeHtml(t('favouriteAria')) + '">&#9829;</button>' +
      '</section>' +
      '<section class="detail-info">' +
        '<div class="detail-info-group">' +
          '<h3 class="detail-section-label">' + escapeHtml(t('detailCuisine')) + '</h3>' +
          '<div class="card-badges tipo-badges detail-badges">' + (tipoHtml || '<span class="badge">—</span>') + '</div>' +
        '</div>' +
        '<div class="detail-info-group">' +
          '<h3 class="detail-section-label">' + escapeHtml(t('detailPrice')) + '</h3>' +
          '<div class="card-badges precio-badges detail-badges">' + (precioHtml || '<span class="badge">—</span>') + '</div>' +
        '</div>' +
      '</section>' +
      dishesHtml +
      '<section class="detail-notes"><h3 class="detail-section-label">' + escapeHtml(t('detailNotes')) + '</h3><blockquote class="card-notes detail-notes-copy">📝 ' + escapeHtml(notes || '—') + '</blockquote></section>' +
      '<section class="detail-location">' +
        '<h3 class="detail-section-label">' + escapeHtml(t('detailAddress')) + '</h3>' +
        '<p class="detail-address">📍 ' + escapeHtml(address || '') + '</p>' +
        '<h3 class="detail-section-label detail-location-title">' + escapeHtml(t('detailLocation')) + '</h3>' +
        '<div id="detail-mini-map" class="detail-mini-map"></div>' +
      '</section>' +
    '</article>';

  favBtn = content.querySelector('.detail-fav-btn');
  if (favBtn) {
    favBtn.addEventListener('click', function(e) {
      var nombre = favBtn.dataset.nombre;
      var nowFav;
      e.stopPropagation();
      nowFav = !isFav(nombre);
      setFav(nombre, nowFav);
      favBtn.classList.toggle('is-fav', nowFav);

      if (nowFav) {
        favBtn.classList.remove('heart-beat');
        void favBtn.offsetWidth;
        favBtn.classList.add('heart-beat');
        favBtn.addEventListener('animationend', function() {
          favBtn.classList.remove('heart-beat');
        }, { once: true });
      }

      document.querySelectorAll('.fav-btn').forEach(function(btn) {
        if (btn.dataset.nombre !== nombre) return;
        btn.classList.toggle('is-fav', nowFav);
        if (nowFav) {
          btn.classList.remove('heart-beat');
          void btn.offsetWidth;
          btn.classList.add('heart-beat');
          btn.addEventListener('animationend', function() {
            btn.classList.remove('heart-beat');
          }, { once: true });
        }
      });
      if (currentTab === 'favourites') renderFavourites();
    });
  }

  geocodeKey = getRestaurantGeocodeKey(restaurant);
  cachedCoords = geocodeKey && geocodeCache[geocodeKey] !== undefined ? geocodeCache[geocodeKey] : null;
  if (cachedCoords) {
    renderDetailMiniMap(cachedCoords);
  } else {
    geocodeRestaurant(restaurant, function(coords) {
      if (requestId !== detailMapRequestId) return;
      renderDetailMiniMap(coords);
    });
  }

  if (detailCloseTimer) {
    clearTimeout(detailCloseTimer);
    detailCloseTimer = null;
  }

  overlay.removeAttribute('hidden');
  overlay.classList.remove('is-closing');
  overlay.offsetHeight;
  overlay.classList.add('is-open');
}

function closeRestaurantDetail() {
  var overlay = document.getElementById('restaurant-detail-overlay');
  var content = document.getElementById('detail-content');

  if (!overlay || overlay.hasAttribute('hidden') || !overlay.classList.contains('is-open')) return;

  detailMapRequestId += 1;
  overlay.classList.remove('is-open');
  overlay.classList.add('is-closing');

  if (detailCloseTimer) clearTimeout(detailCloseTimer);
  detailCloseTimer = setTimeout(function() {
    destroyDetailMap();
    if (content) content.innerHTML = '';
    overlay.setAttribute('hidden', '');
    overlay.classList.remove('is-closing');
    detailCloseTimer = null;
  }, 360);
}

function renderCard(restaurant) {
  var nombre    = escapeHtml(restaurant.Nombre) || t('emptyName');
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
    '<article class="restaurant-card" data-nombre="' + escapeHtml(restaurant.Nombre) + '">' +
      '<div class="card-body">' +
        '<header class="card-header">' +
          '<button class="fav-btn' + (isFav(restaurant.Nombre) ? ' is-fav' : '') + '" data-nombre="' + escapeHtml(restaurant.Nombre) + '" aria-label="' + escapeHtml(t('favouriteAria')) + '">&#9829;</button>' +
          '<h2 class="card-name">' + nombre + '</h2>' +
          '' +
        '</header>' +
        (metaRow ? '<div class="card-meta">' + metaRow + '</div>' : '') +
        extra +
        dishes +
      '</div>' +
    '</article>'
  );
}

function renderMiniCard(restaurant, index) {
  var nombre    = escapeHtml(restaurant.Nombre) || t('emptyName');
  var tipo      = (restaurant.Tipo || '').split(',')[0].trim();
  var direccion = escapeHtml(restaurant['Dirección'] || '');
  var rating    = parseRating(restaurant['Valoración']);
  var ratingHtml = rating !== null
    ? '<span class="mini-rating">' + rating.toFixed(1) + '</span>'
    : '';

  return (
    '<article class="restaurant-card restaurant-card--mini" data-index="' + index + '">' +
      '<div class="mini-name">' + nombre + '</div>' +
      '<div class="mini-meta">' +
        '' +
        ratingHtml +
        (tipo ? '<span class="mini-tipo">' + escapeHtml(tipo) + '</span>' : '') +
      '</div>' +
      (direccion ? '<div class="mini-address">📍 ' + direccion + '</div>' : '') +
    '</article>'
  );
}

/* =====================================================================
   STATE MANAGEMENT
   ===================================================================== */

function showElement(id) { var el = document.getElementById(id); if (el) el.removeAttribute('hidden'); }
function hideElement(id) { var el = document.getElementById(id); if (el) el.setAttribute('hidden', ''); }

function deactivateExploreTabs() {
  document.querySelectorAll('.tab-btn').forEach(function(btn) {
    btn.classList.remove('active');
    btn.setAttribute('aria-selected', 'false');
  });
}

function restoreExploreHeader(titleEl) {
  var tagline = document.querySelector('.site-tagline');
  if (titleEl) titleEl.textContent = t('title');
  if (tagline) tagline.style.display = '';
  document.querySelectorAll('.tab-btn').forEach(function(btn) {
    var active = btn.dataset.tab === 'explore';
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', active ? 'true' : 'false');
  });
}

function renderResults(restaurants, query) {
  var splitLayout = document.getElementById('split-layout');
  var splitCards  = document.getElementById('split-cards');
  var resultCount = document.getElementById('result-count');
  var emptyQuery  = document.getElementById('empty-query');
  var normalized  = normalizeText(query);

  var titleEl = document.querySelector('.site-title [data-i18n="title"]');

  closeRestaurantDetail();

  hideDidYouMean();

  if (!normalized || normalized.length < 2) {
    showElement('hero-state');
    hideElement('empty-state');
    hideElement('result-count');
    if (splitLayout) splitLayout.setAttribute('hidden', '');
    document.body.classList.remove('map-active');
    destroyMap();
    restoreExploreHeader(titleEl);
    currentViewedRestaurants = [];
    return;
  }

  disconnectSuggestionsObserver();
  hideElement('hero-state');

  if (restaurants.length === 0) {
    hideElement('result-count');
    if (emptyQuery) emptyQuery.textContent = query;
    showElement('empty-state');
    if (splitLayout) splitLayout.setAttribute('hidden', '');
    document.body.classList.remove('map-active');
    destroyMap();
    restoreExploreHeader(titleEl);
    currentViewedRestaurants = [];
    return;
  }

  currentViewedRestaurants = restaurants;

  var cityDisplay = getCityName(restaurants[0]) || query;
  var tagline = document.querySelector('.site-tagline');
  if (titleEl) titleEl.textContent = t('restaurantsIn')(cityDisplay);
  if (tagline) tagline.style.display = 'none';
  deactivateExploreTabs();

  hideElement('empty-state');
  showElement('result-count');
  currentResultsTotal = restaurants.length;
  currentResultsQuery = query;
  resultCount.textContent = t('resultCount')(restaurants.length, query);

  if (splitCards) {
    splitCards.innerHTML = restaurants.map(function(r, i) {
      return renderMiniCard(r, i);
    }).join('');

    splitCards.querySelectorAll('.restaurant-card--mini').forEach(function(cardEl) {
      var idx = parseInt(cardEl.getAttribute('data-index'), 10);
      var restaurant = restaurants[idx];

      cardEl.addEventListener('click', function() {
        openRestaurantDetail(restaurant, idx);
      });
      cardEl.addEventListener('mouseenter', function() {
        highlightRestaurant(idx, false);
      });
      cardEl.addEventListener('mouseleave', function() {
        document.querySelectorAll('.restaurant-card--mini.is-active').forEach(function(el) {
          el.classList.remove('is-active');
        });
        Object.keys(mapMarkers).forEach(function(i) {
          var pinEl = mapMarkers[i].marker.getElement();
          if (pinEl) pinEl.classList.remove('is-active');
        });
      });
    });
  }

  if (splitLayout) splitLayout.removeAttribute('hidden');
  document.body.classList.add('map-active');

  var cityQuery = restaurants[0]
    ? (restaurants[0].CityEN || restaurants[0].Ciudad || query)
    : query;

  var mapInitialized = false;

  function initMapOnce(lat, lng, zoom) {
    if (mapInitialized) return;
    mapInitialized = true;
    initMap(lat, lng, zoom || 13);
    setTimeout(function() {
      if (mapInstance) mapInstance.invalidateSize();
    }, 200);

    restaurants.forEach(function(restaurant, index) {
      geocodeRestaurant(restaurant, function(coords) {
        if (!coords || !mapInstance) return;
        addMapMarker(restaurant, index, coords.lat, coords.lng);

        var cardEl = splitCards && splitCards.querySelector('[data-index="' + index + '"]');
        if (cardEl && mapMarkers[index]) {
          mapMarkers[index].cardEl = cardEl;
        }
        syncCardsToMapBounds();
      });
    });

    setTimeout(function() {
      var bounds = [];
      Object.keys(mapMarkers).forEach(function(i) {
        bounds.push(mapMarkers[i].marker.getLatLng());
      });
      if (bounds.length > 1 && mapInstance) {
        mapInstance.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      }
    }, 3000);
  }

  fetch(
    'https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(cityQuery) + '&format=json&limit=1',
    { headers: { 'User-Agent': 'RestaurantReviews/1.0' } }
  )
  .then(function(r) { return r.json(); })
  .then(function(data) {
    if (data && data[0]) {
      initMapOnce(parseFloat(data[0].lat), parseFloat(data[0].lon), 13);
    } else {
      initMapOnce(40.4168, -3.7038, 12);
    }
  })
  .catch(function() {
    initMapOnce(40.4168, -3.7038, 12);
  });
}

function switchTab(tab) {
  currentTab = tab;
  var input = document.getElementById('search-input');
  var titleEl = document.querySelector('.site-title [data-i18n="title"]');
  document.querySelectorAll('.tab-btn').forEach(function(btn) {
    var active = btn.dataset.tab === tab;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', active ? 'true' : 'false');
  });

  if (titleEl) titleEl.textContent = t('title');

  var searchPanel = document.getElementById('panel-explore-search');
  var heroEl      = document.getElementById('hero-state');
  var emptyEl     = document.getElementById('empty-state');
  var countEl     = document.getElementById('result-count');
  var favsPanel   = document.getElementById('panel-favourites');
  var splitLayout = document.getElementById('split-layout');

  if (tab === 'explore') {
    if (searchPanel) searchPanel.style.display = '';
    if (heroEl) heroEl.removeAttribute('hidden');
    if (emptyEl) emptyEl.setAttribute('hidden', '');
    if (countEl) countEl.setAttribute('hidden', '');
    if (splitLayout) splitLayout.setAttribute('hidden', '');
    document.body.classList.remove('map-active');
    destroyMap();
    if (favsPanel) favsPanel.style.display = 'none';
    if (input) {
      input.value = '';
      renderResults([], '');
    }
  } else {
    disconnectSuggestionsObserver();
    if (searchPanel) searchPanel.style.display = 'none';
    if (heroEl) heroEl.setAttribute('hidden', '');
    if (emptyEl) emptyEl.setAttribute('hidden', '');
    if (countEl) countEl.setAttribute('hidden', '');
    if (splitLayout) splitLayout.setAttribute('hidden', '');
    document.body.classList.remove('map-active');
    destroyMap();
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

  panel.querySelectorAll('.restaurant-card[data-nombre]').forEach(function(cardEl) {
    cardEl.style.cursor = 'pointer';
    cardEl.addEventListener('click', function(e) {
      if (e.target.closest('.fav-btn')) return;
      var nombre = cardEl.getAttribute('data-nombre');
      var restaurant = allRestaurants.find(function(r) { return r.Nombre === nombre; });
      if (restaurant) openRestaurantDetail(restaurant, allRestaurants.indexOf(restaurant));
    });
  });
}

function handleFavClick(e) {
  var btn = e.target.closest ? e.target.closest('.fav-btn') : null;
  if (!btn) return;
  e.stopPropagation();

  var nombre = btn.dataset.nombre;
  var nowFav = !isFav(nombre);
  setFav(nombre, nowFav);
  btn.classList.toggle('is-fav', nowFav);

  if (nowFav) {
    btn.classList.remove('heart-beat');
    void btn.offsetWidth;
    btn.classList.add('heart-beat');
    btn.addEventListener('animationend', function() {
      btn.classList.remove('heart-beat');
    }, { once: true });
  }

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
  var best = null;
  var bestCount = 0;
  hideAutocomplete();

  if (query.length < 2) {
    renderResults([], query);
    return;
  }

  var normalizedQuery = normalizeText(query);
  var cities = getAllCities();
  var hasExactCity = cities.some(function(c) {
    return normalizeText(c.display) === normalizedQuery || normalizeText(c.query) === normalizedQuery;
  });

  if (hasExactCity) {
    renderResults(searchRestaurants(query), query);
    return;
  }

  var suggestions = cities.filter(function(c) {
    return normalizeText(c.display).startsWith(normalizedQuery) || normalizeText(c.query).startsWith(normalizedQuery);
  });

  if (suggestions.length > 0) {
    if (normalizedQuery.length >= 4) {
      best = suggestions[0];
      bestCount = 0;
      suggestions.forEach(function(c) {
        var count = searchRestaurants(c.display).length;
        if (count > bestCount) {
          bestCount = count;
          best = c;
        }
      });
      if (input) input.value = best.display;
      renderResults(searchRestaurants(best.display), best.display);
    } else {
      showDidYouMean(suggestions);
    }
  } else {
    renderResults(searchRestaurants(query), query);
  }
}

/* =====================================================================
   DID YOU MEAN?
   ===================================================================== */

function showDidYouMean(suggestions) {
  var splitLayout = document.getElementById('split-layout');
  var didYouMeanEl = document.getElementById('did-you-mean-state');

  disconnectSuggestionsObserver();
  hideElement('hero-state');
  hideElement('empty-state');
  hideElement('result-count');
  if (splitLayout) splitLayout.setAttribute('hidden', '');
  document.body.classList.remove('map-active');
  destroyMap();

  if (!didYouMeanEl) return;

  var linksHtml = suggestions.map(function(c) {
    return '<a href="#" class="dym-link" data-query="' + escapeHtml(c.display) + '">' +
      escapeHtml(c.display) + '</a>';
  }).join('');

  didYouMeanEl.innerHTML =
    '<span class="dym-emoji">🔍</span>' +
    '<p class="dym-title">' + escapeHtml(t('didYouMean')) + '</p>' +
    '<div class="dym-links">' + linksHtml + '</div>';

  didYouMeanEl.removeAttribute('hidden');
}

function hideDidYouMean() {
  var el = document.getElementById('did-you-mean-state');
  if (el) {
    el.setAttribute('hidden', '');
    el.innerHTML = '';
  }
}

function handleDidYouMeanClick(e) {
  var link = e.target.closest ? e.target.closest('.dym-link') : null;
  if (!link) return;
  e.preventDefault();

  var query = link.dataset.query;
  var input = document.getElementById('search-input');
  if (input) input.value = query;

  hideDidYouMean();
  renderResults(searchRestaurants(query), query);
}

/* =====================================================================
   AUTOCOMPLETE DROPDOWN
   ===================================================================== */

function getAllCities() {
  var allRestaurants = window['allRestaurants'] || [];
  var seen = {};
  var cities = [];
  allRestaurants.forEach(function(r) {
    var cityEN = (r.CityEN || '').trim();
    var cityES = (r.Ciudad || '').trim();
    var display = currentLang === 'es' ? cityES : cityEN;
    var key = normalizeText(display);
    if (!key || seen[key]) return;
    seen[key] = true;
    cities.push({ display: display, query: cityEN || cityES });
  });
  // Deduplicate cities that share the same base name (e.g. "Athens" and "Athens (Greece)")
  // Keep only the shorter base name so the search matches all variants
  var baseMap = {};
  cities.forEach(function(c) {
    var base = normalizeText(c.display.replace(/\s*\(.*\)$/, ''));
    if (!baseMap[base] || c.display.length < baseMap[base].display.length) {
      baseMap[base] = c;
    }
  });
  var deduped = [];
  var addedBases = {};
  cities.forEach(function(c) {
    var base = normalizeText(c.display.replace(/\s*\(.*\)$/, ''));
    if (!addedBases[base]) {
      addedBases[base] = true;
      deduped.push(baseMap[base]);
    }
  });
  deduped.sort(function(a, b) {
    return a.display.localeCompare(b.display);
  });
  return deduped;
}

function showAutocomplete(query) {
  var container = document.getElementById('autocomplete-dropdown');
  if (!container) return;

  var normalized = normalizeText(query);
  if (!normalized || normalized.length < 1) {
    hideAutocomplete();
    return;
  }

  var cities = getAllCities();
  var matches = cities.filter(function(c) {
    return normalizeText(c.display).startsWith(normalized);
  }).slice(0, 8);

  if (matches.length === 0) {
    hideAutocomplete();
    return;
  }

  container.innerHTML = matches.map(function(c) {
    return '<button type="button" class="autocomplete-item" data-query="' + escapeHtml(c.query) + '">' +
      escapeHtml(c.display) +
    '</button>';
  }).join('');

  container.removeAttribute('hidden');
}

function hideAutocomplete() {
  var container = document.getElementById('autocomplete-dropdown');
  if (container) {
    container.setAttribute('hidden', '');
    container.innerHTML = '';
  }
}

function handleAutocompleteClick(e) {
  var item = e.target.closest ? e.target.closest('.autocomplete-item') : null;
  if (!item) return;

  var query = item.dataset.query || '';
  var input = document.getElementById('search-input');
  if (input) input.value = query;

  hideAutocomplete();
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

  // Search input — autocomplete on typing, search on button click or Enter
  var input = document.getElementById('search-input');
  if (input) {
    input.addEventListener('input', function() {
      if (currentTab !== 'explore') return;
      var query = this.value.trim();
      showAutocomplete(query);
    });
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSearchButtonClick();
      }
      if (e.key === 'Escape') {
        hideAutocomplete();
      }
    });
    input.addEventListener('blur', function() {
      setTimeout(hideAutocomplete, 200);
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
  document.addEventListener('click', handleAutocompleteClick);
  document.addEventListener('click', handleDidYouMeanClick);

  var detailOverlay = document.getElementById('restaurant-detail-overlay');
  var detailCloseBtn = document.querySelector('.detail-close-btn');
  var detailBackdrop = document.querySelector('.detail-overlay-backdrop');

  if (detailCloseBtn) {
    detailCloseBtn.addEventListener('click', closeRestaurantDetail);
  }
  if (detailBackdrop) {
    detailBackdrop.addEventListener('click', closeRestaurantDetail);
  }
  if (detailOverlay) {
    detailOverlay.addEventListener('click', function(e) {
      if (e.target === detailOverlay) closeRestaurantDetail();
    });
  }
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeRestaurantDetail();
  });

  // Language buttons
  document.querySelectorAll('.lang-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      if (this.dataset.lang === currentLang) return;
      currentLang = this.dataset.lang;
      applyTranslations();
    });
  });
});
