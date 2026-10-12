import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  TrendingUp, CloudRain, Moon, Sparkles, Building2, Store,
  Compass, Search, ArrowUpRight, ArrowDownRight, Layers,
  ShoppingBag, Coffee, ShieldCheck, AlertTriangle, Flame,
  DollarSign, Users, Award, MapPin, X, Utensils, Landmark,
  Car, Clock, Waves, Navigation
} from 'lucide-react';
import { CARTO_TILES, CARTO_ATTRIBUTION, NLSC_TILES, NLSC_ATTRIBUTION } from '../utils/basemap';

const BASEMAP_TILES = {
  emap: {
    url: NLSC_TILES.emap,
    attribution: NLSC_ATTRIBUTION,
    maxZoom: 19
  },
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

const REGIONS = [
  { id: 'all', label: '🌐 全台總覽', center: [23.95, 120.95], zoom: 8 },
  { id: 'north', label: '🏙️ 北部都會', center: [25.045, 121.530], zoom: 12 },
  { id: 'central', label: '🌲 中部生活圈', center: [24.135, 120.680], zoom: 12 },
  { id: 'south', label: '☀️ 南部生活圈', center: [22.650, 120.350], zoom: 11 },
  { id: 'east', label: '🌊 東部生活圈', center: [24.300, 121.650], zoom: 10 }
];

const CATEGORIES = [
  { id: 'all', label: '全部商業熱點', icon: Layers, countKey: 'total_districts', prefix: '🌐' },
  { id: 'night_market', label: '全台旗艦夜市', icon: Flame, countKey: 'night_markets_count', prefix: '🍢' },
  { id: 'old_street', label: '歷史老街名勝', icon: Landmark, countKey: 'old_streets_count', prefix: '🏛️' },
  { id: 'general', label: '交通商務樞紐', icon: Store, countKey: 'general_districts_count', prefix: '🏬' }
];

const COMMERCIAL_DIMENSIONS = [
  {
    id: 'vitality',
    label: '🏬 商圈生命週期',
    subLabel: '繁榮 vs 沒落預警',
    icon: TrendingUp,
    color: '#F43F5E',
    desc: '透過平日 vs 假日爆發比 (WWR) 與客流底氣，診斷商圈處於爆發擴張、穩健成熟還是空洞化'
  },
  {
    id: 'weather',
    label: '🌧️ 雨天經濟學',
    subLabel: '避雨商場 vs 露天受創',
    icon: CloudRain,
    color: '#38BDF8',
    desc: '衡量大雨天人流彈性：地下街與空橋商場逆勢聚客 (+20%) vs 露天老街夜市人潮雪崩 (-50%)'
  },
  {
    id: 'night',
    label: '🌙 深夜經濟活力',
    subLabel: '夜貓商圈 vs 提早熄燈',
    icon: Moon,
    color: '#A855F7',
    desc: '分析 21:00 以後夜間出站佔比與深夜宵夜/酒吧/24h超商密度，評估夜生活商業熱度'
  },
  {
    id: 'tod',
    label: '💡 TOD 零售商機窪地',
    subLabel: '招商缺口與展店潛力',
    icon: DollarSign,
    color: '#F59E0B',
    desc: '對比巨大客流需求 vs 周邊商業設施供給，揪出「有流量但機能窮」的超高潛力展店窪地'
  }
];

// 跨縣市人流比例條漸層調色盤
const ORIGIN_PALETTE = ['#38BDF8', '#A855F7', '#F59E0B', '#10B981', '#EC4899'];

export default function CommercialPulseLab({ basemap = 'emap' }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDimension, setActiveDimension] = useState('vitality');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentZoom, setCurrentZoom] = useState(8);

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const tileLayerRef = useRef(null);
  const currentBasemapRef = useRef(basemap);
  const markerLayersRef = useRef([]);
  const haloLayersRef = useRef([]);
  const poiLayersRef = useRef([]);

  // 1. 載入商圈商業大數據
  useEffect(() => {
    const baseUrl = import.meta.env.BASE_URL || '/';
    const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    fetch(`${cleanBase}commercial_district_pulse.json`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(json => {
        setData(json);
        setLoading(false);
        if (json.districts && json.districts.length > 0) {
          setSelectedDistrict(json.districts[0]);
        }
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.invalidateSize();
          }
        }, 150);
      })
      .catch(err => {
        console.error('載入商圈商業大數據失敗:', err);
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

    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

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

  // 3. 切換底圖
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;
    if (currentBasemapRef.current === basemap) return;
    currentBasemapRef.current = basemap;
    mapRef.current.removeLayer(tileLayerRef.current);
    tileLayerRef.current = L.tileLayer(BASEMAP_TILES[basemap]?.url || BASEMAP_TILES.emap.url, {
      attribution: BASEMAP_TILES[basemap]?.attribution || BASEMAP_TILES.emap.attribution,
      subdomains: BASEMAP_TILES[basemap]?.subdomains || 'abcd',
      maxZoom: BASEMAP_TILES[basemap]?.maxZoom || 19
    }).addTo(mapRef.current);
  }, [basemap]);

  // 4. 生活圈視角切換
  const handleSelectRegion = (regId) => {
    setSelectedRegion(regId);
    const cfg = REGIONS.find(r => r.id === regId) || REGIONS[0];
    if (mapRef.current) {
      mapRef.current.flyTo(cfg.center, cfg.zoom, { duration: 1.0 });
    }
  };

  // 5. 分類視角切換
  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId);
    if (!data?.districts) return;

    // 若切換分類後，當前選中的商圈不在該類別內，自動選中第一筆該類別商圈並鏡頭跟隨
    const matching = data.districts.filter(d => {
      const matchCat = catId === 'all' || d.category_type === catId;
      const matchReg = selectedRegion === 'all' || d.region === selectedRegion;
      return matchCat && matchReg;
    });

    if (matching.length > 0 && (!selectedDistrict || (catId !== 'all' && selectedDistrict.category_type !== catId))) {
      const target = matching[0];
      setSelectedDistrict(target);
      if (mapRef.current) {
        mapRef.current.flyTo([target.lat, target.lng], Math.max(mapRef.current.getZoom(), 12), { duration: 0.9 });
      }
    }
  };

  // 6. 渲染商圈標記、影響半徑、微型 POI 與互動 Tooltip
  useEffect(() => {
    if (!mapRef.current || !data) return;

    // 清除舊圖層
    markerLayersRef.current.forEach(l => mapRef.current.removeLayer(l));
    markerLayersRef.current = [];
    haloLayersRef.current.forEach(l => mapRef.current.removeLayer(l));
    haloLayersRef.current = [];
    poiLayersRef.current.forEach(l => mapRef.current.removeLayer(l));
    poiLayersRef.current = [];

    const allDistricts = data.districts || [];

    // 複合篩選：類別 + 生活圈 + 搜尋詞（支援搜尋商圈名、美食、景點、廟宇）
    const q = searchQuery.toLowerCase().trim();
    const filtered = allDistricts.filter(d => {
      const matchCategory = selectedCategory === 'all' || d.category_type === selectedCategory;
      const matchRegion = selectedRegion === 'all' || d.region === selectedRegion;
      const matchSearch = q === '' ||
        d.hub_name.toLowerCase().includes(q) ||
        d.commercial_title.toLowerCase().includes(q) ||
        d.region_label.toLowerCase().includes(q) ||
        (d.local_specialties?.food || []).some(f => f.toLowerCase().includes(q)) ||
        (d.local_specialties?.attractions || []).some(a => a.toLowerCase().includes(q)) ||
        (d.local_specialties?.temples || []).some(t => t.toLowerCase().includes(q));
      return matchCategory && matchRegion && matchSearch;
    });

    filtered.forEach(d => {
      const isSelected = selectedDistrict?.hub_name === d.hub_name;

      // 依當前維度決定主題色與數值
      let dimColor = '#38BDF8';
      let mainBadgeValue = '';

      if (activeDimension === 'vitality') {
        dimColor = d.vitality.color;
        mainBadgeValue = `${d.vitality.score}分`;
      } else if (activeDimension === 'weather') {
        dimColor = d.weather_resilience.color;
        const shift = d.weather_resilience.rain_shift_pct;
        mainBadgeValue = shift > 0 ? `+${shift}%` : `${shift}%`;
      } else if (activeDimension === 'night') {
        dimColor = d.night_economy.color;
        mainBadgeValue = `${d.night_economy.night_share_pct}%`;
      } else if (activeDimension === 'tod') {
        dimColor = d.tod_opportunity.color;
        mainBadgeValue = `比 ${d.tod_opportunity.mismatch_ratio}`;
      }

      // 類別識別 Emoji 與標籤色
      let catIcon = '🏬';
      let catBorderGlow = dimColor;
      if (d.category_type === 'night_market') {
        catIcon = '🍢';
        catBorderGlow = '#F43F5E';
      } else if (d.category_type === 'old_street') {
        catIcon = '🏛️';
        catBorderGlow = '#10B981';
      }

      // 500m 商圈核心影響光環 (Walkshed Halo)
      const halo = L.circle([d.lat, d.lng], {
        radius: 500,
        color: catBorderGlow,
        weight: isSelected ? 2.5 : 1.0,
        fillColor: catBorderGlow,
        fillOpacity: isSelected ? 0.22 : 0.05,
        dashArray: isSelected ? '4, 4' : '6, 6'
      }).addTo(mapRef.current);
      haloLayersRef.current.push(halo);

      // 商圈膠囊標記 DivIcon
      const markerHtml = `
        <div style="
          display: flex;
          align-items: center;
          gap: 5px;
          background: rgba(15, 23, 42, 0.95);
          border: 1.5px solid ${isSelected ? '#FFFFFF' : catBorderGlow};
          border-radius: 20px;
          padding: 3px 9px;
          box-shadow: ${isSelected ? `0 0 18px ${catBorderGlow}` : '0 4px 12px rgba(0,0,0,0.65)'};
          cursor: pointer;
          white-space: nowrap;
          position: relative;
          transition: all 0.2s ease;
          transform: ${isSelected ? 'scale(1.14)' : 'scale(1)'};
        ">
          <span style="font-size: 11px;">${catIcon}</span>
          <span style="
            font-size: 11.5px;
            font-weight: 800;
            color: #FFFFFF;
          ">${d.hub_name}</span>
          <span style="
            font-size: 10px;
            font-weight: 700;
            font-family: JetBrains Mono, monospace;
            color: ${dimColor};
            background: ${dimColor}18;
            padding: 1px 5px;
            border-radius: 4px;
          ">${mainBadgeValue}</span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'commercial-hub-marker',
        html: markerHtml,
        iconSize: [124, 28],
        iconAnchor: [62, 14]
      });

      const marker = L.marker([d.lat, d.lng], { icon: customIcon, zIndexOffset: isSelected ? 1000 : 100 });

      // 構建精美互動 Tooltip (Hover 即展現「人流來源溯源」與「在地美食名勝」)
      const origins = d.mobility_origin_analysis?.intercity_origins || [];
      const originPreviewHtml = origins.slice(0, 3).map((o, idx) => `
        <span style="
          background: rgba(56, 189, 248, 0.12);
          border: 1px solid rgba(56, 189, 248, 0.3);
          color: #7DD3FC;
          padding: 1px 5px;
          border-radius: 4px;
          font-size: 9.5px;
          font-weight: 700;
        ">
          ${o.city} <strong style="color: #FFFFFF; font-family: JetBrains Mono, monospace;">${o.pct}%</strong>
        </span>
      `).join(' ');

      const foods = d.local_specialties?.food || [];
      const foodPillsHtml = foods.slice(0, 3).map(f => `
        <span style="
          background: rgba(244, 63, 94, 0.15);
          border: 1px solid rgba(244, 63, 94, 0.35);
          color: #FDA4AF;
          padding: 1px 6px;
          border-radius: 4px;
          font-size: 9.5px;
          font-weight: 600;
        ">🥢 ${f}</span>
      `).join(' ');

      const attractions = [
        ...(d.local_specialties?.attractions || []).slice(0, 2),
        ...(d.local_specialties?.temples || []).slice(0, 1)
      ];
      const attrPillsHtml = attractions.slice(0, 2).map(a => `
        <span style="
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.35);
          color: #6EE7B7;
          padding: 1px 6px;
          border-radius: 4px;
          font-size: 9.5px;
          font-weight: 600;
        ">🏞️ ${a}</span>
      `).join(' ');

      const catBadgeText = d.category_type === 'night_market'
        ? '<span style="background: rgba(244,63,94,0.2); color:#F43F5E; border:1px solid #F43F5E55; padding:1px 6px; border-radius:10px; font-size:9.5px; font-weight:800;">🍢 旗艦夜市</span>'
        : d.category_type === 'old_street'
        ? '<span style="background: rgba(16,185,129,0.2); color:#10B981; border:1px solid #10B98155; padding:1px 6px; border-radius:10px; font-size:9.5px; font-weight:800;">🏛️ 老街名勝</span>'
        : '<span style="background: rgba(56,189,248,0.2); color:#38BDF8; border:1px solid #38BDF855; padding:1px 6px; border-radius:10px; font-size:9.5px; font-weight:800;">🏬 商業樞紐</span>';

      const tooltipHtml = `
        <div style="
          padding: 11px 13px;
          font-family: 'Outfit', 'Noto Sans TC', -apple-system, sans-serif;
          min-width: 270px;
          max-width: 320px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        ">
          <!-- 抬頭與分類標籤 -->
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <span style="font-size: 10px; color: #94A3B8; font-weight: 600;">📍 ${d.region_label}</span>
            ${catBadgeText}
          </div>
          
          <div style="font-size: 14px; font-weight: 900; color: #FFFFFF; line-height: 1.25;">
            ${d.commercial_title}
          </div>

          <!-- 人流來源解構速覽 -->
          <div style="
            background: rgba(15, 23, 42, 0.85);
            border: 1px solid rgba(56, 189, 248, 0.25);
            border-radius: 8px;
            padding: 6px 8px;
            display: flex;
            flex-direction: column;
            gap: 4px;
          ">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 10px; font-weight: 800; color: #38BDF8; display: flex; align-items: center; gap: 4px;">
                🚀 人流來源溯源 (OD)
              </span>
              <span style="font-size: 9px; color: #CBD5E1; font-weight: 700; font-family: JetBrains Mono, monospace;">
                WWR ${d.vitality.wwr_ratio}x
              </span>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 3px;">
              ${originPreviewHtml}
            </div>
            <div style="font-size: 9.5px; color: #94A3B8; line-height: 1.35;">
              ⏰ ${d.mobility_origin_analysis?.peak_hours_desc || ''}
            </div>
          </div>

          <!-- 在地美食與名勝速覽 -->
          <div style="
            background: rgba(15, 23, 42, 0.85);
            border: 1px solid rgba(244, 63, 94, 0.25);
            border-radius: 8px;
            padding: 6px 8px;
            display: flex;
            flex-direction: column;
            gap: 4px;
          ">
            <span style="font-size: 10px; font-weight: 800; color: #F43F5E;">
              🍢 在地特色小吃與古剎勝景
            </span>
            <div style="display: flex; flex-wrap: wrap; gap: 3px;">
              ${foodPillsHtml}
            </div>
            ${attrPillsHtml ? `<div style="display: flex; flex-wrap: wrap; gap: 3px;">${attrPillsHtml}</div>` : ''}
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 8.5px; color: #64748B; margin-top: 1px;">
            <span>週運量: ${d.weekly_transfer_volume.toLocaleString()} 人次</span>
            <span>💡 點擊展開深度商業 HUD 面板</span>
          </div>
        </div>
      `;

      marker.bindTooltip(tooltipHtml, {
        direction: 'top',
        offset: [0, -14],
        opacity: 1,
        className: 'commercial-pulse-tooltip'
      });

      marker.on('click', () => {
        setSelectedDistrict(d);
        if (mapRef.current) {
          mapRef.current.flyTo([d.lat, d.lng], Math.max(mapRef.current.getZoom(), 13), { duration: 0.8 });
        }
      });

      marker.addTo(mapRef.current);
      markerLayersRef.current.push(marker);
    });

    // 7. 若選中特定商圈且 Zoom 較大，渲染周邊實體店家微型標記
    if (selectedDistrict && mapRef.current.getZoom() >= 13) {
      const np = selectedDistrict.nearest_pois || {};
      const allPois = [
        ...(np.convenience || []).map(p => ({ ...p, icon: '🏪', color: '#F97316', label: '便利超商' })),
        ...(np.healthcare || []).map(p => {
          let icon = '💊';
          let label = '藥局';
          let color = '#10B981';
          if (p.sub_type === 'hospital' || (p.name && p.name.includes('醫院'))) {
            icon = '🏥';
            label = '大型醫院';
            color = '#F43F5E';
          } else if (p.sub_type === 'clinic' || (p.name && p.name.includes('診所'))) {
            icon = '🩺';
            label = '專科診所';
            color = '#34D399';
          }
          return { ...p, icon, color, label };
        }),
        ...(np.education || []).map(p => ({ ...p, icon: '🏫', color: '#38BDF8', label: '學校文教' })),
        ...(np.supermarket || []).map(p => ({ ...p, icon: '🛒', color: '#F59E0B', label: '生鮮超市' }))
      ];

      allPois.forEach(poi => {
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

  }, [data, activeDimension, selectedRegion, selectedCategory, selectedDistrict, searchQuery, currentZoom]);

  const currentDimConfig = COMMERCIAL_DIMENSIONS.find(d => d.id === activeDimension) || COMMERCIAL_DIMENSIONS[0];

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#0A0F1D' }}>
      
      {/* 1. 地圖容器 */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, background: '#07090e', zIndex: 1 }} />

      {/* 載入中遮罩 */}
      {loading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 999,
          backgroundColor: '#07090e',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#38BDF8'
        }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid rgba(56, 189, 248, 0.2)', borderTopColor: '#38BDF8', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
          <div style={{ fontSize: '14px', fontWeight: '700' }}>載入全台商圈、夜市與老街脈動商業大數據...</div>
        </div>
      )}

      {/* 2. 頂部左側懸浮控制列：商圈商業脈動地圖 + 類別分頁 + 四大商業維度 + 生活圈切換 */}
      <div style={{
        position: 'absolute',
        top: '68px',
        left: '16px',
        zIndex: 400,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxWidth: '430px'
      }}>
        {/* 標題與簡介卡 */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.94)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: '12px',
          padding: '12px 14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <TrendingUp size={18} color="#F43F5E" />
              <h3 style={{ margin: 0, fontSize: '14.5px', fontWeight: '900', color: '#F8FAFC' }}>
                商圈商業脈動與投資決策地圖
              </h3>
            </div>
            <span style={{ fontSize: '10px', background: 'rgba(244, 63, 94, 0.15)', color: '#F43F5E', padding: '2px 7px', borderRadius: '4px', fontWeight: '800' }}>
              {data?.macro_stats?.total_districts || 102} 熱點 · 全台夜市老街深度解析
            </span>
          </div>
          <p style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#94a3b8', lineHeight: '1.45' }}>
            融合<strong>多模態大眾票證、氣象降雨衝擊與文化民俗觀光</strong>，深度解構全台商圈、旗艦夜市與歷史老街的人流來源、在地特色與投資決策。
          </p>

          {/* 類別過濾切換條 (全部 / 旗艦夜市 / 歷史老街 / 商業樞紐) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '4px',
            marginBottom: '10px',
            background: 'rgba(0, 0, 0, 0.35)',
            padding: '4px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            {CATEGORIES.map(cat => {
              const isSel = selectedCategory === cat.id;
              const count = data?.macro_stats?.[cat.countKey] || (cat.id === 'all' ? 102 : cat.id === 'night_market' ? 11 : cat.id === 'old_street' ? 10 : 81);
              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '5px 2px',
                    borderRadius: '6px',
                    border: isSel ? '1.5px solid #38BDF8' : 'none',
                    background: isSel ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                    color: isSel ? '#FFFFFF' : '#94A3B8',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '12px' }}>{cat.prefix}</span>
                  <span style={{ fontSize: '10px', fontWeight: isSel ? '800' : '600' }}>{cat.label.slice(2)}</span>
                  <span style={{ fontSize: '8.5px', fontFamily: 'JetBrains Mono, monospace', color: isSel ? '#38BDF8' : '#64748B' }}>
                    {count} 處
                  </span>
                </button>
              );
            })}
          </div>

          {/* 四大商業維度切換器 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
            {COMMERCIAL_DIMENSIONS.map(dim => {
              const isSel = activeDimension === dim.id;
              const Icon = dim.icon;
              return (
                <button
                  key={dim.id}
                  onClick={() => setActiveDimension(dim.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 8px',
                    borderRadius: '8px',
                    border: isSel ? `1.5px solid ${dim.color}` : '1px solid rgba(255,255,255,0.08)',
                    background: isSel ? `${dim.color}22` : 'rgba(30, 41, 59, 0.6)',
                    color: isSel ? '#FFFFFF' : '#94a3b8',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={14} color={isSel ? dim.color : '#64748b'} />
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: isSel ? '800' : '600' }}>{dim.label}</div>
                    <div style={{ fontSize: '9px', color: isSel ? dim.color : '#64748b' }}>{dim.subLabel}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 生活圈地域選擇與全域搜尋列 */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          padding: '8px 10px',
          display: 'flex',
          gap: '6px',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '3px' }}>
            {REGIONS.map(r => (
              <button
                key={r.id}
                onClick={() => handleSelectRegion(r.id)}
                style={{
                  padding: '3px 7px',
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
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.35)', borderRadius: '6px', padding: '2px 6px' }}>
            <Search size={12} color="#64748b" />
            <input
              type="text"
              placeholder="搜尋夜市、老街、特產、廟宇..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '10px',
                outline: 'none',
                width: '100%',
                marginLeft: '4px'
              }}
            />
          </div>
        </div>
      </div>

      {/* 3. 右側深度商業決策 HUD 面板 (Commercial Intelligence HUD Panel - 深度解構人流來源與在地特色) */}
      {selectedDistrict && (
        <div style={{
          position: 'absolute',
          top: '68px',
          right: '16px',
          width: '395px',
          maxHeight: 'calc(100vh - 100px)',
          zIndex: 400,
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(16px)',
          border: `1px solid ${currentDimConfig.color}44`,
          borderRadius: '14px',
          boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* 商圈抬頭與分類徽章 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>
                  📍 {selectedDistrict.region_label}
                </span>
                {selectedDistrict.category_type === 'night_market' && (
                  <span style={{ fontSize: '9.5px', background: 'rgba(244, 63, 94, 0.2)', color: '#F43F5E', border: '1px solid rgba(244, 63, 94, 0.5)', padding: '1px 6px', borderRadius: '10px', fontWeight: '800' }}>
                    🍢 旗艦夜市
                  </span>
                )}
                {selectedDistrict.category_type === 'old_street' && (
                  <span style={{ fontSize: '9.5px', background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.5)', padding: '1px 6px', borderRadius: '10px', fontWeight: '800' }}>
                    🏛️ 歷史老街名勝
                  </span>
                )}
                {selectedDistrict.category_type === 'general' && (
                  <span style={{ fontSize: '9.5px', background: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8', border: '1px solid rgba(56, 189, 248, 0.5)', padding: '1px 6px', borderRadius: '10px', fontWeight: '800' }}>
                    🏬 商業樞紐
                  </span>
                )}
              </div>
              <span style={{
                fontSize: '10px',
                padding: '2px 8px',
                borderRadius: '12px',
                background: `${selectedDistrict.vitality.color}22`,
                border: `1px solid ${selectedDistrict.vitality.color}55`,
                color: selectedDistrict.vitality.color,
                fontWeight: '800'
              }}>
                週運量: {selectedDistrict.weekly_transfer_volume.toLocaleString()} 人次
              </span>
            </div>
            <h2 style={{ margin: '4px 0 2px 0', fontSize: '18px', fontWeight: '900', color: '#F8FAFC', lineHeight: '1.3' }}>
              {selectedDistrict.commercial_title}
            </h2>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              {selectedDistrict.district_type}
            </div>
          </div>

          {/* 🌟 核心新功能 A：人流來源溯源與時空結構 (Mobility Origin & Dynamics) */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.75)',
            borderRadius: '11px',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '800', color: '#38BDF8' }}>
                <Navigation size={14} color="#38BDF8" />
                <span>🚀 人流來源溯源 (Mobility OD 分解)</span>
              </div>
              <span style={{ fontSize: '10px', color: '#CBD5E1', fontFamily: 'JetBrains Mono, monospace', background: 'rgba(56, 189, 248, 0.15)', padding: '1px 6px', borderRadius: '4px' }}>
                WWR {selectedDistrict.vitality.wwr_ratio}x
              </span>
            </div>

            {/* 跨縣市人流比例長條進度條 */}
            <div style={{ width: '100%', height: '8px', borderRadius: '4px', overflow: 'hidden', display: 'flex', background: 'rgba(255,255,255,0.08)' }}>
              {(selectedDistrict.mobility_origin_analysis?.intercity_origins || []).map((o, idx) => (
                <div
                  key={idx}
                  title={`${o.city}: ${o.pct}%`}
                  style={{
                    width: `${o.pct}%`,
                    height: '100%',
                    background: ORIGIN_PALETTE[idx % ORIGIN_PALETTE.length],
                    transition: 'width 0.3s ease'
                  }}
                />
              ))}
            </div>

            {/* 來源縣市分佈徽章 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {(selectedDistrict.mobility_origin_analysis?.intercity_origins || []).map((o, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '10px',
                    background: 'rgba(30, 41, 59, 0.6)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    borderLeft: `2.5px solid ${ORIGIN_PALETTE[idx % ORIGIN_PALETTE.length]}`
                  }}
                >
                  <span style={{ color: '#E2E8F0' }}>{o.city}</span>
                  <span style={{ color: ORIGIN_PALETTE[idx % ORIGIN_PALETTE.length], fontWeight: '800', fontFamily: 'JetBrains Mono, monospace' }}>
                    {o.pct}%
                  </span>
                </div>
              ))}
            </div>

            {/* 尖峰時段與主要進出走廊 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10px', color: '#94A3B8', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <Clock size={11} color="#F59E0B" style={{ flexShrink: 0 }} />
                <span><strong style={{ color: '#F1F5F9' }}>尖峰湧動：</strong>{selectedDistrict.mobility_origin_analysis?.peak_hours_desc}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <Car size={11} color="#38BDF8" style={{ flexShrink: 0 }} />
                <span><strong style={{ color: '#F1F5F9' }}>抵達走廊：</strong>{selectedDistrict.mobility_origin_analysis?.primary_transit_modes}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <CloudRain size={11} color="#A855F7" style={{ flexShrink: 0 }} />
                <span><strong style={{ color: '#F1F5F9' }}>天候敏感：</strong>{selectedDistrict.mobility_origin_analysis?.weather_sensitivity_desc}</span>
              </div>
            </div>
          </div>

          {/* 🍢 核心新功能 B：在地必吃特產與名勝古剎 (Local Gastronomy & Heritage) */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.75)',
            borderRadius: '11px',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '800', color: '#F43F5E' }}>
              <Utensils size={14} color="#F43F5E" />
              <span>🍢 在地必吃特產與名勝古剎</span>
            </div>

            {/* 體驗主題口號 */}
            {selectedDistrict.local_specialties?.experience_tag && (
              <div style={{
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.25)',
                borderRadius: '6px',
                padding: '5px 8px',
                fontSize: '10.5px',
                color: '#FDA4AF',
                fontWeight: '700',
                lineHeight: '1.4'
              }}>
                {selectedDistrict.local_specialties.experience_tag}
              </div>
            )}

            {/* 必吃特產小吃 */}
            <div>
              <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '700', marginBottom: '3px' }}>
                🥢 必吃名產小吃：
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {(selectedDistrict.local_specialties?.food || []).map((f, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '10px',
                      padding: '2px 7px',
                      borderRadius: '5px',
                      background: 'rgba(244, 63, 94, 0.12)',
                      border: '1px solid rgba(244, 63, 94, 0.3)',
                      color: '#FECDD3',
                      fontWeight: '600'
                    }}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* 玩的名勝/風景/泛舟 */}
            {(selectedDistrict.local_specialties?.attractions || []).length > 0 && (
              <div>
                <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '700', marginBottom: '3px' }}>
                  🏞️ 玩的名勝景觀 / 泛舟遊程：
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {selectedDistrict.local_specialties.attractions.map((a, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '10px',
                        padding: '2px 7px',
                        borderRadius: '5px',
                        background: 'rgba(56, 189, 248, 0.12)',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        color: '#BAE6FD',
                        fontWeight: '600'
                      }}
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 廟宇信仰古剎 */}
            {(selectedDistrict.local_specialties?.temples || []).length > 0 && (
              <div>
                <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '700', marginBottom: '3px' }}>
                  ⛩️ 國寶古剎與廟宇文化：
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {selectedDistrict.local_specialties.temples.map((t, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '10px',
                        padding: '2px 7px',
                        borderRadius: '5px',
                        background: 'rgba(245, 158, 11, 0.12)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        color: '#FDE68A',
                        fontWeight: '600'
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 四大商業雷達指標卡 (4-Axis Commercial Radar Scores) */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            padding: '10px 12px'
          }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#cbd5e1', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Sparkles size={13} color="#F59E0B" />
              <span>四維商業雷達評分 (0 ~ 100)</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', textAlign: 'center' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '6px 4px', borderRadius: '8px', border: activeDimension === 'vitality' ? '1px solid #F43F5E' : 'none' }}>
                <div style={{ fontSize: '9px', color: '#94a3b8' }}>假日聚客</div>
                <div style={{ fontSize: '15px', fontWeight: '900', color: '#F43F5E', fontFamily: 'JetBrains Mono, monospace' }}>
                  {selectedDistrict.radar.vitality}
                </div>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '6px 4px', borderRadius: '8px', border: activeDimension === 'weather' ? '1px solid #38BDF8' : 'none' }}>
                <div style={{ fontSize: '9px', color: '#94a3b8' }}>雨天抗跌</div>
                <div style={{ fontSize: '15px', fontWeight: '900', color: '#38BDF8', fontFamily: 'JetBrains Mono, monospace' }}>
                  {selectedDistrict.radar.weatherproof}
                </div>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '6px 4px', borderRadius: '8px', border: activeDimension === 'night' ? '1px solid #A855F7' : 'none' }}>
                <div style={{ fontSize: '9px', color: '#94a3b8' }}>深夜夜貓</div>
                <div style={{ fontSize: '15px', fontWeight: '900', color: '#A855F7', fontFamily: 'JetBrains Mono, monospace' }}>
                  {selectedDistrict.radar.nightlife}
                </div>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '6px 4px', borderRadius: '8px', border: activeDimension === 'tod' ? '1px solid #F59E0B' : 'none' }}>
                <div style={{ fontSize: '9px', color: '#94a3b8' }}>展店潛力</div>
                <div style={{ fontSize: '15px', fontWeight: '900', color: '#F59E0B', fontFamily: 'JetBrains Mono, monospace' }}>
                  {selectedDistrict.radar.opportunity}
                </div>
              </div>
            </div>
          </div>

          {/* 當前焦點維度深度解析卡 (Current Active Dimension Focus) */}
          <div style={{
            background: `${currentDimConfig.color}10`,
            border: `1.5px solid ${currentDimConfig.color}44`,
            borderRadius: '10px',
            padding: '12px'
          }}>
            {activeDimension === 'vitality' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#F8FAFC' }}>
                    {selectedDistrict.vitality.label}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: '900', color: selectedDistrict.vitality.color, fontFamily: 'JetBrains Mono, monospace' }}>
                    WWR {selectedDistrict.vitality.wwr_ratio} 倍
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: '#cbd5e1', lineHeight: '1.45' }}>
                  {selectedDistrict.vitality.description}
                </p>
              </div>
            )}

            {activeDimension === 'weather' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#F8FAFC' }}>
                    {selectedDistrict.weather_resilience.label}
                  </span>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: '900',
                    color: selectedDistrict.weather_resilience.rain_shift_pct > 0 ? '#10B981' : '#EF4444',
                    fontFamily: 'JetBrains Mono, monospace'
                  }}>
                    {selectedDistrict.weather_resilience.rain_shift_pct > 0 ? `+${selectedDistrict.weather_resilience.rain_shift_pct}%` : `${selectedDistrict.weather_resilience.rain_shift_pct}%`}
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '6px' }}>
                  🏛️ 遮雨防護結構：{selectedDistrict.weather_resilience.shelter_infrastructure}
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: '#cbd5e1', lineHeight: '1.45' }}>
                  {selectedDistrict.weather_resilience.description}
                </p>
              </div>
            )}

            {activeDimension === 'night' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#F8FAFC' }}>
                    {selectedDistrict.night_economy.label}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: '900', color: selectedDistrict.night_economy.color, fontFamily: 'JetBrains Mono, monospace' }}>
                    夜流 {selectedDistrict.night_economy.night_share_pct}%
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '6px' }}>
                  🍻 深夜主題：{selectedDistrict.night_economy.night_tag}
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: '#cbd5e1', lineHeight: '1.45' }}>
                  {selectedDistrict.night_economy.description}
                </p>
              </div>
            )}

            {activeDimension === 'tod' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#F8FAFC' }}>
                    {selectedDistrict.tod_opportunity.label}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: '900', color: selectedDistrict.tod_opportunity.color, fontFamily: 'JetBrains Mono, monospace' }}>
                    供需比 {selectedDistrict.tod_opportunity.mismatch_ratio}
                  </span>
                </div>
                <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#cbd5e1', lineHeight: '1.45' }}>
                  {selectedDistrict.tod_opportunity.description}
                </p>
              </div>
            )}
          </div>

          {/* AI 招商引資與商業策略推薦 (Retail Investment Recommendations) */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.4)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            padding: '10px 12px'
          }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
              <Store size={13} color="#10B981" />
              <span>AI 推薦引進之商業業態：</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {selectedDistrict.tod_opportunity.recommended_tenants?.map((item, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '10px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#6EE7B7',
                    fontWeight: '700'
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* 客群身分比率結構 (合計 100%) */}
          <div style={{
            background: 'rgba(0,0,0,0.25)',
            padding: '6px 8px',
            borderRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8' }}>
              <span>🎫 票種身分結構（合計 100%）：</span>
              <span style={{ color: '#38BDF8', fontWeight: 'bold' }}>💼 通勤剛需計 {selectedDistrict.persona_pct?.commuter}%</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '10px'
            }}>
              <span>💼 自費通勤: <strong style={{ color: '#38BDF8' }}>{selectedDistrict.persona_pct?.regular_adult || Math.max(0, (selectedDistrict.persona_pct?.commuter || 0) - (selectedDistrict.persona_pct?.tpass || 0))}%</strong></span>
              <span>💳 TPASS: <strong style={{ color: '#A855F7' }}>{selectedDistrict.persona_pct?.tpass}%</strong></span>
              <span>🎓 學生族: <strong style={{ color: '#10B981' }}>{selectedDistrict.persona_pct?.student}%</strong></span>
              <span>👵 樂齡族: <strong style={{ color: '#F43F5E' }}>{selectedDistrict.persona_pct?.senior}%</strong></span>
            </div>
          </div>

          {/* 周邊 500m 現有實體機能統計 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '4px',
            textAlign: 'center',
            fontSize: '10px',
            color: '#94a3b8'
          }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '5px', borderRadius: '6px' }}>
              <div style={{ fontSize: '9px', color: '#64748b' }}>🏪 便利超商</div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#fff' }}>{selectedDistrict.amenity_summary?.convenience_count}</div>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '5px', borderRadius: '6px' }}>
              <div style={{ fontSize: '9px', color: '#64748b' }}>🏥 醫療院所</div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#fff' }}>{selectedDistrict.amenity_summary?.healthcare_count}</div>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '5px', borderRadius: '6px' }}>
              <div style={{ fontSize: '9px', color: '#64748b' }}>🏫 學校文教</div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#fff' }}>{selectedDistrict.amenity_summary?.education_count}</div>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '5px', borderRadius: '6px' }}>
              <div style={{ fontSize: '9px', color: '#64748b' }}>🛒 生鮮超市</div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#fff' }}>{selectedDistrict.amenity_summary?.supermarket_count}</div>
            </div>
          </div>
        </div>
      )}

      {/* 4. 底部左側：動態圖例說明 */}
      <div style={{
        position: 'absolute',
        bottom: '24px',
        left: '16px',
        zIndex: 400,
        background: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '10px',
        padding: '9px 14px',
        fontSize: '11px',
        color: '#94a3b8',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
      }}>
        <div style={{ fontWeight: '700', color: '#f8fafc', fontSize: '10.5px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <span>🏬 商圈決策圖例（維度：{activeDimension === 'vitality' ? '生命週期與活力 WWR' : activeDimension === 'weather' ? '天候衝擊抗跌韌性' : activeDimension === 'night' ? '夜經濟活力分級' : 'TOD 供需缺口與窪地'}）</span>
          <span style={{ fontSize: '9px', color: '#38BDF8' }}>當前分類: {selectedCategory === 'all' ? '全部' : selectedCategory === 'night_market' ? '旗艦夜市' : selectedCategory === 'old_street' ? '歷史老街' : '商業樞紐'}</span>
        </div>

        {/* 類別標記符號提示 */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '10px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '4px' }}>
          <span style={{ color: '#E2E8F0' }}>標記符號：</span>
          <span>🍢 全台旗艦夜市</span>
          <span>🏛️ 歷史老街名勝</span>
          <span>🏬 交通商務樞紐</span>
        </div>

        {activeDimension === 'vitality' && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F43F5E', display: 'inline-block' }}></span>
              <span>🔥 爆發擴張商圈 (WWR &ge; 1.7x)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38BDF8', display: 'inline-block' }}></span>
              <span>💎 穩健核心商圈</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }}></span>
              <span>💼 通勤純辦沙漠</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#94A3B8', display: 'inline-block' }}></span>
              <span>📉 空洞化沒落預警</span>
            </div>
          </div>
        )}

        {activeDimension === 'weather' && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
              <span>🛡️ 全天候避雨庇護 (暴雨逆勢 +10%~+25%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38BDF8', display: 'inline-block' }}></span>
              <span>⚖️ 騎樓半抗跌 (-8%~-18%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', display: 'inline-block' }}></span>
              <span>☔ 露天重創脆弱 (-40%~-65%)</span>
            </div>
          </div>
        )}

        {activeDimension === 'night' && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#C084FC', display: 'inline-block' }}></span>
              <span>🦉 越夜越美麗 (夜流 &ge; 25%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38BDF8', display: 'inline-block' }}></span>
              <span>🌙 溫和小夜商圈 (15%~24%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#64748B', display: 'inline-block' }}></span>
              <span>💤 清晨入睡純辦/住宅 (&lt; 15%)</span>
            </div>
          </div>
        )}

        {activeDimension === 'tod' && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }}></span>
              <span>🚀 爆發潛力商機窪地 (供不應求)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
              <span>⚖️ 供需健康均衡</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EC4899', display: 'inline-block' }}></span>
              <span>⚠️ 零售競爭紅海 (飽和)</span>
            </div>
          </div>
        )}

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '4px', fontSize: '9px', color: '#64748B' }}>
          * 滑鼠懸停標記即可查看「人流來源溯源」與「在地名產勝景」卡片；外圈 500m 虛線光環為核心徒步吸引半徑。
        </div>
      </div>

    </div>
  );
}
