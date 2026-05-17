/**
 * SmartServe SMEs — Central API configuration
 *
 * LOCAL DEV:  set to 'http://localhost:5501'
 * PRODUCTION: set to your Render backend URL, e.g. 'https://smartserve-smes.onrender.com'
 *
 * This is the ONLY file you need to edit when switching between
 * local development and production.
 */

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5501'          // local dev
  : 'https://smartserve-smes.onrender.com'; // ← replace with your Render URL after deploying

// Make available globally
window.API_BASE = API_BASE;
