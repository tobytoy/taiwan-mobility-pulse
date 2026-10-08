import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  Shuffle, Users, Briefcase, GraduationCap, Heart, Clock, 
  DollarSign, MapPin, Zap, ChevronRight, X, ArrowUpRight, 
  ShieldCheck, Flame, Compass, Layers, Info, Sparkles, Navigation
} from 'lucide-react';
import { esc } from '../utils/sanitize';
import { CARTO_TILES, CARTO_ATTRIBUTION } from '../utils/basemap';

const BASEMAP_TILES = {
  dark: {
    url: CARTO_TILES.dark,
    attribution: CARTO_ATTRIBUTION,
    subdomains: 'abcd',
    maxZoom: 19
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    maxZoom: 18
  },
  osm: {
    url: CARTO_TILES.voyager,
    attribution: CARTO_ATTRIBUTION,
    subdomains: 'abcd',
    maxZoom: 19
  },
  light: {
    url: CARTO_TILES.light,
    attribution: CARTO_ATTRIBUTION,
    subdomains: 'abcd',
    maxZoom: 19
  }
};

const REGION_OPTIONS = [
  { id: 'all', label: '🌐 全台總覽', center: [23.95, 120.95], zoom: 8, badge: '76 樞紐' },
  { id: 'north', label: '🏙️ 北部都會', center: [25.045, 121.530], zoom: 11, badge: '46 樞紐' },
  { id: 'central', label: '🌲 中部生活圈', center: [24.085, 120.650], zoom: 11, badge: '18 樞紐' },
  { id: 'south', label: '☀️ 南部生活圈', center: [22.750, 120.400], zoom: 10, badge: '6 樞紐' },
  { id: 'east', label: '🌊 東部生活圈', center: [24.400, 121.700], zoom: 9, badge: '6 樞紐' }
];

const PERSONA_FILTERS = [
  { id: 'all', label: '🔀 全部轉乘總覽', color: '#38BDF8', icon: Shuffle, desc: '綜合多模態四色甜甜圈' },
  { id: 'commuter', label: '💼 上班通勤接駁', color: '#38BDF8', icon: Briefcase, desc: '商辦科技園區與公車捷運' },
  { id: 'student', label: '🎓 學生通學走廊', color: '#10B981', icon: GraduationCap, desc: '校園與通學大站走廊' },
  { id: 'senior', label: '👵 銀髮樂齡生活', color: '#F43F5E', icon: Heart, desc: '醫學中心與果菜市集路網' },
  { id: 'tpass', label: '💳 TPASS 月票專案', color: '#A855F7', icon: Zap, desc: '邊際成本 0 元高頻轉乘' }
];

export default function TransferMapView({ basemap = 'dark' }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentZoom, setCurrentZoom] = useState(8);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedPersona, setSelectedPersona] = useState('all');
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [showSpiderRays, setShowSpiderRays] = useState(true);
  const [showKpiCard, setShowKpiCard] = useState(true);

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersRef = useRef([]);
  const spiderLayersRef = useRef([]);

  // 1. 載入轉乘大數據 JSON
  useEffect(() => {
    const baseUrl = import.meta.env.BASE_URL || '/';
    const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    fetch(`${cleanBase}transfer_analysis.json`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error('載入轉乘分析資料失敗:', err);
        setLoading(false);
      });
  }, []);

  // 2. 初始化 Leaflet 地圖
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // 預設全台視角
    const map = L.map(mapContainerRef.current, {
      center: [23.95, 120.95],
      zoom: 8,
      minZoom: 7,
      maxZoom: 17,
      zoomControl: false,
      attributionControl: false
    });

    tileLayerRef.current = L.tileLayer(BASEMAP_TILES[basemap]?.url || BASEMAP_TILES.dark.url, {
      attribution: BASEMAP_TILES[basemap]?.attribution || BASEMAP_TILES.dark.attribution,
      subdomains: BASEMAP_TILES[basemap]?.subdomains || 'abcd',
      maxZoom: BASEMAP_TILES[basemap]?.maxZoom || 19
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapRef.current = map;

    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    // 確保容器尺寸就緒後重算視圖
    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 切換生活圈鏡頭平移
  const handleSelectRegion = (regId) => {
    setSelectedRegion(regId);
    setSelectedHotspot(null);
    const cfg = REGION_OPTIONS.find(r => r.id === regId) || REGION_OPTIONS[0];
    if (mapRef.current) {
      mapRef.current.flyTo(cfg.center, cfg.zoom, { duration: 1.1, easeLinearity: 0.25 });
    }
  };

  // 3. 切換底圖
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;
    mapRef.current.removeLayer(tileLayerRef.current);
    tileLayerRef.current = L.tileLayer(BASEMAP_TILES[basemap].url, {
      attribution: BASEMAP_TILES[basemap].attribution,
      subdomains: BASEMAP_TILES[basemap].subdomains || 'abcd',
      maxZoom: BASEMAP_TILES[basemap].maxZoom
    }).addTo(mapRef.current);
  }, [basemap]);

  // 4. 動態生成 SVG 甜甜圈圓盤 HTML (支援 Zoom 自適應尺度)
  const generateDonutHtml = (st, index, personaFilter, isSelected, zoomLevel = 8) => {
    const p = st.persona_pct || { regular_adult: 25, tpass: 25, student: 25, senior: 25 };
    
    // 依據目前過濾器動態決定主導顏色與大小
    const zoomFactor = zoomLevel <= 8 ? 0.70 : zoomLevel <= 10 ? 0.85 : 1.0;
    let baseSize = 46;
    let rank = index + 1;
    let label = `#${rank}`;
    let primaryColor = '#38BDF8';

    if (personaFilter === 'student') {
      const stuScore = p.student || 0;
      baseSize = Math.max(38, Math.min(62, 36 + stuScore * 1.5));
      primaryColor = '#10B981';
    } else if (personaFilter === 'senior') {
      const senScore = p.senior || 0;
      baseSize = Math.max(38, Math.min(62, 36 + senScore * 0.9));
      primaryColor = '#F43F5E';
    } else if (personaFilter === 'commuter') {
      baseSize = Math.max(38, Math.min(62, 36 + (p.commuter || 0) * 0.4));
      primaryColor = '#38BDF8';
    } else if (personaFilter === 'tpass') {
      baseSize = Math.max(38, Math.min(62, 36 + (p.tpass || 0) * 0.5));
      primaryColor = '#A855F7';
    } else {
      // All: 依週轉乘量縮放
      const vol = st.transfer_volume || 20000;
      baseSize = Math.max(42, Math.min(64, 40 + (vol / 55000) * 22));
    }

    if (isSelected) baseSize += 10;
    const size = Math.round(baseSize * zoomFactor);

    const c = size / 2;
    const r = size * 0.35;
    const strokeW = Math.max(5, size * 0.12);
    const circ = 2 * Math.PI * r;

    // 四個客群弧長 (以總和精準歸一化，消除浮點四捨五入隙縫)
    const pTotal = ((p.regular_adult || 0) + (p.tpass || 0) + (p.student || 0) + (p.senior || 0)) || 100;
    const p1 = (p.regular_adult || 0) / pTotal;
    const p2 = (p.tpass || 0) / pTotal;
    const p3 = (p.student || 0) / pTotal;
    const p4 = (p.senior || 0) / pTotal;

    const o1 = 0;
    const o2 = -p1 * circ;
    const o3 = -(p1 + p2) * circ;
    const o4 = -(p1 + p2 + p3) * circ;

    // 透明度調校：若選擇特定客群，其他客群弧線微暗
    const opAdult = personaFilter === 'all' || personaFilter === 'commuter' ? '1' : '0.25';
    const opTpass = personaFilter === 'all' || personaFilter === 'tpass' || personaFilter === 'commuter' ? '1' : '0.25';
    const opStu = personaFilter === 'all' || personaFilter === 'student' ? '1' : '0.25';
    const opSen = personaFilter === 'all' || personaFilter === 'senior' ? '1' : '0.25';

    const glowStyle = isSelected 
      ? `box-shadow: 0 0 24px ${primaryColor}; transform: scale(1.1);`
      : 'box-shadow: 0 4px 14px rgba(0,0,0,0.6);';

    return `
      <div style="width: ${size}px; height: ${size}px; border-radius: 50%; ${glowStyle} cursor: pointer; position: relative; transition: all 0.2s ease;">
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform: rotate(-90deg); display: block;">
          <!-- 背景底軌 -->
          <circle cx="${c}" cy="${c}" r="${r}" fill="#0A0F1D" stroke="rgba(255,255,255,0.08)" stroke-width="${strokeW}" />
          
          <!-- 晴空藍: 自費通勤 -->
          <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="#38BDF8" stroke-width="${strokeW}"
            stroke-dasharray="${p1 * circ} ${circ}" stroke-dashoffset="${o1}" stroke-linecap="butt" opacity="${opAdult}" />
            
          <!-- 賽博紫: TPASS 月票 -->
          <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="#A855F7" stroke-width="${strokeW}"
            stroke-dasharray="${p2 * circ} ${circ}" stroke-dashoffset="${o2}" stroke-linecap="butt" opacity="${opTpass}" />
            
          <!-- 翡翠綠: 學生通學 -->
          <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="#10B981" stroke-width="${strokeW}"
            stroke-dasharray="${p3 * circ} ${circ}" stroke-dashoffset="${o3}" stroke-linecap="butt" opacity="${opStu}" />
            
          <!-- 薔薇紅: 銀髮長者 -->
          <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="#F43F5E" stroke-width="${strokeW}"
            stroke-dasharray="${p4 * circ} ${circ}" stroke-dashoffset="${o4}" stroke-linecap="butt" opacity="${opSen}" />
            
          <!-- 中心核心圓盤 -->
          <circle cx="${c}" cy="${c}" r="${r - strokeW * 0.7}" fill="#0F172A" stroke="${isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.15)'}" stroke-width="${isSelected ? 2 : 1}" />
          
          <!-- 核心文字 -->
          <text x="${c}" y="${c}" text-anchor="middle" dominant-baseline="central"
            fill="${isSelected ? '#38BDF8' : '#F8FAFC'}" font-size="${Math.max(9, size * 0.22)}" font-weight="900" font-family="Outfit, sans-serif"
            transform="rotate(90 ${c} ${c})">
            ${label}
          </text>
        </svg>
      </div>
    `;
  };

  // 5. 繪製站點 Marker 與放射線 (Spider Rays)
  useEffect(() => {
    if (!mapRef.current || !data) return;

    // 重新調整地圖尺寸，防止初次掛載瓦片未填滿
    mapRef.current.invalidateSize();

    // 清除舊圖層
    markersRef.current.forEach(m => mapRef.current.removeLayer(m));
    markersRef.current = [];
    spiderLayersRef.current.forEach(l => mapRef.current.removeLayer(l));
    spiderLayersRef.current = [];

    const allHotspots = data.overall_top_hotspots || [];
    const hotspots = selectedRegion === 'all'
      ? allHotspots
      : allHotspots.filter(h => h.region === selectedRegion);
    const zoomFactor = currentZoom <= 8 ? 0.70 : currentZoom <= 10 ? 0.85 : 1.0;

    hotspots.forEach((st, idx) => {
      const isSelected = selectedHotspot?.BoardingStopName === st.BoardingStopName;
      const html = generateDonutHtml(st, idx, selectedPersona, isSelected, currentZoom);
      const iconDim = Math.round((isSelected ? 56 : 46) * zoomFactor);

      const icon = L.divIcon({
        className: 'transfer-hub-div-icon',
        html,
        iconSize: [iconDim, iconDim],
        iconAnchor: [Math.round(iconDim / 2), Math.round(iconDim / 2)]
      });

      const marker = L.marker([st.lat, st.lng], { icon, zIndexOffset: isSelected ? 1000 : 100 });

      // 懸浮 Tooltip
      const p = st.persona_pct || {};
      const tooltipContent = `
        <div style="font-family: Outfit, sans-serif; min-width: 200px; padding: 6px 4px; color: #f8fafc;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 4px; margin-bottom: 6px;">
            <strong style="color: #38bdf8; font-size: 13px;">${esc(st.BoardingStopName)}</strong>
            <span style="font-size: 10px; background: rgba(56, 189, 248, 0.2); color: #38bdf8; padding: 2px 6px; border-radius: 4px; font-weight: 700;">${esc(st.region_label || '樞紐')}</span>
          </div>
          <div style="font-size: 11px; margin-bottom: 6px;">
            週轉乘量: <strong style="color: #fff; font-size: 12px;">${(st.transfer_volume || 0).toLocaleString()}</strong> 人次
          </div>
          <div style="display: flex; flex-direction: column; gap: 3px; font-size: 10px;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #38BDF8;">💼 通勤 (TPASS+自費):</span>
              <strong style="color: #38BDF8;">${p.commuter}%</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #F43F5E;">👵 銀髮樂齡生活:</span>
              <strong style="color: #F43F5E;">${p.senior}%</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #10B981;">🎓 學生通學接駁:</span>
              <strong style="color: #10B981;">${p.student}%</strong>
            </div>
          </div>
          <div style="margin-top: 6px; font-size: 9px; color: #94a3b8; text-align: center; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 4px;">
            點擊展開「微觀放射轉乘走廊」
          </div>
        </div>
      `;

      marker.bindTooltip(tooltipContent, {
        direction: 'top',
        offset: [0, -22],
        className: 'cyber-dark-tooltip'
      });

      marker.on('click', () => {
        setSelectedHotspot(st);
        mapRef.current.flyTo([st.lat, st.lng], 14, { duration: 0.8 });
      });

      marker.addTo(mapRef.current);
      markersRef.current.push(marker);
    });

    // 6. 如果有選中站點，繪製放射狀轉乘走廊 (Spider Rays)
    if (selectedHotspot && showSpiderRays) {
      const st = selectedHotspot;
      const destinations = st.top_destinations || [];

      destinations.forEach((dst, dIdx) => {
        const destCoords = dst.latlng || [st.lat + 0.012, st.lng + 0.012];
        const count = dst.count || 500;
        
        // 依目前選取模式決定走廊光芒色彩
        const rayColor = selectedPersona === 'student' ? '#10B981' :
                         selectedPersona === 'senior' ? '#F43F5E' :
                         selectedPersona === 'tpass' ? '#A855F7' : '#38BDF8';

        // 弧線路徑 (帶有微小二次貝茲凸起)
        const latMid = (st.lat + destCoords[0]) / 2 + (dIdx % 2 === 0 ? 0.003 : -0.003);
        const lngMid = (st.lng + destCoords[1]) / 2 + (dIdx % 2 === 0 ? -0.003 : 0.003);
        const pathCoords = [[st.lat, st.lng], [latMid, lngMid], destCoords];

        // 放射弧線
        const polyline = L.polyline(pathCoords, {
          color: rayColor,
          weight: Math.max(2.5, Math.min(5.5, 2 + (count / 2000) * 3)),
          opacity: 0.85,
          dashArray: '8, 8',
          className: 'transfer-animated-ray'
        }).addTo(mapRef.current);

        // 迄點衛星脈衝圓點
        const destMarker = L.circleMarker(destCoords, {
          radius: 7,
          color: '#FFFFFF',
          weight: 2,
          fillColor: rayColor,
          fillOpacity: 0.9
        }).bindTooltip(`
          <div style="font-family: Outfit, sans-serif; font-size: 11px; padding: 2px;">
            <div style="font-weight: 700; color: #fff;">${esc(dst.DeboardingStopName)}</div>
            <div style="color: ${rayColor}; font-size: 10px;">接駁運量: ${count.toLocaleString()} 人次</div>
          </div>
        `, { direction: 'top', className: 'cyber-dark-tooltip' }).addTo(mapRef.current);

        spiderLayersRef.current.push(polyline, destMarker);
      });
    }

  }, [data, selectedRegion, selectedPersona, selectedHotspot, showSpiderRays, currentZoom]);

  const meta = data?.analysis_meta || {};
  const currentSt = selectedHotspot;
  const currentRegionLabel = REGION_OPTIONS.find(r => r.id === selectedRegion)?.label || '全台總覽';

  const allHotspots = data?.overall_top_hotspots || [];
  const activeHotspots = selectedRegion === 'all' 
    ? allHotspots 
    : allHotspots.filter(h => h.region === selectedRegion);

  const regionTrips = activeHotspots.reduce((acc, h) => acc + (h.transfer_volume || 0), 0);
  const regionSubsidy = activeHotspots.reduce((acc, h) => acc + (h.subsidized_ntd || 0), 0);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      
      {/* 1. 地圖容器 (始終掛載於 DOM，讓 Leaflet 在首幀立即初始化) */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', background: '#07090e', zIndex: 1 }} />

      {/* 載入中遮罩層 */}
      {loading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 500,
          backgroundColor: '#07090e',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#38BDF8'
        }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(56, 189, 248, 0.2)', borderTopColor: '#38BDF8', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '14px' }} />
          <div style={{ fontSize: '15px', fontWeight: '700' }}>載入全島四大生活圈轉乘脈衝大數據中...</div>
        </div>
      )}

      {/* 2. 頂部生活圈與客群篩選雙層膠囊列 (移至 top: 68px，避免遮擋頂部視圖切換按鈕) */}
      <div style={{
        position: 'absolute',
        top: '68px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 420,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px'
      }}>
        {/* Tier 1: 全台四大生活圈切換列 */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.94)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          borderRadius: '30px',
          padding: '4px 6px',
          display: 'flex',
          gap: '4px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.6)'
        }}>
          {REGION_OPTIONS.map(r => {
            const isSel = selectedRegion === r.id;
            return (
              <button
                key={r.id}
                onClick={() => handleSelectRegion(r.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  border: isSel ? '1px solid #38BDF8' : '1px solid transparent',
                  background: isSel ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.6), rgba(56, 189, 248, 0.3))' : 'transparent',
                  color: isSel ? '#F8FAFC' : '#94A3B8',
                  fontSize: '11px',
                  fontWeight: isSel ? '800' : '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{r.label}</span>
                <span style={{ fontSize: '9px', background: isSel ? '#38BDF8' : 'rgba(255,255,255,0.08)', color: isSel ? '#0F172A' : '#64748B', padding: '1px 5px', borderRadius: '4px', fontWeight: '800' }}>
                  {r.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tier 2: 四大身分過濾膠囊列 */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          padding: '3px 6px',
          display: 'flex',
          gap: '4px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.5)'
        }}>
          {PERSONA_FILTERS.map(f => {
            const isSel = selectedPersona === f.id;
            const Icon = f.icon;
            return (
              <button
                key={f.id}
                onClick={() => setSelectedPersona(f.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '16px',
                  border: isSel ? `1px solid ${f.color}` : '1px solid transparent',
                  background: isSel ? `${f.color}25` : 'transparent',
                  color: isSel ? '#F8FAFC' : '#94A3B8',
                  fontSize: '11px',
                  fontWeight: isSel ? '800' : '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ color: f.color }}><Icon size={12} /></span>
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. 左上角宏觀 KPI 資訊牌 (動態切換生活圈數據，具備收合按鈕) */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        zIndex: 400,
        background: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        borderRadius: '12px',
        padding: showKpiCard ? '12px 16px' : '8px 12px',
        width: showKpiCard ? '260px' : 'auto',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        transition: 'all 0.2s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: showKpiCard ? '1px solid rgba(255,255,255,0.08)' : 'none', paddingBottom: showKpiCard ? '6px' : '0', marginBottom: showKpiCard ? '8px' : '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🔀</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#F8FAFC' }}>{currentRegionLabel} 轉乘脈衝</div>
              {showKpiCard && <div style={{ fontSize: '10px', color: '#64748B' }}>涵蓋 {activeHotspots.length} 大樞紐節點</div>}
            </div>
          </div>
          <button
            onClick={() => setShowKpiCard(!showKpiCard)}
            title={showKpiCard ? "收合面板" : "展開面板"}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              fontSize: '10px',
              padding: '3px 6px',
              borderRadius: '4px',
              marginLeft: '8px'
            }}
          >
            {showKpiCard ? '收合' : '展開'}
          </button>
        </div>

        {showKpiCard && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '8px' }}>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>區域轉乘人次</div>
                <div style={{ fontSize: '15px', fontWeight: '900', color: '#38BDF8' }}>
                  {regionTrips.toLocaleString()}
                </div>
                <div style={{ fontSize: '9px', color: '#64748B' }}>{activeHotspots.length} 核心站點</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '8px' }}>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>週折讓補貼額</div>
                <div style={{ fontSize: '15px', fontWeight: '900', color: '#F59E0B' }}>
                  ${Math.round(regionSubsidy / 10000)}萬
                </div>
                <div style={{ fontSize: '9px', color: '#64748B' }}>
                  均折 ${Math.round(regionSubsidy / Math.max(1, regionTrips) * 10) / 10}/趟
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '5px 8px', borderRadius: '6px' }}>
              <span style={{ color: '#10B981', fontWeight: '600' }}>全島轉乘覆蓋率:</span>
              <strong style={{ color: '#10B981' }}>{selectedRegion === 'all' ? '88.0%' : '高頻密集'}</strong>
            </div>
          </>
        )}
      </div>

      {/* 4. 右側浮動面板：選中轉乘樞紐深度卡片 (方案 2 深度下鑽) */}
      {currentSt && (
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 400,
          background: 'rgba(13, 18, 30, 0.94)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          borderRadius: '14px',
          padding: '16px 18px',
          width: '320px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
          animation: 'fadeIn 0.2s ease'
        }}>
          {/* 標題與關閉按鈕 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '16px' }}>🔀</span>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#F8FAFC', margin: 0 }}>
                  {currentSt.BoardingStopName}
                </h3>
              </div>
              <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>
                {currentSt.region_label || '臺灣核心轉乘樞紐'} ｜ 週轉乘量: {(currentSt.transfer_volume || 0).toLocaleString()} 人次
              </div>
            </div>
            <button
              onClick={() => setSelectedHotspot(null)}
              style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '2px' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* 四大客群堆疊條 (Stacked Persona Capsule) */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8', marginBottom: '5px' }}>
              <span>客群轉乘身分結構:</span>
              <span style={{ color: '#38BDF8', fontWeight: '700' }}>通勤為主力 ({currentSt.persona_pct?.commuter}%)</span>
            </div>
            
            {/* 堆疊彩色膠囊 */}
            <div style={{ height: '10px', borderRadius: '6px', display: 'flex', overflow: 'hidden', background: '#1e293b' }}>
              <div style={{ width: `${currentSt.persona_pct?.regular_adult || 20}%`, background: '#38BDF8' }} title="自費成人通勤" />
              <div style={{ width: `${currentSt.persona_pct?.tpass || 40}%`, background: '#A855F7' }} title="TPASS 通勤月票" />
              <div style={{ width: `${currentSt.persona_pct?.senior || 25}%`, background: '#F43F5E' }} title="銀髮樂齡生活" />
              <div style={{ width: `${currentSt.persona_pct?.student || 15}%`, background: '#10B981' }} title="學生通學接駁" />
            </div>

            {/* 比例標籤 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: '6px', fontSize: '10px' }}>
              <div style={{ color: '#38BDF8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38BDF8' }} />
                自費成人: {currentSt.persona_pct?.regular_adult}%
              </div>
              <div style={{ color: '#A855F7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#A855F7' }} />
                TPASS月票: {currentSt.persona_pct?.tpass}%
              </div>
              <div style={{ color: '#F43F5E', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F43F5E' }} />
                銀髮樂齡: {currentSt.persona_pct?.senior}%
              </div>
              <div style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                學生通學: {currentSt.persona_pct?.student}%
              </div>
            </div>
          </div>

          {/* 轉乘來源運具組成 */}
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '8px 10px', marginBottom: '10px' }}>
            <div style={{ fontSize: '10px', color: '#64748B', marginBottom: '4px' }}>主要轉乘來源運具:</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
              <span style={{ color: '#38BDF8' }}>🚇 捷運轉公車:</span>
              <strong>{(currentSt.from_metro || 0).toLocaleString()} 人次</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '2px' }}>
              <span style={{ color: '#10B981' }}>🚏 幹線公車雙向:</span>
              <strong>{(currentSt.from_trunk || 0).toLocaleString()} 人次</strong>
            </div>
          </div>

          {/* 前幾大接駁公車路線 */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '5px' }}>Top 依賴轉乘路線 (Feeding Routes):</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {(currentSt.top_feeder_routes || []).map((r, i) => (
                <span key={i} style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: '#38BDF8',
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}>
                  {r.RouteName} ({r.count.toLocaleString()}次)
                </span>
              ))}
            </div>
          </div>

          {/* 放射走廊開關 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '8px' }}>
            <span style={{ fontSize: '10px', color: '#64748B' }}>顯示放射接駁走廊:</span>
            <button
              onClick={() => setShowSpiderRays(!showSpiderRays)}
              style={{
                fontSize: '10px',
                padding: '3px 8px',
                borderRadius: '4px',
                border: 'none',
                background: showSpiderRays ? '#0284C7' : 'rgba(255,255,255,0.1)',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              {showSpiderRays ? '已開啟' : '已關閉'}
            </button>
          </div>
        </div>
      )}

      {/* 5. 右下角圖例說明 (Legend) */}
      <div style={{
        position: 'absolute',
        bottom: '24px',
        right: '16px',
        zIndex: 400,
        background: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
        padding: '10px 14px',
        fontSize: '10px',
        color: '#94A3B8',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
      }}>
        <div style={{ fontWeight: '700', color: '#f8fafc', marginBottom: '6px' }}>🎨 甜甜圈圓盤四色身分圖例</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38BDF8' }} />
            <span>晴空藍：自費成人上班通勤 (折 $8)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#A855F7' }} />
            <span>賽博紫：TPASS 通勤月票 (折 $15)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
            <span>翡翠綠：學生通學接駁 (折 $6)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F43F5E' }} />
            <span>薔薇紅：銀髮樂齡醫療生活 (折 $4)</span>
          </div>
        </div>
      </div>

    </div>
  );
}
