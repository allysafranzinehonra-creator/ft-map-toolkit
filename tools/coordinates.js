(() => {
  const el = id => document.getElementById(id);
  const dropzone = el('coordDropzone');
  const fileInput = el('coordFileInput');
  let sourceRows = [], headers = [], convertedRows = [], convertedHeaders = [];

  function setMessage(text, type = '') {
    const node = el('coordMessage');
    node.textContent = text;
    node.className = `status-message ${type}`.trim();
  }

  function parseCSV(text) {
    const rows = [];
    let row = [], field = '', inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i], next = text[i + 1];
      if (char === '"' && inQuotes && next === '"') { field += '"'; i++; }
      else if (char === '"') inQuotes = !inQuotes;
      else if (char === ',' && !inQuotes) { row.push(field); field = ''; }
      else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (char === '\r' && next === '\n') i++;
        row.push(field);
        if (row.some(value => value !== '')) rows.push(row);
        row = []; field = '';
      } else field += char;
    }
    row.push(field);
    if (row.some(value => value !== '')) rows.push(row);
    return rows;
  }

  function escapeCSV(value) {
    const text = value == null ? '' : String(value);
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  function suggestedColumn() {
    const exact = headers.findIndex(header => /^wkt$/i.test(header.trim()));
    if (exact >= 0) return exact;
    for (let c = 0; c < headers.length; c++) {
      if (sourceRows.slice(0, 30).some(row => /POINT\s*\(/i.test(row[c] || ''))) return c;
    }
    return 0;
  }

  function populateColumns() {
    const select = el('coordWktColumn');
    select.innerHTML = '';
    headers.forEach((header, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = header || `Column ${index + 1}`;
      select.appendChild(option);
    });
    select.value = suggestedColumn();
    select.disabled = false;
  }

  function loadFile(file) {
    if (!file || !file.name.toLowerCase().endsWith('.csv')) {
      setMessage('Please choose a CSV file.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = parseCSV(event.target.result.replace(/^\uFEFF/, ''));
        if (parsed.length < 2) throw new Error('The CSV does not contain data rows.');
        headers = parsed[0];
        sourceRows = parsed.slice(1).map(row => {
          const copy = [...row];
          while (copy.length < headers.length) copy.push('');
          return copy;
        });
        populateColumns();
        el('coordFileLabel').textContent = file.name;
        el('coordOutputName').value = file.name.replace(/\.csv$/i, '') + '_coordinates.csv';
        el('coordConvert').disabled = false;
        el('coordDownload').disabled = true;
        el('coordPreview').hidden = true;
        setMessage(`Loaded ${sourceRows.length.toLocaleString()} rows. Choose the WKT column, then convert.`, 'success');
      } catch (error) { setMessage(error.message || 'The file could not be read.', 'error'); }
    };
    reader.readAsText(file);
  }

  function parsePoint(value) {
    const match = String(value || '').trim().match(/^POINT(?:\s+Z|\s+M|\s+ZM)?\s*\(\s*([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)\s+([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)(?:\s+[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)?\s*\)$/i);
    return match ? { longitude: Number(match[1]), latitude: Number(match[2]) } : null;
  }

  function convert() {
    const columnIndex = Number(el('coordWktColumn').value);
    let valid = 0, invalid = 0;
    const removeWkt = el('coordRemoveWkt').checked;
    const latitudeFirst = el('coordLatFirst').checked;
    const baseHeaders = headers.filter((_, index) => !(removeWkt && index === columnIndex));
    convertedHeaders = latitudeFirst ? ['latitude','longitude',...baseHeaders] : [...baseHeaders,'latitude','longitude'];
    convertedRows = sourceRows.map(row => {
      const point = parsePoint(row[columnIndex]);
      point ? valid++ : invalid++;
      const base = row.filter((_, index) => !(removeWkt && index === columnIndex));
      const latitude = point ? point.latitude : '';
      const longitude = point ? point.longitude : '';
      return latitudeFirst ? [latitude, longitude, ...base] : [...base, latitude, longitude];
    });
    renderPreview();
    el('coordDownload').disabled = false;
    el('coordPreview').hidden = false;
    setMessage(invalid ? `Converted ${valid.toLocaleString()} rows. ${invalid.toLocaleString()} invalid WKT values were left blank.` : `Converted all ${valid.toLocaleString()} rows successfully.`, invalid ? 'error' : 'success');
  }

  function renderPreview() {
    const table = el('coordPreviewTable');
    table.innerHTML = '';
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    convertedHeaders.forEach(header => { const th = document.createElement('th'); th.textContent = header; headerRow.appendChild(th); });
    thead.appendChild(headerRow); table.appendChild(thead);
    const tbody = document.createElement('tbody');
    convertedRows.slice(0, 100).forEach(row => {
      const tr = document.createElement('tr');
      row.forEach(value => { const td = document.createElement('td'); td.textContent = value; tr.appendChild(td); });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    el('coordSummary').textContent = convertedRows.length > 100 ? `Showing 100 of ${convertedRows.length.toLocaleString()} rows` : `${convertedRows.length.toLocaleString()} rows`;
  }

  function downloadCSV() {
    const csv = [convertedHeaders, ...convertedRows].map(row => row.map(escapeCSV).join(',')).join('\r\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = el('coordOutputName').value.trim() || 'flourish_coordinates.csv';
    document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  }

  function reset() {
    fileInput.value = '';
    el('coordFileLabel').textContent = 'Drop a CSV file here';
    el('coordWktColumn').innerHTML = '<option>Upload a file first</option>';
    el('coordWktColumn').disabled = true;
    el('coordOutputName').value = 'flourish_coordinates.csv';
    el('coordRemoveWkt').checked = false;
    el('coordLatFirst').checked = true;
    el('coordConvert').disabled = true;
    el('coordDownload').disabled = true;
    el('coordPreview').hidden = true;
    sourceRows = []; headers = []; convertedRows = []; convertedHeaders = [];
    setMessage('Waiting for a file.');
  }

  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') fileInput.click(); });
  fileInput.addEventListener('change', event => loadFile(event.target.files[0]));
  ['dragenter','dragover'].forEach(name => dropzone.addEventListener(name, event => { event.preventDefault(); dropzone.classList.add('dragover'); }));
  ['dragleave','drop'].forEach(name => dropzone.addEventListener(name, event => { event.preventDefault(); dropzone.classList.remove('dragover'); }));
  dropzone.addEventListener('drop', event => loadFile(event.dataTransfer.files[0]));
  el('coordConvert').addEventListener('click', convert);
  el('coordDownload').addEventListener('click', downloadCSV);
  el('coordReset').addEventListener('click', reset);
})();
