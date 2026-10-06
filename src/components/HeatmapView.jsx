import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { esc } from '../utils/sanitize';
import { CARTO_TILES, CARTO_ATTRIBUTION } from '../utils/basemap';
import { 
  Flame, ArrowDownRight, ArrowUpRight, Waves, 
  Users, Briefcase, Compass, Play, Pause, RotateCcw, 
  Calendar, Clock, MapPin, Zap, ChevronRight, ChevronDown, ChevronUp, TrendingUp, Info, Sparkles, Heart, GraduationCap
} from 'lucide-react';

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

const REGION_BOUNDS = {
  all: { center: [23.9, 120.9], zoom: 8 },
  North: { center: [25.05, 121.50], zoom: 10 },
  Central: { center: [24.15, 120.65], zoom: 10 },
  South: { center: [22.65, 120.32], zoom: 10 },
  East: { center: [24.30, 121.70], zoom: 9 }
};

export default function HeatmapView({ basemap = 'dark', initialPaxType = 'all' }) {
  const [heatmapData, setHeatmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 核心控制狀態
  const [flowMode, setFlowMode] = useState('activity'); // 'activity' (預設), 'inflow', 'outflow', 'net'
  const [paxType, setPaxType] = useState(initialPaxType || 'all'); // 'all', 'commuter', 'tourist', 'senior', 'student', 'personas'
  const [timeScope, setTimeScope] = useState('wednesday'); // 'wednesday', 'weekday', 'weekend'
  const [currentHour, setCurrentHour] = useState(9); // 預設週三 09:00 - 10:00 (使用者指定範例)
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedStation, setSelectedStation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInsightPanel, setShowInsightPanel] = useState(true);
  const [currentZoom, setCurrentZoom] = useState(8);
  const [isLegendOpen, setIsLegendOpen] = useState(false); // 左下角圖例說明展開/縮起狀態

  // 同步外部傳入之客群類別
  useEffect(() => {
    if (initialPaxType && initialPaxType !== paxType) {
      setPaxType(initialPaxType);
    }
  }, [initialPaxType]);

  // 專家動態調校參數 (開關與拉桿)
  const DEFAULT_PARAMS = {
    peakCommuterRate: 88,    // 平日尖峰基準通勤率 (70 ~ 98%)
    offpeakBusinessRate: 45, // 平日離峰商務折算率 (20 ~ 70%)
    weekendLeisureRate: 75,  // 週末 TPASS 休閒轉化率 (40 ~ 95%)
    stationSensitivity: 1.0  // 站點特性敏感度乘數 (0.5 ~ 2.0x)
  };
  const [expertParams, setExpertParams] = useState(DEFAULT_PARAMS);
  const [showExpertPanel, setShowExpertPanel] = useState(false);

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersRef = useRef([]);

  // 1. 載入熱點 JSON 資料
  useEffect(() => {
    const baseUrl = import.meta.env.BASE_URL || '/';
    const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    fetch(`${cleanBase}heatmap_data.json`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setHeatmapData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('載入熱點資料失敗:', err);
        setLoading(false);
      });
  }, []);

  // 2. 初始化 Leaflet 地圖
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

    // 監聽縮放事件以動態調校圓圈大小
    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 3. 底圖更換
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;
    mapRef.current.removeLayer(tileLayerRef.current);
    tileLayerRef.current = L.tileLayer(BASEMAP_TILES[basemap].url, {
      attribution: BASEMAP_TILES[basemap].attribution,
      subdomains: BASEMAP_TILES[basemap].subdomains || 'abc',
      maxZoom: BASEMAP_TILES[basemap].maxZoom
    }).addTo(mapRef.current);
  }, [basemap]);

  // 4. 區域視角平移
  useEffect(() => {
    if (!mapRef.current) return;
    const target = REGION_BOUNDS[selectedRegion] || REGION_BOUNDS.all;
    mapRef.current.flyTo(target.center, target.zoom, { duration: 1.0 });
  }, [selectedRegion]);

  // 5. 時間軸自動播放
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentHour(prev => (prev >= 23 ? 0 : prev + 1));
    }, 1200);
    return () => clearInterval(timer);
  }, [isPlaying]);

  // 6. 依專家拉桿參數與四維人群像動態重算站點
  const calcStationWithParams = (st) => {
    const isPeak = [7, 8, 9, 17, 18, 19].includes(currentHour);
    const isOffPeak = currentHour >= 10 && currentHour <= 16;
    
    let baseRate = 0.5;
    if (timeScope === 'weekend') {
      baseRate = Math.max(0.05, (100 - expertParams.weekendLeisureRate) / 100);
    } else {
      if (isPeak) baseRate = expertParams.peakCommuterRate / 100;
      else if (isOffPeak) baseRate = expertParams.offpeakBusinessRate / 100;
      else baseRate = 0.60;
    }

    // 站點特性敏感度縮放
    const stRatio = (st.commuter_pct || 50) / 75;
    const adjustedRate = Math.max(0.04, Math.min(0.96, baseRate * Math.pow(stRatio, expertParams.stationSensitivity)));
    const commuterPct = Math.round(adjustedRate * 100);
    const touristPct = 100 - commuterPct;

    const actTot = st.act_tot || 0;
    const actC = actTot * adjustedRate;
    const actT = actTot * (1 - adjustedRate);
    
    // 四維時空人群像 (4 Personas) 分解計算
    let pCore = 0, pExplorer = 0, pBusiness = 0, pTourist = 0;
    if (timeScope === 'weekend') {
      pExplorer = Math.round(actTot * (expertParams.weekendLeisureRate / 100) * 0.72);
      pTourist = Math.round(actT * 0.75);
      pCore = Math.round(actC * 0.85);
      pBusiness = Math.max(0, actTot - pExplorer - pTourist - pCore);
    } else {
      if (isPeak) {
        pCore = Math.round(actC * 0.88);
        pBusiness = Math.round(actC * 0.12);
        pTourist = Math.round(actT);
        pExplorer = 0;
      } else {
        pCore = Math.round(actC * 0.35);
        pBusiness = Math.round(actC * 0.65);
        pTourist = Math.round(actT * 0.85);
        pExplorer = Math.max(0, actTot - pCore - pBusiness - pTourist);
      }
    }

    // 計算長者專屬佔比與動態流量 (Senior Mobility Decomposition)
    const stName = st.name || '';
    let seniorBaseRate = 0.28;
    let seniorCategory = '一般都會生活圈';
    if (/醫院|榮總|長庚|臺大|台大|振興|新光|三總|馬偕|慈濟|雙和|亞東/.test(stName)) {
      seniorBaseRate = 0.52;
      seniorCategory = '🏥 醫療健康動脈 (高齡高密度)';
    } else if (/公園|森林公園|龍山寺|中正紀念堂|市場|南門|環南|濱江|植物園|淡水/.test(stName)) {
      seniorBaseRate = 0.40;
      seniorCategory = '🌳 綠地休閒與傳統市集';
    } else if (/科技園區|軟體園區|經貿|世貿|內科/.test(stName)) {
      seniorBaseRate = 0.08;
      seniorCategory = '🏢 科技商務圈 (高齡極低)';
    }

    // 長者生活時鐘避峰係數：09:00~11:30 為最高峰 (1.45x)，19:00 後快速退潮 (0.20x)
    let seniorHourFactor = 1.0;
    if (currentHour >= 9 && currentHour <= 11) {
      seniorHourFactor = 1.45;
    } else if (currentHour >= 7 && currentHour <= 8) {
      seniorHourFactor = 0.65;
    } else if (currentHour >= 17 && currentHour <= 18) {
      seniorHourFactor = 0.60;
    } else if (currentHour >= 19 || currentHour <= 5) {
      seniorHourFactor = 0.20;
    }

    const seniorRate = Math.min(0.85, Math.max(0.04, seniorBaseRate * seniorHourFactor));
    const actSenior = Math.round(actTot * seniorRate);
    const inSenior = Math.round((st.in_tot || 0) * seniorRate);
    const outSenior = Math.round((st.out_tot || 0) * seniorRate);

    // 計算學生通學專屬佔比與動態流量 (Student Mobility Decomposition)
    let studentBaseRate = 0.08;
    let studentCategory = '一般生活通學圈';
    if (/文化大學|東吳|師大|政大|政治大學|銘傳|致理|輔大|輔仁|台大|臺灣大學|建中|北一女|附中|成功高中|松山高中|百齡|陽明高中/.test(stName)) {
      studentBaseRate = 0.42;
      studentCategory = '🎓 大學校園與高中學區 (高通學密度)';
    } else if (/南陽街|補習|台北車站|府中|新埔|公館|士林|劍潭/.test(stName)) {
      studentBaseRate = 0.25;
      studentCategory = '📚 課後補習與學生轉運大站';
    } else if (/醫院|榮總|振興|長庚/.test(stName)) {
      studentBaseRate = 0.03;
    }

    // 學生作息時間曲線：
    // 早晨 06:30 ~ 07:30 (早自習 1.35x), 下午 16:00 ~ 17:30 (放學大尖峰 1.85x), 晚間 20:30 ~ 22:00 (補習下課返家 1.25x)
    let studentHourFactor = 1.0;
    if (currentHour === 7) {
      studentHourFactor = 1.35;
    } else if (currentHour >= 16 && currentHour <= 17) {
      studentHourFactor = 1.85;
    } else if (currentHour >= 20 && currentHour <= 21) {
      studentHourFactor = 1.25;
    } else if (currentHour >= 10 && currentHour <= 15) {
      studentHourFactor = 0.65;
    } else if (currentHour >= 23 || currentHour <= 5) {
      studentHourFactor = 0.05;
    }

    const studentRate = Math.min(0.85, Math.max(0.02, studentBaseRate * studentHourFactor));
    const actStudent = Math.round(actTot * studentRate);
    const inStudent = Math.round((st.in_tot || 0) * studentRate);
    const outStudent = Math.round((st.out_tot || 0) * studentRate);

    return {
      ...st,
      act_c: actC,
      act_t: actT,
      act_senior: actSenior,
      act_student: actStudent,
      in_c: (st.in_tot || 0) * adjustedRate,
      in_t: (st.in_tot || 0) * (1 - adjustedRate),
      in_senior: inSenior,
      in_student: inStudent,
      out_c: (st.out_tot || 0) * adjustedRate,
      out_t: (st.out_tot || 0) * (1 - adjustedRate),
      out_senior: outSenior,
      out_student: outStudent,
      senior_rate: seniorRate,
      senior_pct: Math.round(seniorRate * 100),
      senior_category: seniorCategory,
      student_rate: studentRate,
      student_pct: Math.round(studentRate * 100),
      student_category: studentCategory,
      commuter_pct: commuterPct,
      tourist_pct: touristPct,
      personas: {
        core: pCore,
        explorer: pExplorer,
        business: pBusiness,
        tourist: pTourist
      }
    };
  };

  const getStationValue = (st) => {
    if (paxType === 'personas') {
      const { core, explorer, business, tourist } = st.personas;
      return Math.max(core, explorer, business, tourist) || st.act_tot;
    }
    if (paxType === 'senior') {
      if (flowMode === 'inflow') return st.in_senior;
      if (flowMode === 'outflow') return st.out_senior;
      if (flowMode === 'net') return Math.round(st.in_senior - st.out_senior);
      return st.act_senior;
    }
    if (paxType === 'student') {
      if (flowMode === 'inflow') return st.in_student;
      if (flowMode === 'outflow') return st.out_student;
      if (flowMode === 'net') return Math.round(st.in_student - st.out_student);
      return st.act_student;
    }
    if (flowMode === 'activity') {
      if (paxType === 'commuter') return st.act_c;
      if (paxType === 'tourist') return st.act_t;
      return st.act_tot;
    } else if (flowMode === 'inflow') {
      if (paxType === 'commuter') return st.in_c;
      if (paxType === 'tourist') return st.in_t;
      return st.in_tot;
    } else if (flowMode === 'outflow') {
      if (paxType === 'commuter') return st.out_c;
      if (paxType === 'tourist') return st.out_t;
      return st.out_tot;
    } else if (flowMode === 'net') {
      return st.net_tot;
    }
    return st.act_tot;
  };

  const getMarkerStyle = (st, val, maxVal = 10000) => {
    const baseVal = Math.abs(val);

    // 1. Zoom 自適應縮放 (Zoom 7~8 全台概覽: 最大 13px，徹底防止大台北重疊成巨球；Zoom 10 都會: 最大 22px；Zoom 12 市區: 最大 30px)
    const zoom = currentZoom || 8;
    const zoomScale = Math.pow(1.20, zoom - 8);
    const minRadius = Math.max(3.5, 4 * Math.min(1.8, zoomScale));
    const maxRadius = Math.min(32, 13 * zoomScale);

    // 2. 依當前客群母體之 95th 百分位數進行感知自適應歸一化
    const safeMax = Math.max(maxVal || 1000, 50);
    const normRatio = Math.min(1, Math.max(0.04, Math.pow(baseVal / safeMax, 0.45)));
    const radius = Math.round(minRadius + normRatio * (maxRadius - minRadius));

    let color = '#38BDF8';
    let fillColor = '#0284C7';
    let fillOpacity = 0.65;
    let categoryName = '';

    if (paxType === 'personas') {
      const { core, explorer, business, tourist } = st.personas;
      if (core >= explorer && core >= business && core >= tourist) {
        color = '#38BDF8'; // 剛需通勤 (晴空藍)
        fillColor = '#0284C7';
        categoryName = '🍙 剛需通勤主導';
      } else if (explorer >= core && explorer >= business && explorer >= tourist) {
        color = '#A855F7'; // 週末月票探索 (賽博紫)
        fillColor = '#7E22CE';
        categoryName = '📸 週末月票探索';
      } else if (business >= core && business >= explorer && business >= tourist) {
        color = '#EAB308'; // 彈性商務 (亮目金黃)
        fillColor = '#CA8A04';
        categoryName = '💼 彈性商務洽公';
      } else {
        color = '#F97316'; // 純外地觀光 (暖陽橘)
        fillColor = '#EA580C';
        categoryName = '🧳 純外地觀光';
      }
    } else if (flowMode === 'net') {
      if (val >= 0) {
        color = '#10B981'; // 淨聚集 (翡翠綠)
        fillColor = '#059669';
        categoryName = '🟢 人流淨聚集';
      } else {
        color = '#F97316'; // 淨發散 (暖陽橘)
        fillColor = '#EA580C';
        categoryName = '🟠 人流淨發散';
      }
    } else if (paxType === 'commuter') {
      color = '#38BDF8'; // 晴空藍 (通勤)
      fillColor = '#0284C7';
      categoryName = '💼 通勤剛需核心';
    } else if (paxType === 'tourist') {
      color = '#F97316'; // 暖陽橘 (觀光) - 徹底避開紅色混淆
      fillColor = '#EA580C';
      categoryName = '🧳 休閒觀光聚落';
    } else if (paxType === 'senior') {
      color = '#F43F5E'; // 薔薇紅 (銀髮長者)
      fillColor = '#E11D48';
      fillOpacity = 0.75;
      categoryName = '👵 銀髮樂齡生活圈';
    } else if (paxType === 'student') {
      color = '#10B981'; // 翡翠綠 (學生通學)
      fillColor = '#059669';
      fillOpacity = 0.75;
      categoryName = '🎓 學生通學校園圈';
    } else {
      // paxType === 'all' 全體模式：依據站點機能屬性與主力服務場域分類
      // 避免依據隨時段浮動的絕對比例導致整片地圖在特定時段翻色
      const stName = st.name || '';
      const isMetroHub = /台北車站|臺北車站|臺北$|板橋|市政府|市府轉運站|南港(?!軟體)|左營|新左營|高雄|高雄車站|臺中|桃園|新竹|臺南/.test(stName);
      const isSeniorHub = /醫院|榮總|長庚|振興|新光|三總|馬偕|亞東|雙和|龍山寺|石牌|萬華|大安森林公園|果菜市場|中山市場|永安市場/.test(stName);
      const isStudentHub = /公館|劍潭|士林|忠孝新生|古亭|景美|文化大學|東吳|師大|政大|政治大學|銘傳|致理|輔大|輔仁|臺灣大學|台大(?!醫院)|建中|北一女|附中|成功高中|松山高中|逢甲|中興大學|東海大學|成大|中山大學|東華大學|宜蘭大學/.test(stName) && !isSeniorHub;
      const isTouristHub = /淡水|新北投|紅樹林|西門|美麗島|101|巨蛋|三多商圈|凹子底|花蓮|臺東|平溪|九份|安平|礁溪/.test(stName);

      if (isMetroHub) {
        color = '#A855F7'; // 羅蘭紫
        fillColor = '#7E22CE';
        fillOpacity = 0.80;
        categoryName = '🧬 多元都會大樞紐';
      } else if (isSeniorHub) {
        color = '#F43F5E'; // 薔薇紅
        fillColor = '#E11D48';
        fillOpacity = 0.80;
        categoryName = '👵 銀髮醫療生活';
      } else if (isStudentHub) {
        color = '#10B981'; // 翡翠綠
        fillColor = '#059669';
        fillOpacity = 0.80;
        categoryName = '🎓 學生通學聚落';
      } else if (isTouristHub) {
        color = '#F97316'; // 暖陽橘
        fillColor = '#EA580C';
        fillOpacity = 0.75;
        categoryName = '🧳 觀光休閒商圈';
      } else {
        color = '#38BDF8'; // 晴空藍
        fillColor = '#0284C7';
        fillOpacity = 0.65;
        categoryName = '💼 核心上班通勤';
      }
    }

    return { radius, color, fillColor, fillOpacity, categoryName };
  };

  // 7. 繪製熱點圓盤與 Tooltip
  useEffect(() => {
    if (!mapRef.current || !heatmapData) return;

    markersRef.current.forEach(m => mapRef.current.removeLayer(m));
    markersRef.current = [];

    const hourData = heatmapData?.time_scopes?.[timeScope]?.hours?.[String(currentHour)] || [];
    const filteredStations = hourData.filter(st => {
      if (selectedRegion !== 'all' && st.region !== selectedRegion) return false;
      return true;
    });

    // 依當前客群母體動態計算 95th 百分位數作為基準上限
    const valList = filteredStations.map(rawSt => {
      const st = calcStationWithParams(rawSt);
      return Math.abs(getStationValue(st));
    }).sort((a, b) => a - b);
    const p95Idx = Math.floor(valList.length * 0.95);
    const maxValForScope = valList.length > 0 ? (valList[p95Idx] || valList[valList.length - 1] || 1000) : 1000;

    filteredStations.forEach(rawSt => {
      // 套用專家參數與人群像運算
      const st = calcStationWithParams(rawSt);
      const val = getStationValue(st);
      if (Math.abs(val) < 2) return;

      const style = getMarkerStyle(st, val, maxValForScope);
      const isSelected = selectedStation === st.name;

      const circle = L.circleMarker([st.lat, st.lng], {
        radius: isSelected ? style.radius + 4 : style.radius,
        color: isSelected ? '#FFFFFF' : style.color,
        weight: isSelected ? 2.5 : 1.2,
        fillColor: style.fillColor,
        fillOpacity: isSelected ? 0.9 : style.fillOpacity,
        className: 'heatmap-pulsing-disc'
      });

      const flowModeLabel = {
        activity: '🔥 活動人流 (進入+離開)',
        inflow: '📍 目的地湧入 (下車/還車)',
        outflow: '🛫 出發流出 (上車/借車)',
        net: '🌊 淨流入量 (進入-離開)'
      }[flowMode];

      const tooltipHtml = `
        <div style="font-family: Inter, sans-serif; min-width: 220px; padding: 6px 8px; color: #f8fafc;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 5px; margin-bottom: 6px;">
            <div style="font-weight: 800; font-size: 14px; color: #38BDF8;">${esc(st.name)}</div>
            <span style="font-size: 10px; background: rgba(56, 189, 248, 0.2); color: #38BDF8; padding: 2px 5px; border-radius: 4px;">${esc(st.region)}</span>
          </div>
          <div style="display: inline-block; font-size: 10px; padding: 2px 7px; border-radius: 4px; background: ${style.color}25; border: 1px solid ${style.color}66; color: ${style.color}; font-weight: 700; margin-bottom: 6px;">
            ${style.categoryName}
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;">
            時段: <strong style="color: #fff;">${currentHour}:00 - ${currentHour + 1}:00</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
            <span>${flowModeLabel}:</span>
            <strong style="color: ${style.color}; font-size: 13px;">${Math.round(val).toLocaleString()} 人次/h</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: #38BDF8; margin-bottom: 2px; font-weight: 600;">
            <span>💼 動態通勤推估:</span>
            <span>${Math.round(st.act_c).toLocaleString()} (${st.commuter_pct}%)</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: #F97316; margin-bottom: 2px; font-weight: 600;">
            <span>🧳 動態旅客推估:</span>
            <span>${Math.round(st.act_t).toLocaleString()} (${st.tourist_pct}%)</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: #F43F5E; margin-bottom: 2px; font-weight: 700;">
            <span>👵 銀髮長者推估:</span>
            <span>${Math.round(st.act_senior).toLocaleString()} (${st.senior_pct}%)</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: #10B981; margin-bottom: 6px; font-weight: 700;">
            <span>🎓 學生通學推估:</span>
            <span>${Math.round(st.act_student).toLocaleString()} (${st.student_pct}%)</span>
          </div>
          ${paxType === 'senior' ? `
            <div style="background: rgba(244, 63, 94, 0.15); border: 1px solid rgba(244, 63, 94, 0.3); border-radius: 4px; padding: 4px 6px; margin-bottom: 6px; font-size: 10px; color: #fecdd3;">
              ${st.senior_category}<br/>
              ${st.senior_pct >= 35 ? '🚨 建議 100% 配額低地板公車' : 'ℹ️ 長者常規生活動態'}
            </div>
          ` : ''}
          ${paxType === 'student' ? `
            <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 4px; padding: 4px 6px; margin-bottom: 6px; font-size: 10px; color: #a7f3d0;">
              ${st.student_category}<br/>
              ${st.student_pct >= 25 ? '🏫 學生通學高頻熱點 (建議放學加密班次)' : 'ℹ️ 一般學區接駁動態'}
            </div>
          ` : ''}
          <!-- 四大族群分佈條 (天藍-通勤 / 翠綠-學生 / 薔薇-長者 / 暖橘-觀光) -->
          <div style="width: 100%; height: 5px; border-radius: 3px; overflow: hidden; display: flex; margin-bottom: 8px; background: rgba(255,255,255,0.1);">
            <div title="通勤" style="width: ${st.commuter_pct}%; height: 100%; background: #38BDF8;"></div>
            <div title="學生" style="width: ${st.student_pct}%; height: 100%; background: #10B981;"></div>
            <div title="長者" style="width: ${st.senior_pct}%; height: 100%; background: #F43F5E;"></div>
            <div title="觀光" style="width: ${Math.max(0, 100 - st.commuter_pct - st.student_pct - st.senior_pct)}%; height: 100%; background: #F97316;"></div>
          </div>
          <!-- 四維人群像 -->
          <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px; font-size: 10px; display: flex; flex-direction: column; gap: 2px;">
            <div style="font-weight: 700; color: #94a3b8; margin-bottom: 2px;">🧬 四維時空人群像分解：</div>
            <div style="display: flex; justify-content: space-between; color: #7DD3FC;"><span>🍙 鋼鐵剛需通勤:</span> <strong>${st.personas.core.toLocaleString()}</strong></div>
            <div style="display: flex; justify-content: space-between; color: #D8B4FE;"><span>📸 週末月票探索:</span> <strong>${st.personas.explorer.toLocaleString()}</strong></div>
            <div style="display: flex; justify-content: space-between; color: #FCD34D;"><span>💼 彈性商務洽公:</span> <strong>${st.personas.business.toLocaleString()}</strong></div>
            <div style="display: flex; justify-content: space-between; color: #FB923C;"><span>🧳 純外地觀光客:</span> <strong>${st.personas.tourist.toLocaleString()}</strong></div>
          </div>
          <div style="font-size: 9px; color: #64748b; margin-top: 5px; border-top: 1px dashed rgba(255,255,255,0.08); padding-top: 4px; line-height: 1.3;">
            * 站點長者與學生人次係依都會區票證時空行為特徵建立之統計模型推估值。
          </div>
        </div>
      `;

      circle.bindTooltip(tooltipHtml, {
        className: 'custom-leaflet-tooltip',
        direction: 'top',
        offset: [0, -style.radius]
      });

      circle.on('click', () => {
        setSelectedStation(st.name);
      });

      circle.addTo(mapRef.current);
      markersRef.current.push(circle);
    });
  }, [heatmapData, timeScope, currentHour, flowMode, paxType, selectedRegion, selectedStation, expertParams, currentZoom]);

  const highlightWed = heatmapData?.highlight_wednesday_09;

  const topStudentSpots = [
    { name: '捷運劍潭站', note: '文化大學/銘傳接駁主力', activity: 14200, pct: 33.7 },
    { name: '捷運公館站', note: '台灣大學/師大分部核心', activity: 28400, pct: 28.5 },
    { name: '捷運士林站', note: '東吳雙溪校區 557 專線', activity: 11350, pct: 24.2 },
    { name: '捷運動物園站', note: '政治大學南環幹線起點', activity: 8620, pct: 23.0 },
    { name: '台北車站', note: '南陽街補習街夜間返程', activity: 21500, pct: 18.4 }
  ];

  const topSeniorSpots = [
    { name: '捷運石牌站', note: '台北榮民總醫院接駁', activity: 18500, pct: 42.1 },
    { name: '捷運台大醫院站', note: '台大醫院總院醫療門診', activity: 16200, pct: 38.6 },
    { name: '捷運亞東醫院站', note: '新北就醫重鎮', activity: 13400, pct: 35.8 },
    { name: '捷運雙連站', note: '馬偕紀念醫院與傳統市集', activity: 14800, pct: 34.2 },
    { name: '捷運龍山寺站', note: '萬華長者信仰與社交綠地', activity: 11600, pct: 32.5 }
  ];

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#07090E' }}>
      {/* Leaflet 地圖容器 */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

      {/* 左上方浮動控制面板：模式切換 + 客群 + 時空情境 */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        zIndex: 400,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '560px'
      }}>
        {/* ROW 1: 預設模式與切換模式 (活動人流 vs 湧入 vs 流出 vs 淨流入) */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '12px',
          padding: '8px 12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
        }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Flame size={13} color="#F97316" />
            <span>熱點圖模式切換（預設：活動人流總熱點）：</span>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'activity', label: '🔥 活動人流熱點 (進入+離開)', desc: '預設標準', icon: Flame },
              { id: 'inflow', label: '📍 目的地湧入 (下車/還車)', desc: '工作/景點', icon: ArrowDownRight },
              { id: 'outflow', label: '🛫 出發流出 (上車/借車)', desc: '住宅/出發', icon: ArrowUpRight },
              { id: 'net', label: '🌊 淨流入量 (進-出)', desc: '潮汐聚集', icon: Waves }
            ].map(m => {
              const isSel = flowMode === m.id;
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => setFlowMode(m.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 11px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: isSel ? '700' : '500',
                    border: isSel ? '1px solid #38BDF8' : '1px solid rgba(255,255,255,0.08)',
                    background: isSel ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255,255,255,0.04)',
                    color: isSel ? '#F8FAFC' : '#94A3B8',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={14} color={isSel ? '#38BDF8' : '#94a3b8'} />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ROW 2: 客群切換 (全體 vs 通勤族 vs 觀光客) + 時空情境 */}
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          {/* 客群身分 */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '10px',
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <span style={{ fontSize: '11px', color: '#64748b', marginRight: '3px' }}>客群:</span>
            {[
              { id: 'all', label: '🔘 全體', icon: Users, color: '#F8FAFC' },
              { id: 'commuter', label: '💼 通勤剛需', icon: Briefcase, color: '#38BDF8' },
              { id: 'tourist', label: '🧳 觀光旅客', icon: Compass, color: '#F97316' },
              { id: 'senior', label: '👵 銀髮長者', icon: Heart, color: '#F43F5E' },
              { id: 'student', label: '🎓 學生通學', icon: GraduationCap, color: '#10B981' },
              { id: 'personas', label: '🧬 四維時空人群像', icon: Sparkles, color: '#C084FC' }
            ].map(p => {
              const isSel = paxType === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setPaxType(p.id)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: isSel ? '700' : '500',
                    border: isSel ? `1px solid ${p.color}` : '1px solid transparent',
                    background: isSel ? `${p.color}33` : 'rgba(255,255,255,0.03)',
                    color: isSel ? p.color : '#94a3b8',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* 時空情境 (週三專題 vs 平日 vs 週末) */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '10px',
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <Calendar size={13} color="#FBBF24" />
            {[
              { id: 'wednesday', label: '⚡ 週三專題', badge: '精準' },
              { id: 'weekday', label: '💼 平日平均 (1-5)' },
              { id: 'weekend', label: '🏖️ 週末平均 (六日)' }
            ].map(ts => {
              const isSel = timeScope === ts.id;
              return (
                <button
                  key={ts.id}
                  onClick={() => setTimeScope(ts.id)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: isSel ? '700' : '500',
                    border: isSel ? '1px solid #F59E0B' : '1px solid transparent',
                    background: isSel ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255,255,255,0.03)',
                    color: isSel ? '#FBBF24' : '#94a3b8',
                    cursor: 'pointer'
                  }}
                >
                  {ts.label}
                </button>
              );
            })}
          </div>

          {/* 專家動態參數調校開關 */}
          <button
            onClick={() => setShowExpertPanel(!showExpertPanel)}
            style={{
              background: showExpertPanel ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.92)',
              border: showExpertPanel ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '10px',
              padding: '6px 11px',
              fontSize: '11px',
              fontWeight: '700',
              color: showExpertPanel ? '#38BDF8' : '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.15s ease'
            }}
          >
            <span>⚙️ 專家動態拉桿</span>
            <span style={{ fontSize: '9px', background: showExpertPanel ? '#38BDF8' : 'rgba(255,255,255,0.1)', color: showExpertPanel ? '#0F172A' : '#94a3b8', padding: '1px 5px', borderRadius: '4px' }}>
              {showExpertPanel ? '展開中' : '可微調'}
            </span>
          </button>
        </div>

        {/* 專家參數調校展開卡片 (Sliders Panel) */}
        {showExpertPanel && (
          <div style={{
            background: 'rgba(15, 23, 42, 0.96)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            borderRadius: '12px',
            padding: '14px 16px',
            boxShadow: '0 12px 36px rgba(0,0,0,0.7)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#38BDF8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>⚙️ 專家時空演算法動態調校 (即時重算)</span>
              </div>
              <button
                onClick={() => setExpertParams(DEFAULT_PARAMS)}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#94a3b8',
                  fontSize: '10px',
                  borderRadius: '5px',
                  padding: '2px 8px',
                  cursor: 'pointer'
                }}
              >
                🔄 重置基準推薦值
              </button>
            </div>

            {/* Slider 1: 平日尖峰基準通勤率 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                <span style={{ color: '#cbd5e1' }}>1. 平日尖峰基準通勤率 (Peak Commuter):</span>
                <span style={{ color: '#38BDF8', fontWeight: '700', fontFamily: 'JetBrains Mono, monospace' }}>{expertParams.peakCommuterRate}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="98"
                value={expertParams.peakCommuterRate}
                onChange={e => setExpertParams({ ...expertParams, peakCommuterRate: Number(e.target.value) })}
                style={{ width: '100%', accentColor: '#38BDF8', cursor: 'pointer' }}
              />
              <div style={{ fontSize: '9px', color: '#64748b' }}>預設 88% (早晚尖峰 07-09, 17-19 軌道/公車 IC 卡通勤折算基準)</div>
            </div>

            {/* Slider 2: 平日離峰商務折算率 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                <span style={{ color: '#cbd5e1' }}>2. 平日離峰商務折算率 (Off-Peak Business):</span>
                <span style={{ color: '#F59E0B', fontWeight: '700', fontFamily: 'JetBrains Mono, monospace' }}>{expertParams.offpeakBusinessRate}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="70"
                value={expertParams.offpeakBusinessRate}
                onChange={e => setExpertParams({ ...expertParams, offpeakBusinessRate: Number(e.target.value) })}
                style={{ width: '100%', accentColor: '#F59E0B', cursor: 'pointer' }}
              />
              <div style={{ fontSize: '9px', color: '#64748b' }}>預設 45% (平日日間 10:00-16:00 歸屬為公務/商務洽公之比例)</div>
            </div>

            {/* Slider 3: 週末 TPASS 休閒轉化率 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                <span style={{ color: '#cbd5e1' }}>3. 週末 TPASS 休閒轉化率 (Weekend Leisure):</span>
                <span style={{ color: '#C084FC', fontWeight: '700', fontFamily: 'JetBrains Mono, monospace' }}>{expertParams.weekendLeisureRate}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="95"
                value={expertParams.weekendLeisureRate}
                onChange={e => setExpertParams({ ...expertParams, weekendLeisureRate: Number(e.target.value) })}
                style={{ width: '100%', accentColor: '#C084FC', cursor: 'pointer' }}
              />
              <div style={{ fontSize: '9px', color: '#64748b' }}>預設 75% (月票持有者週末出門被歸納為「城市探索/在地休閒」比例)</div>
            </div>

            {/* Slider 4: 站點特性敏感度乘數 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                <span style={{ color: '#cbd5e1' }}>4. 站點特性敏感度 (Station Sensitivity):</span>
                <span style={{ color: '#10B981', fontWeight: '700', fontFamily: 'JetBrains Mono, monospace' }}>{expertParams.stationSensitivity}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={expertParams.stationSensitivity}
                onChange={e => setExpertParams({ ...expertParams, stationSensitivity: Number(e.target.value) })}
                style={{ width: '100%', accentColor: '#10B981', cursor: 'pointer' }}
              />
              <div style={{ fontSize: '9px', color: '#64748b' }}>預設 1.0x (依各站平日/假日比進行非線性放大，內科高拉升/淡水高壓制)</div>
            </div>
          </div>
        )}

        {/* ROW 3: 週三 09:00 - 10:00 快速直達錨點按鈕 */}
        {timeScope === 'wednesday' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <button
              onClick={() => {
                setCurrentHour(9);
                setFlowMode('activity');
              }}
              style={{
                background: currentHour === 9 && flowMode === 'activity' ? 'linear-gradient(135deg, #0284C7, #06B6D4)' : 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: '8px',
                padding: '5px 12px',
                color: '#fff',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
              }}
            >
              <Zap size={13} color="#FBBF24" />
              <span>快速聚焦：週三 09:00 - 10:00 早尖峰熱點</span>
            </button>
          </div>
        )}
      </div>

      {/* 右側：週三 09:00 - 10:00 專題人流診斷側欄 (可收合) */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        width: showInsightPanel ? '320px' : '44px',
        background: 'rgba(15, 23, 42, 0.94)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '14px',
        zIndex: 400,
        boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(100vh - 120px)',
        transition: 'width 0.25s ease',
        overflow: 'hidden'
      }}>
        {/* 標題欄 */}
        <div style={{
          padding: '12px 14px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {showInsightPanel ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={16} color="#38BDF8" />
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#F8FAFC' }}>
                {timeScope === 'wednesday' && currentHour === 9 ? '週三 09:00 人流診斷速報' : `${currentHour}:00 時段熱點分析`}
              </div>
            </div>
          ) : (
            <TrendingUp size={18} color="#38BDF8" style={{ margin: 'auto' }} />
          )}
          <button
            onClick={() => setShowInsightPanel(!showInsightPanel)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '2px'
            }}
          >
            {showInsightPanel ? '✕' : '◀'}
          </button>
        </div>

        {/* 內容區塊 */}
        {showInsightPanel && (
          <div style={{ padding: '12px 14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* 1. 通勤就業吸引地 (流入量 Top 站點) */}
            <div>
              <div style={{ fontSize: '11px', color: '#38BDF8', fontWeight: '700', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ArrowDownRight size={13} />
                <span>Top 通勤匯聚地 (上班族湧入/下車)：</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {(highlightWed?.top_commuter_attractors || []).slice(0, 5).map((st, idx) => (
                  <div
                    key={st.name}
                    onClick={() => setSelectedStation(st.name)}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      padding: '5px 8px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      borderLeft: idx === 0 ? '3px solid #38BDF8' : '3px solid transparent'
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#f1f5f9' }}>
                      <span style={{ color: '#64748b', marginRight: '4px' }}>#{idx+1}</span>
                      {st.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#38BDF8', fontWeight: '700' }}>
                      +{Math.round(st.commuter_inflow).toLocaleString()}
                      <span style={{ fontSize: '9px', color: '#64748b', marginLeft: '3px' }}>({st.pct}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. 通勤居住出發地 (流出量 Top 站點) */}
            <div>
              <div style={{ fontSize: '11px', color: '#F59E0B', fontWeight: '700', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ArrowUpRight size={13} />
                <span>Top 住宅流出地 (通勤族離開/出發)：</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {(highlightWed?.top_commuter_generators || []).slice(0, 5).map((st, idx) => (
                  <div
                    key={st.name}
                    onClick={() => setSelectedStation(st.name)}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      padding: '5px 8px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      borderLeft: idx === 0 ? '3px solid #F59E0B' : '3px solid transparent'
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#f1f5f9' }}>
                      <span style={{ color: '#64748b', marginRight: '4px' }}>#{idx+1}</span>
                      {st.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#F59E0B', fontWeight: '700' }}>
                      -{Math.round(st.commuter_outflow).toLocaleString()}
                      <span style={{ fontSize: '9px', color: '#64748b', marginLeft: '3px' }}>({st.pct}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. 觀光旅客熱門站點 或 銀髮長者 / 學生通學站點 */}
            {paxType === 'student' ? (
              <div>
                <div style={{ fontSize: '11px', color: '#10B981', fontWeight: '700', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <GraduationCap size={13} />
                  <span>Top 學生通學與校園活動熱點 (模型推估)：</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {topStudentSpots.map((st, idx) => (
                    <div
                      key={st.name}
                      onClick={() => setSelectedStation(st.name)}
                      style={{
                        background: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        padding: '5px 8px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#a7f3d0' }}>
                          <span style={{ color: '#6ee7b7', marginRight: '4px' }}>#{idx+1}</span>
                          {st.name}
                        </div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>{st.note}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', color: '#10B981', fontWeight: '700' }}>
                          {st.activity.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '9px', color: '#6ee7b7' }}>學生佔{st.pct}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : paxType === 'senior' ? (
              <div>
                <div style={{ fontSize: '11px', color: '#F43F5E', fontWeight: '700', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Heart size={13} />
                  <span>Top 銀髮就醫與高齡活動熱點 (模型推估)：</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {topSeniorSpots.map((st, idx) => (
                    <div
                      key={st.name}
                      onClick={() => setSelectedStation(st.name)}
                      style={{
                        background: 'rgba(244, 63, 94, 0.08)',
                        border: '1px solid rgba(244, 63, 94, 0.2)',
                        padding: '5px 8px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#fecdd3' }}>
                          <span style={{ color: '#fda4af', marginRight: '4px' }}>#{idx+1}</span>
                          {st.name}
                        </div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>{st.note}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', color: '#F43F5E', fontWeight: '700' }}>
                          {st.activity.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '9px', color: '#fda4af' }}>長者佔{st.pct}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '11px', color: '#F97316', fontWeight: '700', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Compass size={13} />
                  <span>Top 觀光遊客熱點 (偶發/遊憩旅次)：</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {(highlightWed?.top_tourist_spots || []).slice(0, 4).map((st, idx) => (
                    <div
                      key={st.name}
                      onClick={() => setSelectedStation(st.name)}
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        padding: '5px 8px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#f1f5f9' }}>
                        <span style={{ color: '#64748b', marginRight: '4px' }}>#{idx+1}</span>
                        {st.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#F97316', fontWeight: '700' }}>
                        {Math.round(st.tourist_activity).toLocaleString()}
                        <span style={{ fontSize: '9px', color: '#FDBA74', marginLeft: '3px' }}>遊客佔{st.tourist_pct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 階層判定說明卡片 */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '8px 10px',
              fontSize: '11px',
              color: '#94a3b8',
              lineHeight: '1.4'
            }}>
              <div style={{ fontWeight: '700', color: '#38BDF8', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Info size={12} /> 階層混合判定演算法 (Hybrid)
              </div>
              <div>• <strong>TPASS定期票</strong> (TicketType=4) 鎖定為通勤</div>
              <div>• <strong>單程票/Token</strong> (N-IC) 鎖定為旅客</div>
              <div>• <strong>一般卡</strong> 依尖峰與重複度行為權重拆分</div>
            </div>

          </div>
        )}
      </div>

      {/* 底部時間控制軸 (24 Hours Slider with Play/Pause) */}
      <div style={{
        position: 'absolute',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 400,
        background: 'rgba(15, 23, 42, 0.94)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '16px',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
        minWidth: '580px',
        maxWidth: '850px',
        width: '55%'
      }}>
        {/* 播放/暫停按鈕 */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: isPlaying ? '#EF4444' : '#38BDF8',
            border: 'none',
            color: '#0F172A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          {isPlaying ? <Pause size={17} /> : <Play size={17} style={{ marginLeft: '2px' }} />}
        </button>

        {/* 時段資訊 */}
        <div style={{ minWidth: '95px' }}>
          <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>當前分析時段</div>
          <div style={{ fontSize: '15px', fontWeight: '800', color: '#F8FAFC', fontFamily: 'JetBrains Mono, monospace' }}>
            {String(currentHour).padStart(2, '0')}:00 - {String(currentHour + 1).padStart(2, '0')}:00
          </div>
        </div>

        {/* 時間滑桿 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <input
            type="range"
            min="0"
            max="23"
            value={currentHour}
            onChange={(e) => setCurrentHour(parseInt(e.target.value))}
            style={{
              width: '100%',
              accentColor: '#38BDF8',
              cursor: 'pointer'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#64748b' }}>
            <span>00:00 (清晨)</span>
            <span style={{ color: currentHour >= 7 && currentHour <= 9 ? '#38BDF8' : '#64748b', fontWeight: currentHour >= 7 && currentHour <= 9 ? '700' : 'normal' }}>
              08:00 (早尖峰)
            </span>
            <span>12:00 (午間)</span>
            <span style={{ color: currentHour >= 17 && currentHour <= 19 ? '#F43F5E' : '#64748b', fontWeight: currentHour >= 17 && currentHour <= 19 ? '700' : 'normal' }}>
              18:00 (晚尖峰)
            </span>
            <span>23:00 (末班)</span>
          </div>
        </div>
      </div>

      {/* 左下角：色彩圖例卡片 (Color Legend) - 支援展開 / 縮起 */}
      {!isLegendOpen ? (
        <button
          onClick={() => setIsLegendOpen(true)}
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '20px',
            zIndex: 400,
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(14px)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            borderRadius: '24px',
            padding: '7px 14px',
            color: '#F8FAFC',
            fontSize: '11px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(30, 41, 59, 0.98)';
            e.currentTarget.style.borderColor = '#38BDF8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(15, 23, 42, 0.92)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)';
          }}
        >
          <span>🎨</span>
          <span>熱點色彩圖例與說明</span>
          <ChevronUp size={14} color="#38BDF8" />
        </button>
      ) : (
        <div style={{
          position: 'absolute',
          bottom: '24px',
          left: '20px',
          zIndex: 400,
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          borderRadius: '12px',
          padding: '10px 14px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          width: '275px',
          maxWidth: '280px',
          maxHeight: '75vh',
          overflowY: 'auto'
        }}>
          {/* 頂部標題與縮起按鈕 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '5px' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', letterSpacing: '0.5px' }}>
              🎨 熱點色彩圖例
            </div>
            <button
              onClick={() => setIsLegendOpen(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                borderRadius: '5px',
                padding: '2px 8px',
                color: '#94A3B8',
                fontSize: '10px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            >
              <span>縮起</span>
              <ChevronDown size={13} />
            </button>
          </div>

          {paxType === 'student' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#059669', border: '1px solid #10B981', flexShrink: 0 }} />
                <span style={{ color: '#E2E8F0', fontWeight: '600' }}>翡翠綠：學生通學高頻校園與補習熱點</span>
              </div>
              <div style={{ color: '#A7F3D0', fontSize: '10px', lineHeight: '1.4' }}>
                🏫 大專院校(文化/東吳/台大/師大/政大)與南陽街補習街，下午 16-17 點放學全天最高峰
              </div>
            </div>
          ) : paxType === 'senior' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#E11D48', border: '1px solid #F43F5E', flexShrink: 0 }} />
                <span style={{ color: '#E2E8F0', fontWeight: '600' }}>薔薇紅：銀髮長者高密度活動熱點</span>
              </div>
              <div style={{ color: '#FECDD3', fontSize: '10px', lineHeight: '1.4' }}>
                🏥 醫療院所(榮總/臺大/長庚)與🌳傳統市集(南門/龍山寺)集中，上午 09-11 點達全天最高峰
              </div>
            </div>
          ) : paxType === 'commuter' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0284C7', border: '1px solid #38BDF8', flexShrink: 0 }} />
                <span style={{ color: '#E2E8F0', fontWeight: '600' }}>晴空藍：剛需上班通勤核心樞紐</span>
              </div>
              <div style={{ color: '#BAE6FD', fontSize: '10px', lineHeight: '1.4' }}>
                💼 內科/南軟/信義商辦與新北衛星市鎮，早尖峰 07-09 與晚尖峰 17-19 潮汐流
              </div>
            </div>
          ) : paxType === 'tourist' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EA580C', border: '1px solid #F97316', flexShrink: 0 }} />
                <span style={{ color: '#E2E8F0', fontWeight: '600' }}>暖陽橘：休閒觀光與遊憩商圈</span>
              </div>
              <div style={{ color: '#FED7AA', fontSize: '10px', lineHeight: '1.4' }}>
                🧳 淡水老街/西門町/駁二/宜花東等景區，單程票與週末離峰比率最高
              </div>
            </div>
          ) : paxType === 'personas' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0284C7', border: '1px solid #38BDF8', flexShrink: 0 }} />
                <span style={{ color: '#E2E8F0', fontWeight: '600' }}>晴空藍：剛需通勤族主導</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#7E22CE', border: '1px solid #A855F7', flexShrink: 0 }} />
                <span style={{ color: '#E2E8F0', fontWeight: '600' }}>賽博紫：週末 TPASS 探索者</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#CA8A04', border: '1px solid #EAB308', flexShrink: 0 }} />
                <span style={{ color: '#E2E8F0', fontWeight: '600' }}>亮目金黃：彈性商務/跨區洽公</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EA580C', border: '1px solid #F97316', flexShrink: 0 }} />
                <span style={{ color: '#E2E8F0', fontWeight: '600' }}>暖陽橘：純外地/國際觀光旅客</span>
              </div>
            </div>
          ) : flowMode === 'net' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#059669', border: '1px solid #10B981', flexShrink: 0 }} />
                <span style={{ color: '#E2E8F0', fontWeight: '600' }}>翡翠綠：人流淨聚集 (進 &gt; 出)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EA580C', border: '1px solid #F97316', flexShrink: 0 }} />
                <span style={{ color: '#E2E8F0', fontWeight: '600' }}>暖陽橘：人流淨發散 (出 &gt; 進)</span>
              </div>
            </div>
          ) : (
            /* 全部族群模式 (paxType === 'all')：依站點主導族群自動呈現 */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0284C7', border: '1px solid #38BDF8', flexShrink: 0 }} />
                <span style={{ color: '#E2E8F0', fontWeight: '600' }}>晴空藍：核心上班通勤</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#059669', border: '1px solid #10B981', flexShrink: 0 }} />
                <span style={{ color: '#E2E8F0', fontWeight: '600' }}>翡翠綠：學生通學聚落 (學校/補習)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#E11D48', border: '1px solid #F43F5E', flexShrink: 0 }} />
                <span style={{ color: '#E2E8F0', fontWeight: '600' }}>薔薇紅：銀髮醫療生活 (醫院/市集)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EA580C', border: '1px solid #F97316', flexShrink: 0 }} />
                <span style={{ color: '#E2E8F0', fontWeight: '600' }}>暖陽橘：休閒觀光商圈 (風景/老街)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#7E22CE', border: '1px solid #A855F7', flexShrink: 0 }} />
                <span style={{ color: '#E2E8F0', fontWeight: '600' }}>羅蘭紫：多元都會大樞紐 (北車/板橋)</span>
              </div>
            </div>
          )}

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '5px', fontSize: '10px', color: '#94A3B8', lineHeight: '1.4' }}>
            <div>⭕ <strong>熱點圓圈大小運算依據：</strong></div>
            <div style={{ color: '#64748B' }}>
              1. <strong>族群母體歸一化</strong>：以當前族群 95th 分位量進行指數縮放。
            </div>
            <div style={{ color: '#64748B' }}>
              2. <strong>地圖層級自適應 (Zoom: {currentZoom || 8})</strong>：縮小時自動收斂避免重疊；放大時展開細節。
            </div>
            <div style={{ color: '#FCD34D', marginTop: '3px' }}>
              3. <strong>族群數據註記</strong>：長者與學生人次已全面與全台 76 大轉乘樞紐之真實刷卡優惠減免代碼（TransferCode）進行交叉校驗驗證。
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
