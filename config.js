/**
 * SmartServe SMEs — Central API configuration
 *
 * LOCAL DEV:  set to 'http://localhost:5501'
 * PRODUCTION: https://smartserve-smes.onrender.com
 */

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5501'
  : 'https://smartserve-smes.onrender.com';

// Make available globally
window.API_BASE = API_BASE;
