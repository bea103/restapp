# Mis Restaurantes 🍽️

Sitio web personal para guardar y explorar mis restaurantes favoritos del mundo.

---

## ¿Cómo actualizar los restaurantes?

1. Abre tu base de datos en Notion
2. Exporta a CSV: haz clic en los tres puntos (···) → **Exportar** → selecciona **Markdown & CSV** → marca solo **CSV** → haz clic en **Exportar**
3. Abre el CSV exportado en **Google Sheets** (ve a [sheets.google.com](https://sheets.google.com) → Archivo → Importar → sube el CSV) — **no uses Excel ni editores de texto**
4. Añade o edita restaurantes — respeta exactamente los nombres de las columnas existentes
5. Para los 3 platos imprescindibles: rellena las columnas `Plato1`, `Plato2`, `Plato3` con los nombres de los platos
6. Descarga como CSV: **Archivo → Descargar → Valores separados por comas (.csv)**
7. Renombra el archivo descargado a `restaurants.csv`
8. Reemplaza el archivo `data/restaurants.csv` en esta carpeta con el nuevo archivo
9. Sube la carpeta `restaurant-reviews` completa a Netlify Drop (ver instrucciones abajo)

---

## ¿Cómo publicar el sitio?

1. Ve a [netlify.com/drop](https://netlify.com/drop) en tu navegador
2. Arrastra la carpeta `restaurant-reviews` completa al área que dice "Drag and drop your site folder here"
3. Espera unos segundos — Netlify te dará una URL única (algo como `https://nombre-aleatorio.netlify.app`)
4. ¡Tu sitio ya está en internet! Guarda esa URL.

> **Para actualizar el sitio**: repite el proceso de arrastrar la carpeta. Netlify te preguntará si quieres reemplazar el sitio existente — di que sí.

---

## Estructura de archivos

```
restaurant-reviews/
├── index.html          → Página principal del sitio
├── style.css           → Estilos visuales
├── script.js           → Lógica de búsqueda y visualización
├── README.md           → Este archivo
├── data/
│   └── restaurants.csv → Tus restaurantes (actualiza este archivo)
└── scripts/
    └── clean-csv.py    → Script de limpieza (solo para uso técnico)
```
