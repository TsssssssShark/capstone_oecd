// ============================================================================
// OECD National Policy Evaluation Portals 
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
  // Prevent duplicate initialization
  if (map) {
    return map;
  }
  
  map = L.map(containerId).setView([50, 10], 4);

  // Set attribution without Ukrainian flag for political neutrality
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
    // Fetch world countries GeoJSON from external source
    const geoResponse = await fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson');
    const geoData = await geoResponse.json();
    
    console.log('GeoJSON loaded with', geoData.features.length, 'countries');
    console.log('Current PORTAL_DATA has', PORTAL_DATA.length, 'items');
    console.log('First PORTAL_DATA item:', PORTAL_DATA[0]);
    
    // Create lookup map for portal data 
    const portalMap = {};
    PORTAL_DATA.forEach(item => {
      const normalizedName = item.country.toLowerCase();
      portalMap[normalizedName] = item;
      
      // Handle special naming cases for country matching
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
    
    // Merge portal data with geo features
    let matched = 0;
    geoData.features.forEach(feature => {
      const geoCountryName = feature.properties.ADMIN || feature.properties.name || '';
      const normalizedName = geoCountryName.toLowerCase();
      
      let portalItem = portalMap[normalizedName];
      
      if (portalItem) {
        // Copy portal data to feature properties for map rendering
        feature.properties.portal_value = portalItem.value;
        feature.properties.portal_color = portalItem.color;
        feature.properties.portal_label = portalItem.label;
        matched++;
      } else {
        // Default values for countries without data
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
  // Use color directly from data 
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
  // Remove existing layer before adding new one
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
  // Extract country name from various possible property names
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
  
  // Click event - select country
  layer.on('click', function(e) {
    selectCountry(countryName, feature);
    L.DomEvent.stop(e);
  });
  
  // Hover effect - highlight on mouseover
  layer.on('mouseover', function(e) {
    const lyr = e.target;
    lyr.setStyle({
      weight: 2.5,
      color: '#333',
      fillOpacity: 0.9
    });
    lyr.bringToFront();
  });
  
  // Reset style on mouseout (unless selected)
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
  
  // Clear existing content
  indicatorsList.innerHTML = '';
  
  // Group countries by their label 
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
  
  // Create header with color indicator and count
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
  // Find and select country by name (called from sidebar)
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
    // Find matching portal data entry
    const portalItem = PORTAL_DATA.find(item => item.country === countryName);
    if (!portalItem) return;
    
    // Get country code for flag display
    const countryCode = COUNTRY_CODE_MAP[countryName] || 'UN';
    
    // Create or update country detail panel
    let panel = document.getElementById('country-detail-panel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'country-detail-panel';
        panel.className = 'mt-4 p-4 bg-white border rounded-lg shadow-sm';
        document.getElementById('indicators-list').after(panel);
    }
    
    // Get current dataset name for display
    const currentDatasetName = DataManager?.datasets[DataManager?.currentDataset]?.name || 'Status';
    
    panel.innerHTML = `
        <div class="flex items-start gap-3">
            <!-- Country Flag -->
            <div class="flex-shrink-0">
                <img 
                    src="https://flagcdn.com/w80/${countryCode.toLowerCase()}.png" 
                    alt="${countryName} flag"
                    class="w-12 h-8 object-cover rounded shadow-sm"
                    onerror="this.src='https://via.placeholder.com/48x32/e5e7eb/6b7280?text=Flag'"
                >
            </div>
            
            <!-- Country Info -->
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

function selectCountry(countryName, feature) {
    // Update global selection state
    currentSelectedCountry = countryName;
    
    // Highlight selected country in sidebar
    const items = document.querySelectorAll('#indicators-list button');
    items.forEach(item => {
        if (item.textContent === countryName) {
            item.classList.add('bg-blue-200', 'font-semibold');
        } else {
            item.classList.remove('bg-blue-200', 'font-semibold');
        }
    });
    
    // Highlight selected country on map
    if (geoJsonLayer) {
        geoJsonLayer.eachLayer(layer => {
            const layerCountryName = layer.feature.properties.ADMIN || 
                                     layer.feature.properties.NAME || 
                                     layer.feature.properties.name;
            
            if (layerCountryName === countryName) {
                // Selected style
                layer.setStyle({
                    weight: 3,
                    color: '#0066cc',
                    fillOpacity: 0.85
                });
                layer.bringToFront();
            } else {
                // Reset to default style
                layer.setStyle(getCountryStyle(layer.feature));
            }
        });
    }
    
    // Create/update country detail panel
    createCountryPanel(countryName, feature);
}

// ============================================================================
// MAP LEGEND 
// ============================================================================

function addLegend() {
  const legend = L.control({ position: 'bottomright' });
  
  legend.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'info legend bg-white p-3 rounded shadow-lg');
    
    // Get unique labels and colors dynamically from current data
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
    
    // Add "No Data" entry
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
// Note: Map is initialized here, but data loading is controlled by DataManager
// ============================================================================

document.addEventListener('DOMContentLoaded', async function() {
  // Check if map is already initialized to prevent duplicates
  if (window.mapInitialized) return;
  window.mapInitialized = true;
  
  // Initialize map only - DataManager will handle data loading
  initMap('map');
});

// ============================================================================
// EXPOSE FUNCTIONS FOR DATAMANAGER
// These functions are called by DataManager.refreshMap()
// ============================================================================
window.renderIndicatorsList = renderIndicatorsList;
window.fetchAndProcessGeoData = fetchAndProcessGeoData;
window.addCountryLayer = addCountryLayer;
window.addLegend = addLegend;