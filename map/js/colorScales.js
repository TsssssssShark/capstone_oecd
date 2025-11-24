const statusColors = {
  'yes': '#28a745',
  'no': '#dc3545',
  'developing': '#ffc107',
  'noData': '#e9ecef'
};

// Optional: if you need a gradient
const yearGradient = chroma.scale(['#deebf7', '#08519c']);

// Export
if (typeof module !== 'undefined') {
  module.exports = { statusColors, yearGradient };
}
