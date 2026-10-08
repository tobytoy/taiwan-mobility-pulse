import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { esc } from '../utils/sanitize';
import { CARTO_TILES, CARTO_ATTRIBUTION } from '../utils/basemap';
const BASEMAP_TILES = {
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
    desc: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap',
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
  selectedPaxType = 'all', // 'all', 'commuter', 'tourist'
  selectedDayType = 'workday_clear', // 'workday_clear', 'workday_rain', 'holiday_clear', 'holiday_rain'
  basemap = 'dark',
  currentHour = 8,
  onSelectStation,
  selectedStation,
  onSelectCorridor,
  selectedCorridor
}) {
  const [currentZoom, setCurrentZoom] = useState(8);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const tileLayerRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const particlesRef = useRef([]);
  const markersRef = useRef([]);

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

    tileLayerRef.current = L.tileLayer(BASEMAP_TILES[basemap].url, {
      attribution: BASEMAP_TILES[basemap].attribution,
      subdomains: BASEMAP_TILES[basemap].subdomains || 'abc',
      maxZoom: BASEMAP_TILES[basemap].maxZoom
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
    tileLayerRef.current = L.tileLayer(BASEMAP_TILES[basemap].url, {
      attribution: BASEMAP_TILES[basemap].attribution,
      subdomains: BASEMAP_TILES[basemap].subdomains || 'abc',
      maxZoom: BASEMAP_TILES[basemap].maxZoom
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

  // 4. 繪製車站標記點 (Station Markers) - 隨縮放等級動態調校半徑與防重疊
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

      // 全島宏觀視角 LOD：隱藏短距走廊避免大台北擠成發光團塊；區域放大時展開完整微觀接駁
      if (isMacroView && c.origin_coord && c.dest_coord) {
        const dKm = Math.hypot((c.origin_coord[0] - c.dest_coord[0]) * 111, (c.origin_coord[1] - c.dest_coord[1]) * 102);
        if (dKm < 2.5 && c.mode_id !== 'thsr' && c.mode_id !== 'tra') return false;
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
      const marker = L.circleMarker(coords, {
        radius: isSelected ? baseRadius + 3.5 : baseRadius,
        fillColor: isSelected ? '#38BDF8' : '#F8FAFC',
        color: isSelected ? '#38BDF8' : '#0F172A',
        weight: isSelected ? 2.5 : 1.2,
        opacity: 0.9,
        fillOpacity: isSelected ? 1 : 0.75
      });

      marker.bindTooltip(`
        <div style="font-family: Outfit, sans-serif; font-size: 12px; font-weight: 600; padding: 2px 4px;">
          <span style="color: #38BDF8;">●</span> ${esc(name)}
        </div>
      `, { className: 'custom-leaflet-tooltip', direction: 'top', offset: [0, -6] });

      marker.on('click', () => {
        if (onSelectStation) onSelectStation(name);
      });

      marker.addTo(mapRef.current);
      markersRef.current.push(marker);
    });
  }, [corridors, stationsGeo, selectedMode, selectedRegion, selectedPaxType, selectedStation, currentZoom]);

  // 5. 隨時間 (currentHour)、日型與天候情境 (selectedDayType) 動態粒子渲染
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
        if (dKm < 2.5 && c.mode_id !== 'thsr' && c.mode_id !== 'tra') return false;
      }
      return true;
    });

    const isHoliday = selectedDayType.startsWith('holiday') || selectedDayType === 'Weekend' || selectedDayType === 'Holiday';
    const isHeavyRain = selectedDayType.includes('heavy_rain');
    const isRain = selectedDayType.includes('rainy') || (selectedDayType.endsWith('rain') && !isHeavyRain);
    const isCloudy = selectedDayType.includes('cloudy');
    const isSunny = selectedDayType.includes('sunny') || selectedDayType.endsWith('clear');

    const particles = [];
    filteredCorridors.forEach((corr) => {
      let hourFactor = corr.hourly_curve ? corr.hourly_curve[currentHour] : 0.5;
      
      // 日型身分彈性
      if (isHoliday) {
        if (corr.pax_type === 'commuter') hourFactor *= 0.35; // 假日通勤線量大減
        if (corr.pax_type === 'tourist') {
          hourFactor *= isHeavyRain ? 0.22 : isRain ? 0.38 : isCloudy ? 1.25 : 1.45;  // 豪雨觀光重創 (-78%)，常規雨凍結 (-62%)，陰晴熱絡
        }
        if (corr.pax_type === 'senior') {
          hourFactor *= isHeavyRain ? 0.28 : isRain ? 0.44 : isCloudy ? 0.95 : 0.85;  // 長者豪雨高度避險不出門 (-72%)
        }
        if (corr.pax_type === 'student') hourFactor *= (isHeavyRain ? 0.12 : 0.20);  // 假日學校停課
      } else {
        if (corr.pax_type === 'tourist') hourFactor *= (isHeavyRain ? 0.35 : 0.55);  // 平日觀光線略降
        if (corr.pax_type === 'senior') {
          if (isHeavyRain) hourFactor *= 0.45; // 豪雨平日非緊急就醫大幅延期 (-55%)
          else if (isRain) hourFactor *= 0.72; // 常規雨延期 (-28%)
          else if (isCloudy) hourFactor *= 1.05; // 陰天宜出行
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
        } else if (corr.mode_id === 'thb_bus') {
          hourFactor *= 0.75; // 國道受積水與視線不良大幅壅塞延誤 (-25%)
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

      const maxCount = Math.min(14, Math.max(3, Math.floor(Math.log10(corr.total_vol || 10000) * 2.8)));
      const activeCount = Math.round(maxCount * Math.min(1.2, hourFactor));

      for (let i = 0; i < activeCount; i++) {
        particles.push({
          corridor: corr,
          progress: Math.random(),
          speed: (0.003 + Math.random() * 0.004) * (0.6 + hourFactor * 0.8) * (isHeavyRain ? 0.75 : isRain ? 0.88 : isCloudy ? 0.98 : 1.0),
          color: corr.color || '#38BDF8',
          paxType: corr.pax_type,
          hourFactor: hourFactor
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
        if (isHoliday) {
          if (corr.pax_type === 'commuter') hourFactor *= 0.35;
          if (corr.pax_type === 'tourist') hourFactor *= isRain ? 0.38 : 1.45;
          if (corr.pax_type === 'senior') hourFactor *= isRain ? 0.44 : 0.85;
          if (corr.pax_type === 'student') hourFactor *= 0.20;
        } else {
          if (corr.pax_type === 'tourist') hourFactor *= 0.55;
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
          selectedCorridor.origin === corr.origin && selectedCorridor.destination === corr.destination
        );

        const dx = x2 - x1;
        const dy = y2 - y1;
        // 雙向走廊分離：A->B 與 B->A 分居左右兩側，消除重合干涉
        const side = (corr.origin || '') > (corr.destination || '') ? 1 : -1;
        const cx = (x1 + x2) / 2 - dy * 0.15 * side;
        const cy = (y1 + y2) / 2 + dx * 0.15 * side;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(cx, cy, x2, y2);

        // 通勤走廊採藍/綠光，觀光走廊採粉/橘光微調
        const alpha = isFocused ? 'ee' : Math.floor(Math.min(255, Math.max(30, hourFactor * 160))).toString(16).padStart(2, '0');
        ctx.strokeStyle = isFocused ? 'rgba(255, 255, 255, 0.95)' : (corr.color + alpha);
        ctx.lineWidth = isFocused ? 4.0 : Math.min(3.5, Math.max(0.8, hourFactor * 3.0));
        ctx.stroke();
      });

      // 繪製時間與乘客身分動態粒子
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
        const pRadius = 1.8 + p.hourFactor * 1.5;
        ctx.arc(px, py, pRadius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 4 + p.hourFactor * 4;
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

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '380px', overflow: 'hidden' }}>
      <div 
        ref={mapContainerRef} 
        role="region"
        aria-label="全台多模態動態人流走廊地圖"
        tabIndex={0}
        style={{ width: '100%', height: '100%', minHeight: '380px', background: '#07090E' }} 
      />

      {/* LOD 縮放過濾提示標籤 */}
      {currentZoom <= 9 && selectedRegion === 'all' && (
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 400,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '20px',
          padding: '5px 12px',
          fontSize: '11px',
          color: '#38BDF8',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          pointerEvents: 'none'
        }}>
          <span>🌐 全島城際主幹線視圖</span>
          <span style={{ color: '#94a3b8', fontSize: '10px' }}>(放大或切換區域以展開微觀短程接駁)</span>
        </div>
      )}

      {/* Floating Bottom-Left Weather Impact Diagnostic Badge */}
      {(() => {
        const isHol = selectedDayType.startsWith('holiday') || selectedDayType === 'Weekend' || selectedDayType === 'Holiday';
        const isHvy = selectedDayType.includes('heavy_rain');
        const isRn = selectedDayType.includes('rainy') || (selectedDayType.endsWith('rain') && !isHvy);
        const isCld = selectedDayType.includes('cloudy');
        
        const badgeColor = isHvy ? '#F43F5E' : isRn ? '#38BDF8' : isCld ? '#94A3B8' : '#F59E0B';
        const badgeTitle = isHvy ? '⛈️ 豪大雨交通斷層實證診斷 (≥10mm/h)'
          : isRn ? '🌧️ 常規雨天交通轉移診斷 (0.1~10mm/h)'
          : isCld ? '☁️ 陰天微氣候通勤基準 (時雨量 0mm)'
          : '☀️ 晴朗天常態交通基準 (日照充足)';
        
        const badgeScenario = `${isHol ? '假日' : '上班日'}·${isHvy ? '豪大雨' : isRn ? '常規雨' : isCld ? '陰天' : '晴天'}`;

        return (
          <div style={{
            position: 'absolute',
            bottom: '24px',
            left: '16px',
            zIndex: 400,
            maxWidth: '470px',
            background: isHvy ? 'rgba(30, 15, 25, 0.95)' : isRn ? 'rgba(15, 23, 42, 0.94)' : 'rgba(15, 23, 42, 0.88)',
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
              <div style={{ fontSize: '11px', fontWeight: '800', color: badgeColor, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span>{badgeTitle}</span>
                <span style={{ fontSize: '9px', background: `${badgeColor}25`, color: badgeColor, padding: '1px 6px', borderRadius: '4px', border: `1px solid ${badgeColor}40` }}>
                  {badgeScenario}
                </span>
              </div>
            </div>

            <div style={{ fontSize: '10.5px', color: '#cbd5e1', lineHeight: '1.45' }}>
              {isHvy && !isHol ? (
                <>
                  • <strong>💼 極端天候通勤斷層</strong>：自駕與叫車需求爆量導致主要幹道嚴重回堵；YouBike 幾近停擺 (<span style={{ color: '#EF4444', fontWeight: '700' }}>-81%</span>)，人潮全面湧入地下捷運 (<span style={{ color: '#10B981', fontWeight: '700' }}>+22% 避雨方舟</span>)；國道客運受視線與塞車嚴重延誤 (<span style={{ color: '#EF4444', fontWeight: '700' }}>-25%</span>)。<br/>
                  • <strong>👵 長者非緊急活動全面取消</strong>：常規就醫門診取消與延期率突破 <span style={{ color: '#F43F5E', fontWeight: '700' }}>55%</span>。
                </>
              ) : isHvy && isHol ? (
                <>
                  • <strong>👵 長者防跌極限不出門</strong>：天雨路滑高度避險，外出人次全日崩跌 <span style={{ color: '#EF4444', fontWeight: '700' }}>-72%</span>。<br/>
                  • <strong>🧳 戶外景點急凍癱瘓</strong>：淡水/駁二等戶外景點急凍 <span style={{ color: '#EF4444', fontWeight: '700' }}>-78%</span>，人流全面轉入室內地下街與共構百貨。
                </>
              ) : isRn && !isHol ? (
                <>
                  • <strong>💼 上班族自駕/叫車激增</strong>：有車族轉為<strong>自己開車</strong>，引發幹道與聯外橋樑回堵；無車族放棄 YouBike (<span style={{ color: '#EF4444', fontWeight: '700' }}>-54%</span>) 湧入地下捷運 (<span style={{ color: '#10B981', fontWeight: '700' }}>+10%</span>) 與市區公車 (<span style={{ color: '#10B981', fontWeight: '700' }}>+15%</span>)。<br/>
                  • <strong>👵 退休長者非急迫就醫延期</strong>：常規門診延期率達 <span style={{ color: '#F43F5E', fontWeight: '700' }}>38.5%</span>。
                </>
              ) : isRn && isHol ? (
                <>
                  • <strong>👵 退休長者防跌大幅不出門</strong>：長者天雨路滑高度避險，外出人次全日急跌 <span style={{ color: '#EF4444', fontWeight: '700' }}>-56%</span>。<br/>
                  • <strong>🧳 戶外景點急凍 / 百貨聚集</strong>：戶外景點急凍 <span style={{ color: '#EF4444', fontWeight: '700' }}>-62%</span>，人潮倒灌捷運共構室內大型商場 (<span style={{ color: '#10B981', fontWeight: '700' }}>+25%</span>)。
                </>
              ) : isCld ? (
                <>
                  • <strong>🚲 體感涼爽最佳騎乘微氣候</strong>：時雨量 0mm 無日曬，微型移動 YouBike 騎乘意願最高 (<span style={{ color: '#10B981', fontWeight: '700' }}>+5%</span>)。<br/>
                  • <strong>🏙️ 跨區走廊均衡穩定</strong>：{isHol ? '各風景區與市集活動熱絡，舒適氣候吸引家庭外出。' : '早晚尖峰通勤順暢，公車與捷運運轉準點率最高。'}
                </>
              ) : (
                <>
                  • <strong>💼 晴朗天全台常態基準</strong>：{isHol ? '跨區觀光出遊高峰，淡水老街、新北投、駁二及東部鐵路全日高載客。' : '早尖峰 (07:30~08:30) 與晚尖峰 (17:30~19:00) 捷運、公車與 YouBike 高效協同運轉。'}
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
        <div style={{ fontWeight: '700', color: '#94A3B8', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span>🌊 人流走廊身分圖例</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '12px', height: '3px', borderRadius: '2px', background: '#38BDF8' }} />
          <span style={{ color: '#E2E8F0', fontWeight: '600' }}>💼 通勤剛需走廊</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '12px', height: '3px', borderRadius: '2px', background: '#F97316' }} />
          <span style={{ color: '#E2E8F0', fontWeight: '600' }}>🧳 觀光休閒走廊</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '12px', height: '3px', borderRadius: '2px', background: '#F43F5E' }} />
          <span style={{ color: '#E2E8F0', fontWeight: '600' }}>👵 銀髮樂齡走廊</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '12px', height: '3px', borderRadius: '2px', background: '#10B981' }} />
          <span style={{ color: '#E2E8F0', fontWeight: '600' }}>🎓 學生通學走廊</span>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '5px', fontSize: '9px', color: '#64748B', lineHeight: '1.3' }}>
          ℹ️ 公車微觀走廊採臺北市公車票證；軌道走廊涵蓋全台高鐵、臺鐵、北捷與高捷。
        </div>
      </div>
    </div>
  );
}
