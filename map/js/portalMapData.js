// Portal status with map styling
// Generated: 2025-12-04

const PORTAL_MAP_DATA = [
  {
    "country": "Australia",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Portal"
  },
  {
    "country": "Austria",
    "portal_status": "no",
    "color": "#dc3545",
    "label": "No Portal"
  },
  {
    "country": "Belgium",
    "portal_status": "no",
    "color": "#dc3545",
    "label": "No Portal"
  },
  {
    "country": "Canada",
    "portal_status": "no",
    "color": "#dc3545",
    "label": "No Portal"
  },
  {
    "country": "Chile",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Portal"
  },
  {
    "country": "Colombia",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Portal"
  },
  {
    "country": "Costa Rica",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Portal"
  },
  {
    "country": "Czechia",
    "portal_status": "no",
    "color": "#dc3545",
    "label": "No Portal"
  },
  {
    "country": "Denmark",
    "portal_status": "no",
    "color": "#dc3545",
    "label": "No Portal"
  },
  {
    "country": "Estonia",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Portal"
  },
  {
    "country": "Finland",
    "portal_status": "no",
    "color": "#dc3545",
    "label": "No Portal"
  },
  {
    "country": "France",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Portal"
  },
  {
    "country": "Germany",
    "portal_status": "no",
    "color": "#dc3545",
    "label": "No Portal"
  },
  {
    "country": "Greece",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Portal"
  },
  {
    "country": "Hungary",
    "portal_status": "developing",
    "color": "#ffc107",
    "label": "Under Development"
  },
  {
    "country": "Iceland",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Portal"
  },
  {
    "country": "Ireland",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Portal"
  },
  {
    "country": "Israel",
    "portal_status": "no",
    "color": "#dc3545",
    "label": "No Portal"
  },
  {
    "country": "Italy",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Portal"
  },
  {
    "country": "Japan",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Portal"
  },
  {
    "country": "Latvia",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Portal"
  },
  {
    "country": "Lithuania",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Portal"
  },
  {
    "country": "Luxembourg",
    "portal_status": "no",
    "color": "#dc3545",
    "label": "No Portal"
  },
  {
    "country": "Mexico",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Portal"
  },
  {
    "country": "New Zealand",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Portal"
  },
  {
    "country": "Norway",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Portal"
  },
  {
    "country": "Poland",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Portal"
  },
  {
    "country": "Portugal",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Portal"
  },
  {
    "country": "Slovak Republic",
    "portal_status": "no",
    "color": "#dc3545",
    "label": "No Portal"
  },
  {
    "country": "Slovenia",
    "portal_status": "no",
    "color": "#dc3545",
    "label": "No Portal"
  },
  {
    "country": "South Korea",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Portal"
  },
  {
    "country": "Spain",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Portal"
  },
  {
    "country": "Sweden",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Portal"
  },
  {
    "country": "Switzerland",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Portal"
  },
  {
    "country": "The Netherlands",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Portal"
  },
  {
    "country": "Turkey",
    "portal_status": "no",
    "color": "#dc3545",
    "label": "No Portal"
  },
  {
    "country": "United Kingdom",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Portal"
  },
  {
    "country": "United States",
    "portal_status": "no",
    "color": "#dc3545",
    "label": "No Portal"
  }
];

// Color mapping for legend
const STATUS_COLORS = {
  'yes': '#28a745',
  'no': '#dc3545',
  'developing': '#ffc107',
  'other': '#6c757d'
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PORTAL_MAP_DATA, STATUS_COLORS };
}
