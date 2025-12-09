// ============================================================================
// Data Manager - Controls dataset switching for the OECD Portal Map
// ============================================================================

const DataManager = {
    // Dataset registry
    datasets: {
        'central_portal': {
            name: 'Central Portal',
            getData: () => typeof CENTRAL_PORTAL_DATA !== 'undefined' ? CENTRAL_PORTAL_DATA : []
        },
        'independent_website': {
            name: 'Independent Website',
            getData: () => typeof INDEPENDENT_WEBSITE_DATA !== 'undefined' ? INDEPENDENT_WEBSITE_DATA : []
        },
        'search_function': {
            name: 'Search Function',
            getData: () => typeof SEARCH_FUNCTION_DATA !== 'undefined' ? SEARCH_FUNCTION_DATA : []
        },
        'policy_categorisation': {
            name: 'Policy Categorisation',
            getData: () => typeof POLICY_CATEGORISATION_DATA !== 'undefined' ? POLICY_CATEGORISATION_DATA : []
        },
        'summary_available': {
            name: 'Summary Available',
            getData: () => typeof SUMMARY_AVAILABLE_DATA !== 'undefined' ? SUMMARY_AVAILABLE_DATA : []
        }
    },
    
    currentDataset: 'central_portal',
    
    // Initialize the DataManager
    init: function() {
        this.createDataSelector();
        // Load default dataset on init
        this.loadDataset('central_portal');
    },
    
    // Create the dataset selector UI in the sidebar
    createDataSelector: function() {
        const selectorHTML = `
            <div id="data-selector" class="bg-gray-50 rounded-lg p-4 mb-4">
                <label class="block text-sm font-semibold text-gray-700 mb-3">
                    Select Indicator:
                </label>
                <div class="space-y-2">
                    ${Object.entries(this.datasets).map(([key, dataset]) => `
                        <button 
                            onclick="DataManager.switchDataset('${key}')"
                            id="btn-${key}"
                            class="w-full text-left px-3 py-2 rounded-md border transition dataset-btn ${
                                key === 'central_portal' 
                                ? 'bg-blue-500 text-white border-blue-500' 
                                : 'border-gray-300 hover:bg-gray-100'
                            }">
                            ${dataset.name}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        const container = document.querySelector('#map-topic .flex.flex-col.gap-4');
        if (container) {
            container.insertAdjacentHTML('afterbegin', selectorHTML);
        }
    },
    
    // Switch to a different dataset
    switchDataset: function(datasetKey) {
        this.currentDataset = datasetKey;
        
        // Update button styles 
        document.querySelectorAll('.dataset-btn').forEach(btn => {
            btn.classList.remove('bg-blue-500', 'text-white', 'border-blue-500');
            btn.classList.add('border-gray-300', 'hover:bg-gray-100');
        });
        
        // Add active state to selected button
        const activeBtn = document.getElementById(`btn-${datasetKey}`);
        if (activeBtn) {
            activeBtn.classList.remove('border-gray-300', 'hover:bg-gray-100');
            activeBtn.classList.add('bg-blue-500', 'text-white', 'border-blue-500');
        }
        
        this.loadDataset(datasetKey);
    },
    
    // Load a dataset and update the global PORTAL_DATA
    loadDataset: function(datasetKey) {
        const dataset = this.datasets[datasetKey];
        if (!dataset) {
            console.error(`Dataset ${datasetKey} not found`);
            return;
        }
        
        // Get data from the dataset's getData function
        const data = dataset.getData();
        
        if (!data || data.length === 0) {
            console.error(`Dataset ${datasetKey} is empty or not loaded`);
            return;
        }
        
        console.log(`Loading dataset: ${datasetKey} with ${data.length} items`);
        
        // Using JSON parse/stringify ensures complete independence from source
        window.PORTAL_DATA = JSON.parse(JSON.stringify(data));
        
        console.log('PORTAL_DATA updated successfully');
        console.log('First item:', window.PORTAL_DATA[0]);
        
        // Refresh the map with new data
        this.refreshMap();
    },  // 
    
    // Refresh the map and sidebar with current PORTAL_DATA
    refreshMap: async function() {
        // Reset country selection state
        window.currentSelectedCountry = null;
        
        // Refresh sidebar country list
        if (typeof window.renderIndicatorsList === 'function') {
            window.renderIndicatorsList();
        }
        
        // Reload geo data and re-render map
        if (typeof window.fetchAndProcessGeoData === 'function') {
            const geoData = await window.fetchAndProcessGeoData();
            
            if (geoData && typeof window.addCountryLayer === 'function') {
                window.addCountryLayer(geoData);
                
                // Remove old legend before adding new one
                const oldLegend = document.querySelector('.info.legend');
                if (oldLegend) {
                    oldLegend.remove();
                }
                
                // Add updated legend
                if (typeof window.addLegend === 'function') {
                    window.addLegend();
                }
            }
        }
        
        // Remove country detail panel 
        const panel = document.getElementById('country-detail-panel');
        if (panel) {
            panel.remove();
        }
    }
};

// Expose DataManager globally
window.DataManager = DataManager;