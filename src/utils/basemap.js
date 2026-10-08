export const CARTO_KEY = import.meta.env.VITE_CARTO_API_KEY || 'cb1_34ly_1_0922d1c895d7b40fd9f335f0';
const keySuffix = CARTO_KEY ? `?key=${CARTO_KEY}` : '';

export const CARTO_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

export const CARTO_TILES = {
  dark: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png${keySuffix}`,
  light: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png${keySuffix}`,
  voyager: `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png${keySuffix}`
};

export const NLSC_ATTRIBUTION = '&copy; <a href="https://maps.nlsc.gov.tw/" target="_blank">國土測繪圖資服務雲 (臺灣通用電子地圖)</a>';

export const NLSC_TILES = {
  emap: 'https://wmts.nlsc.gov.tw/wmts/EMAP/default/GoogleMapsCompatible/{z}/{y}/{x}',
  transparent: 'https://wmts.nlsc.gov.tw/wmts/EMAP2/default/GoogleMapsCompatible/{z}/{y}/{x}',
  grayscale: 'https://wmts.nlsc.gov.tw/wmts/EMAP01/default/GoogleMapsCompatible/{z}/{y}/{x}'
};
