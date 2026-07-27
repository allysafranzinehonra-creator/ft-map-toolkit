(() => {
  const bands = [
    { label: 'shake-intensity-1', min: 3, max: 4, color: '#f8de8b' },
    { label: 'shake-intensity-2', min: 4.5, max: 5.5, color: '#f8ae4c' },
    { label: 'shake-intensity-3', min: 6, max: 7, color: '#f96a2c' },
    { label: 'shake-intensity-4', min: 7.5, max: 8, color: '#e83b26' },
    { label: 'shake-intensity-5', min: 8.5, max: 99, color: '#c7221f' }
  ];

  const el = id => document.getElementById(id);
  const dropzone = el('eqDropzone');
  const fileInput = el('eqFileInput');
  let csvBlob = null;
  let geoBlob = null;

  function setStatus(text, type = '') {
    const node = el('eqStatus');
    node.textContent = text;
    node.className = `status-message ${type}`.trim();
  }

  function closeRing(ring) {
    if (!Array.isArray(ring) || ring.length < 3) return null;
    const clean = ring.map(point => [Number(point[0]), Number(point[1])])
      .filter(point => Number.isFinite(point[0]) && Number.isFinite(point[1]));
    if (clean.length < 3) return null;
    const first = clean[0], last = clean[clean.length - 1];
    if (Math.abs(first[0] - last[0]) > 1e-6 || Math.abs(first[1] - last[1]) > 1e-6) clean.push([...first]);
    return clean.length >= 4 ? clean : null;
  }

  function signedArea(ring) {
    let sum = 0;
    for (let i = 0; i < ring.length - 1; i++) {
      sum += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
    }
    return sum / 2;
  }

  function normaliseRing(ring) { return signedArea(ring) < 0 ? [...ring].reverse() : ring; }
  function bandForValue(value) { return bands.find(band => value >= band.min && value <= band.max); }

  function featureToPolygons(feature) {
    const geometry = feature.geometry || {};
    const value = Number(feature.properties && feature.properties.value);
    const band = bandForValue(value);
    if (!band) return [];
    let rings = [];
    if (geometry.type === 'LineString') rings = [geometry.coordinates];
    if (geometry.type === 'MultiLineString') rings = geometry.coordinates || [];
    if (geometry.type === 'Polygon') rings = (geometry.coordinates || []).slice(0, 1);
    if (geometry.type === 'MultiPolygon') rings = (geometry.coordinates || []).map(polygon => polygon[0]);
    return rings.map(closeRing).filter(Boolean).map(ring => ({
      type: 'Feature',
      properties: { value, band: band.label, band_min: band.min, band_max: band.max },
      geometry: { type: 'Polygon', coordinates: [normaliseRing(ring)] }
    }));
  }

  function csvEscape(value) {
    const text = String(value == null ? '' : value);
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  function makeCsv(rows) {
    const headers = ['region_geometry','region_label','region_fill','region_fill_opacity','region_stroke','region_stroke_width','region_stroke_dash_array','region_stroke_linecap','region_line_opacity','region_line_blur','visible'];
    return [headers.join(','), ...rows.map(row => headers.map(header => csvEscape(row[header] ?? '')).join(','))].join('\n');
  }

  async function handleFile(file) {
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const polygons = (data.features || []).flatMap(featureToPolygons);
      const grouped = new Map(bands.map(band => [band.label, []]));
      polygons.forEach(feature => grouped.get(feature.properties.band).push(feature));
      const baseOpacity = Number(el('eqOpacity').value) || 0.62;
      const stroke = el('eqStroke').value.trim();
      const strokeWidth = el('eqStrokeWidth').value;
      const rows = bands.map((band, index) => ({
        region_geometry: JSON.stringify({ type: 'FeatureCollection', features: grouped.get(band.label) }),
        region_label: band.label,
        region_fill: band.color,
        region_fill_opacity: Math.min(1, +(baseOpacity * (0.68 + index * 0.12)).toFixed(2)),
        region_stroke: stroke,
        region_stroke_width: strokeWidth || '',
        visible: 'TRUE'
      })).filter(row => JSON.parse(row.region_geometry).features.length);

      csvBlob = new Blob([makeCsv(rows)], { type: 'text/csv;charset=utf-8' });
      geoBlob = new Blob([JSON.stringify({ type: 'FeatureCollection', features: polygons })], { type: 'application/geo+json;charset=utf-8' });
      el('eqDownloadCsv').disabled = rows.length === 0;
      el('eqDownloadGeo').disabled = polygons.length === 0;
      const counts = rows.map(row => `${row.region_label}: ${JSON.parse(row.region_geometry).features.length}`).join('\n');
      setStatus(`Converted ${polygons.length} closed contour rings into ${rows.length} region rows.\n${counts}\nOpen contour segments were skipped.`, 'success');
    } catch (error) {
      csvBlob = geoBlob = null;
      el('eqDownloadCsv').disabled = true;
      el('eqDownloadGeo').disabled = true;
      setStatus(`Error: ${error.message}`, 'error');
    }
  }

  function download(blob, filename) {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') fileInput.click(); });
  fileInput.addEventListener('change', event => handleFile(event.target.files[0]));
  ['dragenter','dragover'].forEach(name => dropzone.addEventListener(name, event => { event.preventDefault(); dropzone.classList.add('dragover'); }));
  ['dragleave','drop'].forEach(name => dropzone.addEventListener(name, event => { event.preventDefault(); dropzone.classList.remove('dragover'); }));
  dropzone.addEventListener('drop', event => handleFile(event.dataTransfer.files[0]));
  el('eqDownloadCsv').addEventListener('click', () => download(csvBlob, 'flourish_regions.csv'));
  el('eqDownloadGeo').addEventListener('click', () => download(geoBlob, 'banded_regions.geojson'));
})();
