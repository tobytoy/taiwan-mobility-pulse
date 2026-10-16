import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { esc } from '../utils/sanitize';
import { CARTO_TILES, CARTO_ATTRIBUTION, NLSC_TILES, NLSC_ATTRIBUTION } from '../utils/basemap';
import { Truck, Compass, ArrowRight, X, Sparkles, Navigation, Layers, ChevronRight, Activity, Calendar, Camera, Video, Play, ExternalLink } from 'lucide-react';
import { TDX_TOURISM_SPOTS } from '../data/tdxTourismMobilityData';

const BASEMAP_TILES = {
  emap: {
    name: '臺灣繁中',
    desc: '臺灣通用電子地圖 (NLSC)',
    url: NLSC_TILES.emap,
    attribution: NLSC_ATTRIBUTION,
    maxZoom: 19
  },
  dark: {
    name: '賽博深色',
    desc: 'Dark Matter',
    url: CARTO_TILES.dark,
    attribution: CARTO_ATTRIBUTION,
    subdomains: 'abcd',
    maxZoom: 19
  },
  satellite: {
    name: '高解析衛星',
    desc: 'ESRI Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    maxZoom: 18
  },
  osm: {
    name: '開放街圖',
    desc: 'OpenStreetMap (Voyager)',
    url: CARTO_TILES.voyager,
    attribution: CARTO_ATTRIBUTION,
    subdomains: 'abcd',
    maxZoom: 19
  },
  light: {
    name: '極簡淺色',
    desc: 'Positron',
    url: CARTO_TILES.light,
    attribution: CARTO_ATTRIBUTION,
    subdomains: 'abcd',
    maxZoom: 19
  }
};

const REGION_BOUNDS = {
  all: { center: [23.9, 120.9], zoom: 8 },
  North: { center: [25.05, 121.50], zoom: 10 },
  Central: { center: [24.15, 120.65], zoom: 10 },
  South: { center: [22.65, 120.32], zoom: 10 },
  East: { center: [24.30, 121.70], zoom: 9 }
};

export default function FlowMap({
  corridors = [],
  stationsGeo = {},
  selectedMode = 'all',
  selectedRegion = 'all',
  selectedPaxType = 'all', // 'all', 'commuter', 'tourist', 'freight', 'senior', 'student'
  selectedDayType = 'workday_sunny', // 'workday_sunny', 'holiday_sunny', etc.
  basemap = 'dark',
  currentHour = 8,
  onSelectStation,
  selectedStation,
  onSelectCorridor,
  selectedCorridor
}) {
  const [currentZoom, setCurrentZoom] = useState(8);
  const [corridorFilterTab, setCorridorFilterTab] = useState('all'); // 'all', 'freight', 'tourist', 'commuter'
  const [isQuickNavOpen, setIsQuickNavOpen] = useState(true);
  const [showCctvMarkers, setShowCctvMarkers] = useState(false);
  const [activeCctvSpot, setActiveCctvSpot] = useState(null);

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const tileLayerRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const particlesRef = useRef([]);
  const markersRef = useRef([]);
  const cctvMarkersRef = useRef([]);

  const isHoliday = selectedDayType.startsWith('holiday') || selectedDayType === 'Weekend' || selectedDayType === 'Holiday';
  const isHeavyRain = selectedDayType.includes('heavy_rain');
  const isRain = selectedDayType.includes('rainy') || (selectedDayType.endsWith('rain') && !isHeavyRain);
  const isCloudy = selectedDayType.includes('cloudy');
  const isSunny = selectedDayType.includes('sunny') || selectedDayType.endsWith('clear');

  // 1. 初始化 Leaflet 地圖
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [23.9, 120.9],
      zoom: 8,
      minZoom: 7,
      maxZoom: 16,
      zoomControl: false,
      attributionControl: false
    });

    tileLayerRef.current = L.tileLayer(BASEMAP_TILES[basemap]?.url || BASEMAP_TILES.emap.url, {
      attribution: BASEMAP_TILES[basemap]?.attribution || BASEMAP_TILES.emap.attribution,
      subdomains: BASEMAP_TILES[basemap]?.subdomains || 'abcd',
      maxZoom: BASEMAP_TILES[basemap]?.maxZoom || 19
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapRef.current = map;

    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    // 建立 Canvas Overlay
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '350';
    map.getPanes().overlayPane.appendChild(canvas);
    canvasRef.current = canvas;

    const resizeCanvas = () => {
      const size = map.getSize();
      canvas.width = size.x * window.devicePixelRatio;
      canvas.height = size.y * window.devicePixelRatio;
      canvas.style.width = `${size.x}px`;
      canvas.style.height = `${size.y}px`;
    };

    resizeCanvas();
    map.on('resize', resizeCanvas);
    map.on('move', () => {
      const bounds = map.getBounds();
      const nw = map.latLngToLayerPoint(bounds.getNorthWest());
      canvas.style.transform = `translate3d(${nw.x}px, ${nw.y}px, 0px)`;
    });

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. 切換底圖圖層 (Basemap Switching)
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;
    mapRef.current.removeLayer(tileLayerRef.current);
    tileLayerRef.current = L.tileLayer(BASEMAP_TILES[basemap]?.url || BASEMAP_TILES.emap.url, {
      attribution: BASEMAP_TILES[basemap]?.attribution || BASEMAP_TILES.emap.attribution,
      subdomains: BASEMAP_TILES[basemap]?.subdomains || 'abcd',
      maxZoom: BASEMAP_TILES[basemap]?.maxZoom || 19
    }).addTo(mapRef.current);
  }, [basemap]);

  // 3. 切換區域視角平移 (Region View Change)
  useEffect(() => {
    if (!mapRef.current) return;
    const target = REGION_BOUNDS[selectedRegion] || REGION_BOUNDS.all;
    mapRef.current.flyTo(target.center, target.zoom, {
      duration: 1.2,
      easeLinearity: 0.25
    });
  }, [selectedRegion]);

  // 4. 繪製車站/樞紐標記點 (Station Markers) - 隨縮放等級動態調校半徑，並凸顯貨運樞紐與觀光名勝
  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach(m => mapRef.current.removeLayer(m));
    markersRef.current = [];

    const isMacroView = (currentZoom <= 9 && selectedRegion === 'all');

    const filteredCorridors = corridors.filter(c => {
      const matchMode = selectedMode === 'all' || c.mode_id === selectedMode;
      const matchRegion = selectedRegion === 'all' || c.region === selectedRegion;
      const matchPax = selectedPaxType === 'all' || c.pax_type === selectedPaxType;
      if (!matchMode || !matchRegion || !matchPax) return false;

      // 全島宏觀視角 LOD：隱藏短距走廊避免擠成發光團塊；區域放大時展開完整微觀接駁
      if (isMacroView && c.origin_coord && c.dest_coord) {
        const dKm = Math.hypot((c.origin_coord[0] - c.dest_coord[0]) * 111, (c.origin_coord[1] - c.dest_coord[1]) * 102);
        if (dKm < 2.5 && c.mode_id !== 'thsr' && c.mode_id !== 'tra' && c.pax_type !== 'freight') return false;
      }
      return true;
    });

    const activeStations = new Set();
    filteredCorridors.forEach(c => {
      activeStations.add(c.origin);
      activeStations.add(c.destination);
    });

    const baseRadius = currentZoom <= 8 ? 3.0 : currentZoom <= 10 ? 4.5 : 6.5;

    Object.entries(stationsGeo).forEach(([name, coords]) => {
      if (activeStations.size > 0 && !activeStations.has(name)) return;

      const isSelected = selectedStation === name;
      const isFreightHub = name.includes('港') || name.includes('物流') || name.includes('科學園區') || name.includes('中科') || name.includes('南科') || name.includes('工業') || name.includes('園區') || name.includes('貨運');
      const isTourismHub = name.includes('礁溪') || name.includes('溫泉') || name.includes('夜市') || name.includes('太魯閣') || name.includes('七星潭') || name.includes('大溪') || name.includes('九份') || name.includes('日月潭') || name.includes('鹿港') || name.includes('阿里山') || name.includes('墾丁');

      const markerColor = isSelected ? '#38BDF8' 
        : isFreightHub ? '#10B981' 
        : isTourismHub ? '#F97316' 
        : '#F8FAFC';

      const hubBadge = isFreightHub ? '<span style="color: #10B981; font-weight:700;">[🚛 產業物流樞紐]</span>'
        : isTourismHub ? '<span style="color: #F97316; font-weight:700;">[🧳 觀光名勝]</span>'
        : '<span style="color: #38BDF8;">●</span>';

      const marker = L.circleMarker(coords, {
        radius: isSelected ? baseRadius + 4.0 : (isFreightHub || isTourismHub) ? baseRadius + 1.2 : baseRadius,
        fillColor: markerColor,
        color: isSelected ? '#38BDF8' : '#0F172A',
        weight: isSelected ? 2.8 : 1.2,
        opacity: 0.95,
        fillOpacity: isSelected ? 1 : 0.85
      });

      marker.bindTooltip(`
        <div style="font-family: Outfit, sans-serif; font-size: 12px; font-weight: 600; padding: 2px 4px;">
          ${hubBadge} ${esc(name)}
        </div>
      `, { className: 'custom-leaflet-tooltip', direction: 'top', offset: [0, -6] });

      marker.on('click', () => {
        if (onSelectStation) onSelectStation(name);
      });

      marker.addTo(mapRef.current);
      markersRef.current.push(marker);
    });
  }, [corridors, stationsGeo, selectedMode, selectedRegion, selectedPaxType, selectedStation, currentZoom]);

  // 4b. 觀光署 74 處景點即時影像 (CCTV) 圖層渲染與彈出視窗
  useEffect(() => {
    if (!mapRef.current) return;

    cctvMarkersRef.current.forEach(m => mapRef.current.removeLayer(m));
    cctvMarkersRef.current = [];

    const shouldShow = showCctvMarkers || selectedPaxType === 'tourist' || corridorFilterTab === 'tourist';
    if (!shouldShow) return;

    TDX_TOURISM_SPOTS.forEach(spot => {
      if (!spot.lat || !spot.lon) return;

      const marker = L.circleMarker([spot.lat, spot.lon], {
        radius: 6,
        fillColor: '#F59E0B',
        color: '#FFFFFF',
        weight: 1.5,
        opacity: 0.95,
        fillOpacity: 0.9
      });

      const popupContent = `
        <div style="font-family: Outfit, -apple-system, sans-serif; min-width: 220px; color: #0F172A; padding: 2px;">
          <div style="font-weight: 800; font-size: 13.5px; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between;">
            <span>📷 ${esc(spot.location)}</span>
            <span style="font-size: 10px; background: #FEF3C7; color: #B45309; padding: 2px 6px; border-radius: 4px; font-weight: 700;">${esc(spot.county_name)}</span>
          </div>
          <div style="font-size: 11px; color: #64748B; margin-bottom: 6px;">
            視角: ${esc(spot.view_type)} · 狀態: <strong style="color: #059669;">${esc(spot.status)}</strong>
          </div>
          <div style="font-size: 11px; background: #FFFBEB; padding: 5px 8px; border-radius: 6px; border: 1px solid #FDE68A; margin-bottom: 8px;">
            🚗 假日車流爆發: <strong style="color: #D97706;">${esc(spot.mobility_profile?.holiday_surge || '+320%')}</strong><br/>
            🛣️ 聯外動脈: <span style="color: #334155;">${esc(spot.mobility_profile?.connected_corridor || '主要幹線')}</span>
          </div>
          <button 
            id="cctv-flow-btn-${spot.id}"
            style="width: 100%; padding: 7px 10px; background: #EF4444; color: #FFFFFF; border: none; border-radius: 6px; font-weight: 700; font-size: 11px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;"
          >
            ▶️ 觀看現場 CCTV 串流
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`cctv-flow-btn-${spot.id}`);
        if (btn) {
          btn.onclick = () => {
            setActiveCctvSpot(spot);
          };
        }
      });

      marker.bindTooltip(`📷 ${esc(spot.location)} [${esc(spot.county_name)}]`, {
        className: 'custom-leaflet-tooltip',
        direction: 'top',
        offset: [0, -6]
      });

      marker.addTo(mapRef.current);
      cctvMarkersRef.current.push(marker);
    });
  }, [showCctvMarkers, selectedPaxType, corridorFilterTab]);

  // 5. 隨時間 (currentHour)、日型 (isHoliday) 與天候 (selectedDayType) 動態粒子與弧線渲染
  useEffect(() => {
    if (!mapRef.current || !canvasRef.current) return;

    const isMacroView = (currentZoom <= 9 && selectedRegion === 'all');

    const filteredCorridors = corridors.filter(c => {
      const matchMode = selectedMode === 'all' || c.mode_id === selectedMode;
      const matchRegion = selectedRegion === 'all' || c.region === selectedRegion;
      const matchPax = selectedPaxType === 'all' || c.pax_type === selectedPaxType;
      if (!matchMode || !matchRegion || !matchPax) return false;

      if (isMacroView && c.origin_coord && c.dest_coord) {
        const dKm = Math.hypot((c.origin_coord[0] - c.dest_coord[0]) * 111, (c.origin_coord[1] - c.dest_coord[1]) * 102);
        if (dKm < 2.5 && c.mode_id !== 'thsr' && c.mode_id !== 'tra' && c.pax_type !== 'freight') return false;
      }
      return true;
    });

    const particles = [];
    filteredCorridors.forEach((corr) => {
      let hourFactor = corr.hourly_curve ? corr.hourly_curve[currentHour] : 0.5;
      
      // === 日型與流向彈性係數 (上班日 vs 假日巨大差異機制) ===
      if (corr.day_type_factor) {
        // 自定義日型倍率
        hourFactor *= isHoliday ? (corr.day_type_factor.holiday ?? 1) : (corr.day_type_factor.workday ?? 1);
      } else if (isHoliday) {
        // 放假日 (Holiday)
        if (corr.pax_type === 'commuter') hourFactor *= 0.35; // 假日通勤降 65%
        if (corr.pax_type === 'tourist') {
          hourFactor *= isHeavyRain ? 0.45 : isRain ? 0.85 : isCloudy ? 2.50 : 3.20; // 假日觀光全線大爆發 (3.2x)
        }
        if (corr.pax_type === 'freight') {
          hourFactor *= 0.22; // 假日工廠海關休眠，貨物流大幅減少 (-78%)
        }
        if (corr.pax_type === 'senior') {
          hourFactor *= isHeavyRain ? 0.28 : isRain ? 0.44 : isCloudy ? 0.95 : 0.85;
        }
        if (corr.pax_type === 'student') hourFactor *= (isHeavyRain ? 0.12 : 0.20);
      } else {
        // 上班日 (Workday)
        if (corr.pax_type === 'freight') {
          hourFactor *= 1.45; // 上班日全台產業物流全力奔馳 (+45%)
        }
        if (corr.pax_type === 'tourist') {
          hourFactor *= (isHeavyRain ? 0.15 : isRain ? 0.20 : 0.28); // 上班日觀光低溫休止 (-72%)
        }
        if (corr.pax_type === 'commuter') {
          hourFactor *= 1.15; // 上班日常態通勤雙尖峰滿載
        }
        if (corr.pax_type === 'senior') {
          if (isHeavyRain) hourFactor *= 0.45;
          else if (isRain) hourFactor *= 0.72;
          else if (isCloudy) hourFactor *= 1.05;
        }
      }

      // 天候四段降雨對不同運具的粒子彈性調節
      if (isHeavyRain) {
        if (corr.mode_id === 'taipei_bike' || corr.mode_id === 'bike' || /bike|ubike|youbike/i.test(corr.corridor_id || corr.name || '')) {
          hourFactor *= 0.19; // 豪大雨 YouBike 幾近停擺 (-81%)
        } else if (corr.mode_id === 'tpe_bus' || corr.mode_id === 'bus' || /bus/i.test(corr.mode_id || '')) {
          hourFactor *= 1.14; // 公車承接短程避雨 (+14%)
        } else if (corr.mode_id === 'trtc' || corr.mode_id === 'metro' || /metro|trtc/i.test(corr.mode_id || '')) {
          hourFactor *= 1.22; // 地下捷運避雨大聚集 (+22%)
        } else if (corr.mode_id === 'thb_bus' || corr.pax_type === 'freight') {
          hourFactor *= 0.75; // 豪雨視線差，國道大車減速延誤 (-25%)
        }
      } else if (isRain) {
        if (corr.mode_id === 'taipei_bike' || corr.mode_id === 'bike' || /bike|ubike|youbike/i.test(corr.corridor_id || corr.name || '')) {
          hourFactor *= 0.46; // YouBike 斷鏈 (-54%)
        } else if (corr.mode_id === 'tpe_bus' || corr.mode_id === 'bus' || /bus/i.test(corr.mode_id || '')) {
          hourFactor *= 1.15; // 市區公車湧浪承接 (+15%)
        } else if (corr.mode_id === 'trtc' || corr.mode_id === 'metro' || /metro|trtc/i.test(corr.mode_id || '')) {
          hourFactor *= 1.10; // 地下捷運避雨湧入 (+10%)
        } else if (corr.mode_id === 'thb_bus') {
          hourFactor *= 0.85; // 國道客運受道路塞車影響 (-15%)
        }
      } else if (isCloudy) {
        if (corr.mode_id === 'taipei_bike' || corr.mode_id === 'bike' || /bike|ubike|youbike/i.test(corr.corridor_id || corr.name || '')) {
          hourFactor *= 1.05; // 陰天體感涼爽無雨，騎乘意願最高 (+5%)
        }
      }

      const isFocused = selectedCorridor && (
        selectedCorridor.corridor_id === corr.corridor_id ||
        (selectedCorridor.origin === corr.origin && selectedCorridor.destination === corr.destination)
      );

      const maxCount = Math.min(16, Math.max(3, Math.floor(Math.log10(corr.total_vol || 10000) * 3.2)));
      const activeCount = Math.round(maxCount * Math.min(1.5, Math.max(0.15, hourFactor)));

      for (let i = 0; i < (isFocused ? activeCount * 1.5 : activeCount); i++) {
        particles.push({
          corridor: corr,
          progress: Math.random(),
          speed: (0.003 + Math.random() * 0.004) * (0.6 + hourFactor * 0.8) * (isHeavyRain ? 0.75 : isRain ? 0.88 : isCloudy ? 0.98 : 1.0) * (isFocused ? 1.4 : 1.0),
          color: corr.color || '#38BDF8',
          paxType: corr.pax_type,
          hourFactor: hourFactor,
          isFocused: isFocused
        });
      }
    });
    particlesRef.current = particles;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const render = () => {
      if (!mapRef.current) return;
      const map = mapRef.current;
      const dpr = window.devicePixelRatio || 1;
      const bounds = map.getBounds();
      const nw = map.latLngToLayerPoint(bounds.getNorthWest());

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      // 繪製 OD 弧線背景光暈
      filteredCorridors.forEach(corr => {
        let hourFactor = corr.hourly_curve ? corr.hourly_curve[currentHour] : 0.5;
        if (corr.day_type_factor) {
          hourFactor *= isHoliday ? (corr.day_type_factor.holiday ?? 1) : (corr.day_type_factor.workday ?? 1);
        } else if (isHoliday) {
          if (corr.pax_type === 'commuter') hourFactor *= 0.35;
          if (corr.pax_type === 'tourist') hourFactor *= isRain ? 0.85 : 3.20;
          if (corr.pax_type === 'freight') hourFactor *= 0.22;
          if (corr.pax_type === 'senior') hourFactor *= isRain ? 0.44 : 0.85;
          if (corr.pax_type === 'student') hourFactor *= 0.20;
        } else {
          if (corr.pax_type === 'freight') hourFactor *= 1.45;
          if (corr.pax_type === 'tourist') hourFactor *= 0.28;
          if (corr.pax_type === 'commuter') hourFactor *= 1.15;
          if (corr.pax_type === 'senior' && isRain) hourFactor *= 0.72;
        }

        if (isRain) {
          if (corr.mode_id === 'taipei_bike' || corr.mode_id === 'bike' || /bike|ubike|youbike/i.test(corr.corridor_id || corr.name || '')) {
            hourFactor *= 0.46;
          } else if (corr.mode_id === 'tpe_bus' || corr.mode_id === 'bus' || /bus/i.test(corr.mode_id || '')) {
            hourFactor *= 1.15;
          } else if (corr.mode_id === 'trtc' || corr.mode_id === 'metro' || /metro|trtc/i.test(corr.mode_id || '')) {
            hourFactor *= 1.10;
          }
        }
        if (hourFactor < 0.02) return;

        const p1 = map.latLngToLayerPoint(corr.origin_coord);
        const p2 = map.latLngToLayerPoint(corr.dest_coord);

        const x1 = p1.x - nw.x;
        const y1 = p1.y - nw.y;
        const x2 = p2.x - nw.x;
        const y2 = p2.y - nw.y;

        const isFocused = selectedCorridor && (
          selectedCorridor.corridor_id === corr.corridor_id ||
          (selectedCorridor.origin === corr.origin && selectedCorridor.destination === corr.destination)
        );

        const dx = x2 - x1;
        const dy = y2 - y1;
        const side = (corr.origin || '') > (corr.destination || '') ? 1 : -1;
        const cx = (x1 + x2) / 2 - dy * 0.15 * side;
        const cy = (y1 + y2) / 2 + dx * 0.15 * side;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(cx, cy, x2, y2);

        const alpha = isFocused ? 'ff' : Math.floor(Math.min(255, Math.max(30, hourFactor * 160))).toString(16).padStart(2, '0');
        ctx.strokeStyle = isFocused ? '#FFFFFF' : (corr.color + alpha);
        ctx.lineWidth = isFocused ? 4.5 : Math.min(3.6, Math.max(0.8, hourFactor * 3.0));
        ctx.stroke();
      });

      // 繪製動態粒子
      particlesRef.current.forEach(p => {
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;

        const p1 = map.latLngToLayerPoint(p.corridor.origin_coord);
        const p2 = map.latLngToLayerPoint(p.corridor.dest_coord);

        const x1 = p1.x - nw.x;
        const y1 = p1.y - nw.y;
        const x2 = p2.x - nw.x;
        const y2 = p2.y - nw.y;

        const dx = x2 - x1;
        const dy = y2 - y1;
        const side = (p.corridor.origin || '') > (p.corridor.destination || '') ? 1 : -1;
        const cx = (x1 + x2) / 2 - dy * 0.15 * side;
        const cy = (y1 + y2) / 2 + dx * 0.15 * side;

        const t = p.progress;
        const px = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2;
        const py = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2;

        ctx.beginPath();
        const pRadius = (p.isFocused ? 3.0 : 2.0) + p.hourFactor * 1.5;
        ctx.arc(px, py, pRadius, 0, Math.PI * 2);
        ctx.fillStyle = p.isFocused ? '#FFFFFF' : p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = (p.isFocused ? 12 : 5) + p.hourFactor * 5;
        ctx.fill();
      });

      ctx.restore();
      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [corridors, selectedMode, selectedRegion, selectedPaxType, selectedDayType, currentHour, selectedCorridor, currentZoom]);

  // 篩選出代表性走廊清單供快捷雷達選取
  const spotlightCorridors = useMemo(() => {
    return corridors.filter(c => {
      if (corridorFilterTab === 'freight') return c.pax_type === 'freight';
      if (corridorFilterTab === 'tourist') return c.pax_type === 'tourist';
      if (corridorFilterTab === 'commuter') return c.pax_type === 'commuter';
      return c.pax_type === 'freight' || c.pax_type === 'tourist';
    });
  }, [corridors, corridorFilterTab]);

  const handleCorridorClick = (corr) => {
    if (onSelectCorridor) onSelectCorridor(corr);
    if (mapRef.current && corr.origin_coord && corr.dest_coord) {
      const midLat = (corr.origin_coord[0] + corr.dest_coord[0]) / 2;
      const midLng = (corr.origin_coord[1] + corr.dest_coord[1]) / 2;
      mapRef.current.flyTo([midLat, midLng], 10, { duration: 1.0 });
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '380px', overflow: 'hidden' }}>
      <div 
        ref={mapContainerRef} 
        role="region"
        aria-label="全台多模態動態人流走廊地圖"
        tabIndex={0}
        style={{ width: '100%', height: '100%', minHeight: '380px', background: '#07090E' }} 
      />

      {/* Floating Top Banner: Workday vs Holiday Flow Dynamic Alert */}
      <div style={{
        position: 'absolute',
        top: '68px',
        left: '16px',
        zIndex: 390,
        background: isHoliday ? 'rgba(249, 115, 22, 0.16)' : 'rgba(16, 185, 129, 0.16)',
        backdropFilter: 'blur(10px)',
        border: isHoliday ? '1px solid rgba(249, 115, 22, 0.45)' : '1px solid rgba(16, 185, 129, 0.45)',
        borderRadius: '10px',
        padding: '6px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '9px',
        fontSize: '11.5px',
        color: '#F8FAFC',
        boxShadow: isHoliday ? '0 4px 16px rgba(249, 115, 22, 0.25)' : '0 4px 16px rgba(16, 185, 129, 0.25)',
        pointerEvents: 'none'
      }}>
        <span style={{ fontSize: '14px' }}>{isHoliday ? '🏖️' : '💼'}</span>
        <div>
          <strong style={{ color: isHoliday ? '#FB923C' : '#34D399' }}>
            {isHoliday ? '【放假日流向實證】' : '【上班日流向實證】'}
          </strong>
          <span style={{ color: '#E2E8F0', marginLeft: '6px' }}>
            {isHoliday 
              ? '🧳 觀光旅遊大爆發 (320% 狂飆噴發) · 國五雪隧/日月潭景點高度飽和 · 🚛 產業物流休眠熄火 (-78%)'
              : '🚛 國道產業物流全線巔峰奔馳 (145%) · 💼 都會通勤早晚雙尖峰 · 🧳 跨城觀光旅遊降至低溫基期 (28%)'}
          </span>
        </div>
      </div>

      {/* 🧭 核心流向觀測台 (Corridor Quick Selector Strip) */}
      <div style={{
        position: 'absolute',
        bottom: '88px',
        left: '16px',
        zIndex: 400,
        maxWidth: 'calc(100% - 32px)',
        background: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '12px',
        padding: '8px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Navigation size={13} color="#38BDF8" />
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#F8FAFC' }}>🧭 核心動態流向觀測台：</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[
                { id: 'all', label: '全部重點' },
                { id: 'freight', label: '🚛 產業貨物 (eTag)', color: '#10B981' },
                { id: 'tourist', label: '🧳 觀光旅遊 (eTag)', color: '#F97316' },
                { id: 'commuter', label: '💼 都會通勤', color: '#38BDF8' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setCorridorFilterTab(tab.id)}
                  style={{
                    padding: '2px 7px',
                    borderRadius: '5px',
                    fontSize: '10px',
                    fontWeight: corridorFilterTab === tab.id ? '700' : '500',
                    border: corridorFilterTab === tab.id ? `1px solid ${tab.color || '#38BDF8'}` : '1px solid transparent',
                    background: corridorFilterTab === tab.id ? `${tab.color || '#38BDF8'}25` : 'rgba(255,255,255,0.04)',
                    color: corridorFilterTab === tab.id ? (tab.color || '#38BDF8') : '#94A3B8',
                    cursor: 'pointer'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCctvMarkers(!showCctvMarkers)}
              style={{
                marginLeft: '8px',
                padding: '2px 8px',
                borderRadius: '5px',
                fontSize: '10px',
                fontWeight: showCctvMarkers ? '800' : '600',
                border: showCctvMarkers ? '1px solid #F59E0B' : '1px solid rgba(245, 158, 11, 0.3)',
                background: showCctvMarkers ? 'rgba(245, 158, 11, 0.25)' : 'rgba(245, 158, 11, 0.08)',
                color: showCctvMarkers ? '#FCD34D' : '#F59E0B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Camera size={11} />
              <span>📷 74處觀光CCTV {showCctvMarkers ? '(開)' : '(關)'}</span>
            </button>
          </div>
          <button 
            onClick={() => setIsQuickNavOpen(!isQuickNavOpen)}
            style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '10px' }}
          >
            {isQuickNavOpen ? '▲ 收合' : '▼ 展開'}
          </button>
        </div>

        {isQuickNavOpen && (
          <div style={{
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            paddingBottom: '2px',
            maxWidth: '920px'
          }}>
            {spotlightCorridors.slice(0, 10).map((corr, idx) => {
              const isSelected = selectedCorridor && selectedCorridor.corridor_id === corr.corridor_id;
              const isFreight = corr.pax_type === 'freight';
              return (
                <button
                  key={`${corr.corridor_id || 'corr'}-${idx}`}
                  onClick={() => handleCorridorClick(corr)}
                  style={{
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: isSelected ? `1.5px solid ${corr.color}` : '1px solid rgba(255,255,255,0.08)',
                    background: isSelected ? `${corr.color}35` : 'rgba(30, 41, 59, 0.6)',
                    color: isSelected ? '#FFFFFF' : '#CBD5E1',
                    fontSize: '10.5px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{isFreight ? '🚛' : corr.pax_type === 'tourist' ? '🧳' : '🚆'}</span>
                  <span style={{ fontWeight: isSelected ? '700' : '500' }}>{corr.origin} ➔ {corr.destination}</span>
                  <span style={{ 
                    fontSize: '9px', 
                    color: corr.color, 
                    background: `${corr.color}20`, 
                    padding: '1px 4px', 
                    borderRadius: '3px' 
                  }}>
                    {isHoliday ? (isFreight ? '休眠' : '🔥爆發') : (isFreight ? '⚡滿載' : '常態')}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Corridor Inspector Modal HUD */}
      {selectedCorridor && (
        <div style={{
          position: 'absolute',
          top: '124px',
          left: '16px',
          zIndex: 420,
          width: '340px',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(16px)',
          border: `1.5px solid ${selectedCorridor.color || '#38BDF8'}88`,
          borderRadius: '14px',
          padding: '14px 16px',
          boxShadow: `0 12px 36px ${selectedCorridor.color || '#38BDF8'}33`,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <span style={{
                  padding: '1px 6px',
                  borderRadius: '4px',
                  fontSize: '9.5px',
                  fontWeight: '800',
                  background: `${selectedCorridor.color}25`,
                  color: selectedCorridor.color,
                  border: `1px solid ${selectedCorridor.color}50`
                }}>
                  {selectedCorridor.pax_type === 'freight' ? '🚛 國道產業物流 (eTag)' : selectedCorridor.pax_type === 'tourist' ? '🧳 觀光旅遊走廊 (eTag)' : '🚆 都會公共運輸'}
                </span>
                <span style={{ fontSize: '10px', color: '#94A3B8' }}>{selectedCorridor.region} 走廊</span>
              </div>
              <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#F8FAFC', margin: 0 }}>
                {selectedCorridor.name}
              </h4>
            </div>
            <button
              onClick={() => onSelectCorridor && onSelectCorridor(null)}
              style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '2px' }}
            >
              <X size={15} />
            </button>
          </div>

          {/* 車種分配與門架路段 */}
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '8px 10px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ color: '#94A3B8' }}>
              🛣️ <strong>門架/路段</strong>：<span style={{ color: '#E2E8F0' }}>{selectedCorridor.highway_tag || '全台主要幹線'}</span>
            </div>
            {selectedCorridor.vehicle_mix && (
              <div style={{ color: '#94A3B8' }}>
                🚗 <strong>車種結構</strong>：<span style={{ color: '#38BDF8' }}>{selectedCorridor.vehicle_mix}</span>
              </div>
            )}
          </div>

          {/* 上班日 vs 假日車流對比條 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
              <span style={{ color: '#94A3B8' }}>💼 上班日運量：</span>
              <strong style={{ color: '#34D399' }}>
                {(selectedCorridor.volume_workday || selectedCorridor.volume || 0).toLocaleString()} 輛/日
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
              <span style={{ color: '#94A3B8' }}>🏖️ 放假日運量：</span>
              <strong style={{ color: '#FB923C' }}>
                {(selectedCorridor.volume_holiday || (selectedCorridor.volume ? selectedCorridor.volume * 0.4 : 0)).toLocaleString()} 輛/日
              </strong>
            </div>
            <div style={{
              background: isHoliday ? 'rgba(249, 115, 22, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              border: isHoliday ? '1px solid rgba(249, 115, 22, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '10px',
              color: isHoliday ? '#FB923C' : '#34D399',
              fontWeight: '700'
            }}>
              {selectedCorridor.pax_type === 'freight' 
                ? (isHoliday ? '⚠️ 放假日貨運熄火：工廠海關休假，車流僅平日 22%' : '⚡ 上班日貨運全載：跨區貨櫃與半導體物流奔馳 (145%)')
                : (isHoliday ? '🔥 放假日觀光噴發：跨城自駕與遊覽車湧入 (+320%)' : '💤 上班日觀光低溫：景點車流降至低基期 (28%)')}
            </div>
          </div>

          {/* 商業/交通洞察 */}
          {selectedCorridor.commercial_desc && (
            <div style={{ fontSize: '10.5px', color: '#CBD5E1', lineHeight: '1.45', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '6px' }}>
              💡 {selectedCorridor.commercial_desc}
            </div>
          )}
        </div>
      )}

      {/* Floating Bottom-Left Weather Impact & Day Type Diagnostic Badge */}
      {(() => {
        const badgeColor = isHeavyRain ? '#F43F5E' : isRain ? '#38BDF8' : isCloudy ? '#94A3B8' : isHoliday ? '#F97316' : '#10B981';
        const badgeTitle = isHoliday 
          ? '🏖️ 放假日觀光與休閒流向特徵'
          : '💼 上班日產業動脈與通勤特徵';
        const badgeScenario = `${isHoliday ? '放假日' : '上班日'}·${isHeavyRain ? '豪大雨' : isRain ? '常規雨' : isCloudy ? '陰天' : '晴天'}`;

        return (
          <div style={{
            position: 'absolute',
            bottom: '24px',
            left: '16px',
            zIndex: 380,
            maxWidth: '520px',
            background: 'rgba(15, 23, 42, 0.94)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${badgeColor}55`,
            borderRadius: '12px',
            padding: '10px 14px',
            boxShadow: `0 8px 32px ${badgeColor}22`,
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            pointerEvents: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: badgeColor, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{badgeTitle}</span>
                <span style={{ fontSize: '9px', background: `${badgeColor}25`, color: badgeColor, padding: '1px 6px', borderRadius: '4px', border: `1px solid ${badgeColor}40` }}>
                  {badgeScenario}
                </span>
              </div>
            </div>

            <div style={{ fontSize: '10.5px', color: '#CBD5E1', lineHeight: '1.45' }}>
              {isHoliday ? (
                <>
                  • <strong>🧳 跨城觀光旅遊大爆發 (320% 狂飆)</strong>：國道 5 號雪隧、國 6 日月潭、墾丁南灣湧現巨大自駕與遊覽車潮，風景區停車場午前即達飽和。<br/>
                  • <strong>🚛 產業物流熄火休眠 (-78%)</strong>：海關保稅倉週末休關、工廠排休與國道大貨車特定時段管制，貨物流降至全週最低谷。<br/>
                  • <strong>💼 都會通勤全面消退 (-70%)</strong>：跨城通勤高鐵與都會捷運人潮由通勤轉為生活休閒。
                </>
              ) : (
                <>
                  • <strong>🚛 國道產業物流全線巔峰 (145% 奔馳)</strong>：基隆港/台北港/高雄港國際貨櫃進出拆櫃、竹科-中科-南科半導體氣墊專車密集對開，重卡與貨車為國道主力。<br/>
                  • <strong>💼 都會通勤早晚雙尖峰 (115%)</strong>：捷運、幹線公車與聯外幹道高乘載運轉。<br/>
                  • <strong>🧳 觀光休閒流向低溫 (28%)</strong>：風景區車流平緩，無假性排隊壅塞。
                </>
              )}
            </div>
          </div>
        );
      })()}

      {/* Floating Bottom-Right Corridor Legend Badge */}
      <div style={{
        position: 'absolute',
        bottom: '24px',
        right: '16px',
        zIndex: 400,
        background: 'rgba(15, 23, 42, 0.90)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '10px',
        padding: '10px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        fontSize: '11px',
        pointerEvents: 'none'
      }}>
        <div style={{ fontWeight: '700', color: '#F8FAFC', marginBottom: '2px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>🚆 運具與動脈流向圖例</span>
          {selectedPaxType !== 'all' && (
            <span style={{ fontSize: '9.5px', background: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8', padding: '1px 5px', borderRadius: '4px' }}>
              {selectedPaxType === 'commuter' ? '💼 通勤' : selectedPaxType === 'tourist' ? '🧳 觀光' : selectedPaxType === 'freight' ? '🚛 物流' : selectedPaxType === 'senior' ? '👵 銀髮' : '🎓 學生'}走廊
            </span>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 10px', fontSize: '10.5px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '3.5px', borderRadius: '2px', background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
            <span style={{ color: '#E2E8F0', fontWeight: '700' }}>🚛 國道物流 (eTag)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '3.5px', borderRadius: '2px', background: '#F97316', boxShadow: '0 0 6px #F97316' }} />
            <span style={{ color: '#E2E8F0', fontWeight: '700' }}>🧳 觀光旅遊 (eTag)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '3px', borderRadius: '2px', background: '#3B82F6' }} />
            <span style={{ color: '#CBD5E1' }}>臺鐵 (TRA)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '3px', borderRadius: '2px', background: '#F97316' }} />
            <span style={{ color: '#CBD5E1' }}>高鐵 (THSR)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '3px', borderRadius: '2px', background: '#10B981' }} />
            <span style={{ color: '#CBD5E1' }}>北捷 (TRTC)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '3px', borderRadius: '2px', background: '#0284C7' }} />
            <span style={{ color: '#CBD5E1' }}>市區公車/客運</span>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '5px', fontSize: '9px', color: '#94A3B8', lineHeight: '1.4' }}>
          <div>✨ <strong>動態粒子特徵</strong>：</div>
          <div>1. <strong>上班日</strong>：綠色貨物流速與密度拉滿 (145%)，觀光流微弱。</div>
          <div>2. <strong>放假日</strong>：橘色觀光粒子成倍爆發 (320%)，貨物流熄火。</div>
        </div>
      </div>

      {/* CCTV Embedded Player Modal */}
      {activeCctvSpot && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#0F172A',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '16px',
            maxWidth: '900px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.7)'
          }}>
            <div style={{
              padding: '12px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(30, 41, 59, 0.6)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  padding: '2px 8px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '4px',
                  color: '#EF4444',
                  fontSize: '11px',
                  fontWeight: '800'
                }}>
                  ● LIVE
                </span>
                <span style={{ fontSize: '15px', fontWeight: '800', color: '#FFFFFF' }}>
                  {activeCctvSpot.location} ({activeCctvSpot.county_name})
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {activeCctvSpot.live_url && (
                  <a
                    href={activeCctvSpot.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '5px',
                      color: '#38BDF8',
                      fontSize: '11px',
                      textDecoration: 'none',
                      fontWeight: '600'
                    }}
                  >
                    <span>YouTube開啟</span>
                    <ExternalLink size={12} />
                  </a>
                )}
                <button
                  onClick={() => setActiveCctvSpot(null)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000000' }}>
              {activeCctvSpot.embed_player_url ? (
                <iframe
                  src={activeCctvSpot.embed_player_url}
                  title={activeCctvSpot.location}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none'
                  }}
                />
              ) : (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                  暫無嵌入串流，請點擊上方連結前往 YouTube 觀看
                </div>
              )}
            </div>

            <div style={{ padding: '14px 20px', background: 'rgba(15, 23, 42, 0.95)', fontSize: '12px', color: '#94A3B8', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                🛣️ <strong>聯外走廊</strong>: <span style={{ color: '#E2E8F0' }}>{activeCctvSpot.mobility_profile?.connected_corridor}</span>
              </div>
              <div>
                🚗 <strong>假日車流暴增</strong>: <strong style={{ color: '#F59E0B' }}>{activeCctvSpot.mobility_profile?.holiday_surge}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
