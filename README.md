# 🗺️ Flourish Map Toolkit

A collection of lightweight, browser-based utilities designed to speed
up common workflows when preparing data for **Flourish** maps.

![HTML](https://img.shields.io/badge/HTML-5-E34F26?logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-F7DF1E?logo=javascript&logoColor=black)
![Offline](https://img.shields.io/badge/Works-Offline-success)
![License](https://img.shields.io/badge/License-Personal-blue)

------------------------------------------------------------------------

## ✨ Features

-   ✅ Runs entirely in your browser
-   ✅ No installation required
-   ✅ No data uploaded to external servers
-   ✅ Designed for Flourish mapping workflows
-   ✅ One-click CSV exports

------------------------------------------------------------------------

## 🛠️ Included Tools

### 🌍 Earthquake Heatmap Converter

Convert USGS `cont_mmi.json` files into the **FT WebGL Map -- Regions**
format.

**Features** - Converts MMI contour polygons into FT WebGL regions -
Groups contours into five intensity bands - Exports: -
`flourish_regions.csv` - `banded_regions.geojson`

------------------------------------------------------------------------

### 📍 Flourish Coordinates Converter

Convert WKT coordinates (e.g. `POINT (118.9 13.7)`) into separate
latitude and longitude columns.

**Features** - Automatically detects the WKT column - Splits latitude
and longitude - Optional removal of the original WKT column - Preview
before download - Exports a Flourish-ready CSV

------------------------------------------------------------------------

## 🚀 Planned Tools

-   GeoJSON Cleaner
-   KMZ/KML → GeoJSON Converter
-   GPX → GeoJSON Converter
-   Location Finder
-   Map Bounds Calculator

------------------------------------------------------------------------

## 📸 Screenshots

> Add screenshots here as the toolkit grows.

    Earthquake Heatmap Converter
    ┌─────────────────────────────────────────────┐
    │ Upload cont_mmi.json                        │
    │ Configure bands                             │
    │ Download Flourish CSV / GeoJSON             │
    └─────────────────────────────────────────────┘

    Flourish Coordinates Converter
    ┌─────────────────────────────────────────────┐
    │ Upload CSV                                 │
    │ Split WKT → Latitude / Longitude           │
    │ Preview                                    │
    │ Download CSV                               │
    └─────────────────────────────────────────────┘

------------------------------------------------------------------------

## 💻 Technology

-   HTML5
-   CSS3
-   Vanilla JavaScript

------------------------------------------------------------------------

## 📄 License

Personal project for map production workflows.
