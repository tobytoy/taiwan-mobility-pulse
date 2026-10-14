import os

# We will construct the enhanced ClimatePulseLab.jsx
target_file = "/home/toby/projects/Github/taiwan-mobility-pulse/src/components/ClimatePulseLab.jsx"

code = r'''import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { 
  Sun, CloudRain, Flame, Shield, Compass, Thermometer, Droplets, 
  Wind, Umbrella, RefreshCw, ChevronRight, Award, Zap, Sparkles, 
  Layers, MapPin, Eye, ArrowUpRight, BarChart3, TrendingUp, AlertTriangle,
  Info, Maximize2, Check, Scale, Play, Pause, ChevronLeft, Calendar, Clock,
  Store, BatteryCharging, Waves, Skull, Building2, Radio
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
  
  // Active Modes: 'seasons', 'retail_solar', 'typhoon_reservoir', 'change', 'livability'
  const [activeMode, setActiveMode] = useState('seasons');
  const [selectedMonth, setSelectedMonth] = useState(7); // 1 ~ 12
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1); // 0.5, 1, 2
  const [selectedMetric, setSelectedMetric] = useState('temp_delta'); // 'temp_delta', 'hot35_delta', 'rain_days_delta', 'rain_mm'
  const [activeRankCat, setActiveRankCat] = useState('mold');
  const [selectedStationId, setSelectedStationId] = useState('466920'); // 臺北 default
  const [compareStationId, setCompareStationId] = useState('467490'); // 臺中 default for PK
  const [searchFilter, setSearchFilter] = useState('');

  // Category 4 state: Retail Convection & Solar EV
  const [retailSolarTab, setRetailSolarTab] = useState('retail'); // 'retail' or 'solar'
  const [weatherScenario, setWeatherScenario] = useState('sunny'); // 'sunny', 'rain_drizzle', 'heavy_rain'
  const [selectedDistrictId, setSelectedDistrictId] = useState('ximen_pedestrian');
  const [selectedSolarStationId, setSelectedSolarStationId] = useState('467350');

  // Category 5 state: Typhoon Resilience & Reservoirs
  const [typhoonReservoirTab, setTyphoonReservoirTab] = useState('typhoon'); // 'typhoon' or 'reservoir'
  const [selectedTyphoonId, setSelectedTyphoonId] = useState('herb_1996');
  const [selectedReservoirId, setSelectedReservoirId] = useState('tsengwen');
  
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
  const retailDistricts = data?.retail_weather_convection || [];
  const solarStations = data?.solar_ev_potential || [];
  const typhoonData = data?.typhoon_resilience_backtest || { historical_typhoons: [], station_rankings: [] };
  const reservoirs = data?.reservoir_drought_deluge || [];

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

  // Selected Retail District & Scenario
  const selectedDistrict = useMemo(() => {
    return retailDistricts.find(d => d.district_id === selectedDistrictId) || retailDistricts[0];
  }, [retailDistricts, selectedDistrictId]);

  // Selected Solar Station
  const selectedSolarStation = useMemo(() => {
    return solarStations.find(s => s.stn_id === selectedSolarStationId) || solarStations[0];
  }, [solarStations, selectedSolarStationId]);

  // Selected Typhoon
  const selectedTyphoon = useMemo(() => {
    return typhoonData.historical_typhoons?.find(t => t.id === selectedTyphoonId) || typhoonData.historical_typhoons?.[0];
  }, [typhoonData, selectedTyphoonId]);

  // Selected Reservoir
  const selectedReservoir = useMemo(() => {
    return reservoirs.find(r => r.reservoir_id === selectedReservoirId) || reservoirs[0];
  }, [reservoirs, selectedReservoirId]);

  // Rankings
  const rankings = useMemo(() => {
    if (!stations.length) {
      return { topTemp: [], stableTemp: [], topHot: [], dropRainDays: [], topList: [], bottomList: [], category: LIVABILITY_RANK_CATEGORIES[0] };
    }
    if (activeMode === 'change') {
      const sortedByTemp = [...stations].sort((a, b) => b.metrics_30y.temp_delta - a.metrics_30y.temp_delta);
      const sortedByHot = [...stations].sort((a, b) => b.metrics_30y.hot35_days_delta - a.metrics_30y.hot35_days_delta);
      const sortedByRainDelta = [...stations].sort((a, b) => a.metrics_30y.rain_days_delta - b.metrics_30y.rain_days_delta);
      return {
        topTemp: sortedByTemp.slice(0, 5),
        stableTemp: sortedByTemp.slice(-5).reverse(),
        topHot: sortedByHot.slice(0, 5),
        dropRainDays: sortedByRainDelta.slice(0, 5)
      };
    } else {
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

  // Fly to target station
  const flyToStation = (stn) => {
    if (!mapInstanceRef.current || !stn) return;
    setSelectedStationId(stn.id || stn.stn_id);
    mapInstanceRef.current.flyTo([stn.lat, stn.lng], 10, { duration: 1.2 });
  };

  // Fly to target district
  const flyToDistrict = (d) => {
    if (!mapInstanceRef.current || !d) return;
    setSelectedDistrictId(d.district_id);
    mapInstanceRef.current.flyTo([d.lat, d.lng], 13, { duration: 1.2 });
  };

  // Fly to reservoir
  const flyToReservoir = (r) => {
    if (!mapInstanceRef.current || !r) return;
    setSelectedReservoirId(r.reservoir_id);
    mapInstanceRef.current.flyTo([r.lat, r.lng], 11, { duration: 1.2 });
  };

  // Draw Dynamic Map Markers according to activeMode & subtabs
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Clear existing markers
    Object.values(markersRef.current).forEach(m => map.removeLayer(m));
    markersRef.current = {};

    // 1. RETAIL CONVECTION MODE
    if (activeMode === 'retail_solar' && retailSolarTab === 'retail') {
      retailDistricts.forEach(d => {
        const isSelected = d.district_id === selectedDistrictId;
        const scen = d.scenarios[weatherScenario] || d.scenarios.sunny;
        const isIndoorShelter = d.type.includes('underground') || d.type.includes('skybridge') || d.type.includes('mall');
        
        // Color coding based on whether rain causes collapse or spike
        let markerColor = '#38BDF8';
        if (weatherScenario === 'heavy_rain') {
          markerColor = isIndoorShelter ? '#10B981' : '#EF4444';
        } else if (weatherScenario === 'rain_drizzle') {
          markerColor = isIndoorShelter ? '#06B6D4' : '#F59E0B';
        } else {
          markerColor = '#F59E0B';
        }

        const iconHtml = `
          <div style="
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            transform: ${isSelected ? 'scale(1.28)' : 'scale(1)'};
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: ${isSelected ? 1000 : 500};
          ">
            ${isSelected ? `<div style="
              position: absolute;
              top: -6px; left: -6px; right: -6px; bottom: 8px;
              border-radius: 50%;
              background: ${markerColor}44;
              animation: pulse-halo 1.8s infinite;
            "></div>` : ''}

            <div style="
              width: 38px;
              height: 38px;
              border-radius: 50%;
              background: #0B1120;
              border: ${isSelected ? '3px solid #FFFFFF' : `2px solid ${markerColor}`};
              box-shadow: 0 4px 14px rgba(0,0,0,0.7), 0 0 16px ${markerColor}66;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;
            ">
              ${isIndoorShelter ? '🏢' : '🛍️'}
            </div>

            <div style="
              margin-top: 3px;
              background: rgba(11, 17, 32, 0.95);
              border: 1px solid ${markerColor};
              border-radius: 6px;
              padding: 2px 7px;
              display: flex;
              align-items: center;
              gap: 4px;
              box-shadow: 0 4px 10px rgba(0,0,0,0.6);
              white-space: nowrap;
            ">
              <span style="font-size: 11px; font-weight: 800; color: #FFFFFF;">${d.name.split(' ')[0]}</span>
              <span style="
                font-size: 10.5px;
                font-weight: 900;
                color: ${markerColor};
              ">${scen.pax_index}%</span>
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'climate-retail-marker',
          iconSize: [80, 56],
          iconAnchor: [40, 48]
        });

        const marker = L.marker([d.lat, d.lng], { icon: customIcon }).addTo(map);
        marker.on('click', () => flyToDistrict(d));
        markersRef.current[d.district_id] = marker;
      });
      return;
    }

    // 2. SOLAR EV ROI MODE
    if (activeMode === 'retail_solar' && retailSolarTab === 'solar') {
      solarStations.forEach(s => {
        const isSelected = s.stn_id === selectedSolarStationId;
        const tierColor = s.tier.startsWith('S') ? '#F59E0B' : s.tier.startsWith('A') ? '#10B981' : s.tier.startsWith('B') ? '#06B6D4' : '#64748B';

        const iconHtml = `
          <div style="
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            transform: ${isSelected ? 'scale(1.25)' : 'scale(1)'};
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: ${isSelected ? 1000 : 500};
          ">
            <div style="
              width: 34px;
              height: 34px;
              border-radius: 50%;
              background: #0B1120;
              border: ${isSelected ? '3px solid #FFFFFF' : `2px solid ${tierColor}`};
              box-shadow: 0 4px 12px rgba(0,0,0,0.6), 0 0 12px ${tierColor}66;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 15px;
            ">
              ☀️
            </div>
            <div style="
              margin-top: 3px;
              background: rgba(11, 17, 32, 0.95);
              border: 1px solid ${tierColor};
              border-radius: 5px;
              padding: 1px 6px;
              display: flex;
              gap: 3px;
              white-space: nowrap;
            ">
              <span style="font-size: 10px; font-weight: 800; color: #FFFFFF;">${s.name}</span>
              <span style="font-size: 10px; font-weight: 900; color: ${tierColor};">${s.annual_sunshine_h}h</span>
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'climate-solar-marker',
          iconSize: [70, 50],
          iconAnchor: [35, 42]
        });

        const marker = L.marker([s.lat, s.lng], { icon: customIcon }).addTo(map);
        marker.on('click', () => {
          setSelectedSolarStationId(s.stn_id);
          map.flyTo([s.lat, s.lng], 10, { duration: 1.2 });
        });
        markersRef.current[s.stn_id] = marker;
      });
      return;
    }

    // 3. TYPHOON RESILIENCE BACKTEST MODE
    if (activeMode === 'typhoon_reservoir' && typhoonReservoirTab === 'typhoon') {
      (typhoonData.station_rankings || []).forEach(s => {
        const isSelected = s.stn_id === selectedStationId;
        const shieldColor = s.shielding_rate_pct >= 50 ? '#10B981' : s.shielding_rate_pct >= 25 ? '#F59E0B' : '#EF4444';

        const iconHtml = `
          <div style="
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            transform: ${isSelected ? 'scale(1.25)' : 'scale(1)'};
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: ${isSelected ? 1000 : 500};
          ">
            <div style="
              width: 34px;
              height: 34px;
              border-radius: 50%;
              background: #0B1120;
              border: ${isSelected ? '3px solid #FFFFFF' : `2px solid ${shieldColor}`};
              box-shadow: 0 4px 12px rgba(0,0,0,0.6), 0 0 14px ${shieldColor}66;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 15px;
            ">
              ${s.shielding_rate_pct >= 50 ? '🛡️' : s.shielding_rate_pct <= 5 ? '💥' : '🌀'}
            </div>
            <div style="
              margin-top: 3px;
              background: rgba(11, 17, 32, 0.95);
              border: 1px solid ${shieldColor};
              border-radius: 5px;
              padding: 1px 6px;
              display: flex;
              gap: 3px;
              white-space: nowrap;
            ">
              <span style="font-size: 10.5px; font-weight: 800; color: #FFFFFF;">${s.name}</span>
              <span style="font-size: 10px; font-weight: 900; color: ${shieldColor};">屏障${s.shielding_rate_pct}%</span>
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'climate-typhoon-marker',
          iconSize: [80, 52],
          iconAnchor: [40, 44]
        });

        const marker = L.marker([s.lat, s.lng], { icon: customIcon }).addTo(map);
        marker.on('click', () => {
          setSelectedStationId(s.stn_id);
          map.flyTo([s.lat, s.lng], 10, { duration: 1.2 });
        });
        markersRef.current[s.stn_id] = marker;
      });
      return;
    }

    // 4. RESERVOIR DROUGHT & DELUGE MODE
    if (activeMode === 'typhoon_reservoir' && typhoonReservoirTab === 'reservoir') {
      reservoirs.forEach(r => {
        const isSelected = r.reservoir_id === selectedReservoirId;
        const color = r.inversion_index >= 85 ? '#EF4444' : r.inversion_index >= 60 ? '#F59E0B' : '#10B981';

        const iconHtml = `
          <div style="
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            transform: ${isSelected ? 'scale(1.28)' : 'scale(1)'};
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: ${isSelected ? 1000 : 500};
          ">
            ${isSelected ? `<div style="
              position: absolute;
              top: -8px; left: -8px; right: -8px; bottom: 8px;
              border-radius: 50%;
              background: ${color}44;
              animation: pulse-halo 1.8s infinite;
            "></div>` : ''}

            <div style="
              width: 40px;
              height: 40px;
              border-radius: 50%;
              background: #0B1120;
              border: ${isSelected ? '3px solid #FFFFFF' : `2px solid ${color}`};
              box-shadow: 0 4px 14px rgba(0,0,0,0.7), 0 0 16px ${color}66;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;
            ">
              💧
            </div>
            <div style="
              margin-top: 3px;
              background: rgba(11, 17, 32, 0.95);
              border: 1px solid ${color};
              border-radius: 6px;
              padding: 2px 7px;
              display: flex;
              align-items: center;
              gap: 4px;
              white-space: nowrap;
            ">
              <span style="font-size: 11px; font-weight: 800; color: #FFFFFF;">${r.name}</span>
              <span style="font-size: 10px; font-weight: 900; color: ${color};">${r.capacity_million_m3}億噸</span>
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'climate-reservoir-marker',
          iconSize: [85, 58],
          iconAnchor: [42, 50]
        });

        const marker = L.marker([r.lat, r.lng], { icon: customIcon }).addTo(map);
        marker.on('click', () => flyToReservoir(r));
        markersRef.current[r.reservoir_id] = marker;
      });
      return;
    }

    // 5. STANDARD SEASONS, CHANGE & LIVABILITY MODES (29 STATIONS)
    if (!stations.length) return;
    stations.forEach(s => {
      const isSelected = s.id === selectedStationId;
      const isCompare = s.id === compareStationId;

      let displayValue = '';
      let markerColor = '#38BDF8';
      let haloColor = 'rgba(56, 189, 248, 0.35)';

      if (activeMode === 'seasons') {
        const mData = s.monthly_climatology?.find(m => m.month === selectedMonth) || s.monthly_climatology?.[selectedMonth - 1];
        const temp = mData ? `${mData.temp.toFixed(1)}°` : '';
        const rain = mData ? `${Math.round(mData.rain_mm)}mm` : '';
        displayValue = `${temp} · ${rain}`;

        if (mData?.rain_mm >= 320) {
          markerColor = '#818CF8';
          haloColor = 'rgba(129, 140, 248, 0.45)';
        } else if (mData?.rain_mm >= 160) {
          markerColor = '#38BDF8';
          haloColor = 'rgba(56, 189, 248, 0.4)';
        } else if (mData?.temp >= 28) {
          markerColor = '#EF4444';
          haloColor = 'rgba(239, 68, 68, 0.45)';
        } else if (mData?.temp <= 16) {
          markerColor = '#06B6D4';
          haloColor = 'rgba(6, 182, 212, 0.4)';
        } else {
          markerColor = '#F59E0B';
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
          ${isSelected ? `<div style="
            position: absolute;
            top: -6px; left: -6px; right: -6px; bottom: 8px;
            border-radius: 50%;
            background: ${haloColor};
            animation: pulse-halo 1.8s infinite;
          "></div>` : ''}

          <div style="
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #0B1120;
            border: ${ringBorder};
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6), 0 0 10px ${markerColor}66;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 15px;
          ">
            ${activeMode === 'seasons' ? currentMonthIcon : '📍'}
          </div>

          <div style="
            margin-top: 3px;
            background: rgba(11, 17, 32, 0.92);
            border: 1px solid ${markerColor};
            border-radius: 5px;
            padding: 1px 6px;
            display: flex;
            align-items: center;
            gap: 3px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
            white-space: nowrap;
          ">
            <span style="font-size: 10.5px; font-weight: 800; color: #FFFFFF;">${s.name}</span>
            <span style="font-size: 9.5px; font-weight: 700; color: ${markerColor};">${displayValue}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'climate-station-marker',
        iconSize: [64, 48],
        iconAnchor: [32, 40]
      });

      const marker = L.marker([s.lat, s.lng], { icon: customIcon }).addTo(map);
      marker.on('click', () => flyToStation(s));
      markersRef.current[s.id] = marker;
    });

  }, [
    activeMode, retailSolarTab, weatherScenario, selectedDistrictId, selectedSolarStationId,
    typhoonReservoirTab, selectedTyphoonId, selectedReservoirId, selectedMonth, selectedMetric,
    activeRankCat, selectedStationId, compareStationId, stations, retailDistricts, solarStations,
    typhoonData, reservoirs
  ]);

  // SVG Radar generator helper
  const renderRadarChart = (stationA, stationB = null) => {
    if (!stationA) return null;
    const r = 85;
    const cx = 110;
    const cy = 105;
    const axes = [
      { key: 'rain_defense', label: '降雨防禦' },
      { key: 'thermal_comfort', label: '溫度舒適' },
      { key: 'typhoon_defense', label: '抗颱韌性' },
      { key: 'sunshine', label: '陽光充足' },
      { key: 'anti_mold', label: '乾爽防霉' },
      { key: 'night_cool', label: '夜間清涼' }
    ];

    const getCoord = (idx, value) => {
      const angle = (Math.PI * 2 / axes.length) * idx - Math.PI / 2;
      const dist = (value / 100.0) * r;
      return [cx + dist * Math.cos(angle), cy + dist * Math.sin(angle)];
    };

    const polyA = axes.map((a, i) => getCoord(i, stationA.livability?.radar?.[a.key] || 50));
    const polyB = stationB ? axes.map((a, i) => getCoord(i, stationB.livability?.radar?.[a.key] || 50)) : null;

    const pathA = polyA.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ') + ' Z';
    const pathB = polyB ? polyB.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ') + ' Z' : '';

    return (
      <svg width="220" height="210" style={{ overflow: 'visible' }}>
        {[0.25, 0.5, 0.75, 1.0].map((level, lIdx) => {
          const gridPts = axes.map((_, i) => getCoord(i, level * 100));
          const gridPath = gridPts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ') + ' Z';
          return (
            <path key={lIdx} d={gridPath} fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" strokeDasharray="2,2" />
          );
        })}
        {axes.map((a, i) => {
          const [ax, ay] = getCoord(i, 100);
          const [labelX, labelY] = getCoord(i, 118);
          return (
            <g key={a.key}>
              <line x1={cx} y1={cy} x2={ax} y2={ay} stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" />
              <text x={labelX} y={labelY + 3} textAnchor="middle" fill="#94A3B8" fontSize="10" fontWeight="600">
                {a.label}
              </text>
            </g>
          );
        })}
        {polyB && (
          <path d={pathB} fill="rgba(245, 158, 11, 0.25)" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3,3" />
        )}
        <path d={pathA} fill="rgba(56, 189, 248, 0.35)" stroke="#38BDF8" strokeWidth="2" />
        {polyA.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill="#38BDF8" stroke="#0F172A" strokeWidth="1.5" />
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
          <path d={`${pathD} L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`} fill="url(#tempGrad)" opacity="0.3" />
          <path d={pathD} fill="none" stroke="#F43F5E" strokeWidth="2.2" />
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
        <div ref={mapRef} style={{ width: '100%', height: '100%', background: '#0a0f1d' }} />

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
          flexDirection: 'column',
          gap: '8px',
          pointerEvents: 'none',
          zIndex: 800
        }}>
          {/* Main Mode Switcher Pill */}
          <div style={{
            display: 'flex',
            background: 'rgba(15, 23, 42, 0.94)',
            backdropFilter: 'blur(12px)',
            borderRadius: '10px',
            padding: '4px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            pointerEvents: 'auto',
            gap: '4px',
            width: 'fit-content'
          }}>
            <button
              onClick={() => setActiveMode('seasons')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '7px 12px',
                borderRadius: '7px',
                border: 'none',
                background: activeMode === 'seasons' ? 'linear-gradient(135deg, #0284C7, #38BDF8)' : 'transparent',
                color: activeMode === 'seasons' ? '#0F172A' : '#94A3B8',
                fontWeight: '800',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              <Clock size={13} />
              <span>⏱️ 四季動態潮汐</span>
            </button>

            <button
              onClick={() => setActiveMode('retail_solar')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '7px 12px',
                borderRadius: '7px',
                border: 'none',
                background: activeMode === 'retail_solar' ? 'linear-gradient(135deg, #F59E0B, #EAB308)' : 'transparent',
                color: activeMode === 'retail_solar' ? '#0F172A' : '#94A3B8',
                fontWeight: '800',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              <Store size={13} />
              <span>🏬 晴雨商圈與光電EV (類別4)</span>
            </button>

            <button
              onClick={() => setActiveMode('typhoon_reservoir')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '7px 12px',
                borderRadius: '7px',
                border: 'none',
                background: activeMode === 'typhoon_reservoir' ? 'linear-gradient(135deg, #8B5CF6, #6366F1)' : 'transparent',
                color: activeMode === 'typhoon_reservoir' ? '#FFFFFF' : '#94A3B8',
                fontWeight: '800',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              <Shield size={13} />
              <span>🌪️ 抗颱神仙與水庫旱澇 (類別5)</span>
            </button>

            <button
              onClick={() => setActiveMode('change')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '7px 12px',
                borderRadius: '7px',
                border: 'none',
                background: activeMode === 'change' ? 'linear-gradient(135deg, #EF4444, #F97316)' : 'transparent',
                color: activeMode === 'change' ? '#FFFFFF' : '#94A3B8',
                fontWeight: '700',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              <TrendingUp size={13} />
              <span>📈 30年升溫</span>
            </button>

            <button
              onClick={() => setActiveMode('livability')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '7px 12px',
                borderRadius: '7px',
                border: 'none',
                background: activeMode === 'livability' ? 'linear-gradient(135deg, #10B981, #059669)' : 'transparent',
                color: activeMode === 'livability' ? '#0F172A' : '#94A3B8',
                fontWeight: '700',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              <Award size={13} />
              <span>🏆 宜居榜</span>
            </button>
          </div>

          {/* Sub Control Strip for Category 4 (Retail & Solar) */}
          {activeMode === 'retail_solar' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(15, 23, 42, 0.94)',
              backdropFilter: 'blur(12px)',
              borderRadius: '9px',
              padding: '6px 12px',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
              pointerEvents: 'auto',
              width: 'fit-content'
            }}>
              <div style={{ display: 'flex', gap: '4px', background: 'rgba(30, 41, 59, 0.6)', padding: '2px', borderRadius: '6px' }}>
                <button
                  onClick={() => setRetailSolarTab('retail')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '5px',
                    border: 'none',
                    background: retailSolarTab === 'retail' ? '#F59E0B' : 'transparent',
                    color: retailSolarTab === 'retail' ? '#0F172A' : '#94A3B8',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  🛍️ 晴雨商圈對流模型
                </button>
                <button
                  onClick={() => setRetailSolarTab('solar')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '5px',
                    border: 'none',
                    background: retailSolarTab === 'solar' ? '#F59E0B' : 'transparent',
                    color: retailSolarTab === 'solar' ? '#0F172A' : '#94A3B8',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  ☀️ 全島光電與 EV 快充 ROI
                </button>
              </div>

              {retailSolarTab === 'retail' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#CBD5E1', fontWeight: '700' }}>模擬天候：</span>
                  {[
                    { id: 'sunny', label: '☀️ 晴朗', color: '#EAB308' },
                    { id: 'rain_drizzle', label: '🌧️ 陰雨 1-10mm', color: '#38BDF8' },
                    { id: 'heavy_rain', label: '⛈️ 豪大雨 >50mm', color: '#EF4444' }
                  ].map(sc => (
                    <button
                      key={sc.id}
                      onClick={() => setWeatherScenario(sc.id)}
                      style={{
                        padding: '4px 9px',
                        borderRadius: '5px',
                        border: weatherScenario === sc.id ? `1px solid ${sc.color}` : '1px solid rgba(255, 255, 255, 0.1)',
                        background: weatherScenario === sc.id ? `${sc.color}33` : 'rgba(30, 41, 59, 0.4)',
                        color: weatherScenario === sc.id ? '#FFFFFF' : '#94A3B8',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {sc.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sub Control Strip for Category 5 (Typhoon & Reservoir) */}
          {activeMode === 'typhoon_reservoir' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(15, 23, 42, 0.94)',
              backdropFilter: 'blur(12px)',
              borderRadius: '9px',
              padding: '6px 12px',
              border: '1px solid rgba(139, 92, 246, 0.35)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
              pointerEvents: 'auto',
              width: 'fit-content'
            }}>
              <div style={{ display: 'flex', gap: '4px', background: 'rgba(30, 41, 59, 0.6)', padding: '2px', borderRadius: '6px' }}>
                <button
                  onClick={() => setTyphoonReservoirTab('typhoon')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '5px',
                    border: 'none',
                    background: typhoonReservoirTab === 'typhoon' ? '#8B5CF6' : 'transparent',
                    color: typhoonReservoirTab === 'typhoon' ? '#FFFFFF' : '#94A3B8',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  🛡️ 中央山脈 30 年抗颱回測
                </button>
                <button
                  onClick={() => setTyphoonReservoirTab('reservoir')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '5px',
                    border: 'none',
                    background: typhoonReservoirTab === 'reservoir' ? '#8B5CF6' : 'transparent',
                    color: typhoonReservoirTab === 'reservoir' ? '#FFFFFF' : '#94A3B8',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  💧 四大水庫連續乾旱與旱澇急轉
                </button>
              </div>

              {typhoonReservoirTab === 'typhoon' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#CBD5E1', fontWeight: '700' }}>回測颱風：</span>
                  <select
                    value={selectedTyphoonId}
                    onChange={e => setSelectedTyphoonId(e.target.value)}
                    style={{
                      background: '#1E293B',
                      border: '1px solid rgba(139, 92, 246, 0.4)',
                      borderRadius: '5px',
                      color: '#F8FAFC',
                      fontSize: '11px',
                      padding: '3px 8px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {typhoonData.historical_typhoons?.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.year})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Floating Season Player (When in 'seasons' mode) */}
        {activeMode === 'seasons' && (
          <div style={{
            position: 'absolute',
            bottom: '20px',
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
                      cursor: 'pointer'
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
                      cursor: 'pointer'
                    }}
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>

                <div style={{ display: 'flex', background: 'rgba(30, 41, 59, 0.8)', borderRadius: '6px', padding: '2px' }}>
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  background: 'rgba(56, 189, 248, 0.18)',
                  border: '1px solid #38BDF8',
                  color: '#38BDF8',
                  padding: '3px 9px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: '800'
                }}>
                  {SEASON_NARRATIVES[selectedMonth]?.season}
                </span>
                <span style={{ color: '#E2E8F0', fontSize: '12px', fontWeight: '500' }}>
                  {SEASON_NARRATIVES[selectedMonth]?.desc}
                </span>
              </div>
            </div>

            {/* Month Slider */}
            <input
              type="range"
              min="1"
              max="12"
              step="1"
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: '#38BDF8',
                cursor: 'pointer'
              }}
            />
          </div>
        )}

      </div>

      {/* RIGHT STAGE: Inspector & Leaderboard Panel (36% Width) */}
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
                  {activeMode === 'retail_solar' ? '🏬' : activeMode === 'typhoon_reservoir' ? '🌪️' : activeMode === 'seasons' ? '⏱️' : activeMode === 'change' ? '🌡️' : '🏆'}
                </span>
                <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#F8FAFC', margin: 0 }}>
                  {activeMode === 'retail_solar' 
                    ? (retailSolarTab === 'retail' ? '晴雨商圈乾濕人流對流模型' : '全島 30 年光電與 EV 快充 ROI')
                    : activeMode === 'typhoon_reservoir'
                    ? (typhoonReservoirTab === 'typhoon' ? '中央山脈 30 年抗颱屏障大回測' : '四大水庫連續乾旱與旱澇急轉')
                    : activeMode === 'seasons' 
                    ? '全島四季氣候潮汐動態看板' 
                    : activeMode === 'change' 
                    ? '全台 30 年氣候變遷戰略報告' 
                    : '全台微氣候宜居極值排行'}
                </h2>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#64748B' }}>
                交通部中央氣象署 CODiS 1998–2024 近 30 年連續實測大數據庫
              </p>
            </div>

            <div style={{ width: '120px' }}>
              <input
                type="text"
                placeholder="搜尋點位..."
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

          {/* ============================================================ */}
          {/* CATEGORY 4: RETAIL CONVECTION SUBTAB                         */}
          {/* ============================================================ */}
          {activeMode === 'retail_solar' && retailSolarTab === 'retail' && selectedDistrict && (
            <>
              {/* Selected District Card */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.8)',
                borderRadius: '10px',
                padding: '16px',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{
                      background: 'rgba(245, 158, 11, 0.2)',
                      color: '#F59E0B',
                      fontSize: '10.5px',
                      fontWeight: '800',
                      padding: '2px 7px',
                      borderRadius: '4px'
                    }}>
                      {selectedDistrict.type_label}
                    </span>
                    <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#F8FAFC', margin: '6px 0 2px' }}>
                      {selectedDistrict.name}
                    </h3>
                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                      {selectedDistrict.city} · 晴天基準客流 {(selectedDistrict.sunny_daily_pax / 10000).toFixed(1)}萬人次/日
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>遮雨防護評級</div>
                    <div style={{ color: '#F59E0B', fontSize: '14px', fontWeight: '800', marginTop: '2px' }}>
                      {'⭐'.repeat(selectedDistrict.rain_shield_rating)} ({selectedDistrict.rain_shield_rating}/5星)
                    </div>
                  </div>
                </div>

                {/* Scenario Metric Cards */}
                {(() => {
                  const scen = selectedDistrict.scenarios[weatherScenario] || selectedDistrict.scenarios.sunny;
                  const isPositive = scen.pax_index >= 100;
                  const diff = scen.pax_index - 100;
                  return (
                    <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                      <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '10px 8px', borderRadius: '7px', textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', color: '#94A3B8' }}>人流指數</div>
                        <div style={{ fontSize: '17px', fontWeight: '900', color: isPositive ? '#10B981' : '#EF4444', margin: '2px 0' }}>
                          {scen.pax_index}%
                        </div>
                        <div style={{ fontSize: '9.5px', color: isPositive ? '#10B981' : '#EF4444' }}>
                          {diff >= 0 ? `+${diff}%` : `${diff}%`}
                        </div>
                      </div>

                      <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '10px 8px', borderRadius: '7px', textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', color: '#94A3B8' }}>預估日客流</div>
                        <div style={{ fontSize: '16px', fontWeight: '900', color: '#F8FAFC', margin: '2px 0' }}>
                          {(scen.daily_pax / 10000).toFixed(1)}萬
                        </div>
                        <div style={{ fontSize: '9.5px', color: '#64748B' }}>人次/日</div>
                      </div>

                      <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '10px 8px', borderRadius: '7px', textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', color: '#94A3B8' }}>停留時長</div>
                        <div style={{ fontSize: '16px', fontWeight: '900', color: '#38BDF8', margin: '2px 0' }}>
                          {scen.dwell_mins}
                        </div>
                        <div style={{ fontSize: '9.5px', color: '#64748B' }}>分鐘</div>
                      </div>

                      <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '10px 8px', borderRadius: '7px', textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', color: '#94A3B8' }}>客單消費</div>
                        <div style={{ fontSize: '16px', fontWeight: '900', color: '#F59E0B', margin: '2px 0' }}>
                          ${scen.avg_spend}
                        </div>
                        <div style={{ fontSize: '9.5px', color: '#64748B' }}>NTD</div>
                      </div>
                    </div>
                  );
                })()}

                {/* Convection Destination Callout */}
                <div style={{
                  marginTop: '12px',
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px dashed rgba(56, 189, 248, 0.35)',
                  borderRadius: '7px',
                  padding: '9px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <ArrowUpRight size={16} color="#38BDF8" />
                  <div style={{ fontSize: '11.5px', color: '#E2E8F0' }}>
                    <strong style={{ color: '#38BDF8' }}>人流乾濕對流樞紐：</strong> {selectedDistrict.convection_destination}
                  </div>
                </div>

                <div style={{ marginTop: '10px', fontSize: '11px', color: '#94A3B8', lineHeight: '1.5' }}>
                  💡 <strong>大數據洞察：</strong> {selectedDistrict.insight}
                </div>
              </div>

              {/* 7 Districts Convection Comparison Table */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#F8FAFC', marginBottom: '8px' }}>
                  📊 全台 7 大指標商圈【{weatherScenario === 'sunny' ? '☀️ 晴朗' : weatherScenario === 'rain_drizzle' ? '🌧️ 陰雨 1-10mm' : '⛈️ 豪大雨 >50mm'}】即時對照
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {retailDistricts.map(d => {
                    const isSelected = d.district_id === selectedDistrictId;
                    const scen = d.scenarios[weatherScenario] || d.scenarios.sunny;
                    const isUp = scen.pax_index >= 100;
                    return (
                      <div
                        key={d.district_id}
                        onClick={() => flyToDistrict(d)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: isSelected ? 'rgba(245, 158, 11, 0.18)' : 'rgba(30, 41, 59, 0.35)',
                          border: isSelected ? '1px solid #F59E0B' : '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '7px',
                          cursor: 'pointer'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: '#F8FAFC' }}>{d.name}</span>
                            <span style={{ fontSize: '10px', color: '#94A3B8' }}>({d.city})</span>
                          </div>
                          <div style={{ fontSize: '10px', color: '#64748B' }}>{d.type_label}</div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '15px', fontWeight: '900', color: isUp ? '#10B981' : '#EF4444' }}>
                            {scen.pax_index}%
                          </span>
                          <span style={{ fontSize: '10px', color: '#64748B', marginLeft: '4px' }}>
                            ({(scen.daily_pax / 10000).toFixed(1)}萬人)
                          </span>
                          <div style={{ fontSize: '9.5px', color: '#94A3B8' }}>
                            營業額彈性: {scen.revenue_elasticity}x
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ============================================================ */}
          {/* CATEGORY 4: SOLAR & EV CHARGING ROI SUBTAB                   */}
          {/* ============================================================ */}
          {activeMode === 'retail_solar' && retailSolarTab === 'solar' && selectedSolarStation && (
            <>
              {/* Selected Solar Station Profile */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.8)',
                borderRadius: '10px',
                padding: '16px',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{
                      background: 'rgba(245, 158, 11, 0.2)',
                      color: '#F59E0B',
                      fontSize: '10.5px',
                      fontWeight: '800',
                      padding: '2px 7px',
                      borderRadius: '4px'
                    }}>
                      {selectedSolarStation.tier}
                    </span>
                    <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#F8FAFC', margin: '6px 0 2px' }}>
                      {selectedSolarStation.name} 氣象站
                    </h3>
                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                      {selectedSolarStation.county} · 全國日照排行第 {selectedSolarStation.rank} 名
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>日照資本評星</div>
                    <div style={{ color: '#F59E0B', fontSize: '13px', fontWeight: '800' }}>
                      {'⭐'.repeat(selectedSolarStation.stars)}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '10px 8px', borderRadius: '7px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#94A3B8' }}>年日照時數</div>
                    <div style={{ fontSize: '16px', fontWeight: '900', color: '#F59E0B', margin: '2px 0' }}>
                      {selectedSolarStation.annual_sunshine_h}
                    </div>
                    <div style={{ fontSize: '9.5px', color: '#64748B' }}>小時/年</div>
                  </div>

                  <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '10px 8px', borderRadius: '7px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#94A3B8' }}>每日平均日射</div>
                    <div style={{ fontSize: '16px', fontWeight: '900', color: '#F8FAFC', margin: '2px 0' }}>
                      {selectedSolarStation.daily_radiation_kwh}
                    </div>
                    <div style={{ fontSize: '9.5px', color: '#64748B' }}>kWh/m²</div>
                  </div>

                  <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '10px 8px', borderRadius: '7px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#94A3B8' }}>50kW 屋頂年發</div>
                    <div style={{ fontSize: '16px', fontWeight: '900', color: '#10B981', margin: '2px 0' }}>
                      {(selectedSolarStation.rooftop_50kw_kwh_yr / 1000).toFixed(1)}k
                    </div>
                    <div style={{ fontSize: '9.5px', color: '#64748B' }}>度/年</div>
                  </div>

                  <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '10px 8px', borderRadius: '7px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#94A3B8' }}>EV快充ROI</div>
                    <div style={{ fontSize: '16px', fontWeight: '900', color: '#38BDF8', margin: '2px 0' }}>
                      {selectedSolarStation.ev_charging_roi_years}
                    </div>
                    <div style={{ fontSize: '9.5px', color: '#64748B' }}>年回本</div>
                  </div>
                </div>

                <div style={{ marginTop: '12px', fontSize: '11px', color: '#94A3B8', lineHeight: '1.5' }}>
                  🌿 <strong>清潔能源潛力：</strong> 年減碳量高達 <strong>{selectedSolarStation.co2_reduction_tons_yr} 噸 CO₂e</strong>。{selectedSolarStation.desc}
                </div>
              </div>

              {/* Solar Leaderboard Top 10 */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#F8FAFC', marginBottom: '8px' }}>
                  ☀️ 全台 30 年日照資本與光電 ROI 排行榜 (Top 10)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {solarStations.slice(0, 10).map((s, idx) => {
                    const isSelected = s.stn_id === selectedSolarStationId;
                    return (
                      <div
                        key={s.stn_id}
                        onClick={() => {
                          setSelectedSolarStationId(s.stn_id);
                          mapInstanceRef.current?.flyTo([s.lat, s.lng], 10, { duration: 1.2 });
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: isSelected ? 'rgba(245, 158, 11, 0.18)' : 'rgba(30, 41, 59, 0.35)',
                          border: isSelected ? '1px solid #F59E0B' : '1px solid rgba(255, 255, 255, 0.06)',
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
                            <span style={{ fontSize: '13px', fontWeight: '700', color: '#F8FAFC' }}>{s.name}</span>
                            <span style={{ fontSize: '10.5px', color: '#94A3B8', marginLeft: '6px' }}>({s.county})</span>
                            <div style={{ fontSize: '10px', color: '#F59E0B' }}>{s.tier}</div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '15px', fontWeight: '900', color: '#F8FAFC' }}>
                            {s.annual_sunshine_h}
                          </span>
                          <span style={{ fontSize: '10px', color: '#64748B', marginLeft: '3px' }}>小時</span>
                          <div style={{ fontSize: '9.5px', color: '#10B981' }}>
                            回本年限: {s.ev_charging_roi_years} 年
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ============================================================ */}
          {/* CATEGORY 5: TYPHOON RESILIENCE BACKTEST SUBTAB               */}
          {/* ============================================================ */}
          {activeMode === 'typhoon_reservoir' && typhoonReservoirTab === 'typhoon' && (
            <>
              {/* Selected Typhoon Dossier */}
              {selectedTyphoon && (
                <div style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  borderRadius: '10px',
                  padding: '14px',
                  border: '1px solid rgba(139, 92, 246, 0.35)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      background: 'rgba(139, 92, 246, 0.25)',
                      color: '#C084FC',
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      {selectedTyphoon.intensity}
                    </span>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>登陸年份: {selectedTyphoon.year}</span>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#F8FAFC', margin: '6px 0 4px' }}>
                    🌀 {selectedTyphoon.name}
                  </h3>
                  <div style={{ fontSize: '11.5px', color: '#F43F5E', fontWeight: '700' }}>
                    極值紀錄：{selectedTyphoon.max_rain_record}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px', lineHeight: '1.4' }}>
                    {selectedTyphoon.damage_summary}
                  </div>
                </div>
              )}

              {/* Selected Station 30-Year Resilience Dossier */}
              {selectedStation && (
                <div style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  borderRadius: '10px',
                  padding: '14px',
                  border: '1px solid rgba(56, 189, 248, 0.35)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{
                        background: selectedStation.livability?.radar?.typhoon_defense >= 80 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: selectedStation.livability?.radar?.typhoon_defense >= 80 ? '#10B981' : '#EF4444',
                        fontSize: '10.5px',
                        fontWeight: '800',
                        padding: '2px 7px',
                        borderRadius: '4px'
                      }}>
                        {selectedStation.badge}
                      </span>
                      <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#F8FAFC', margin: '6px 0 2px' }}>
                        {selectedStation.name} 抗颱綜合評級
                      </h3>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>{selectedStation.county}</div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>抗颱防護分</div>
                      <div style={{
                        fontSize: '22px', fontWeight: '900',
                        color: selectedStation.livability?.radar?.typhoon_defense >= 80 ? '#10B981' : selectedStation.livability?.radar?.typhoon_defense >= 60 ? '#F59E0B' : '#EF4444'
                      }}>
                        {selectedStation.livability?.radar?.typhoon_defense || 60}分
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '10px', fontSize: '11px', color: '#CBD5E1', lineHeight: '1.5' }}>
                    {selectedStation.id === '467490' 
                      ? '🛡️ 台中盆地受雪山與中央山脈雙重屏蔽，歷次強颱風雨衰減近七成，全台最安全避風港。'
                      : selectedStation.id === '466920'
                      ? '🌊 台北盆地風力受擋，但納莉級慢速颱風時河川外水倒灌壓力極大。'
                      : selectedStation.id === '467060'
                      ? '💥 蘇澳岬角迎風多雨，蘇迪勒颱風瞬間狂風飆破 17 級破表，全台風暴重災最前線。'
                      : selectedStation.id === '467440_merged'
                      ? '🌀 傳統避開西北颱，但山陀兒極罕見登陸高屏，市區連遭 17 級風橫掃 6 小時。'
                      : '中央山脈地形效應顯著影響該地風雨分佈。'}
                  </div>
                </div>
              )}

              {/* Typhoon Station Rankings */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#F8FAFC', marginBottom: '8px' }}>
                  🛡️ 全台中央山脈抗颱屏障度排行榜 (Top 8)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {typhoonData.station_rankings?.slice(0, 8).map((s, idx) => {
                    const isSelected = s.stn_id === selectedStationId;
                    return (
                      <div
                        key={s.stn_id}
                        onClick={() => {
                          setSelectedStationId(s.stn_id);
                          mapInstanceRef.current?.flyTo([s.lat, s.lng], 10, { duration: 1.2 });
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: isSelected ? 'rgba(139, 92, 246, 0.2)' : 'rgba(30, 41, 59, 0.35)',
                          border: isSelected ? '1px solid #8B5CF6' : '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '7px',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            width: '20px', height: '20px', borderRadius: '50%',
                            background: idx === 0 ? '#10B981' : idx === 1 ? '#059669' : 'rgba(255, 255, 255, 0.1)',
                            color: '#FFFFFF', fontSize: '11px', fontWeight: '800',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            {idx + 1}
                          </span>
                          <div>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: '#F8FAFC' }}>{s.name}</span>
                            <span style={{ fontSize: '10.5px', color: '#94A3B8', marginLeft: '6px' }}>({s.county})</span>
                            <div style={{ fontSize: '10px', color: '#C084FC' }}>{s.shield_badge}</div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '15px', fontWeight: '900', color: '#10B981' }}>
                            {s.shielding_rate_pct}%
                          </span>
                          <span style={{ fontSize: '10px', color: '#64748B', marginLeft: '3px' }}>屏障衰減</span>
                          <div style={{ fontSize: '9.5px', color: '#94A3B8' }}>
                            綜合防護: {s.resilience_score}分
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ============================================================ */}
          {/* CATEGORY 5: RESERVOIR DROUGHT & DELUGE SUBTAB               */}
          {/* ============================================================ */}
          {activeMode === 'typhoon_reservoir' && typhoonReservoirTab === 'reservoir' && selectedReservoir && (
            <>
              {/* Selected Reservoir Dossier */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.8)',
                borderRadius: '10px',
                padding: '16px',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{
                      background: 'rgba(56, 189, 248, 0.2)',
                      color: '#38BDF8',
                      fontSize: '10.5px',
                      fontWeight: '800',
                      padding: '2px 7px',
                      borderRadius: '4px'
                    }}>
                      {selectedReservoir.region}
                    </span>
                    <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#F8FAFC', margin: '6px 0 2px' }}>
                      💧 {selectedReservoir.name}
                    </h3>
                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                      {selectedReservoir.service_area}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>旱澇急轉指數</div>
                    <div style={{
                      fontSize: '22px', fontWeight: '900',
                      color: selectedReservoir.inversion_index >= 85 ? '#EF4444' : selectedReservoir.inversion_index >= 60 ? '#F59E0B' : '#10B981'
                    }}>
                      {selectedReservoir.inversion_index}分
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '10px 8px', borderRadius: '7px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#94A3B8' }}>庫容總量</div>
                    <div style={{ fontSize: '16px', fontWeight: '900', color: '#38BDF8', margin: '2px 0' }}>
                      {selectedReservoir.capacity_million_m3}
                    </div>
                    <div style={{ fontSize: '9.5px', color: '#64748B' }}>億立方米</div>
                  </div>

                  <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '10px 8px', borderRadius: '7px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#94A3B8' }}>最長CDD無雨</div>
                    <div style={{ fontSize: '16px', fontWeight: '900', color: '#EF4444', margin: '2px 0' }}>
                      {selectedReservoir.max_cdd_days}
                    </div>
                    <div style={{ fontSize: '9.5px', color: '#64748B' }}>連續天數</div>
                  </div>

                  <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '10px 8px', borderRadius: '7px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#94A3B8' }}>CDD 30年增幅</div>
                    <div style={{ fontSize: '16px', fontWeight: '900', color: '#F59E0B', margin: '2px 0' }}>
                      +{selectedReservoir.cdd_30y_growth_pct}%
                    </div>
                    <div style={{ fontSize: '9.5px', color: '#64748B' }}>乾旱延長</div>
                  </div>

                  <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '10px 8px', borderRadius: '7px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#94A3B8' }}>48hr暴雨驟滿</div>
                    <div style={{ fontSize: '16px', fontWeight: '900', color: '#10B981', margin: '2px 0' }}>
                      {selectedReservoir.deluge_rapid_refill_count}
                    </div>
                    <div style={{ fontSize: '9.5px', color: '#64748B' }}>次 (30年)</div>
                  </div>
                </div>

                <div style={{ marginTop: '12px', fontSize: '11px', color: '#CBD5E1', lineHeight: '1.5' }}>
                  🌊 <strong>補給水文特徵：</strong> {selectedReservoir.water_source_pattern}
                </div>
                <div style={{ marginTop: '6px', fontSize: '11px', color: '#F43F5E', lineHeight: '1.4' }}>
                  🚨 <strong>歷史驚悚極限：</strong> {selectedReservoir.historical_extreme}
                </div>
              </div>

              {/* 4 Reservoirs Comparison List */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#F8FAFC', marginBottom: '8px' }}>
                  💧 全台四大核心水庫旱澇急轉脆弱度橫向評估
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {reservoirs.map(r => {
                    const isSelected = r.reservoir_id === selectedReservoirId;
                    const color = r.inversion_index >= 85 ? '#EF4444' : r.inversion_index >= 60 ? '#F59E0B' : '#10B981';
                    return (
                      <div
                        key={r.reservoir_id}
                        onClick={() => flyToReservoir(r)}
                        style={{
                          padding: '10px 12px',
                          background: isSelected ? 'rgba(56, 189, 248, 0.18)' : 'rgba(30, 41, 59, 0.35)',
                          border: isSelected ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#F8FAFC' }}>{r.name}</span>
                            <span style={{ fontSize: '11px', color: '#94A3B8', marginLeft: '6px' }}>({r.region})</span>
                            <div style={{ fontSize: '10.5px', color }}>{r.vulnerability_tier}</div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '16px', fontWeight: '900', color }}>{r.inversion_index}分</div>
                            <div style={{ fontSize: '10px', color: '#64748B' }}>庫容 {r.capacity_million_m3}億噸</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ============================================================ */}
          {/* MODE 0: SEASONAL CLIMATOLOGY PLAYER                          */}
          {/* ============================================================ */}
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
                    最高: {islandMonthlyStats.hottest?.station.name} ({islandMonthlyStats.hottest?.temp}°C)
                  </div>
                </div>

                <div style={{ background: 'rgba(129, 140, 248, 0.08)', border: '1px solid rgba(129, 140, 248, 0.25)', padding: '10px 12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#818CF8', fontWeight: '700' }}>全島月降雨量</div>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: '#F8FAFC', margin: '4px 0 2px' }}>
                    {islandMonthlyStats.avgRain}mm
                  </div>
                  <div style={{ fontSize: '10px', color: '#94A3B8' }}>
                    雨極: {islandMonthlyStats.rainiest?.station.name} ({Math.round(islandMonthlyStats.rainiest?.rain_mm)}mm)
                  </div>
                </div>

                <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '10px 12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#F59E0B', fontWeight: '700' }}>全島日照時數</div>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: '#F8FAFC', margin: '4px 0 2px' }}>
                    {islandMonthlyStats.avgSun}h
                  </div>
                  <div style={{ fontSize: '10px', color: '#94A3B8' }}>
                    陽光: {islandMonthlyStats.sunniest?.station.name} ({Math.round(islandMonthlyStats.sunniest?.sunshine_h)}h)
                  </div>
                </div>
              </div>

              {/* Mobility Safety Advisory */}
              <div style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '8px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <AlertTriangle size={18} color="#EF4444" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '11.5px', color: '#E2E8F0', lineHeight: '1.4' }}>
                  <strong style={{ color: '#EF4444' }}>交通安全與移動提醒：</strong>
                  {SEASON_NARRATIVES[selectedMonth]?.mobility}
                </div>
              </div>
            </>
          )}

          {/* ============================================================ */}
          {/* MODE 1: 30-YEAR CLIMATE CHANGE HERO                          */}
          {/* ============================================================ */}
          {activeMode === 'change' && (
            <>
              {/* Metric filter buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { id: 'temp_delta', label: '🌡️ 均溫攀升 (°C)', color: '#EF4444' },
                  { id: 'hot35_delta', label: '🔥 酷熱天增加 (天)', color: '#F97316' },
                  { id: 'rain_days_delta', label: '🌧️ 雨天縮減 (天)', color: '#8B5CF6' }
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMetric(m.id)}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      borderRadius: '7px',
                      border: selectedMetric === m.id ? `1px solid ${m.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                      background: selectedMetric === m.id ? 'rgba(30, 41, 59, 0.8)' : 'rgba(30, 41, 59, 0.3)',
                      color: selectedMetric === m.id ? '#FFFFFF' : '#94A3B8',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Temperature Warming Leaderboard */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#F8FAFC', marginBottom: '8px' }}>
                  🔥 全台 30 年均溫升溫最劇烈測站 (Top 5)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {rankings.topTemp?.map((s, idx) => (
                    <div
                      key={s.id}
                      onClick={() => flyToStation(s)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: selectedStationId === s.id ? 'rgba(239, 68, 68, 0.2)' : 'rgba(30, 41, 59, 0.35)',
                        border: selectedStationId === s.id ? '1px solid #EF4444' : '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '7px',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          width: '18px', height: '18px', borderRadius: '50%',
                          background: idx === 0 ? '#EF4444' : '#F97316',
                          color: '#FFFFFF', fontSize: '10.5px', fontWeight: '800',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {idx + 1}
                        </span>
                        <div>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#F8FAFC' }}>{s.name}</span>
                          <span style={{ fontSize: '10.5px', color: '#64748B', marginLeft: '6px' }}>({s.county})</span>
                          <div style={{ fontSize: '10px', color: '#EF4444' }}>{s.badge}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '14px', fontWeight: '900', color: '#EF4444' }}>
                          +{s.metrics_30y.temp_delta}°C
                        </span>
                        <div style={{ fontSize: '9.5px', color: '#94A3B8' }}>酷熱天+{s.metrics_30y.hot35_days_delta}天</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ============================================================ */}
          {/* MODE 2: LIVABILITY RANKINGS                                  */}
          {/* ============================================================ */}
          {activeMode === 'livability' && (
            <>
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
                        cursor: 'pointer'
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

              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#F8FAFC', marginBottom: '8px' }}>
                  🏆 {rankings.category?.label} 榜首前六名
                </h4>
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
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* DUAL-STATION PK & RADAR CHART INSPECTOR (Always available) */}
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

            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
              <div style={{ flex: 1, background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '6px', padding: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#38BDF8' }}>🔵 {selectedStation.name}</span>
                  <span style={{ fontSize: '10px', color: '#94A3B8' }}>海拔 {selectedStation.alt_m}m</span>
                </div>
                <div style={{ fontSize: '10.5px', color: '#F8FAFC', marginTop: '2px', fontWeight: '600' }}>
                  {selectedStation.badge}
                </div>
              </div>

              <div style={{ flex: 1, background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '6px', padding: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#F59E0B' }}>🟡 {compareStation.name}</span>
                  <span style={{ fontSize: '10px', color: '#94A3B8' }}>海拔 {compareStation.alt_m}m</span>
                </div>
                <div style={{ fontSize: '10.5px', color: '#F8FAFC', marginTop: '2px', fontWeight: '600' }}>
                  {compareStation.badge}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
              {renderRadarChart(selectedStation, compareStation)}
            </div>

            {selectedStation.metrics_30y?.history && (
              renderHistoryTrend(selectedStation.metrics_30y.history)
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
'''

with open(target_file, "w", encoding="utf-8") as f:
    f.write(code)

print("Updated ClimatePulseLab.jsx successfully!")
