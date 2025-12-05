// Portal status with map styling
// Generated: 2025-12-05

const PORTAL_DATA = [
  {
    "country": "Australia",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Yes"
  },
  {
    "country": "Austria",
    "portal_status": "no",
    "color": "#dc3545",
    "label": "No"
  },
  {
    "country": "Belgium",
    "portal_status": "no",
    "color": "#dc3545",
    "label": "No"
  },
  {
    "country": "Canada",
    "portal_status": "no",
    "color": "#dc3545",
    "label": "No"
  },
  {
    "country": "Chile",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Yes"
  },
  {
    "country": "Colombia",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Yes"
  },
  {
    "country": "Costa Rica",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Yes"
  },
  {
    "country": "Czechia",
    "portal_status": "no",
    "color": "#dc3545",
    "label": "No"
  },
  {
    "country": "Denmark",
    "portal_status": "no",
    "color": "#dc3545",
    "label": "No"
  },
  {
    "country": "Estonia",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Yes"
  },
  {
    "country": "Finland",
    "portal_status": "no",
    "color": "#dc3545",
    "label": "No"
  },
  {
    "country": "France",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Yes"
  },
  {
    "country": "Germany",
    "portal_status": "no",
    "color": "#dc3545",
    "label": "No"
  },
  {
    "country": "Greece",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Yes"
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
    "label": "Yes"
  },
  {
    "country": "Ireland",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Yes"
  },
  {
    "country": "Israel",
    "portal_status": "no",
    "color": "#dc3545",
    "label": "No"
  },
  {
    "country": "Italy",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Yes"
  },
  {
    "country": "Japan",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Yes"
  },
  {
    "country": "Latvia",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Yes"
  },
  {
    "country": "Lithuania",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Yes"
  },
  {
    "country": "Luxembourg",
    "portal_status": "no",
    "color": "#dc3545",
    "label": "No"
  },
  {
    "country": "Mexico",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Yes"
  },
  {
    "country": "New Zealand",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Yes"
  },
  {
    "country": "Norway",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Yes"
  },
  {
    "country": "Poland",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Yes"
  },
  {
    "country": "Portugal",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Yes"
  },
  {
    "country": "Slovak Republic",
    "portal_status": "no",
    "color": "#dc3545",
    "label": "No"
  },
  {
    "country": "Slovenia",
    "portal_status": "no",
    "color": "#dc3545",
    "label": "No"
  },
  {
    "country": "South Korea",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Yes"
  },
  {
    "country": "Spain",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Yes"
  },
  {
    "country": "Sweden",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Yes"
  },
  {
    "country": "Switzerland",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Yes"
  },
  {
    "country": "The Netherlands",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Yes"
  },
  {
    "country": "Turkey",
    "portal_status": "no",
    "color": "#dc3545",
    "label": "No"
  },
  {
    "country": "United Kingdom",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Yes"
  },
  {
    "country": "United States",
    "portal_status": "no",
    "color": "#dc3545",
    "label": "No"
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
