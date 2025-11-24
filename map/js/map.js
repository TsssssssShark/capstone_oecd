// ============================================================================
// OECD National Policy Evaluation Portals - Complete Interaction Script
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
  'France': 'FR',
  'Greece': 'GR',
  'Hungary': 'HU',
  'Iceland': 'IS',
  'Ireland': 'IE',
  'Italy': 'IT',
  'Japan': 'JP',
  'Latvia': 'LV',
  'Luxembourg': 'LU',
  'Mexico': 'MX',
  'Netherlands': 'NL',
  'New Zealand': 'NZ',
  'Norway': 'NO',
  'Poland': 'PL',
  'Portugal': 'PT',
  'Spain': 'ES',
  'Sweden': 'SE',
  'Switzerland': 'CH',
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
  map = L.map(containerId).setView([50, 10], 4);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);
  
  L.control.scale().addTo(map);
  
  // Add print control
  new L.easyPrint({
    title: 'Print map',
    position: 'topleft',
    sizeModes: ['Current', 'A4Portrait', 'A4Landscape']
  }).addTo(map);
  
  return map;
}

// ============================================================================
// DATA LOADING & PROCESSING
// ============================================================================

// Convert PORTAL_MAP_DATA to country-code indexed format
function buildPortalDataIndex() {
  const index = {};
  PORTAL_MAP_DATA.forEach(item => {
    const code = COUNTRY_CODE_MAP[item.country];
    if (code) {
      index[code] = {
        country: item.country,
        status: item.portal_status,
        color: item.color,
        label: item.label
      };
    }
  });
  return index;
}

// Create synthetic GeoJSON from World Countries
async function fetchAndProcessGeoData() {
  try {
    const geoResponse = await fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson');
    const geoData = await geoResponse.json();
    
    console.log('GeoJSON loaded with', geoData.features.length, 'countries');
    
    // Create a map of portal data by country name for easier lookup
    const portalMap = {};
    PORTAL_MAP_DATA.forEach(item => {
      portalMap[item.country.toLowerCase()] = item;
    });
    
    console.log('Portal countries:', Object.keys(portalMap));
    
    let matched = 0;
    let unmatched = [];
    
    // Merge portal data
    geoData.features.forEach(feature => {
      const geoCountryName = feature.properties.ADMIN || feature.properties.name || '';
      const normalizedName = geoCountryName.toLowerCase();
      
      // Try exact match first, then fuzzy match
      let portalItem = portalMap[normalizedName];
      
      if (portalItem) {
        feature.properties.portal_status = portalItem.portal_status;
        feature.properties.portal_color = portalItem.color;
        matched++;
      } else {
        feature.properties.portal_status = 'no data';
        feature.properties.portal_color = '#e9ecef';
        unmatched.push(geoCountryName);
      }
    });
    
    console.log(`Matched: ${matched}, Unmatched: ${unmatched.length}`);
    console.log('Unmatched countries:', unmatched.slice(0, 10));
    
    return geoData;
  } catch (error) {
    console.error('Error loading GeoJSON:', error);
    return null;
  }
}

// ============================================================================
// MAP LAYER RENDERING
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

function getCountryStyle(feature) {
  const status = feature.properties.portal_status || 'no data';
  const colorMap = {
    'yes': '#28a745',
    'no': '#dc3545',
    'developing': '#ffc107',
    'no data': '#e9ecef'
  };
  
  const fillColor = colorMap[status] || '#e9ecef';
  
  return {
    fillColor: fillColor,
    weight: 1.5,
    opacity: 1,
    color: '#666',
    fillOpacity: 0.8
  };
}

function onEachFeature(feature, layer) {
  const countryName = feature.properties.ADMIN;
  const status = feature.properties.portal_status || 'no data';
  const statusLabel = STATUS_COLORS[status] || 'No information';
  
  const popupContent = `
    <div class="p-3 text-sm">
      <h4 class="font-bold text-base mb-2">${countryName}</h4>
      <p><span class="font-semibold">Portal Status:</span> ${status}</p>
    </div>
  `;
  
  layer.bindPopup(popupContent);
  
  // Interactive events
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
// SIDEBAR INTERACTION
// ============================================================================

function renderIndicatorsList() {
  const indicatorsList = document.getElementById('indicators-list');
  indicatorsList.innerHTML = '';
  
  // Group countries by status
  const byStatus = {
    'yes': [],
    'no': [],
    'developing': [],
    'other': []
  };
  
  PORTAL_MAP_DATA.forEach(item => {
    const status = item.portal_status;
    byStatus[status] = byStatus[status] || [];
    byStatus[status].push(item);
  });
  
  // Render status groups
  const statusOrder = ['yes', 'no', 'developing'];
  
  statusOrder.forEach(status => {
    if (byStatus[status] && byStatus[status].length > 0) {
      const section = createStatusSection(status, byStatus[status]);
      indicatorsList.appendChild(section);
    }
  });
}

function createStatusSection(status, countries) {
  const section = document.createElement('div');
  section.className = 'border rounded-lg p-3 bg-gray-50';
  
  const statusLabels = {
    'yes': 'Has Portal',
    'no': 'No Portal',
    'developing': 'Under Development'
  };
  
  const statusColors = {
    'yes': '#28a745',
    'no': '#dc3545',
    'developing': '#ffc107'
  };
  
  const header = document.createElement('div');
  header.className = 'flex items-center gap-2 mb-3 font-semibold text-sm';
  header.innerHTML = `
    <span class="w-3 h-3 rounded-full" style="background-color: ${statusColors[status]}"></span>
    <span>${statusLabels[status]} (${countries.length})</span>
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
// COUNTRY SELECTION & DETAILS
// ============================================================================

function selectCountryByName(countryName) {
  if (geoJsonLayer) {
    geoJsonLayer.eachLayer(layer => {
      if (layer.feature.properties.ADMIN === countryName) {
        selectCountry(countryName, layer.feature);
      }
    });
  }
}

function selectCountry(countryName, feature) {
  currentSelectedCountry = countryName;
  
  // Update sidebar highlight
  const items = document.querySelectorAll('#indicators-list button');
  items.forEach(item => {
    if (item.textContent === countryName) {
      item.classList.add('bg-blue-200', 'font-semibold');
    } else {
      item.classList.remove('bg-blue-200', 'font-semibold');
    }
  });
  
  // Update map highlight
  if (geoJsonLayer) {
    geoJsonLayer.eachLayer(layer => {
      if (layer.feature.properties.ADMIN === countryName) {
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
  
  // Update header
  updateViewHeader(countryName, feature);
  
  // Zoom to country (optional)
  // map.fitBounds(geoJsonLayer.getBounds());
}

function updateViewHeader(countryName, feature) {
  const headerEl = document.getElementById('view-page-title');
  const status = feature.properties.portal_status || 'no data';
  const statusLabel = {
    'yes': 'Has Portal',
    'no': 'No Portal',
    'developing': 'Developing',
    'no data': 'No Data'
  }[status];
  
  headerEl.textContent = `${countryName}: ${statusLabel}`;
  headerEl.style.backgroundColor = feature.properties.portal_color || STATUS_COLORS.other;
}

// ============================================================================
// LEGEND
// ============================================================================

function addLegend() {
  const legend = L.control({ position: 'bottomright' });
  
  legend.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'info legend bg-white p-3 rounded shadow-lg');
    
    const items = [
      { status: 'yes', label: 'Has Portal' },
      { status: 'no', label: 'No Portal' },
      { status: 'developing', label: 'Under Development' },
      { status: 'other', label: 'No Data' }
    ];
    
    div.innerHTML = '<h4 class="font-bold text-sm mb-2">Portal Status</h4>';
    
    items.forEach(item => {
      const color = STATUS_COLORS[item.status] || STATUS_COLORS.other;
      const row = document.createElement('div');
      row.className = 'flex items-center gap-2 text-xs mb-1';
      row.innerHTML = `
        <span class="w-3 h-3 rounded-sm" style="background-color: ${color}"></span>
        <span>${item.label}</span>
      `;
      div.appendChild(row);
    });
    
    return div;
  };
  
  legend.addTo(map);
}

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', async function() {
  // Initialize map
  initMap('map');
  
  // Render sidebar
  renderIndicatorsList();
  
  // Load and add GeoJSON
  const geoData = await fetchAndProcessGeoData();
  if (geoData) {
    addCountryLayer(geoData);
    addLegend();
  } else {
    console.error('Failed to load geographic data');
  }
  
  // Auto-select first country
  if (PORTAL_MAP_DATA.length > 0) {
    selectCountryByName(PORTAL_MAP_DATA[0].country);
  }
});