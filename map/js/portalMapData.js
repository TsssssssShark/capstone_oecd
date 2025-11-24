// Portal status with map styling
// Generated: 2025-11-24

const PORTAL_MAP_DATA = [
  {
    "country": "Australia",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Central Portal"
  },
  {
    "country": "Austria",
    "portal_status": "no",
    "color": "#dc3545",
    "label": "Without Central Portal"
  },
  {
    "country": "Belgium",
    "portal_status": "no",
    "color": "#dc3545",
    "label": "Without Central Portal"
  },
  {
    "country": "Canada",
    "portal_status": "no",
    "color": "#dc3545",
    "label": "Without Central Portal"
  },
  {
    "country": "Chile",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Central Portal"
  },
  {
    "country": "Colombia",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Central Portal"
  },
  {
    "country": "Costa Rica",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Central Portal"
  },
  {
    "country": "Czechia",
    "portal_status": "no",
    "color": "#dc3545",
    "label": "Without Central Portal"
  },
  {
    "country": "Denmark",
    "portal_status": "no",
    "color": "#dc3545",
    "label": "Without Central Portal"
  },
  {
    "country": "Estonia",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Central Portal"
  },
  {
    "country": "Finland",
    "portal_status": "no",
    "color": "#dc3545",
    "label": "Without Central Portal"
  },
  {
    "country": "France",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Central Portal"
  },
  {
    "country": "Germany",
    "portal_status": "no",
    "color": "#dc3545",
    "label": "Without Central Portal"
  },
  {
    "country": "Greece",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Central Portal"
  },
  {
    "country": "Hungary",
    "portal_status": "developing",
    "color": "#ffc107",
    "label": "Portal Under Development"
  },
  {
    "country": "Iceland",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Central Portal"
  },
  {
    "country": "Ireland",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Central Portal"
  },
  {
    "country": "Israel",
    "portal_status": "no",
    "color": "#dc3545",
    "label": "Without Central Portal"
  },
  {
    "country": "Italy",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Central Portal"
  },
  {
    "country": "Japan",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Central Portal"
  },
  {
    "country": "Latvia",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Central Portal"
  },
  {
    "country": "Lithuania",
    "portal_status": "developing",
    "color": "#ffc107",
    "label": "Portal Under Development"
  },
  {
    "country": "Luxembourg",
    "portal_status": "no",
    "color": "#dc3545",
    "label": "Without Central Portal"
  },
  {
    "country": "Mexico",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Central Portal"
  },
  {
    "country": "Netherlands",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Central Portal"
  },
  {
    "country": "New Zealand",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Central Portal"
  },
  {
    "country": "Norway",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Central Portal"
  },
  {
    "country": "Poland",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Central Portal"
  },
  {
    "country": "Portugal",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Central Portal"
  },
  {
    "country": "Slovak Republic",
    "portal_status": "no",
    "color": "#dc3545",
    "label": "Without Central Portal"
  },
  {
    "country": "Slovenia",
    "portal_status": "no",
    "color": "#dc3545",
    "label": "Without Central Portal"
  },
  {
    "country": "South Korea",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Central Portal"
  },
  {
    "country": "Spain",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Central Portal"
  },
  {
    "country": "Sweden",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Central Portal"
  },
  {
    "country": "Switzerland",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Central Portal"
  },
  {
    "country": "Turkey",
    "portal_status": "no",
    "color": "#dc3545",
    "label": "Without Central Portal"
  },
  {
    "country": "United Kingdom",
    "portal_status": "yes",
    "color": "#5cb85c",
    "label": "Has Central Portal"
  },
  {
    "country": "United States",
    "portal_status": "no",
    "color": "#dc3545",
    "label": "Without Central Portal"
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
