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

  // Removed the Ukraninan Flag for political neutrality: the flag in the credit is attributed to the creator of Leaflet who is an Ukrainian citizen
  map.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank">Leaflet</a>');
  
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
// DATA PROCESSING
// ============================================================================

async function fetchAndProcessGeoData() {
  try {
    // Fetch world countries GeoJSON
    const geoResponse = await fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson');
    const geoData = await geoResponse.json();
    
    console.log('GeoJSON loaded with', geoData.features.length, 'countries');
    
    // Create portal data lookup map
    const portalMap = {};
    PORTAL_DATA.forEach(item => {
      portalMap[item.country.toLowerCase()] = item;
      // Handle special cases
      if (item.country.toLowerCase() === 'the netherlands') {
        portalMap['netherlands'] = item;
      }
    });
    
    // Merge portal data with geo features
    let matched = 0;
    geoData.features.forEach(feature => {
      const geoCountryName = feature.properties.ADMIN || feature.properties.name || '';
      const normalizedName = geoCountryName.toLowerCase();
      
      // Find matching portal data
      let portalItem = portalMap[normalizedName];
      
      if (portalItem) {
        feature.properties.portal_status = portalItem.portal_status;
        feature.properties.portal_color = portalItem.color;
        feature.properties.portal_label = portalItem.label;
        matched++;
      } else {
        feature.properties.portal_status = 'no data';
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
  // Use color directly from data instead of hardcoded mapping
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
  // Remove existing layer if present
  if (geoJsonLayer) {
    map.removeLayer(geoJsonLayer);
  }
  
  // Add new GeoJSON layer with styling and interactions
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
  
  // Create popup content
  const popupContent = `
    <div class="p-3 text-sm">
      <h4 class="font-bold text-base mb-2">${countryName}</h4>
      <p><span class="font-semibold">Status:</span> ${label}</p>
    </div>
  `;
  
  layer.bindPopup(popupContent);
  
  // Add click event
  layer.on('click', function(e) {
    selectCountry(countryName, feature);
    L.DomEvent.stop(e);
  });
  
  // Add hover effects
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
  
  // Group countries by their label (dynamic, not hardcoded)
  const byLabel = {};
  const labelOrder = []; // To maintain order
  
  PORTAL_DATA.forEach(item => {
    const label = item.label || 'Unknown';
    if (!byLabel[label]) {
      byLabel[label] = {
        countries: [],
        color: item.color // Store color for this label group
      };
      labelOrder.push(label);
    }
    byLabel[label].countries.push(item);
  });
  
  // Render each group in order
  labelOrder.forEach(label => {
    const groupData = byLabel[label];
    if (groupData.countries.length > 0) {
      const section = createStatusSection(label, groupData.countries, groupData.color);
      indicatorsList.appendChild(section);
    }
  });
}

function createStatusSection(label, countries, groupColor) {
  // Create section container
  const section = document.createElement('div');
  section.className = 'border rounded-lg p-3 bg-gray-50';
  
  // Create header using dynamic label and color
  const header = document.createElement('div');
  header.className = 'flex items-center gap-2 mb-3 font-semibold text-sm';
  header.innerHTML = `
    <span class="w-3 h-3 rounded-full" style="background-color: ${groupColor}"></span>
    <span>${label} (${countries.length})</span>
  `;
  section.appendChild(header);
  
  // Create country list
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

function selectCountry(countryName, feature) {
  currentSelectedCountry = countryName;
  
  // Update sidebar highlighting
  const items = document.querySelectorAll('#indicators-list button');
  items.forEach(item => {
    if (item.textContent === countryName) {
      item.classList.add('bg-blue-200', 'font-semibold');
    } else {
      item.classList.remove('bg-blue-200', 'font-semibold');
    }
  });
  
  // Update map highlighting
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
  
  // Update header display
  updateViewHeader(countryName, feature);
}

function updateViewHeader(countryName, feature) {
  const headerEl = document.getElementById('view-page-title');
  if (!headerEl) return;
  
  // Use label directly from feature properties
  const label = feature.properties.portal_label || 'No Data';
  
  headerEl.textContent = `${countryName}: ${label}`;
  headerEl.style.backgroundColor = feature.properties.portal_color || '#e9ecef';
  headerEl.style.color = '#ffffff';
  headerEl.style.padding = '0.5rem 1rem';
  headerEl.style.borderRadius = '0.375rem';
}

// ============================================================================
// MAP LEGEND - Dynamic based on data
// ============================================================================

function addLegend() {
  const legend = L.control({ position: 'bottomright' });
  
  legend.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'info legend bg-white p-3 rounded shadow-lg');
    
    // Get unique labels and colors from data
    const uniqueLabels = {};
    PORTAL_DATA.forEach(item => {
      if (!uniqueLabels[item.label]) {
        uniqueLabels[item.label] = item.color;
      }
    });
    
    // Create legend title
    div.innerHTML = '<h4 class="font-bold text-sm mb-2">Legend</h4>';
    
    // Add each unique label to legend
    Object.entries(uniqueLabels).forEach(([label, color]) => {
      const row = document.createElement('div');
      row.className = 'flex items-center gap-2 text-xs mb-1';
      row.innerHTML = `
        <span class="w-3 h-3 rounded-sm" style="background-color: ${color}"></span>
        <span>${label}</span>
      `;
      div.appendChild(row);
    });
    
    // Add "No Data" option if needed
    const noDataRow = document.createElement('div');
    noDataRow.className = 'flex items-center gap-2 text-xs mb-1';
    noDataRow.innerHTML = `
      <span class="w-3 h-3 rounded-sm" style="background-color: #e9ecef"></span>
      <span>No Data</span>
    `;
    div.appendChild(noDataRow);
    
    return div;
  };
  
  legend.addTo(map);
}

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', async function() {
  // Check if data is available
  if (typeof PORTAL_DATA === 'undefined') {
    console.error('Portal data not available');
    return;
  }
  
  // Initialize map
  initMap('map');
  
  // Render sidebar with countries list
  renderIndicatorsList();
  
  // Load and process geographic data
  const geoData = await fetchAndProcessGeoData();
  if (geoData) {
    addCountryLayer(geoData);
    addLegend();
  } else {
    console.error('Failed to load geographic data');
  }
  
  // Auto-select first country if available
  if (PORTAL_DATA.length > 0) {
    selectCountryByName(PORTAL_DATA[0].country);
  }
});