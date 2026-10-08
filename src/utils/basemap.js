export const CARTO_KEY = import.meta.env.VITE_CARTO_API_KEY || '';
const keySuffix = CARTO_KEY ? `?key=${CARTO_KEY}` : '';

export const CARTO_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

export const CARTO_TILES = {
  dark: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png${keySuffix}`,
  light: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png${keySuffix}`,
  voyager: `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png${keySuffix}`
};
