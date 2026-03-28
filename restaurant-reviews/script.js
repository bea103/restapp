// Mis Restaurantes — Lógica principal
// Tasks 3, 4, 5, 6, 8: carga CSV, búsqueda, renderizado, platos, estados

/* =====================================================================
   TASK 3 — Carga del CSV con PapaParse
   ===================================================================== */

function loadRestaurants() {
  Papa.parse('data/restaurants.csv', {
    download: true,
    header: true,
    encoding: 'UTF-8',
    skipEmptyLines: true,
    complete: function (results) {
      var restaurants = results.data.map(function (r) {
        var cleaned = {};
        for (var key in r) {
          var trimmedKey = key.trim();
          cleaned[trimmedKey] = typeof r[key] === 'string' ? r[key].trim() : r[key];
        }
        return cleaned;
      });
      window.allRestaurants = restaurants;
    },
    error: function (error) {
      console.error('Error cargando CSV:', error);
    }
  });
}

/* =====================================================================
   TASK 4 — Lógica de búsqueda por ciudad (substring + diacríticos)
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
  return (window.allRestaurants || []).filter(function (r) {
    var city = normalizeText(r.Ciudad);
    return city.includes(normalizedQuery);
  });
}

/* =====================================================================
   TASK 5 — Renderizado de tarjetas de restaurante
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
  var parts = value.split(',').map(function (p) { return p.trim(); }).filter(Boolean);
  return parts.map(function (p) {
    return '<span class="badge">' + escapeHtml(p) + '</span>';
  }).join('');
}

function renderDishes(restaurant) {
  var dishes = [restaurant.Plato1, restaurant.Plato2, restaurant.Plato3]
    .filter(function (p) { return p && p.trim(); });
  if (dishes.length === 0) return '';
  var items = dishes.map(function (d) {
    return '<li>' + escapeHtml(d) + '</li>';
  }).join('');
  return (
    '<section class="must-try">' +
      '<h3 class="must-try-title">🍽️ Platos imprescindibles</h3>' +
      '<ol class="must-try-list">' + items + '</ol>' +
    '</section>'
  );
}

function renderCard(restaurant) {
  var nombre = escapeHtml(restaurant.Nombre) || 'Sin nombre';
  var avatar = (restaurant.Nombre || 'R').charAt(0).toUpperCase();
  var ciudad = escapeHtml(restaurant.Ciudad);
  var tipo = renderBadges(restaurant.Tipo);
  var precio = renderBadges(restaurant.Precio);
  var direccion = escapeHtml(restaurant.Dirección || restaurant['Dirección'] || '');
  var notes = escapeHtml(restaurant.Notes || '');
  var dishes = renderDishes(restaurant);

  var metaRow = '';
  if (tipo) metaRow += '<div class="card-badges tipo-badges">' + tipo + '</div>';
  if (precio) metaRow += '<div class="card-badges precio-badges">' + precio + '</div>';

  var extraFields = '';
  if (direccion) {
    extraFields += '<p class="card-address">📍 ' + direccion + '</p>';
  }
  if (notes) {
    extraFields += '<blockquote class="card-notes">📝 ' + notes + '</blockquote>';
  }

  return (
    '<article class="restaurant-card">' +
      '<div class="card-avatar" aria-hidden="true">' + avatar + '</div>' +
      '<div class="card-body">' +
        '<header class="card-header">' +
          '<h2 class="card-name">' + nombre + '</h2>' +
          (ciudad ? '<p class="card-city">' + ciudad + '</p>' : '') +
        '</header>' +
        (metaRow ? '<div class="card-meta">' + metaRow + '</div>' : '') +
        extraFields +
        dishes +
      '</div>' +
    '</article>'
  );
}

/* =====================================================================
   TASK 8 — Estados: hero, vacío, contador, flujo completo
   ===================================================================== */

function showElement(id) {
  var el = document.getElementById(id);
  if (el) el.removeAttribute('hidden');
}

function hideElement(id) {
  var el = document.getElementById(id);
  if (el) el.setAttribute('hidden', '');
}

function renderResults(restaurants, query) {
  var container = document.getElementById('cards-container');
  var resultCount = document.getElementById('result-count');
  var emptyQuery = document.getElementById('empty-query');

  var normalizedQuery = normalizeText(query);

  if (!normalizedQuery || normalizedQuery.length < 2) {
    // Estado inicial: mostrar hero, ocultar todo lo demás
    showElement('hero-state');
    hideElement('empty-state');
    hideElement('result-count');
    container.innerHTML = '';
    return;
  }

  hideElement('hero-state');

  if (restaurants.length === 0) {
    // Estado vacío
    hideElement('result-count');
    if (emptyQuery) emptyQuery.textContent = query;
    showElement('empty-state');
    container.innerHTML = '';
    return;
  }

  // Hay resultados
  hideElement('empty-state');
  showElement('result-count');
  resultCount.textContent = 'Se encontraron ' + restaurants.length + ' restaurante' +
    (restaurants.length !== 1 ? 's' : '') + ' en "' + query + '"';
  container.innerHTML = restaurants.map(renderCard).join('');
}

/* =====================================================================
   INICIALIZACIÓN
   ===================================================================== */

document.addEventListener('DOMContentLoaded', function () {
  loadRestaurants();

  var input = document.getElementById('search-input');
  if (input) {
    input.addEventListener('input', function () {
      var query = this.value.trim();
      var results = query.length >= 2
        ? searchRestaurants(query)
        : [];
      renderResults(results, query);
    });
  }
});
