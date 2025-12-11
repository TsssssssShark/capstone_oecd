const ColorScales = {
  // Blue Scale
  blue: function(value) {
    if (value === null || value === undefined || isNaN(value)) {
      return '#e9ecef'; 
    }
  
    return chroma.scale(['#cce5ff', '#004085'])(value).hex();
  },
  
  // Orange Scale
  orange: function(value) {
    if (value === null || value === undefined || isNaN(value)) {
      return '#e9ecef';
    }
    
    return chroma.scale(['#ffe5cc', '#d35400'])(value).hex();
  },
  
  // Purple Scale
  purple: function(value) {
    if (value === null || value === undefined || isNaN(value)) {
      return '#e9ecef';
    }
    
    return chroma.scale(['#e9d5ff', '#6b21a8'])(value).hex();
  },
  
  // Discrete Scale for 'yes'/'no'
  discrete: function(value) {
    if (value === 'yes') return '#5cb85c'; 
    if (value === 'no') return '#dc3545';  
    return '#e9ecef'; 
  }
};

window.ColorScales = ColorScales;
