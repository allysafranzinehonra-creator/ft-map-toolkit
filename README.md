# Flourish Map Toolkit — Version 2

A browser-based toolkit for preparing data for Flourish maps.

## Included tools

### Earthquake Heatmap Converter

Converts USGS `cont_mmi.json` contour files into:

- `flourish_regions.csv`
- `banded_regions.geojson`

The output is designed for the FT WebGL Map **Regions** sheet.

### Flourish Coordinates Converter

Converts WKT point values such as:

```text
POINT (118.9 13.7)
```

into separate `latitude` and `longitude` columns and exports a clean CSV.

## Project structure

```text
index.html
style.css
app.js
tools/
  earthquake.js
  coordinates.js
assets/
README.md
```

Everything runs locally in the browser. No installation or external processing is required.
