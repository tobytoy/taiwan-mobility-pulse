import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  Store, HeartPulse, GraduationCap, ShoppingBag, AlertTriangle,
  ShieldCheck, CheckCircle2, Navigation, Layers, Compass,
  Sparkles, Info, Users, Clock, ArrowUpRight, Flame, Search, Filter, X
} from 'lucide-react';
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
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap',
    maxZoom: 19
  },
  light: {
    url: CARTO_TILES.light,
    attribution: CARTO_ATTRIBUTION,
    subdomains: 'abcd',
    maxZoom: 19
  }
};

const REGIONS = [
  { id: 'all', label: '🌐 全台總覽', center: [23.95, 120.95], zoom: 8 },
  { id: 'north', label: '🏙️ 北部都會', center: [25.045, 121.530], zoom: 12 },
  { id: 'central', label: '🌲 中部生活圈', center: [24.135, 120.680], zoom: 12 },
  { id: 'south', label: '☀️ 南部生活圈', center: [22.650, 120.350], zoom: 11 },
  { id: 'east', label: '🌊 東部生活圈', center: [24.300, 121.650], zoom: 10 }
];

const PERSPECTIVES = [
  { id: 'all', label: '🌐 全機能總覽', color: '#38BDF8', desc: '綜合 15 分鐘 TOD 多元機能指標' },
  { id: 'senior', label: '👵 銀髮慢箋醫療視角', color: '#F43F5E', desc: '聚焦 300m 健保藥局、家醫診所與長照可達性' },
  { id: 'student', label: '🎓 學生通學文教視角', color: '#10B981', desc: '聚焦 500m 學校、補習班與 YouBike 微循環' },
  { id: 'commuter', label: '💼 通勤超商早餐視角', color: '#A855F7', desc: '聚焦站前 200m 7-11/全家照明錨點與接駁' },
  { id: 'desert', label: '🚨 機能缺口與沙漠探針', color: '#EF4444', desc: '專注檢視醫療盲區、生鮮沙漠與偏鄉生活圈' }
];

export default function UrbanAmenityAccessibilityLab({ basemap = 'dark' }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [perspective, setPerspective] = useState('all');
  const [selectedHub, setSelectedHub] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMacroInsights, setShowMacroInsights] = useState(true);
  const [currentZoom, setCurrentZoom] = useState(8);

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const tileLayerRef = useRef(null);
  const hubLayersRef = useRef([]);
  const poiLayersRef = useRef([]);
  const circleLayersRef = useRef([]);

  // 1. 載入 15 分鐘都市機能資料
  useEffect(() => {
    const baseUrl = import.meta.env.BASE_URL || '/';
    const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    fetch(`${cleanBase}urban_amenities_mobility.json`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(json => {
        setData(json);
        setLoading(false);
        // 預設選中全台第 1 大樞紐或萬芳醫院站
        if (json.hubs_amenity_profile && json.hubs_amenity_profile.length > 0) {
          setSelectedHub(json.hubs_amenity_profile[0]);
        }
      })
      .catch(err => {
        console.error('載入 15 分鐘微生活圈機能資料失敗:', err);
        setLoading(false);
      });
  }, []);

  // 2. 初始化 Leaflet 地圖
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [23.95, 120.95],
      zoom: 8,
      minZoom: 7,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false
    });

    tileLayerRef.current = L.tileLayer(BASEMAP_TILES[basemap]?.url || BASEMAP_TILES.dark.url, {
      attribution: BASEMAP_TILES[basemap]?.attribution || BASEMAP_TILES.dark.attribution,
      subdomains: 'abc',
      maxZoom: 19
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapRef.current = map;

    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(resizeTimer);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 3. 切換底圖
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;
    mapRef.current.removeLayer(tileLayerRef.current);
    tileLayerRef.current = L.tileLayer(BASEMAP_TILES[basemap]?.url || BASEMAP_TILES.dark.url, {
      attribution: BASEMAP_TILES[basemap]?.attribution || BASEMAP_TILES.dark.attribution,
      subdomains: 'abc',
      maxZoom: 19
    }).addTo(mapRef.current);
  }, [basemap]);

  // 4. 切換生活圈平移
  const handleSelectRegion = (regId) => {
    setSelectedRegion(regId);
    const cfg = REGIONS.find(r => r.id === regId) || REGIONS[0];
    if (mapRef.current) {
      mapRef.current.flyTo(cfg.center, cfg.zoom, { duration: 1.0 });
    }
  };

  // 5. 繪製樞紐標記、等時生活圈與 POI 點位
  useEffect(() => {
    if (!mapRef.current || !data) return;

    // 清除既有圖層
    hubLayersRef.current.forEach(l => mapRef.current.removeLayer(l));
    hubLayersRef.current = [];
    circleLayersRef.current.forEach(l => mapRef.current.removeLayer(l));
    circleLayersRef.current = [];
    poiLayersRef.current.forEach(l => mapRef.current.removeLayer(l));
    poiLayersRef.current = [];

    const allHubs = data.hubs_amenity_profile || [];

    // 依據區域、視角與搜尋過濾
    const filteredHubs = allHubs.filter(h => {
      const matchRegion = selectedRegion === 'all' || h.region === selectedRegion;
      const matchSearch = searchQuery === '' || 
        h.hub_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.region_label.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchPerspective = true;
      if (perspective === 'senior') {
        matchPerspective = h.persona_pct?.senior >= 20 || h.amenity_summary?.healthcare_count <= 1;
      } else if (perspective === 'student') {
        matchPerspective = h.persona_pct?.student >= 12 || h.amenity_summary?.education_count >= 1;
      } else if (perspective === 'commuter') {
        matchPerspective = h.persona_pct?.commuter >= 50 || h.amenity_summary?.convenience_count >= 8;
      } else if (perspective === 'desert') {
        matchPerspective = h.is_desert_probe || h.identified_gaps.some(g => g.severity === 'high');
      }

      return matchRegion && matchSearch && matchPerspective;
    });

    filteredHubs.forEach(h => {
      const isSelected = selectedHub?.hub_name === h.hub_name;
      const sum = h.amenity_summary;
      const score = sum.tod_living_score;
      const gradeColor = sum.grade_color;

      // 依當前視角決定主題色與等時圈半徑
      let perspectiveColor = gradeColor;
      let bufferRadius = 500;
      if (perspective === 'senior') {
        perspectiveColor = sum.healthcare_count === 0 ? '#EF4444' : '#F43F5E';
        bufferRadius = 350; // 長者 350m 舒適圈
      } else if (perspective === 'student') {
        perspectiveColor = '#10B981';
        bufferRadius = 600; // 學生含騎車 600m
      } else if (perspective === 'commuter') {
        perspectiveColor = '#A855F7';
        bufferRadius = 400;
      } else if (perspective === 'desert') {
        perspectiveColor = '#EF4444';
      }

      // 繪製微光生活圈 (Walkshed Ring)
      const haloCircle = L.circle([h.lat, h.lng], {
        radius: bufferRadius,
        color: perspectiveColor,
        weight: isSelected ? 2.5 : 1.2,
        fillColor: perspectiveColor,
        fillOpacity: isSelected ? 0.16 : 0.06,
        dashArray: isSelected ? '4, 4' : '6, 6'
      }).addTo(mapRef.current);
      circleLayersRef.current.push(haloCircle);

      // 站點 DivIcon
      const hasHighGap = h.identified_gaps.some(g => g.severity === 'high');
      const gapIconBadge = hasHighGap 
        ? `<div style="position: absolute; top: -6px; right: -6px; width: 14px; height: 14px; border-radius: 50%; background: #EF4444; border: 2px solid #0F172A; box-shadow: 0 0 8px #EF4444;"></div>` 
        : '';

      const markerHtml = `
        <div style="
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(15, 23, 42, 0.92);
          border: 1.5px solid ${isSelected ? '#FFFFFF' : perspectiveColor};
          border-radius: 20px;
          padding: 3px 8px;
          box-shadow: ${isSelected ? `0 0 16px ${perspectiveColor}` : '0 4px 12px rgba(0,0,0,0.5)'};
          cursor: pointer;
          white-space: nowrap;
          position: relative;
          transition: all 0.2s ease;
          transform: ${isSelected ? 'scale(1.12)' : 'scale(1)'};
        ">
          ${gapIconBadge}
          <div style="
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: ${perspectiveColor};
            box-shadow: 0 0 6px ${perspectiveColor};
          "></div>
          <span style="font-size: 11px; font-weight: 800; color: #F8FAFC;">
            ${h.hub_name.split('(')[0]}
          </span>
          <span style="
            font-size: 9.5px;
            font-weight: 700;
            background: ${perspectiveColor}25;
            color: ${perspectiveColor};
            padding: 1px 4px;
            border-radius: 4px;
            font-family: JetBrains Mono, monospace;
          ">
            ${score}
          </span>
        </div>
      `;

      const markerIcon = L.divIcon({
        className: 'urban-amenity-hub-marker',
        html: markerHtml,
        iconSize: [110, 26],
        iconAnchor: [55, 13]
      });

      const marker = L.marker([h.lat, h.lng], { icon: markerIcon, zIndexOffset: isSelected ? 1000 : 200 });

      marker.on('click', () => {
        setSelectedHub(h);
        mapRef.current.flyTo([h.lat, h.lng], 15, { duration: 0.8 });
      });

      marker.addTo(mapRef.current);
      hubLayersRef.current.push(marker);
    });

    // 6. 如果有選中特定站點，繪製周邊真實 POI 微型標記
    if (selectedHub && mapRef.current.getZoom() >= 13) {
      const np = selectedHub.nearest_pois || {};
      const allNearPois = [
        ...(np.convenience || []).map(p => ({ ...p, icon: '🏪', color: '#F97316', label: '便利超商' })),
        ...(np.healthcare || []).map(p => ({ ...p, icon: '💊', color: '#10B981', label: '醫療藥局' })),
        ...(np.education || []).map(p => ({ ...p, icon: '🏫', color: '#38BDF8', label: '學校文教' })),
        ...(np.supermarket || []).map(p => ({ ...p, icon: '🛒', color: '#F59E0B', label: '生鮮超市' }))
      ];

      allNearPois.forEach(poi => {
        if (!poi.lat || !poi.lon) return;

        const poiHtml = `
          <div style="
            background: rgba(15, 23, 42, 0.9);
            border: 1px solid ${poi.color};
            border-radius: 6px;
            padding: 2px 6px;
            display: flex;
            align-items: center;
            gap: 3px;
            font-size: 10px;
            color: #F8FAFC;
            box-shadow: 0 2px 8px rgba(0,0,0,0.6);
            white-space: nowrap;
          ">
            <span>${poi.icon}</span>
            <span style="font-weight: 600;">${poi.name}</span>
            <span style="color: ${poi.color}; font-size: 8.5px; font-family: JetBrains Mono, monospace;">${poi.distance_m}m</span>
          </div>
        `;

        const poiIcon = L.divIcon({
          className: 'poi-glyph-marker',
          html: poiHtml,
          iconSize: [90, 20],
          iconAnchor: [45, 10]
        });

        const pMarker = L.marker([poi.lat, poi.lon], { icon: poiIcon, zIndexOffset: 500 });
        pMarker.addTo(mapRef.current);
        poiLayersRef.current.push(pMarker);
      });
    }

  }, [data, selectedRegion, perspective, selectedHub, searchQuery, currentZoom]);

  if (loading) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0B0F19',
        color: '#38BDF8',
        fontSize: '14px',
        fontWeight: '700',
        gap: '10px'
      }}>
        <div style={{
          width: '20px',
          height: '20px',
          border: '2px solid rgba(56, 189, 248, 0.2)',
          borderTopColor: '#38BDF8',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <span>載入 15分鐘微生活圈 · 都市機能與客群可達性資料庫...</span>
      </div>
    );
  }

  const macroFindings = data?.macro_insights?.key_findings || [];
  const hubsList = data?.hubs_amenity_profile || [];
  const selectedSum = selectedHub?.amenity_summary || { convenience_count: 0, healthcare_count: 0, education_count: 0, supermarket_count: 0, tod_living_score: 0, grade: '' };
  const persona = selectedHub?.persona_pct || {};

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#0A0F1D' }}>
      
      {/* 1. 地圖容器 */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

      {/* 2. 頂部左側懸浮控制列：客群視角 + 生活圈過濾 */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        zIndex: 400,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxWidth: '460px'
      }}>
        {/* 標題與簡介卡 */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '12px',
          padding: '12px 14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <Compass size={17} color="#38BDF8" />
              <h3 style={{ margin: 0, fontSize: '14.5px', fontWeight: '900', color: '#F8FAFC' }}>
                15分鐘微生活圈 · 都市機能可達性
              </h3>
            </div>
            <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
              OSM 2,070 POI 實證
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', lineHeight: '1.45' }}>
            結合 OpenStreetMap 與 76 大轉乘樞紐，診斷周邊 500m 步行圈內<strong>便利超商、醫療藥局、學校文教、生鮮超市</strong>健全度與客群缺口。
          </p>

          {/* 視角切換器 */}
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', marginTop: '10px', paddingBottom: '2px' }}>
            {PERSPECTIVES.map(p => {
              const isSel = perspective === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setPerspective(p.id)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '10.5px',
                    fontWeight: isSel ? '800' : '500',
                    border: isSel ? `1px solid ${p.color}` : '1px solid rgba(255,255,255,0.08)',
                    background: isSel ? `${p.color}25` : 'rgba(30, 41, 59, 0.6)',
                    color: isSel ? '#FFFFFF' : '#94a3b8',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 生活圈地域選擇與搜尋 */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          padding: '8px 10px',
          display: 'flex',
          gap: '6px',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {REGIONS.map(r => (
              <button
                key={r.id}
                onClick={() => handleSelectRegion(r.id)}
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: selectedRegion === r.id ? '800' : '500',
                  border: 'none',
                  background: selectedRegion === r.id ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                  color: selectedRegion === r.id ? '#38BDF8' : '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '2px 6px' }}>
            <Search size={12} color="#64748b" />
            <input
              type="text"
              placeholder="搜尋站點..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '10.5px',
                outline: 'none',
                width: '100%',
                marginLeft: '4px'
              }}
            />
          </div>
        </div>
      </div>

      {/* 3. 頂部宏觀洞察橫幅膠囊 (可收折) */}
      {showMacroInsights && (
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 400,
          background: 'rgba(15, 23, 42, 0.94)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(249, 115, 22, 0.3)',
          borderRadius: '12px',
          padding: '12px 14px',
          maxWidth: '380px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '800', color: '#FB923C' }}>
              <Flame size={14} /> 4 大微生活圈宏觀大數據發現
            </div>
            <button
              onClick={() => setShowMacroInsights(false)}
              style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px' }}
            >
              <X size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {macroFindings.map((f, idx) => (
              <div key={idx} style={{
                background: 'rgba(30, 41, 59, 0.5)',
                borderRadius: '6px',
                padding: '6px 8px',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#F1F5F9' }}>{f.title}</span>
                  <strong style={{ fontSize: '11px', color: '#38BDF8', fontFamily: 'JetBrains Mono, monospace' }}>{f.metric}</strong>
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8', lineHeight: '1.4' }}>
                  {f.insight}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. 底部右側：選取站點詳細診斷卡 + 四芒星生活機能雷達 */}
      {selectedHub && (
        <div style={{
          position: 'absolute',
          bottom: '24px',
          right: '16px',
          zIndex: 400,
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          borderRadius: '16px',
          padding: '16px 18px',
          width: '420px',
          maxWidth: 'calc(100vw - 32px)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* 站名與評級標頭 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: '#F8FAFC' }}>
                  {selectedHub.hub_name}
                </h4>
                <span style={{
                  fontSize: '10px',
                  background: `${selectedSum.grade_color}25`,
                  color: selectedSum.grade_color,
                  border: `1px solid ${selectedSum.grade_color}50`,
                  padding: '2px 7px',
                  borderRadius: '6px',
                  fontWeight: '800'
                }}>
                  {selectedSum.grade}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                {selectedHub.region_label} · 週轉乘量: <strong style={{ color: '#cbd5e1' }}>{selectedHub.weekly_transfer_volume.toLocaleString()}</strong> 人次
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>15分生活圈總分</div>
              <div style={{
                fontSize: '22px',
                fontWeight: '900',
                fontFamily: 'JetBrains Mono, monospace',
                color: selectedSum.grade_color
              }}>
                {selectedSum.tod_living_score}
              </div>
            </div>
          </div>

          {/* 四芒星生活機能儀表 (Amenity Balance Diamond) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '6px',
            background: 'rgba(30, 41, 59, 0.5)',
            padding: '10px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                <Store size={11} /> 便利超商
              </div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#fff', marginTop: '2px', fontFamily: 'JetBrains Mono, monospace' }}>
                {selectedSum.convenience_count}
              </div>
              <div style={{ fontSize: '9px', color: '#64748b' }}>
                7-11: {selectedHub.brand_breakdown?.seven_eleven} | 全家: {selectedHub.brand_breakdown?.family_mart}
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: selectedSum.healthcare_count === 0 ? '#EF4444' : '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                <HeartPulse size={11} /> 醫療藥局
              </div>
              <div style={{
                fontSize: '16px',
                fontWeight: '800',
                color: selectedSum.healthcare_count === 0 ? '#EF4444' : '#fff',
                marginTop: '2px',
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                {selectedSum.healthcare_count}
              </div>
              <div style={{ fontSize: '9px', color: selectedSum.healthcare_count === 0 ? '#EF4444' : '#64748b' }}>
                {selectedSum.healthcare_count === 0 ? '🚨 盲區缺乏' : '健保/診所'}
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                <GraduationCap size={11} /> 學校文教
              </div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#fff', marginTop: '2px', fontFamily: 'JetBrains Mono, monospace' }}>
                {selectedSum.education_count}
              </div>
              <div style={{ fontSize: '9px', color: '#64748b' }}>
                高中/大專
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: selectedSum.supermarket_count === 0 ? '#F59E0B' : '#FBBF24', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                <ShoppingBag size={11} /> 生鮮超市
              </div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#fff', marginTop: '2px', fontFamily: 'JetBrains Mono, monospace' }}>
                {selectedSum.supermarket_count}
              </div>
              <div style={{ fontSize: '9px', color: '#64748b' }}>
                全聯/家樂福
              </div>
            </div>
          </div>

          {/* 客群身分比率與需求契合 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#94a3b8', borderBottom: '1px dashed rgba(255,255,255,0.08)', paddingBottom: '6px' }}>
            <span>💼 上班通勤: <strong style={{ color: '#38BDF8' }}>{persona.commuter}%</strong></span>
            <span>👵 銀髮樂齡: <strong style={{ color: '#F43F5E' }}>{persona.senior}%</strong></span>
            <span>🎓 學生通學: <strong style={{ color: '#10B981' }}>{persona.student}%</strong></span>
            <span>💳 TPASS: <strong style={{ color: '#A855F7' }}>{persona.tpass}%</strong></span>
          </div>

          {/* 偵測到的機能缺口警報 (Identified Amenity Gaps) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <AlertTriangle size={13} color="#F59E0B" />
              <span>生活機能診斷與缺口警報：</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {selectedHub.identified_gaps?.map((g, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '10.5px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: `${g.color}18`,
                    border: `1px solid ${g.color}40`,
                    color: g.color,
                    fontWeight: '700'
                  }}
                >
                  {g.label}
                </span>
              ))}
            </div>
          </div>

          {/* 政策改善建議 (Policy Recommendation) */}
          {selectedHub.policy_recommendation && (
            <div style={{
              background: 'rgba(56, 189, 248, 0.08)',
              borderLeft: '3px solid #38BDF8',
              borderRadius: '4px 8px 8px 4px',
              padding: '8px 10px',
              fontSize: '11px',
              color: '#cbd5e1',
              lineHeight: '1.45'
            }}>
              💡 <strong>政策調度啟示：</strong>{selectedHub.policy_recommendation}
            </div>
          )}
        </div>
      )}

      {/* 5. 底部左側：圖例說明 */}
      <div style={{
        position: 'absolute',
        bottom: '24px',
        left: '16px',
        zIndex: 400,
        background: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '10px',
        padding: '8px 12px',
        fontSize: '10.5px',
        color: '#94a3b8',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
          <span>A+ 卓越生活圈 (80+)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38BDF8', display: 'inline-block' }}></span>
          <span>A 活力商圈 (60~79)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }}></span>
          <span>B 偏斜機能 (40~59)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', display: 'inline-block' }}></span>
          <span>C 匱乏待補區 (&lt;40)</span>
        </div>
      </div>

    </div>
  );
}
