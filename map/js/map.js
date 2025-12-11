// ============================================================================
// OECD Members List 
// ============================================================================

// Country code mapping (ISO 3166-1 alpha-2)
const COUNTRY_CODE_MAP = {
  'Australia': 'AU',
  'Austria': 'AT',
  'Belgium': 'BE',
  'Canada': 'CA',
  'Chile': 'CL',
  'Colombia': 'CO',
  'Costa Rica': 'CR',
  'Czechia': 'CZ',
  'Denmark': 'DK',
  'Estonia': 'EE',
  'Finland': 'FI',
  'France': 'FR',
  'Germany': 'DE',
  'Greece': 'GR',
  'Hungary': 'HU',
  'Iceland': 'IS',
  'Ireland': 'IE',
  'Israel': 'IL',
  'Italy': 'IT',
  'Japan': 'JP',
  'Latvia': 'LV',
  'Lithuania': 'LT',
  'Luxembourg': 'LU',
  'Mexico': 'MX',
  'Netherlands': 'NL',
  'The Netherlands': 'NL',
  'New Zealand': 'NZ',
  'Norway': 'NO',
  'Poland': 'PL',
  'Portugal': 'PT',
  'Slovak Republic': 'SK',
  'Slovenia': 'SI',
  'South Korea': 'KR',
  'Spain': 'ES',
  'Sweden': 'SE',
  'Switzerland': 'CH',
  'Turkey': 'TR',
  'United Kingdom': 'GB',
  'United States': 'US'
};

// Global state
let map;
let geoJsonLayer;
let currentSelectedCountry = null;

// ============================================================================
// MAP INITIALIZATION
// ============================================================================

function initMap(containerId = 'map') {
  if (map) {
    return map;
  }
  
  map = L.map(containerId, {
    minZoom: 2,
    maxBounds: [
      [-85, -180],
      [85, 180]
    ],
    maxBoundsViscosity: 1.0
  }).setView([30, 0], 2);

  map.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank">Leaflet</a>');
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);
  
  L.control.scale().addTo(map);
  
  new L.easyPrint({
    title: 'Print map',
    position: 'topleft',
    sizeModes: ['Current', 'A4Portrait', 'A4Landscape']
  }).addTo(map);
  
  return map;
}

// ============================================================================
// DATA PROCESSING
// ============================================================================

async function fetchAndProcessGeoData() {
  try {
    const geoResponse = await fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson');
    const geoData = await geoResponse.json();
    
    console.log('GeoJSON loaded with', geoData.features.length, 'countries');
    console.log('Current PORTAL_DATA has', PORTAL_DATA.length, 'items');
    console.log('First PORTAL_DATA item:', PORTAL_DATA[0]);
    
    const portalMap = {};
    PORTAL_DATA.forEach(item => {
      const normalizedName = item.country.toLowerCase();
      portalMap[normalizedName] = item;
      
      if (normalizedName === 'the netherlands') {
        portalMap['netherlands'] = item;
      }
      if (normalizedName === 'south korea') {
        portalMap['korea, republic of'] = item;
        portalMap['republic of korea'] = item;
      }
      if (normalizedName === 'czechia') {
        portalMap['czech republic'] = item;
      }
    });
    
    let matched = 0;
    geoData.features.forEach(feature => {
      const geoCountryName = feature.properties.ADMIN || feature.properties.name || '';
      const normalizedName = geoCountryName.toLowerCase();
      
      let portalItem = portalMap[normalizedName];
      
      if (portalItem) {
        feature.properties.portal_value = portalItem.value;
        feature.properties.portal_color = portalItem.color;
        feature.properties.portal_label = portalItem.label;
        matched++;
      } else {
        feature.properties.portal_value = 'no data';
        feature.properties.portal_color = '#e9ecef';
        feature.properties.portal_label = 'No Data';
      }
    });
    
    console.log(`Matched ${matched} countries with portal data`);
    return geoData;
    
  } catch (error) {
    console.error('Error loading GeoJSON:', error);
    return null;
  }
}

// ============================================================================
// MAP STYLING
// ============================================================================

function getCountryStyle(feature) {
  const fillColor = feature.properties.portal_color || '#e9ecef';
  
  return {
    fillColor: fillColor,
    weight: 1.5,
    opacity: 1,
    color: '#666',
    fillOpacity: 0.8
  };
}

// ============================================================================
// MAP LAYER MANAGEMENT
// ============================================================================

function addCountryLayer(geoData) {
  if (geoJsonLayer) {
    map.removeLayer(geoJsonLayer);
  }
  
  geoJsonLayer = L.geoJSON(geoData, {
    style: getCountryStyle,
    onEachFeature: onEachFeature
  }).addTo(map);
}

function onEachFeature(feature, layer) {
  const countryName = feature.properties.ADMIN || 
                      feature.properties.NAME || 
                      feature.properties.name || 
                      'Unknown Country';

  const label = feature.properties.portal_label || 'No Data';
  
  const popupContent = `
    <div class="p-3 text-sm">
      <h4 class="font-bold text-base mb-2">${countryName}</h4>
      <p>${label}</p>
    </div>
  `;
  
  layer.bindPopup(popupContent);
  
  layer.on('click', function(e) {
    selectCountry(countryName, feature);
    L.DomEvent.stop(e);
  });
  
  layer.on('mouseover', function(e) {
    const lyr = e.target;
    lyr.setStyle({
      weight: 2.5,
      color: '#333',
      fillOpacity: 0.9
    });
    lyr.bringToFront();
  });
  
  layer.on('mouseout', function(e) {
    if (currentSelectedCountry !== countryName) {
      e.target.setStyle(getCountryStyle(feature));
    }
  });
}

// ============================================================================
// SIDEBAR RENDERING - Dynamic labels from data
// ============================================================================

function renderIndicatorsList() {
  const indicatorsList = document.getElementById('indicators-list');
  if (!indicatorsList) return;
  
  indicatorsList.innerHTML = '';
  
  const datasetType = DataManager?.getCurrentType() || 'discrete';
  
  if (datasetType === 'continuous') {
    renderContinuousIndicatorsList(indicatorsList);
  } else {
    renderDiscreteIndicatorsList(indicatorsList);
  }
}

function renderDiscreteIndicatorsList(indicatorsList) {
  const byLabel = {};
  const labelOrder = []; 
  
  PORTAL_DATA.forEach(item => {
    const label = item.label || 'Unknown';
    if (!byLabel[label]) {
      byLabel[label] = {
        countries: [],
        color: item.color 
      };
      labelOrder.push(label);
    }
    byLabel[label].countries.push(item);
  });
  
  labelOrder.forEach(label => {
    const groupData = byLabel[label];
    if (groupData.countries.length > 0) {
      const section = createStatusSection(label, groupData.countries, groupData.color);
      indicatorsList.appendChild(section);
    }
  });
}

function renderContinuousIndicatorsList(indicatorsList) {
  const sorted = [...PORTAL_DATA].sort((a, b) => {
    if (a.value === null || a.value === undefined) return 1;
    if (b.value === null || b.value === undefined) return -1;
    return b.value - a.value;
  });
  
  const section = document.createElement('div');
  section.className = 'border rounded-lg p-3 bg-gray-50';
  
  const header = document.createElement('div');
  header.className = 'font-semibold text-sm mb-3';
  header.textContent = `Countries (${sorted.length})`;
  section.appendChild(header);
  
  const list = document.createElement('div');
  list.className = 'flex flex-col gap-1';
  
  sorted.forEach(country => {
    const item = document.createElement('button');
    item.className = 'text-left px-2 py-1 rounded text-xs hover:bg-gray-200 transition cursor-pointer flex items-center gap-2';
    
    const colorDot = document.createElement('span');
    colorDot.className = 'w-3 h-3 rounded-sm flex-shrink-0';
    colorDot.style.backgroundColor = country.color;
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'flex-grow';
    nameSpan.textContent = country.country;
    
    const valueSpan = document.createElement('span');
    valueSpan.className = 'font-mono text-gray-500';
    valueSpan.textContent = country.value !== null && country.value !== undefined 
      ? country.value.toFixed(2) 
      : 'N/A';
    
    item.appendChild(colorDot);
    item.appendChild(nameSpan);
    item.appendChild(valueSpan);
    item.onclick = () => selectCountryByName(country.country);
    list.appendChild(item);
  });
  
  section.appendChild(list);
  indicatorsList.appendChild(section);
}

function createStatusSection(label, countries, groupColor) {
  const section = document.createElement('div');
  section.className = 'border rounded-lg p-3 bg-gray-50';
  
  const header = document.createElement('div');
  header.className = 'flex items-center gap-2 mb-3 font-semibold text-sm';
  header.innerHTML = `
    <span class="w-3 h-3 rounded-full" style="background-color: ${groupColor}"></span>
    <span>${label} (${countries.length})</span>
  `;
  section.appendChild(header);
  
  const list = document.createElement('div');
  list.className = 'flex flex-col gap-1';
  
  countries.forEach(country => {
    const item = document.createElement('button');
    item.className = 'text-left px-2 py-1 rounded text-xs hover:bg-gray-200 transition cursor-pointer';
    item.textContent = country.country;
    item.onclick = () => selectCountryByName(country.country);
    list.appendChild(item);
  });
  
  section.appendChild(list);
  return section;
}

// ============================================================================
// COUNTRY SELECTION
// ============================================================================

function selectCountryByName(countryName) {
  if (geoJsonLayer) {
    geoJsonLayer.eachLayer(layer => {
      const layerCountryName = layer.feature.properties.ADMIN || 
                               layer.feature.properties.NAME || 
                               layer.feature.properties.name;
      
      if (layerCountryName === countryName) {
        selectCountry(countryName, layer.feature);
      }
    });
  }
}

function createCountryPanel(countryName, feature) {
  const datasetType = DataManager?.getCurrentType() || 'discrete';
  
  if (datasetType === 'continuous') {
    createContinuousPanel(countryName);
  } else {
    createDiscretePanel(countryName, feature);
  }
}

function createDiscretePanel(countryName, feature) {
  const portalItem = PORTAL_DATA.find(item => item.country === countryName);
  if (!portalItem) return;
  
  const countryCode = COUNTRY_CODE_MAP[countryName] || 'UN';
  
  let panel = document.getElementById('country-detail-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'country-detail-panel';
    panel.className = 'mt-4 p-4 bg-white border rounded-lg shadow-sm';
    document.getElementById('indicators-list').after(panel);
  }
  
  const currentDatasetName = DataManager?.datasets[DataManager?.currentDataset]?.name || 'Status';
  
  panel.innerHTML = `
    <div class="flex items-start gap-3">
      <div class="flex-shrink-0">
        <img 
          src="https://flagcdn.com/w80/${countryCode.toLowerCase()}.png" 
          alt="${countryName} flag"
          class="w-12 h-8 object-cover rounded shadow-sm"
          onerror="this.src='https://via.placeholder.com/48x32/e5e7eb/6b7280?text=Flag'"
        >
      </div>
      
      <div class="flex-1">
        <h3 class="font-bold text-lg text-gray-800">${countryName}</h3>
        
        <div class="mt-2 space-y-1">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">${currentDatasetName}:</span>
            <span class="px-2 py-1 rounded-md text-xs font-semibold text-white"
                  style="background-color: ${portalItem.color}">
              ${portalItem.label}
            </span>
          </div>
          
          ${portalItem.value ? `
            <div class="text-sm text-gray-600">
              Value: <span class="font-medium">${portalItem.value}</span>
            </div>
          ` : ''}
          
          ${portalItem.data_type ? `
            <div class="text-sm text-gray-500">
              Type: ${portalItem.data_type.replace(/_/g, ' ')}
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

function createContinuousPanel(countryName) {
  const indices = typeof ALL_INDICES_DATA !== 'undefined' ? ALL_INDICES_DATA[countryName] : null;
  if (!indices) {
    console.log('No index data for', countryName);
    createDiscretePanel(countryName, null);
    return;
  }
  
  const countryCode = COUNTRY_CODE_MAP[countryName] || 'UN';
  
  let panel = document.getElementById('country-detail-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'country-detail-panel';
    panel.className = 'mt-4 p-4 bg-white border rounded-lg shadow-sm';
    document.getElementById('indicators-list').after(panel);
  }
  
  const formatValue = (val) => val !== null && val !== undefined ? val.toFixed(2) : 'N/A';
  
  const getColor = (val, scale) => {
    if (val === null || val === undefined) return '#e9ecef';
    if (typeof ColorScales !== 'undefined' && ColorScales[scale]) {
      return ColorScales[scale](val);
    }
    return '#e9ecef';
  };
  
  const createRow = (label, value, colorScale, indent = 0) => {
    const color = getColor(value, colorScale);
    const displayVal = formatValue(value);
    const barWidth = value !== null && value !== undefined ? value * 100 : 0;
    const paddingLeft = indent * 12;
    
    return `
      <div class="flex items-center gap-2 py-1" style="padding-left: ${paddingLeft}px;">
        <span class="w-3 h-3 rounded-sm flex-shrink-0" style="background-color: ${color}"></span>
        <span class="text-xs flex-grow">${label}</span>
        <span class="text-xs font-mono w-8 text-right">${displayVal}</span>
        <div class="w-12 h-2 bg-gray-200 rounded overflow-hidden flex-shrink-0">
          <div class="h-full rounded" style="width: ${barWidth}%; background-color: ${color}"></div>
        </div>
      </div>
    `;
  };
  
  panel.innerHTML = `
    <div class="flex items-start gap-3 mb-3">
      <div class="flex-shrink-0">
        <img 
          src="https://flagcdn.com/w80/${countryCode.toLowerCase()}.png" 
          alt="${countryName} flag"
          class="w-12 h-8 object-cover rounded shadow-sm"
          onerror="this.src='https://via.placeholder.com/48x32/e5e7eb/6b7280?text=Flag'"
        >
      </div>
      <h3 class="font-bold text-lg text-gray-800">${countryName}</h3>
    </div>
    
    <div class="border-t pt-3">
      ${createRow('Overall Index', indices.overall_index, 'purple', 0)}
      
      <div class="mt-2 mb-1 text-xs text-gray-500 font-semibold">Comprehensiveness</div>
      ${createRow('Comprehensiveness Index', indices.comprehensiveness_index, 'blue', 1)}
      ${createRow('Years Coverage', indices.years_index, 'blue', 2)}
      ${createRow('Volume', indices.volume_index, 'blue', 2)}
      ${createRow('COFOG Coverage', indices.cofog_index, 'blue', 2)}
      
      <div class="mt-2 mb-1 text-xs text-gray-500 font-semibold">Accessibility</div>
      ${createRow('Accessibility Index', indices.accessibility_index, 'orange', 1)}
    </div>
  `;
}

function selectCountry(countryName, feature) {
  currentSelectedCountry = countryName;
  
  const items = document.querySelectorAll('#indicators-list button');
  items.forEach(item => {
    if (item.textContent === countryName || item.textContent.includes(countryName)) {
      item.classList.add('bg-blue-200', 'font-semibold');
    } else {
      item.classList.remove('bg-blue-200', 'font-semibold');
    }
  });
  
  if (geoJsonLayer) {
    geoJsonLayer.eachLayer(layer => {
      const layerCountryName = layer.feature.properties.ADMIN || 
                               layer.feature.properties.NAME || 
                               layer.feature.properties.name;
      
      if (layerCountryName === countryName) {
        layer.setStyle({
          weight: 3,
          color: '#0066cc',
          fillOpacity: 0.85
        });
        layer.bringToFront();
      } else {
        layer.setStyle(getCountryStyle(layer.feature));
      }
    });
  }
  
  createCountryPanel(countryName, feature);
}

// ============================================================================
// MAP LEGEND 
// ============================================================================

function addLegend() {
  const legend = L.control({ position: 'bottomright' });
  
  legend.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'info legend bg-white p-3 rounded shadow-lg');
    
    const datasetType = DataManager?.getCurrentType() || 'discrete';
    const colorScale = DataManager?.getCurrentColorScale() || null;
    
    div.innerHTML = '<h4 class="font-bold text-sm mb-2">Legend</h4>';
    
    if (datasetType === 'continuous' && colorScale && typeof ColorScales !== 'undefined') {
      const scaleFn = ColorScales[colorScale];
      const colors = [0, 0.25, 0.5, 0.75, 1].map(v => scaleFn(v));
      
      div.innerHTML += `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="text-xs">0</span>
          <div style="
            width: 120px; 
            height: 12px; 
            background: linear-gradient(to right, ${colors.join(', ')});
            border-radius: 2px;
          "></div>
          <span class="text-xs">1</span>
        </div>
        <div class="flex items-center gap-2 text-xs mt-2">
          <span class="w-3 h-3 rounded-sm" style="background-color: #e9ecef"></span>
          <span>No Data</span>
        </div>
      `;
    } else {
      div.innerHTML += `
        <div class="flex items-center gap-2 text-xs mb-1">
          <span class="w-3 h-3 rounded-sm" style="background-color: #5cb85c"></span>
          <span>Yes</span>
        </div>
        <div class="flex items-center gap-2 text-xs mb-1">
          <span class="w-3 h-3 rounded-sm" style="background-color: #dc3545"></span>
          <span>No</span>
        </div>
        <div class="flex items-center gap-2 text-xs mb-1">
          <span class="w-3 h-3 rounded-sm" style="background-color: #e9ecef"></span>
          <span>No Data</span>
        </div>
      `;
    }
    
    return div;
  };
  
  legend.addTo(map);
}

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', async function() {
  if (window.mapInitialized) return;
  window.mapInitialized = true;
  
  initMap('map');
});

// ============================================================================
// EXPOSE FUNCTIONS FOR DATAMANAGER
// ============================================================================
window.renderIndicatorsList = renderIndicatorsList;
window.fetchAndProcessGeoData = fetchAndProcessGeoData;
window.addCountryLayer = addCountryLayer;
window.addLegend = addLegend;