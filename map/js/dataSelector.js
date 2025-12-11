const DataManager = {
    datasets: {
        'central_portal': {
            name: 'Central Portal',
            type: 'discrete',
            getData: () => typeof CENTRAL_PORTAL_DATA !== 'undefined' ? CENTRAL_PORTAL_DATA : []
        },
        'independent_website': {
            name: 'Independent Website',
            type: 'discrete',
            getData: () => typeof INDEPENDENT_WEBSITE_DATA !== 'undefined' ? INDEPENDENT_WEBSITE_DATA : []
        },
        'search_function': {
            name: 'Search Function',
            type: 'discrete',
            getData: () => typeof SEARCH_FUNCTION_DATA !== 'undefined' ? SEARCH_FUNCTION_DATA : []
        },
        'policy_categorisation': {
            name: 'Policy Categorisation',
            type: 'discrete',
            getData: () => typeof POLICY_CATEGORISATION_DATA !== 'undefined' ? POLICY_CATEGORISATION_DATA : []
        },
        'summary_available': {
            name: 'Summary Available',
            type: 'discrete',
            getData: () => typeof SUMMARY_AVAILABLE_DATA !== 'undefined' ? SUMMARY_AVAILABLE_DATA : []
        },
        'accessibility_tools': {
            name: 'Accessibility Tools',
            type: 'discrete',
            getData: () => typeof ACCESSIBILITY_TOOLS_DATA !== 'undefined' ? ACCESSIBILITY_TOOLS_DATA : []
        },
        'years_index': {
            name: 'Years Coverage Index',
            type: 'continuous',
            colorScale: 'blue',
            getData: () => typeof YEARS_INDEX_DATA !== 'undefined' ? YEARS_INDEX_DATA : []
        },
        'volume_index': {
            name: 'Volume Index',
            type: 'continuous',
            colorScale: 'blue',
            getData: () => typeof VOLUME_INDEX_DATA !== 'undefined' ? VOLUME_INDEX_DATA : []
        },
        'cofog_index': {
            name: 'COFOG Coverage Index',
            type: 'continuous',
            colorScale: 'blue',
            getData: () => typeof COFOG_INDEX_DATA !== 'undefined' ? COFOG_INDEX_DATA : []
        },
        'comprehensiveness_index': {
            name: 'Comprehensiveness Index',
            type: 'continuous',
            colorScale: 'blue',
            getData: () => typeof COMPREHENSIVENESS_INDEX_DATA !== 'undefined' ? COMPREHENSIVENESS_INDEX_DATA : []
        },
        'accessibility_index': {
            name: 'Accessibility Index',
            type: 'continuous',
            colorScale: 'orange',
            getData: () => typeof ACCESSIBILITY_INDEX_DATA !== 'undefined' ? ACCESSIBILITY_INDEX_DATA : []
        },
        'overall_index': {
            name: 'Overall Index',
            type: 'continuous',
            colorScale: 'purple',
            getData: () => typeof OVERALL_INDEX_DATA !== 'undefined' ? OVERALL_INDEX_DATA : []
        }
    },
    
    currentDataset: 'central_portal',
    
    init: function() {
        this.createDataSelector();
        this.loadDataset('central_portal');
    },
    
    getCurrentType: function() {
        return this.datasets[this.currentDataset]?.type || 'discrete';
    },
    
    getCurrentColorScale: function() {
        return this.datasets[this.currentDataset]?.colorScale || null;
    },
    
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
    
    switchDataset: function(datasetKey) {
        this.currentDataset = datasetKey;
        
        document.querySelectorAll('.dataset-btn').forEach(btn => {
            btn.classList.remove('bg-blue-500', 'text-white', 'border-blue-500');
            btn.classList.add('border-gray-300', 'hover:bg-gray-100');
        });
        
        const activeBtn = document.getElementById(`btn-${datasetKey}`);
        if (activeBtn) {
            activeBtn.classList.remove('border-gray-300', 'hover:bg-gray-100');
            activeBtn.classList.add('bg-blue-500', 'text-white', 'border-blue-500');
        }
        
        this.loadDataset(datasetKey);
    },
    
    loadDataset: function(datasetKey) {
        const dataset = this.datasets[datasetKey];
        if (!dataset) {
            console.error(`Dataset ${datasetKey} not found`);
            return;
        }
        
        const data = dataset.getData();
        if (!data || data.length === 0) {
            console.error(`Dataset ${datasetKey} is empty or not loaded`);
            return;
        }
        
        const coloredData = data.map(item => {
            let color;
            if (dataset.type === 'continuous') {
                const scaleFn = ColorScales[dataset.colorScale];
                color = scaleFn(item.value);
            } else {
                color = ColorScales.discrete(item.value);
            }
            
            return {
                ...item,
                color: color,
                label: this.formatLabel(item.value, dataset.type)
            };
        });
        
        window.PORTAL_DATA = coloredData;
        this.refreshMap();
    },
    
    formatLabel: function(value, type) {
        if (value === null || value === undefined) return 'No Data';
        if (type === 'continuous') {
            return value.toFixed(2);
        }
        return value === 'yes' ? 'Yes' : value === 'no' ? 'No' : String(value);
    },
    
    refreshMap: async function() {
        window.currentSelectedCountry = null;
        
        if (typeof window.renderIndicatorsList === 'function') {
            window.renderIndicatorsList();
        }
        
        if (typeof window.fetchAndProcessGeoData === 'function') {
            const geoData = await window.fetchAndProcessGeoData();
            
            if (geoData && typeof window.addCountryLayer === 'function') {
                window.addCountryLayer(geoData);
                
                const oldLegend = document.querySelector('.info.legend');
                if (oldLegend) {
                    oldLegend.remove();
                }
                
                if (typeof window.addLegend === 'function') {
                    window.addLegend();
                }
            }
        }
        
        const panel = document.getElementById('country-detail-panel');
        if (panel) {
            panel.remove();
        }
    }
};

window.DataManager = DataManager;