import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { 
  Sun, CloudRain, Flame, Shield, Compass, Thermometer, Droplets, 
  Wind, Umbrella, RefreshCw, ChevronRight, Award, Zap, Sparkles, 
  Layers, MapPin, Eye, ArrowUpRight, BarChart3, TrendingUp, AlertTriangle,
  Info, Maximize2, Check, Scale, Play, Pause, ChevronLeft, Calendar, Clock
} from 'lucide-react';
import { CARTO_TILES, CARTO_ATTRIBUTION, NLSC_TILES, NLSC_ATTRIBUTION } from '../utils/basemap';

const BASEMAP_TILES = {
  emap: { url: NLSC_TILES.emap, attribution: NLSC_ATTRIBUTION, maxZoom: 19 },
  dark: { url: CARTO_TILES.dark, attribution: CARTO_ATTRIBUTION, subdomains: 'abcd', maxZoom: 19 },
  satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attribution: 'Tiles &copy; Esri', maxZoom: 18 },
  osm: { url: CARTO_TILES.voyager, attribution: CARTO_ATTRIBUTION, subdomains: 'abcd', maxZoom: 19 },
  light: { url: CARTO_TILES.light, attribution: CARTO_ATTRIBUTION, subdomains: 'abcd', maxZoom: 19 }
};

// 12 個月份全島四季氣候潮汐敘事
const SEASON_NARRATIVES = {
  1: { season: '隆冬寒潮', desc: '大陸冷高壓南下，北部基隆與宜蘭迎風面連綿濕冷，中南部乾冷晴朗，日夜溫差破 10°C。', mobility: '⚠️ 北部高架道路抗側風、路面濕滑制動距離延長；晨間山區高海拔防結冰。' },
  2: { season: '早春回暖', desc: '寒潮最後波段，全台高山偶降雪，中南部春陽初現，農曆春節疏運南北移動氣候考驗。', mobility: '🚄 春節國道大疏運；國道1號及3號中南部易受夜間輻射冷卻濃霧影響。' },
  3: { season: '驚蟄春雨', desc: '華南雲雨區東移，春雷乍響，西半部沿海易發平流濃霧，晨間公路行車視距偏低。', mobility: '🌫️ 台61線西濱快速道路與沿海國道平流霧警戒；高快速公路車距宜放大 1.5 倍。' },
  4: { season: '清明回溫', desc: '氣溫全面回升至 22~26°C，南部枯水期高峰需待梅雨解渴，熱對流雷雨初萌。', mobility: '🚴 清明連假戶外行車舒適，南部強光紫外線強烈，注意長途行車疲勞。' },
  5: { season: '梅雨首波', desc: '滯留鋒面進駐，西南氣流挾帶充沛水氣，短延時強降雨全面啟動，水庫解渴關鍵期。', mobility: '⛈️ 鋒面暴雨易致市區低窪積水與行車水漂；鐵公路邊坡即時水位告警啟動。' },
  6: { season: '梅雨盛期', desc: '梅雨鋒面徘徊，全台豪大雨特報頻仍，高鐵與公路邊坡防汛監控全面戒備。', mobility: '🚨 山區落石好發期，蘇花公路與中橫非必要避免進入；北捷/高捷地下防汛擋板待命。' },
  7: { season: '盛夏酷暑', desc: '太平洋副熱帶高壓籠罩，雙北盆地與花東縱谷飆破 38°C，午後強對流雷陣雨驟降。', mobility: '☀️ 軌道與瀝青高溫膨脹監測；午後 14-16 時劇烈雷雨能見度驟降，通勤提早因應。' },
  8: { season: '颱風好發', desc: '西北太平洋颱風最活躍月份，東海岸與南部迎風面警戒，暴雨風暴挑戰城市韌性。', mobility: '🌀 颱風停班停課動態調整；東部鐵路落石告警防護網、高架橋梁防風限速機制。' },
  9: { season: '秋分換季', desc: '太平洋高壓退縮，首波東北季風報到，秋颱共伴效應引爆東北角特大豪雨。', mobility: '🌧️ 共伴效應豪雨集中雙北山區與宜蘭；雙溪、平溪、蘇澳低窪地區交通需戒備。' },
  10: { season: '九降強風', desc: '新竹九降風與屏東落山風發威，北海岸長達數月陰雨展開，中南部進入乾涼季。', mobility: '💨 國道3號後龍路段與台26線落山風橫風強勁；微移動運具（如YouBike）注意側風。' },
  11: { season: '初冬降溫', desc: '冷空氣勢力南推，北台灣均溫降至 20°C 以下，東北季風迎風面陰雨連綿。', mobility: '☔ 北部與東北部連綿陰雨，大眾運輸使用率提升；中南部乾冷空品擴散不良。' },
  12: { season: '歲末隆冬', desc: '北台灣日照降至全年最低（基隆僅約50小時），南台灣陽光普照，候鳥度冬盛景。', mobility: '❄️ 合歡山與玉山賞雪管制雪鍊上山；跨年夜各都會區捷運高密度加班疏運。' }
};

// 7 大氣候人格色彩定義
const ARCHETYPE_CONFIG = {
  '熱島盆地': { color: '#EF4444', label: '熱島盆地', icon: Flame, desc: '高度水泥化、夜間難散熱、夏季極端高溫' },
  '沉鬱雨港': { color: '#0284C7', label: '沉鬱雨港', icon: CloudRain, desc: '東北季風多雨、年降雨破三千、高發霉率' },
  '多雨水鄉': { color: '#38BDF8', label: '多雨水鄉', icon: Droplets, desc: '迎風面地形雨、冬季連綿陰雨' },
  '極端暴雨': { color: '#6366F1', label: '極端暴雨', icon: Zap, desc: '歷史雨極、極端短延時降水中心' },
  '抗颱晴都': { color: '#F59E0B', label: '抗颱晴都', icon: Shield, desc: '中央山脈天然庇護、少雨晴朗、抗颱天選區' },
  '日照古都': { color: '#EAB308', label: '日照古都', icon: Sun, desc: '年日照時數冠全台、乾濕季分明、冬日免帶傘' },
  '熱帶港都': { color: '#F97316', label: '熱帶港都', icon: Sun, desc: '終年溫暖、冬日避寒首選、熱帶海洋律動' },
  '熱帶半島': { color: '#FB923C', label: '熱帶半島', icon: Wind, desc: '落山風越嶺強陣、四季如夏、南端岬角' },
  '強風科技城': { color: '#06B6D4', label: '強風科技城', icon: Wind, desc: '九降強勁秋風、風力資源豐沛' },
  '乾爽海風': { color: '#10B981', label: '乾爽海風', icon: Wind, desc: '海線強風、雨量偏少乾燥' },
  '沿海風寒': { color: '#64748B', label: '沿海風寒', icon: Thermometer, desc: '冬季海口強風與濕冷刺骨' },
  '起霧台地': { color: '#8B5CF6', label: '起霧台地', icon: Droplets, desc: '台地逆溫起霧、高體感濕度' },
  '雲霧山嶺': { color: '#A855F7', label: '雲霧山嶺', icon: Droplets, desc: '火山谷地雲霧繚繞、涼夏繡球花鄉' },
  '縱谷焚風': { color: '#EC4899', label: '縱谷焚風', icon: Flame, desc: '沉降氣流絕熱增溫、全台高溫榜極端' },
  '東岸洋流': { color: '#14B8A6', label: '東岸洋流', icon: Compass, desc: '太平洋黑潮迎風第一排、颱風登陸前線' },
  '高山寒溫': { color: '#22C55E', label: '高山寒溫', icon: Thermometer, desc: '2000公尺以上巨木雲海、夏季涼爽避暑' },
  '極限高山': { color: '#93C5FD', label: '極限高山', icon: Thermometer, desc: '東北亞之巔、零下冰雪極端' },
  '世界風極': { color: '#D946EF', label: '世界風極', icon: Wind, desc: '歷史世界級陣風登錄地、黑潮風暴前哨' },
  '群島少雨': { color: '#FACC15', label: '群島少雨', icon: Sun, desc: '年雨量不到千毫米、高日照太陽能寶庫' },
  '海峽前線': { color: '#94A3B8', label: '海峽前線', icon: Wind, desc: '海峽冬寒、春季平流濃霧' },
  '平原溫差': { color: '#FB7185', label: '平原溫差', icon: Thermometer, desc: '內陸輻射冷卻強、日夜溫差全台最大' },
  '內陸湖泊': { color: '#0EA5E9', label: '內陸湖泊', icon: Droplets, desc: '千米湖光水氣調節、氣候溫潤宜人' }
};

const LIVABILITY_RANK_CATEGORIES = [
  { id: 'mold', label: '🍄 除濕機全載榜 (發霉指數)', key: 'mold_index', sortAsc: false, unit: '分', desc: '相對濕度 > 80% 且適溫之發霉高危天數' },
  { id: 'typhoon', label: '🛡️ 天選抗颱神仙區', key: 'radar.typhoon_defense', sortAsc: false, unit: '分', desc: '中央山脈天然阻隔、歷次颱風損害度全台最低' },
  { id: 'umbrella', label: '🌂 上班免開傘 (乾爽通勤)', key: 'umbrella_prob_pct', sortAsc: true, unit: '%', desc: '通勤時段（07-09, 17-19）降雨機率最低' },
  { id: 'sunshine', label: '☀️ 陽光之都 (日照時數)', key: 'annual_sunshine_h', sortAsc: false, unit: '小時/年', desc: '年均日照時數最長、抗憂鬱陽光資本' },
  { id: 'rain_heavy', label: '🌧️ 全台雨神霸主', key: 'annual_rain_mm', sortAsc: false, unit: 'mm/年', desc: '東北季風迎風面豪雨與年雨量極值' },
  { id: 'cool_night', label: '🌙 夏季夜間清涼度', key: 'radar.night_cool', sortAsc: false, unit: '分', desc: '夏季夜間降溫良好、自然通風免開冷氣' }
];

export default function ClimatePulseLab({ basemap = 'dark' }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMode, setActiveMode] = useState('seasons'); // 'seasons' (12個月四季潮汐動態播放), 'change' (30年氣候變異), 'livability' (微氣候宜居榜)
  const [selectedMonth, setSelectedMonth] = useState(7); // 1 ~ 12
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1); // 0.5, 1, 2
  const [selectedMetric, setSelectedMetric] = useState('temp_delta'); // 'temp_delta', 'hot35_delta', 'rain_days_delta', 'rain_mm'
  const [activeRankCat, setActiveRankCat] = useState('mold');
  const [selectedStationId, setSelectedStationId] = useState('466920'); // 臺北 default
  const [compareStationId, setCompareStationId] = useState('467490'); // 臺中 default for PK
  const [searchFilter, setSearchFilter] = useState('');
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});

  // Auto-play seasonal loop
  useEffect(() => {
    if (!isPlaying || activeMode !== 'seasons') return;
    const intervalMs = Math.round(1200 / playSpeed);
    const timer = setInterval(() => {
      setSelectedMonth(prev => (prev >= 12 ? 1 : prev + 1));
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, activeMode, playSpeed]);

  // Fetch dataset
  useEffect(() => {
    const baseUrl = import.meta.env.BASE_URL || '/';
    const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    fetch(`${cleanBase}taiwan_climate_pulse.json`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load climate pulse data:', err);
        setLoading(false);
      });
  }, []);

  const stations = data?.stations || [];

  // Filtered stations for search
  const filteredStations = useMemo(() => {
    if (!searchFilter.trim()) return stations;
    const q = searchFilter.toLowerCase();
    return stations.filter(s => 
      s.name.toLowerCase().includes(q) || 
      s.county.toLowerCase().includes(q) ||
      s.badge.toLowerCase().includes(q) ||
      s.archetype.toLowerCase().includes(q)
    );
  }, [stations, searchFilter]);

  const dummyStation = {
    id: '', name: '載入中...', county: '', alt_m: 0, archetype: '', badge: '',
    metrics_30y: { baseline_temp: 0, recent_temp: 0, temp_delta: 0, hot35_days_delta: 0, rain_days_delta: 0, history: [] },
    livability: { avg_temp: 0, annual_rain_mm: 0, annual_rain_days: 0, annual_sunshine_h: 0, avg_humidity_pct: 0, umbrella_prob_pct: 0, mold_index: 0, radar: {} }
  };

  // Selected station objects
  const selectedStation = useMemo(() => {
    return stations.find(s => s.id === selectedStationId) || stations[0] || dummyStation;
  }, [stations, selectedStationId]);

  const compareStation = useMemo(() => {
    return stations.find(s => s.id === compareStationId) || stations[10] || stations[0] || dummyStation;
  }, [stations, compareStationId]);

  // Rankings
  const rankings = useMemo(() => {
    if (!stations.length) {
      return { topTemp: [], stableTemp: [], topHot: [], dropRainDays: [], topList: [], bottomList: [], category: LIVABILITY_RANK_CATEGORIES[0] };
    }
    if (activeMode === 'change') {
      // 30y Climate change rankings
      const sortedByTemp = [...stations].sort((a, b) => b.metrics_30y.temp_delta - a.metrics_30y.temp_delta);
      const sortedByHot = [...stations].sort((a, b) => b.metrics_30y.hot35_days_delta - a.metrics_30y.hot35_days_delta);
      const sortedByRainDelta = [...stations].sort((a, b) => a.metrics_30y.rain_days_delta - b.metrics_30y.rain_days_delta); // 最多減少雨天
      return {
        topTemp: sortedByTemp.slice(0, 5),
        stableTemp: sortedByTemp.slice(-5).reverse(),
        topHot: sortedByHot.slice(0, 5),
        dropRainDays: sortedByRainDelta.slice(0, 5)
      };
    } else {
      // Livability rankings
      const cat = LIVABILITY_RANK_CATEGORIES.find(c => c.id === activeRankCat) || LIVABILITY_RANK_CATEGORIES[0];
      const getVal = (s) => {
        if (cat.key.startsWith('radar.')) {
          const k = cat.key.split('.')[1];
          return s.livability.radar[k] ?? 0;
        }
        return s.livability[cat.key] ?? 0;
      };

      const sorted = [...stations].sort((a, b) => {
        const va = getVal(a);
        const vb = getVal(b);
        return cat.sortAsc ? va - vb : vb - va;
      });

      return {
        topList: sorted.slice(0, 6),
        bottomList: sorted.slice(-5).reverse(),
        category: cat
      };
    }
  }, [stations, activeMode, activeRankCat]);

  // Island-wide monthly climate statistics for active selectedMonth
  const islandMonthlyStats = useMemo(() => {
    if (!stations.length) return null;
    const monthDataList = stations.map(s => {
      const m = s.monthly_climatology?.find(item => item.month === selectedMonth) || s.monthly_climatology?.[selectedMonth - 1];
      return { station: s, ...m };
    }).filter(item => item && item.temp !== undefined);

    if (!monthDataList.length) return null;

    const avgTemp = (monthDataList.reduce((acc, cur) => acc + (cur.temp || 0), 0) / monthDataList.length).toFixed(1);
    const avgRain = Math.round(monthDataList.reduce((acc, cur) => acc + (cur.rain_mm || 0), 0) / monthDataList.length);
    const avgSun = Math.round(monthDataList.reduce((acc, cur) => acc + (cur.sunshine_h || 0), 0) / monthDataList.length);

    const sortedTemp = [...monthDataList].sort((a, b) => b.temp - a.temp);
    const sortedRain = [...monthDataList].sort((a, b) => b.rain_mm - a.rain_mm);
    const sortedSun = [...monthDataList].sort((a, b) => b.sunshine_h - a.sunshine_h);

    const iconCounts = { '☀️': 0, '🌤️': 0, '☁️': 0, '🌧️': 0, '⛈️': 0 };
    monthDataList.forEach(item => {
      if (item.icon && iconCounts[item.icon] !== undefined) {
        iconCounts[item.icon]++;
      }
    });

    return {
      avgTemp,
      avgRain,
      avgSun,
      hottest: sortedTemp[0],
      coldest: sortedTemp[sortedTemp.length - 1],
      rainiest: sortedRain[0],
      driest: sortedRain[sortedRain.length - 1],
      sunniest: sortedSun[0],
      iconCounts,
      list: monthDataList
    };
  }, [stations, selectedMonth]);

  // Map initialization
  useEffect(() => {
    if (loading || !mapRef.current || mapInstanceRef.current) return;

    const tileConf = BASEMAP_TILES[basemap] || BASEMAP_TILES.dark;
    const map = L.map(mapRef.current, {
      center: [23.85, 120.95],
      zoom: 8,
      minZoom: 7,
      maxZoom: 18,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer(tileConf.url, {
      attribution: tileConf.attribution,
      subdomains: tileConf.subdomains || 'abcd',
      maxZoom: tileConf.maxZoom
    }).addTo(map);

    mapInstanceRef.current = map;

    // Force size recomputation
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
      mapInstanceRef.current = null;
    };
  }, [loading]);

  // Update basemap tile layer if prop changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    map.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });
    const tileConf = BASEMAP_TILES[basemap] || BASEMAP_TILES.dark;
    L.tileLayer(tileConf.url, {
      attribution: tileConf.attribution,
      subdomains: tileConf.subdomains || 'abc',
      maxZoom: tileConf.maxZoom
    }).addTo(map);
  }, [basemap]);

  // Draw Station Markers with dynamic values
  useEffect(() => {
    if (!mapInstanceRef.current || !stations.length) return;
    const map = mapInstanceRef.current;

    // Clear existing markers
    Object.values(markersRef.current).forEach(m => map.removeLayer(m));
    markersRef.current = {};

    stations.forEach(s => {
      const isSelected = s.id === selectedStationId;
      const isCompare = s.id === compareStationId;

      // Determine color and label based on mode and metric
      let displayValue = '';
      let markerColor = '#38BDF8';
      let haloColor = 'rgba(56, 189, 248, 0.35)';

      if (activeMode === 'seasons') {
        const mData = s.monthly_climatology?.find(m => m.month === selectedMonth) || s.monthly_climatology?.[selectedMonth - 1];
        const icon = mData?.icon || '🌤️';
        const temp = mData ? `${mData.temp.toFixed(1)}°` : '';
        const rain = mData ? `${Math.round(mData.rain_mm)}mm` : '';
        displayValue = `${temp} · ${rain}`;

        if (mData?.rain_mm >= 320) {
          markerColor = '#818CF8'; // Indigo for torrential
          haloColor = 'rgba(129, 140, 248, 0.45)';
        } else if (mData?.rain_mm >= 160) {
          markerColor = '#38BDF8'; // Rain blue
          haloColor = 'rgba(56, 189, 248, 0.4)';
        } else if (mData?.temp >= 28) {
          markerColor = '#EF4444'; // Hot red
          haloColor = 'rgba(239, 68, 68, 0.45)';
        } else if (mData?.temp <= 16) {
          markerColor = '#06B6D4'; // Cold cyan
          haloColor = 'rgba(6, 182, 212, 0.4)';
        } else {
          markerColor = '#F59E0B'; // Amber sunny/mild
          haloColor = 'rgba(245, 158, 11, 0.35)';
        }
      } else if (activeMode === 'change') {
        if (selectedMetric === 'temp_delta') {
          const delta = s.metrics_30y.temp_delta;
          displayValue = `${delta > 0 ? '+' : ''}${delta}°C`;
          markerColor = delta >= 0.8 ? '#EF4444' : delta >= 0.5 ? '#F97316' : delta >= 0.2 ? '#F59E0B' : '#10B981';
          haloColor = delta >= 0.8 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.3)';
        } else if (selectedMetric === 'hot35_delta') {
          const delta = s.metrics_30y.hot35_days_delta;
          displayValue = `+${delta}天`;
          markerColor = delta >= 15 ? '#DC2626' : delta >= 5 ? '#F97316' : '#10B981';
          haloColor = 'rgba(220, 38, 38, 0.4)';
        } else {
          const delta = s.metrics_30y.rain_days_delta;
          displayValue = `${delta}天`;
          markerColor = delta <= -10 ? '#8B5CF6' : delta <= -5 ? '#3B82F6' : '#06B6D4';
          haloColor = 'rgba(139, 92, 246, 0.35)';
        }
      } else {
        // Livability mode
        if (activeRankCat === 'mold') {
          displayValue = `霉${s.livability.mold_index}`;
          markerColor = s.livability.mold_index >= 70 ? '#A855F7' : s.livability.mold_index >= 50 ? '#38BDF8' : '#10B981';
        } else if (activeRankCat === 'typhoon') {
          displayValue = `盾${s.livability.radar.typhoon_defense}`;
          markerColor = s.livability.radar.typhoon_defense >= 80 ? '#10B981' : s.livability.radar.typhoon_defense >= 60 ? '#F59E0B' : '#EF4444';
        } else if (activeRankCat === 'sunshine') {
          displayValue = `${Math.round(s.livability.annual_sunshine_h)}h`;
          markerColor = s.livability.annual_sunshine_h >= 2000 ? '#F59E0B' : s.livability.annual_sunshine_h >= 1500 ? '#FCD34D' : '#64748B';
        } else {
          displayValue = `${s.livability.umbrella_prob_pct}%傘`;
          markerColor = s.livability.umbrella_prob_pct >= 45 ? '#0284C7' : s.livability.umbrella_prob_pct >= 30 ? '#38BDF8' : '#10B981';
        }
        haloColor = `${markerColor}44`;
      }

      const ringBorder = isSelected ? '3px solid #FFFFFF' : isCompare ? '2px dashed #F59E0B' : '1px solid rgba(255, 255, 255, 0.4)';
      const scaleTransform = isSelected ? 'scale(1.25)' : 'scale(1)';
      const zIndex = isSelected ? 1000 : 500;

      const currentMonthIcon = s.monthly_climatology?.find(m => m.month === selectedMonth)?.icon || '🌤️';

      const iconHtml = `
        <div style="
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          transform: ${scaleTransform};
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: ${zIndex};
        ">
          <!-- Pulsing Halo for selected -->
          ${isSelected ? `<div style="
            position: absolute;
            top: -6px; left: -6px; right: -6px; bottom: 8px;
            border-radius: 50%;
            background: ${haloColor};
            animation: pulse-halo 1.8s infinite;
          "></div>` : ''}

          <!-- Badge Node -->
          <div style="
            background: #0F172A;
            border: ${ringBorder};
            color: ${markerColor};
            padding: 2px 7px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 4px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6), 0 0 10px ${haloColor};
            white-space: nowrap;
          ">
            ${activeMode === 'seasons' 
              ? `<span style="font-size: 12.5px; line-height: 1;">${currentMonthIcon}</span>`
              : `<span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${markerColor};"></span>`
            }
            <span>${s.name}</span>
            <span style="color: #F8FAFC; font-weight: 700; font-size: 10px;">${displayValue}</span>
          </div>

          <!-- Bottom pointer -->
          <div style="
            width: 0; height: 0;
            border-left: 4px solid transparent;
            border-right: 4px solid transparent;
            border-top: 5px solid #0F172A;
            margin-top: -1px;
          "></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-climate-station-icon',
        html: iconHtml,
        iconSize: [80, 32],
        iconAnchor: [40, 26]
      });

      const marker = L.marker([s.lat, s.lng], { icon: customIcon }).addTo(map);

      marker.on('click', () => {
        setSelectedStationId(s.id);
      });

      markersRef.current[s.id] = marker;
    });

  }, [stations, selectedStationId, compareStationId, activeMode, selectedMetric, activeRankCat, selectedMonth]);

  // Center on selected station
  const flyToStation = (stn) => {
    setSelectedStationId(stn.id);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([stn.lat, stn.lng], 10, { duration: 1.2 });
    }
  };

  // Zoom preset regions
  const zoomRegion = (lat, lng, z) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], z, { duration: 1.0 });
    }
  };

  // SVG 12-Month Climatology Timeline Chart for a station
  const renderMonthlyTimeline = (station, currentMonth, onSelectMonth) => {
    if (!station?.monthly_climatology?.length) return null;
    const months = station.monthly_climatology;
    const maxRain = Math.max(...months.map(m => m.rain_mm), 350);
    const minTemp = Math.min(...months.map(m => m.temp), 10);
    const maxTemp = Math.max(...months.map(m => m.temp), 32);

    const svgWidth = 360;
    const svgHeight = 160;
    const paddingLeft = 32;
    const paddingRight = 20;
    const paddingTop = 24;
    const paddingBottom = 26;
    const chartWidth = svgWidth - paddingLeft - paddingRight;
    const chartHeight = svgHeight - paddingTop - paddingBottom;
    const colWidth = chartWidth / 12;

    const tempPoints = months.map((m, i) => {
      const x = paddingLeft + i * colWidth + colWidth / 2;
      const y = paddingTop + chartHeight - ((m.temp - minTemp) / (maxTemp - minTemp)) * (chartHeight - 12);
      return { x, y, temp: m.temp, month: m.month };
    });

    const tempPath = tempPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
      <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: '9px', padding: '12px 14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={13} color="#38BDF8" />
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#F8FAFC' }}>
              {station.name} 1–12 月四季氣候律動雙軸走勢
            </span>
          </div>
          <div style={{ display: 'flex', gap: '10px', fontSize: '10.5px' }}>
            <span style={{ color: '#38BDF8', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#38BDF8', borderRadius: '2px' }}></span>
              月降雨 (mm)
            </span>
            <span style={{ color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#F59E0B', borderRadius: '50%' }}></span>
              月均溫 (°C)
            </span>
          </div>
        </div>

        <svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ overflow: 'visible' }}>
          {/* Reference grids */}
          {[0, 0.5, 1].map((pct, idx) => {
            const y = paddingTop + chartHeight * (1 - pct);
            return (
              <line key={idx} x1={paddingLeft} y1={y} x2={svgWidth - paddingRight} y2={y} stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="2,2" />
            );
          })}

          {/* Month Columns & Rain Bars */}
          {months.map((m, i) => {
            const x = paddingLeft + i * colWidth;
            const barH = Math.max(4, (m.rain_mm / maxRain) * chartHeight);
            const barY = paddingTop + chartHeight - barH;
            const isSelected = m.month === currentMonth;

            return (
              <g 
                key={m.month} 
                onClick={() => onSelectMonth(m.month)} 
                style={{ cursor: 'pointer' }}
              >
                {/* Active Column Highlight Glow */}
                {isSelected && (
                  <rect
                    x={x + 1}
                    y={paddingTop - 6}
                    width={colWidth - 2}
                    height={chartHeight + 30}
                    fill="rgba(56, 189, 248, 0.16)"
                    stroke="#38BDF8"
                    strokeWidth="1.2"
                    rx="4"
                  />
                )}

                {/* Weather emoji */}
                <text
                  x={x + colWidth / 2}
                  y={paddingTop - 9}
                  textAnchor="middle"
                  fontSize="10"
                >
                  {m.icon}
                </text>

                {/* Rain Bar */}
                <rect
                  x={x + 3}
                  y={barY}
                  width={colWidth - 6}
                  height={barH}
                  fill={isSelected ? '#38BDF8' : 'rgba(56, 189, 248, 0.35)'}
                  rx="2"
                />

                {/* Month label */}
                <text
                  x={x + colWidth / 2}
                  y={svgHeight - 6}
                  textAnchor="middle"
                  fill={isSelected ? '#38BDF8' : '#94A3B8'}
                  fontSize="9.5"
                  fontWeight={isSelected ? '800' : '500'}
                >
                  {m.month}月
                </text>
              </g>
            );
          })}

          {/* Temperature Curve */}
          <path
            d={tempPath}
            fill="none"
            stroke="#F59E0B"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Temperature Vertex dots */}
          {tempPoints.map(p => {
            const isSelected = p.month === currentMonth;
            return (
              <circle
                key={p.month}
                cx={p.x}
                cy={p.y}
                r={isSelected ? 4.5 : 2.5}
                fill={isSelected ? '#FFFFFF' : '#F59E0B'}
                stroke={isSelected ? '#F59E0B' : '#0F172A'}
                strokeWidth={isSelected ? 2 : 1}
              />
            );
          })}
        </svg>
      </div>
    );
  };

  // SVG Radar generator helper
  const renderRadarChart = (stationA, stationB = null) => {
    if (!stationA) return null;
    const r = 85;
    const cx = 130;
    const cy = 115;
    const axes = [
      { key: 'rain_defense', label: '降雨防禦力 (少雨)' },
      { key: 'thermal_comfort', label: '溫度舒適度' },
      { key: 'typhoon_defense', label: '天選抗颱防護' },
      { key: 'sunshine', label: '日光充足度' },
      { key: 'anti_mold', label: '乾爽防霉度' },
      { key: 'night_cool', label: '夏夜涼爽度' }
    ];

    const getCoord = (score, idx) => {
      const angle = (idx * (2 * Math.PI / axes.length)) - (Math.PI / 2);
      const dist = (score / 100) * r;
      return [cx + dist * Math.cos(angle), cy + dist * Math.sin(angle)];
    };

    // Station A polygon
    const ptsA = axes.map((a, i) => getCoord(stationA.livability.radar[a.key] || 50, i));
    const pathA = ptsA.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ') + ' Z';

    // Station B polygon (if comparing)
    let pathB = null;
    if (stationB && stationB.id !== stationA.id) {
      const ptsB = axes.map((a, i) => getCoord(stationB.livability.radar[a.key] || 50, i));
      pathB = ptsB.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ') + ' Z';
    }

    return (
      <svg width="260" height="230" viewBox="0 0 260 230" style={{ overflow: 'visible' }}>
        {/* Background Grids */}
        {[0.25, 0.5, 0.75, 1.0].map((level, lvlIdx) => {
          const gridPts = axes.map((_, i) => getCoord(level * 100, i));
          const gridPath = gridPts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ') + ' Z';
          return (
            <path key={lvlIdx} d={gridPath} fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeDasharray={level === 1 ? '' : '2,2'} />
          );
        })}

        {/* Axis Lines & Labels */}
        {axes.map((ax, i) => {
          const edgePt = getCoord(100, i);
          const labelDist = r + 18;
          const angle = (i * (2 * Math.PI / axes.length)) - (Math.PI / 2);
          const lx = cx + labelDist * Math.cos(angle);
          const ly = cy + labelDist * Math.sin(angle);
          return (
            <g key={i}>
              <line x1={cx} y1={cy} x2={edgePt[0]} y2={edgePt[1]} stroke="rgba(255, 255, 255, 0.12)" />
              <text 
                x={lx} 
                y={ly} 
                textAnchor="middle" 
                dominantBaseline="central" 
                fill="#94A3B8" 
                fontSize="9.5" 
                fontWeight="600"
              >
                {ax.label}
              </text>
            </g>
          );
        })}

        {/* Station B (Comparison) Polygon */}
        {pathB && (
          <path 
            d={pathB} 
            fill="rgba(245, 158, 11, 0.25)" 
            stroke="#F59E0B" 
            strokeWidth="1.8" 
            strokeDasharray="4,2" 
          />
        )}

        {/* Station A Polygon */}
        <path 
          d={pathA} 
          fill="rgba(56, 189, 248, 0.35)" 
          stroke="#38BDF8" 
          strokeWidth="2.2" 
        />

        {/* Station A Vertex dots */}
        {ptsA.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="#38BDF8" stroke="#0F172A" strokeWidth="1.5" />
        ))}
      </svg>
    );
  };

  // Sparkline history chart for station
  const renderHistoryTrend = (history) => {
    if (!history || history.length < 5) return null;
    const w = 320;
    const h = 75;
    const pad = 12;

    const temps = history.map(h => h.temp);
    const minT = Math.min(...temps) - 0.5;
    const maxT = Math.max(...temps) + 0.5;

    const points = history.map((item, idx) => {
      const x = pad + (idx / (history.length - 1)) * (w - 2 * pad);
      const y = h - pad - ((item.temp - minT) / (maxT - minT)) * (h - 2 * pad);
      return [x, y];
    });

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');

    return (
      <div style={{ marginTop: '8px', background: 'rgba(15, 23, 42, 0.6)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
          <span>1998年 ({history[0].temp}°C)</span>
          <span style={{ color: '#38bdf8', fontWeight: '700' }}>30 年年均溫攀升走勢</span>
          <span>2024年 ({history[history.length - 1].temp}°C)</span>
        </div>
        <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
          {/* Baseline gradient fill */}
          <path d={`${pathD} L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`} fill="url(#tempGrad)" opacity="0.3" />
          <path d={pathD} fill="none" stroke="#F43F5E" strokeWidth="2.2" />
          {/* Start and end dots */}
          <circle cx={points[0][0]} cy={points[0][1]} r="3" fill="#38BDF8" />
          <circle cx={points[points.length - 1][0]} cy={points[points.length - 1][1]} r="4" fill="#F43F5E" />
          <defs>
            <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  };

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 60px)', display: 'flex', background: '#07090E', overflow: 'hidden', fontFamily: 'Outfit, -apple-system, sans-serif' }}>
      
      {/* LEFT STAGE: GIS Exploration Map (64% Width) */}
      <div style={{ flex: '1 1 64%', position: 'relative', height: '100%' }}>
        
        {/* Leaflet Map DOM */}
        <div ref={mapRef} style={{ width: '100%', height: '100%', background: '#0a0f1d' }} />

        {/* Loading overlay if fetching */}
        {loading && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(7, 9, 14, 0.85)',
            backdropFilter: 'blur(4px)',
            zIndex: 999,
            color: '#38BDF8'
          }}>
            <RefreshCw className="animate-spin" size={32} />
            <span style={{ marginLeft: '12px', fontSize: '15px', fontWeight: '600' }}>載入氣象署 30 年微氣候連續觀測資料庫...</span>
          </div>
        )}

        {/* Top Floating Control Bar on Map */}
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          right: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none',
          zIndex: 800
        }}>
          {/* Mode Switcher Pill */}
          <div style={{
            display: 'flex',
            background: 'rgba(15, 23, 42, 0.94)',
            backdropFilter: 'blur(12px)',
            borderRadius: '10px',
            padding: '4px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            pointerEvents: 'auto',
            gap: '4px'
          }}>
            <button
              onClick={() => setActiveMode('seasons')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                background: activeMode === 'seasons' ? 'linear-gradient(135deg, #0284C7, #38BDF8)' : 'transparent',
                color: activeMode === 'seasons' ? '#0F172A' : '#94A3B8',
                fontWeight: '800',
                fontSize: '12.5px',
                cursor: 'pointer',
                transition: 'all 0.18s'
              }}
            >
              <Clock size={14} />
              <span>⏱️ 四季動態潮汐 (12個月播放)</span>
            </button>

            <button
              onClick={() => setActiveMode('change')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                background: activeMode === 'change' ? 'linear-gradient(135deg, #EF4444, #F97316)' : 'transparent',
                color: activeMode === 'change' ? '#FFFFFF' : '#94A3B8',
                fontWeight: '700',
                fontSize: '12.5px',
                cursor: 'pointer',
                transition: 'all 0.18s'
              }}
            >
              <TrendingUp size={14} />
              <span>📈 30年氣候變異 (升溫/暴雨)</span>
            </button>

            <button
              onClick={() => setActiveMode('livability')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                background: activeMode === 'livability' ? 'linear-gradient(135deg, #10B981, #059669)' : 'transparent',
                color: activeMode === 'livability' ? '#0F172A' : '#94A3B8',
                fontWeight: '700',
                fontSize: '12.5px',
                cursor: 'pointer',
                transition: 'all 0.18s'
              }}
            >
              <Award size={14} />
              <span>🏆 微氣候宜居極端榜</span>
            </button>
          </div>

          {/* Region Quick Zoom Buttons */}
          <div style={{
            display: 'flex',
            gap: '6px',
            background: 'rgba(15, 23, 42, 0.88)',
            padding: '4px 8px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            pointerEvents: 'auto'
          }}>
            {[
              { label: '全台總覽', lat: 23.85, lng: 120.95, z: 8 },
              { label: '雙北盆地', lat: 25.04, lng: 121.52, z: 11 },
              { label: '中部台中', lat: 24.15, lng: 120.68, z: 10 },
              { label: '南台灣', lat: 22.80, lng: 120.35, z: 9 },
              { label: '東海岸', lat: 23.90, lng: 121.50, z: 9 },
              { label: '外島前哨', lat: 24.00, lng: 119.50, z: 8 }
            ].map(r => (
              <button
                key={r.label}
                onClick={() => zoomRegion(r.lat, r.lng, r.z)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  fontSize: '11px',
                  fontWeight: '600',
                  padding: '4px 8px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#38BDF8'}
                onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* BOTTOM FLOATING BAR: Seasonal Player OR Metric Filters */}
        {activeMode === 'seasons' ? (
          <div style={{
            position: 'absolute',
            bottom: '24px',
            left: '20px',
            right: '20px',
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(16px)',
            borderRadius: '12px',
            padding: '12px 18px',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.7)',
            zIndex: 850,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            {/* Upper row: Play/Pause, Month stepper, Speed, Season info */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => setIsPlaying(p => !p)}
                  style={{
                    background: isPlaying ? 'linear-gradient(135deg, #EF4444, #F97316)' : 'linear-gradient(135deg, #0284C7, #38BDF8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: isPlaying ? '#FFFFFF' : '#0F172A',
                    padding: '7px 16px',
                    fontSize: '12.5px',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    boxShadow: isPlaying ? '0 0 12px rgba(239, 68, 68, 0.6)' : '0 0 12px rgba(56, 189, 248, 0.5)'
                  }}
                >
                  {isPlaying ? <Pause size={15} /> : <Play size={15} />}
                  <span>{isPlaying ? '暫停播放' : '四季潮汐播放'}</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <button
                    onClick={() => setSelectedMonth(m => m === 1 ? 12 : m - 1)}
                    style={{
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#F8FAFC',
                      borderRadius: '6px',
                      padding: '5px 8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <span style={{ fontSize: '15px', fontWeight: '900', color: '#38BDF8', minWidth: '48px', textAlign: 'center' }}>
                    {selectedMonth} 月
                  </span>
                  <button
                    onClick={() => setSelectedMonth(m => m === 12 ? 1 : m + 1)}
                    style={{
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#F8FAFC',
                      borderRadius: '6px',
                      padding: '5px 8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>

                {/* Speed selectors */}
                <div style={{ display: 'flex', background: 'rgba(30, 41, 59, 0.8)', borderRadius: '6px', padding: '2px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  {[0.5, 1, 2].map(speed => (
                    <button
                      key={speed}
                      onClick={() => setPlaySpeed(speed)}
                      style={{
                        background: playSpeed === speed ? '#38BDF8' : 'transparent',
                        color: playSpeed === speed ? '#0F172A' : '#94A3B8',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '3px 8px',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Season badge & narration */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  background: 'rgba(56, 189, 248, 0.18)',
                  border: '1px solid #38BDF8',
                  color: '#38BDF8',
                  padding: '3px 9px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '800'
                }}>
                  {SEASON_NARRATIVES[selectedMonth]?.season}
                </span>
                <span style={{ fontSize: '11.5px', color: '#CBD5E1', maxWidth: '440px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {SEASON_NARRATIVES[selectedMonth]?.desc}
                </span>
              </div>
            </div>

            {/* Lower row: Interactive Month Slider & Month quick jump chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="range"
                min="1"
                max="12"
                step="1"
                value={selectedMonth}
                onChange={e => setSelectedMonth(parseInt(e.target.value, 10))}
                style={{
                  flex: 1,
                  accentColor: '#38BDF8',
                  cursor: 'pointer'
                }}
              />
              <div style={{ display: 'flex', gap: '4px' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                  <button
                    key={m}
                    onClick={() => setSelectedMonth(m)}
                    style={{
                      background: selectedMonth === m ? '#38BDF8' : 'rgba(255, 255, 255, 0.06)',
                      color: selectedMonth === m ? '#0F172A' : '#94A3B8',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '3px 6px',
                      fontSize: '10.5px',
                      fontWeight: selectedMonth === m ? '800' : '500',
                      cursor: 'pointer'
                    }}
                  >
                    {m}月
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            position: 'absolute',
            bottom: '24px',
            left: '16px',
            display: 'flex',
            gap: '8px',
            background: 'rgba(15, 23, 42, 0.94)',
            backdropFilter: 'blur(10px)',
            padding: '8px 12px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
            zIndex: 800
          }}>
            {activeMode === 'change' ? (
              <>
                <span style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', marginRight: '4px' }}>
                  <Layers size={13} style={{ marginRight: '4px' }} /> 變異指標:
                </span>
                {[
                  { id: 'temp_delta', label: '🌡️ 30年升溫幅度 (+°C)' },
                  { id: 'hot35_delta', label: '🔥 高溫天數暴增 (+天/年)' },
                  { id: 'rain_days_delta', label: '📉 降雨日數遞減 (-天/年)' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedMetric(opt.id)}
                    style={{
                      padding: '5px 11px',
                      borderRadius: '6px',
                      border: 'none',
                      background: selectedMetric === opt.id ? '#EF4444' : 'rgba(255, 255, 255, 0.05)',
                      color: selectedMetric === opt.id ? '#FFFFFF' : '#CBD5E1',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </>
            ) : (
              <>
                <span style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', marginRight: '4px' }}>
                  <Compass size={13} style={{ marginRight: '4px' }} /> 宜居極值:
                </span>
                {LIVABILITY_RANK_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveRankCat(cat.id)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: activeRankCat === cat.id ? '#0284C7' : 'rgba(255, 255, 255, 0.05)',
                      color: activeRankCat === cat.id ? '#FFFFFF' : '#CBD5E1',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {cat.label.split(' ')[0]} {cat.label.split(' ')[1]}
                  </button>
                ))}
              </>
            )}
          </div>
        )}

        {/* Map Legend (Bottom-right above zoom control) */}
        <div style={{
          position: 'absolute',
          bottom: activeMode === 'seasons' ? '108px' : '24px',
          right: '56px',
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(10px)',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '10.5px',
          color: '#94A3B8',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          zIndex: 800
        }}>
          <div style={{ fontWeight: '700', color: '#F8FAFC' }}>
            {activeMode === 'seasons' ? '🌤️ 四季月氣候符號色階' : activeMode === 'change' ? '🌡️ 30年氣候變異色階' : '📊 數值極端色彩標示'}
          </div>
          {activeMode === 'seasons' ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px' }}>☀️ / 🌤️</span>
                <span>晴朗乾爽 / 陽光充足</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }}></span>
                <span>酷暑高溫 (&gt;28°C)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38BDF8' }}></span>
                <span>連綿降雨 (&gt;160mm)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#818CF8' }}></span>
                <span>極端豪大雨 (&gt;320mm 梅雨/颱風)</span>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }}></span>
                <span>極高溫 / 劇烈升溫 (&gt;+0.8°C)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }}></span>
                <span>中度升溫 / 陽光充足</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></span>
                <span>氣候穩定 / 抗颱結界防護</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8B5CF6' }}></span>
                <span>極端高濕 / 多雨發霉重災區</span>
              </div>
            </>
          )}
        </div>

      </div>

      {/* RIGHT STAGE: Ranking Leaderboard & Radar Inspector (36% Width) */}
      <div style={{
        flex: '0 0 36%',
        height: '100%',
        background: '#0B1120',
        borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto'
      }}>
        
        {/* Panel Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(15, 23, 42, 0.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>
                  {activeMode === 'seasons' ? '⏱️' : activeMode === 'change' ? '🌡️' : '🏆'}
                </span>
                <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#F8FAFC', margin: 0 }}>
                  {activeMode === 'seasons' ? '全島四季氣候潮汐動態看板' : activeMode === 'change' ? '全台 30 年氣候變遷戰略報告' : '全台微氣候宜居極值排行'}
                </h2>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#64748B' }}>
                中央氣象署 CODiS 1998–2024 近 30 年連續實測大數據庫
              </p>
            </div>

            {/* Station Search Input */}
            <div style={{ width: '130px' }}>
              <input
                type="text"
                placeholder="搜尋測站..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(30, 41, 59, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '6px',
                  color: '#F8FAFC',
                  fontSize: '11px',
                  padding: '5px 8px',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* Scrollable Content Container */}
        <div style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* MODE 0: SEASONAL CLIMATOLOGY PLAYER */}
          {activeMode === 'seasons' && islandMonthlyStats && (
            <>
              {/* Island-wide Monthly Macro Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '10px 12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#38BDF8', fontWeight: '700' }}>全島本月均溫</div>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: '#F8FAFC', margin: '4px 0 2px' }}>
                    {islandMonthlyStats.avgTemp}°C
                  </div>
                  <div style={{ fontSize: '10px', color: '#94A3B8' }}>
                    {selectedMonth}月 全島常態平均
                  </div>
                </div>

                <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)', padding: '10px 12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#818CF8', fontWeight: '700' }}>全島平均月雨量</div>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: '#F8FAFC', margin: '4px 0 2px' }}>
                    {islandMonthlyStats.avgRain} <span style={{ fontSize: '12px' }}>mm</span>
                  </div>
                  <div style={{ fontSize: '10px', color: '#94A3B8' }}>
                    雨量冠軍: {islandMonthlyStats.rainiest?.station?.name} ({Math.round(islandMonthlyStats.rainiest?.rain_mm)}mm)
                  </div>
                </div>

                <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '10px 12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#F59E0B', fontWeight: '700' }}>全島平均日照</div>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: '#F8FAFC', margin: '4px 0 2px' }}>
                    {islandMonthlyStats.avgSun} <span style={{ fontSize: '12px' }}>h</span>
                  </div>
                  <div style={{ fontSize: '10px', color: '#94A3B8' }}>
                    陽光之都: {islandMonthlyStats.sunniest?.station?.name} ({Math.round(islandMonthlyStats.sunniest?.sunshine_h)}h)
                  </div>
                </div>
              </div>

              {/* Weather Distribution across Taiwan in this month */}
              <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: '8px', padding: '10px 14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '8px', fontWeight: '700', display: 'flex', justifyContent: 'space-between' }}>
                  <span>全島 29 測站 {selectedMonth} 月天氣型態分佈</span>
                  <span style={{ color: '#38BDF8' }}>最熱: {islandMonthlyStats.hottest?.station?.name} ({islandMonthlyStats.hottest?.temp}°C) · 最冷: {islandMonthlyStats.coldest?.station?.name} ({islandMonthlyStats.coldest?.temp}°C)</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                  {[
                    { icon: '☀️', label: '晴朗艷陽', count: islandMonthlyStats.iconCounts['☀️'] || 0, color: '#F59E0B' },
                    { icon: '🌤️', label: '多雲晴', count: islandMonthlyStats.iconCounts['🌤️'] || 0, color: '#10B981' },
                    { icon: '☁️', label: '陰霾天', count: islandMonthlyStats.iconCounts['☁️'] || 0, color: '#94A3B8' },
                    { icon: '🌧️', label: '多雨天', count: islandMonthlyStats.iconCounts['🌧️'] || 0, color: '#38BDF8' },
                    { icon: '⛈️', label: '豪大雨', count: islandMonthlyStats.iconCounts['⛈️'] || 0, color: '#818CF8' }
                  ].map(w => (
                    <div key={w.label} style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '6px', padding: '6px 4px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <div style={{ fontSize: '15px' }}>{w.icon}</div>
                      <div style={{ fontSize: '14px', fontWeight: '900', color: w.color, margin: '2px 0' }}>{w.count} 站</div>
                      <div style={{ fontSize: '9.5px', color: '#64748B' }}>{w.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Station 12-Month Climatology Trend */}
              {renderMonthlyTimeline(selectedStation, selectedMonth, setSelectedMonth)}

              {/* Selected Station's Current Month Metrics Breakdown */}
              {(() => {
                const curM = selectedStation.monthly_climatology?.find(m => m.month === selectedMonth) || selectedStation.monthly_climatology?.[selectedMonth - 1];
                if (!curM) return null;
                return (
                  <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: '8px', padding: '12px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '18px' }}>{curM.icon}</span>
                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#F8FAFC' }}>
                          {selectedStation.name} · {selectedMonth} 月氣候觀測特徵 ({curM.label})
                        </span>
                      </div>
                      <span style={{ fontSize: '10.5px', color: '#64748B' }}>
                        {selectedStation.archetype} ({selectedStation.county})
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '10px' }}>
                      <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '6px 8px', borderRadius: '6px' }}>
                        <div style={{ fontSize: '10px', color: '#94A3B8' }}>月均溫</div>
                        <div style={{ fontSize: '15px', fontWeight: '800', color: '#F59E0B' }}>{curM.temp.toFixed(1)}°C</div>
                      </div>
                      <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '6px 8px', borderRadius: '6px' }}>
                        <div style={{ fontSize: '10px', color: '#94A3B8' }}>月累積雨量</div>
                        <div style={{ fontSize: '15px', fontWeight: '800', color: '#38BDF8' }}>{Math.round(curM.rain_mm)}mm</div>
                      </div>
                      <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '6px 8px', borderRadius: '6px' }}>
                        <div style={{ fontSize: '10px', color: '#94A3B8' }}>降雨日數</div>
                        <div style={{ fontSize: '15px', fontWeight: '800', color: '#818CF8' }}>{curM.rain_days}天</div>
                      </div>
                      <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '6px 8px', borderRadius: '6px' }}>
                        <div style={{ fontSize: '10px', color: '#94A3B8' }}>日照時數</div>
                        <div style={{ fontSize: '15px', fontWeight: '800', color: '#EAB308' }}>{Math.round(curM.sunshine_h)}h</div>
                      </div>
                    </div>

                    {/* Transportation & Mobility Resilience Advice */}
                    <div style={{ background: 'rgba(56, 189, 248, 0.08)', borderRadius: '6px', padding: '8px 10px', borderLeft: '3px solid #38BDF8', fontSize: '11px', color: '#E2E8F0', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <AlertTriangle size={15} color="#38BDF8" style={{ flexShrink: 0, marginTop: '1px' }} />
                      <div>
                        <strong style={{ color: '#38BDF8' }}>交通安全與人流阻抗叮嚀:</strong> {SEASON_NARRATIVES[selectedMonth]?.mobility}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </>
          )}

          {/* MODE 1: CLIMATE CHANGE REPORT */}
          {activeMode === 'change' && (
            <>
              {/* National Macro Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#EF4444', fontWeight: '700' }}>全台均溫淨升溫</div>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: '#F8FAFC', margin: '4px 0 2px' }}>+0.72°C</div>
                  <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>雙北都會區突破 +0.8°C</div>
                </div>

                <div style={{ background: 'rgba(249, 115, 22, 0.08)', border: '1px solid rgba(249, 115, 22, 0.25)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#F97316', fontWeight: '700' }}>&ge;35°C 高溫暴增</div>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: '#F8FAFC', margin: '4px 0 2px' }}>+18.4 天</div>
                  <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>近十年夏日酷熱翻倍</div>
                </div>

                <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#38BDF8', fontWeight: '700' }}>降雨天數減縮</div>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: '#F8FAFC', margin: '4px 0 2px' }}>-12.6 天</div>
                  <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>總雨量不減·暴雨集中</div>
                </div>
              </div>

              {/* Top Temperature Rise vs Stability Rankings */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#F8FAFC', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Flame size={14} color="#EF4444" />
                    全台 30 年升溫最劇烈 Top 5 (熱島效應核心)
                  </h3>
                  <span style={{ fontSize: '10.5px', color: '#64748B' }}>點擊測站直達空間視角</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {rankings.topTemp?.map((s, idx) => (
                    <div
                      key={s.id}
                      onClick={() => flyToStation(s)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '9px 12px',
                        background: selectedStationId === s.id ? 'rgba(56, 189, 248, 0.15)' : 'rgba(30, 41, 59, 0.4)',
                        border: selectedStationId === s.id ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '7px',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ 
                          width: '18px', height: '18px', borderRadius: '50%', 
                          background: idx === 0 ? '#EF4444' : idx === 1 ? '#F97316' : '#64748B',
                          color: '#FFFFFF', fontSize: '11px', fontWeight: '800',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {idx + 1}
                        </span>
                        <div>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#F8FAFC' }}>{s.name}</span>
                          <span style={{ fontSize: '10.5px', color: '#64748B', marginLeft: '6px' }}>({s.county})</span>
                          <div style={{ fontSize: '10px', color: '#94A3B8' }}>{s.badge}</div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '14px', fontWeight: '800', color: '#EF4444' }}>
                          +{s.metrics_30y.temp_delta}°C
                        </span>
                        <div style={{ fontSize: '10px', color: '#F59E0B' }}>
                          高溫日 +{s.metrics_30y.hot35_days_delta}天
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Climate Stability List (定海神針) */}
              <div>
                <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#F8FAFC', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={14} color="#10B981" />
                  氣候定海神針：全台 30 年均溫最穩定地區 Top 5
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {rankings.stableTemp?.map((s, idx) => (
                    <div
                      key={s.id}
                      onClick={() => flyToStation(s)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: selectedStationId === s.id ? 'rgba(56, 189, 248, 0.15)' : 'rgba(30, 41, 59, 0.3)',
                        border: selectedStationId === s.id ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '7px',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#10B981', color: '#0F172A', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          ✓
                        </span>
                        <div>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#F8FAFC' }}>{s.name}</span>
                          <span style={{ fontSize: '10.5px', color: '#64748B', marginLeft: '6px' }}>({s.county})</span>
                          <div style={{ fontSize: '10px', color: '#10B981' }}>{s.badge}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#10B981' }}>
                          {s.metrics_30y.temp_delta > 0 ? `+${s.metrics_30y.temp_delta}` : s.metrics_30y.temp_delta}°C
                        </span>
                        <div style={{ fontSize: '10px', color: '#64748B' }}>受海風/高山屏障調節</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* MODE 2: LIVABILITY & EXTREME RANKINGS */}
          {activeMode === 'livability' && (
            <>
              {/* Category selector pill strip */}
              <div>
                <div style={{ fontSize: '11.5px', color: '#94A3B8', marginBottom: '8px', fontWeight: '600' }}>
                  選擇特異性維度榜單：
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                  {LIVABILITY_RANK_CATEGORIES.map(cat => {
                    const isSelected = activeRankCat === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveRankCat(cat.id)}
                        style={{
                          textAlign: 'left',
                          padding: '8px 10px',
                          borderRadius: '7px',
                          border: isSelected ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.08)',
                          background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'rgba(30, 41, 59, 0.3)',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        <div style={{ fontSize: '12px', fontWeight: '700', color: isSelected ? '#38BDF8' : '#F8FAFC' }}>
                          {cat.label}
                        </div>
                        <div style={{ fontSize: '9.5px', color: '#64748B', marginTop: '2px' }}>
                          {cat.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Category Top Leaderboard */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#F8FAFC', margin: 0 }}>
                    🏆 {rankings.category?.label} 榜首前六名
                  </h3>
                  <span style={{ fontSize: '11px', color: '#38BDF8', fontWeight: '600' }}>單位: {rankings.category?.unit}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {rankings.topList?.map((s, idx) => {
                    const val = rankings.category?.key.startsWith('radar.') 
                      ? s.livability.radar[rankings.category.key.split('.')[1]] 
                      : s.livability[rankings.category?.key];
                    
                    return (
                      <div
                        key={s.id}
                        onClick={() => flyToStation(s)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '9px 12px',
                          background: selectedStationId === s.id ? 'rgba(56, 189, 248, 0.18)' : 'rgba(30, 41, 59, 0.4)',
                          border: selectedStationId === s.id ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.05)',
                          borderRadius: '7px',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            width: '20px', height: '20px', borderRadius: '50%',
                            background: idx === 0 ? '#F59E0B' : idx === 1 ? '#94A3B8' : idx === 2 ? '#B45309' : 'rgba(255, 255, 255, 0.1)',
                            color: '#FFFFFF', fontSize: '11px', fontWeight: '800',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            {idx + 1}
                          </span>
                          <div>
                            <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#F8FAFC' }}>{s.name}</span>
                            <span style={{ fontSize: '11px', color: '#64748B', marginLeft: '6px' }}>({s.county})</span>
                            <div style={{ fontSize: '10.5px', color: '#38BDF8' }}>{s.badge}</div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '16px', fontWeight: '900', color: '#F8FAFC' }}>
                            {typeof val === 'number' && val % 1 !== 0 ? val.toFixed(1) : val}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748B', marginLeft: '3px' }}>{rankings.category?.unit}</span>
                          <div style={{ fontSize: '10px', color: '#94A3B8' }}>
                            年雨量 {s.livability.annual_rain_mm}mm
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* DUAL-STATION PK & RADAR CHART INSPECTOR */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            borderRadius: '10px',
            padding: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#F8FAFC', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Scale size={15} color="#38BDF8" />
                  微氣候六維雷達與雙站 PK
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '10.5px', color: '#64748B' }}>
                  點擊地圖更換基準站，右側選單挑選對照站
                </p>
              </div>

              {/* Station B Comparison Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: '#F59E0B', fontWeight: '700' }}>PK 對照:</span>
                <select
                  value={compareStationId}
                  onChange={e => setCompareStationId(e.target.value)}
                  style={{
                    background: '#1E293B',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    borderRadius: '6px',
                    color: '#F8FAFC',
                    fontSize: '11px',
                    padding: '4px 8px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {stations.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.county})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Station Meta & Badges */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
              {/* Station A Tag */}
              <div style={{ flex: 1, background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '6px', padding: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#38BDF8' }}>🔵 {selectedStation.name}</span>
                  <span style={{ fontSize: '10px', color: '#94A3B8' }}>{selectedStation.county} · 海拔 {selectedStation.alt_m}m</span>
                </div>
                <div style={{ fontSize: '10.5px', color: '#F8FAFC', marginTop: '2px', fontWeight: '600' }}>
                  {selectedStation.badge}
                </div>
                <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>
                  年均雨量 {selectedStation.livability.annual_rain_mm}mm · 開傘率 {selectedStation.livability.umbrella_prob_pct}%
                </div>
              </div>

              {/* Station B Tag */}
              <div style={{ flex: 1, background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '6px', padding: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#F59E0B' }}>🟡 {compareStation.name}</span>
                  <span style={{ fontSize: '10px', color: '#94A3B8' }}>{compareStation.county} · 海拔 {compareStation.alt_m}m</span>
                </div>
                <div style={{ fontSize: '10.5px', color: '#F8FAFC', marginTop: '2px', fontWeight: '600' }}>
                  {compareStation.badge}
                </div>
                <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>
                  年均雨量 {compareStation.livability.annual_rain_mm}mm · 開傘率 {compareStation.livability.umbrella_prob_pct}%
                </div>
              </div>
            </div>

            {/* Radar SVG Display */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
              {renderRadarChart(selectedStation, compareStation)}
            </div>

            {/* Station 30-Year History Line Chart */}
            {selectedStation.metrics_30y?.history && (
              renderHistoryTrend(selectedStation.metrics_30y.history)
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
