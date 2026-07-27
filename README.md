# FT Map Toolkit

A browser-based toolkit for preparing map data for Flourish and FT-style mapping workflows.

## Included tools

### Earthquake Heatmap Converter
Converts USGS MMI contour GeoJSON into:

- `flourish_regions.csv` for the FT WebGL Map **Regions** sheet
- `banded_regions.geojson`

The converter groups contours into five intensity bands and allows basic opacity and stroke settings.

### Flourish Coordinates Converter
Converts WKT point values such as:

```text
POINT (118.9 13.7)
```

into separate:

- `latitude`
- `longitude`

columns and exports a cleaned CSV for Flourish.

## How to use

1. Open the live GitHub Pages link, or download `index.html` and open it in a browser.
2. Select the required converter tab.
3. Upload or drag and drop your source file.
4. Adjust the available settings.
5. Preview and download the converted output.

All processing happens locally in the browser. Files are not uploaded to a server.

## Run locally

Download the repository and open `index.html` in Chrome, Edge, Firefox, or Safari.

## Publish with GitHub Pages

1. Open the repository on GitHub.
2. Go to **Settings** → **Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and `/ (root)` folder.
5. Click **Save**.

GitHub will generate a public website link after deployment.
