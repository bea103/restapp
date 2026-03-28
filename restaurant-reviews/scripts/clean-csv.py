#!/usr/bin/env python3
"""
Script de limpieza del CSV de restaurantes exportado desde Notion.
Lee el CSV fuente, normaliza datos y genera data/restaurants.csv limpio.
"""

import csv
import re
import os

SOURCE = "/Users/bcarrete/Downloads/Private & Shared/Gastronomía 12609e609c60808a9a31e934f3909bd7.csv"
OUTPUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "restaurants.csv")
OUTPUT = os.path.normpath(OUTPUT)


def normalize_text(value):
    """Limpia espacios: strip de extremos + colapsa espacios internos múltiples."""
    if not isinstance(value, str):
        return value
    value = value.strip()
    value = re.sub(r' {2,}', ' ', value)
    return value


def main():
    with open(SOURCE, encoding='utf-8-sig', newline='') as f:
        reader = csv.DictReader(f)
        # Construir lista de columnas sin 'Fotos', añadiendo Plato1/2/3 al final
        fieldnames = [fn for fn in reader.fieldnames if fn != 'Fotos']
        fieldnames += ['Plato1', 'Plato2', 'Plato3']

        rows = []
        for row in reader:
            cleaned = {}
            for k, v in row.items():
                if k == 'Fotos':
                    continue  # Eliminar columna Fotos
                cleaned[k] = normalize_text(v)
            cleaned['Plato1'] = ''
            cleaned['Plato2'] = ''
            cleaned['Plato3'] = ''
            rows.append(cleaned)

    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    with open(OUTPUT, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    ciudades = set(r['Ciudad'] for r in rows)
    print(f"Limpieza completada: {len(rows)} restaurantes, {len(ciudades)} ciudades únicas")


if __name__ == '__main__':
    main()
