/**
 * Utility functions for HTML sanitization and string escaping
 * Protects Leaflet HTML popups and tooltips from XSS (CWE-79)
 */

export const esc = (s) => {
  if (s === null || s === undefined) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

export default esc;
