import React, { useState, useEffect, Suspense, lazy, useMemo } from 'react';
import FlowMap from './components/FlowMap';
import ErrorBoundary from './components/ErrorBoundary';
import { 
  FREIGHT_AND_TOURISM_CORRIDORS, 
  FREIGHT_AND_TOURISM_STATIONS, 
  FREIGHT_AND_TOURISM_MODES_META 
} from './data/freightAndTourismCorridors';

const ComparisonDashboard = lazy(() => import('./components/ComparisonDashboard'));
const HeatmapView = lazy(() => import('./components/HeatmapView'));
const TransferMapView = lazy(() => import('./components/TransferMapView'));
const TPASSDashboard = lazy(() => import('./components/TPASSDashboard'));
const ODStationView = lazy(() => import('./components/ODStationView'));
const TelecomComparisonView = lazy(() => import('./components/TelecomComparisonView'));
const PersonaAnalyticsView = lazy(() => import('./components/PersonaAnalyticsView'));
const UnsupervisedRailLab = lazy(() => import('./components/UnsupervisedRailLab'));
const UrbanAmenityAccessibilityLab = lazy(() => import('./components/UrbanAmenityAccessibilityLab'));
const CommercialPulseLab = lazy(() => import('./components/CommercialPulseLab'));
const ClimatePulseLab = lazy(() => import('./components/ClimatePulseLab'));
const TourismMobilityLab = lazy(() => import('./components/TourismMobilityLab'));
import { 
  Play, Pause, RotateCcw, Layers, Compass, 
  Activity, Train, Clock, MapPin, Award, 
  ArrowRight, ShieldCheck, ChevronRight, ChevronLeft, Eye,
  BarChart3, FlaskConical, Zap, LayoutDashboard, Navigation, CreditCard,
  Globe, Sun, Moon, Map as MapIcon, Sparkles, Users, Briefcase, Calendar, Flame, Radio, Shuffle, Store, Building2,
  Cloud, CloudRain, CloudLightning, ChevronDown, ChevronUp, Truck, Camera,
  BookOpen, Download, FileText, ExternalLink, X
} from 'lucide-react';

const WEATHER_STAGES = [
  { id: 'sunny', label: '☀️ 晴朗天', shortLabel: '晴天', icon: Sun, color: '#F59E0B', desc: '時雨量 0mm · 日照充足 · YouBike 高峰' },
  { id: 'cloudy', label: '☁️ 陰天', shortLabel: '陰天', icon: Cloud, color: '#94A3B8', desc: '時雨量 0mm · 體感涼爽 · 移動平穩舒適' },
  { id: 'rainy', label: '🌧️ 常規雨', shortLabel: '常規雨', icon: CloudRain, color: '#38BDF8', desc: '0.1~10mm · YouBike 斷鏈 · 轉乘公車捷運' },
  { id: 'heavy_rain', label: '⛈️ 豪大雨', shortLabel: '豪大雨', icon: CloudLightning, color: '#F43F5E', desc: '≥10mm · 自駕塞車 · 捷運避雨湧浪大聚集' }
];

const DAY_TYPES = [
  { id: 'workday', label: '💼 上班日 (工作日)', desc: '🚛 產業物流全線巔峰 (145%) · 💼 都會通勤早晚雙尖峰 · 🧳 跨城觀光低溫休止' },
  { id: 'holiday', label: '🏖️ 放假日 (週末)', desc: '🧳 觀光旅遊大爆發 (320% 狂飆) · 國五/國六景點高度飽和 · 🚛 產業物流休眠' }
];

const BASEMAP_OPTIONS = [
  { id: 'emap', label: '臺灣繁中', icon: MapIcon, desc: '國土測繪 臺灣通用電子地圖 (100% 繁中)' },
  { id: 'dark', label: '賽博深色', icon: Moon, desc: 'Dark Matter (賽博風格)' },
  { id: 'satellite', label: '高解析衛星', icon: Globe, desc: 'ESRI Satellite' },
  { id: 'osm', label: '開放街圖', icon: Globe, desc: 'OpenStreetMap (Voyager)' },
  { id: 'light', label: '極簡淺色', icon: Sun, desc: 'Positron' }
];

const REGION_OPTIONS = [
  { id: 'all', label: '全台全域', icon: '🇹🇼' },
  { id: 'North', label: '北部走廊', icon: '🏙️' },
  { id: 'Central', label: '中部台中', icon: '🌾' },
  { id: 'South', label: '南部高南', icon: '🌴' },
  { id: 'East', label: '東部宜花', icon: '🌊' }
];

const PAX_OPTIONS = [
  { id: 'all', label: '全體流向', icon: '🔘' },
  { id: 'commuter', label: '💼 都會通勤', icon: '💼' },
  { id: 'tourist', label: '🧳 觀光旅遊', icon: '🧳' },
  { id: 'freight', label: '🚛 產業物流', icon: '🚛' },
  { id: 'senior', label: '👵 銀髮長者', icon: '👵' },
  { id: 'student', label: '🎓 學生通學', icon: '🎓' }
];

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  // 整併後的 5 大頂級導航模組
  const [activeTab, setActiveTab] = useState('gis_map'); // 'gis_map', 'ai_lab', 'personas', 'analytics', 'telecom', 'tpass'
  const [mapViewType, setMapViewType] = useState('flows'); // 'flows' (動態走廊流向), 'heatmap' (時空熱點圖)
  const [analyticsSubView, setAnalyticsSubView] = useState('comparison'); // 'comparison', 'od'
  const [personaSubTab, setPersonaSubTab] = useState('weather'); // 'transfer', 'commuter', 'senior', 'student', or 'weather'

  // Map Controls State
  const [currentHour, setCurrentHour] = useState(8);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1);
  const [selectedMode, setSelectedMode] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedPaxType, setSelectedPaxType] = useState('all');
  const [dayType, setDayType] = useState('workday'); // 'workday' or 'holiday'
  const [weatherStage, setWeatherStage] = useState('sunny'); // 'sunny', 'cloudy', 'rainy', 'heavy_rain'
  const [isWeatherDropdownOpen, setIsWeatherDropdownOpen] = useState(false);
  const selectedDayType = `${dayType}_${weatherStage}`;
  const [basemap, setBasemap] = useState('emap');
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedCorridor, setSelectedCorridor] = useState(null);
  const [isGuidebookModalOpen, setIsGuidebookModalOpen] = useState(false);
  const [isTopHeaderCollapsed, setIsTopHeaderCollapsed] = useState(false);

  const baseUrl = import.meta.env.BASE_URL || '/';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  useEffect(() => {
    fetch(`${cleanBase}mobility_full_study.json`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then(jsonData => {
        setData(jsonData);
        setLoading(false);
      })
      .catch(err => {
        console.warn('Primary study data fetch failed, trying fallback:', err);
        fetch(`${cleanBase}mobility_data.json`)
          .then(res => {
            if (!res.ok) throw new Error(`Fallback HTTP ${res.status}: ${res.statusText}`);
            return res.json();
          })
          .then(jsonData => {
            setData(jsonData);
            setLoading(false);
          })
          .catch(e => {
            console.error('All data fetches failed:', e);
            setFetchError('資料載入失敗，請確認網路連線或重新整理頁面。');
            setLoading(false);
          });
      });
  }, [cleanBase]);

  // URL Hash Deep-link Routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (!hash) return;
      if (hash === 'docs' || hash === 'guidebook' || hash === 'download') {
        setIsGuidebookModalOpen(true);
      } else if (hash === 'flows' || hash === 'flowmap') {
        setActiveTab('gis_map');
        setMapViewType('flows');
      } else if (hash === 'heatmap' || hash === 'etag-halos') {
        setActiveTab('gis_map');
        setMapViewType('heatmap');
      } else if (hash === 'tourism' || hash === 'cctv') {
        setActiveTab('tourism');
      } else if (hash === 'climate' || hash === 'climate-lab') {
        setActiveTab('climate');
      } else if (hash === 'commercial-lab' || hash === 'commercial') {
        setActiveTab('gis_map');
        setMapViewType('commercial');
      } else if (hash === 'ai_lab' || hash === 'rail-lab') {
        setActiveTab('ai_lab');
      } else if (hash === 'personas' || hash === 'weather-lab') {
        setActiveTab('personas');
      } else if (hash === 'analytics' || hash === 'od') {
        setActiveTab('analytics');
      } else if (hash === 'telecom' || hash === 'strategy') {
        setActiveTab('telecom');
      } else if (hash === 'tpass') {
        setActiveTab('tpass');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Time playback loop
  useEffect(() => {
    if (!isPlaying || activeTab !== 'gis_map' || mapViewType !== 'flows') return;
    const intervalMs = Math.max(140, 1400 / playSpeed);
    const timer = setInterval(() => {
      setCurrentHour(prev => (prev >= 23 ? 0 : prev + 1));
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, playSpeed, activeTab, mapViewType]);

  const rawModesMeta = data?.modes_meta || [];
  const modesMeta = useMemo(() => {
    const hasFreight = rawModesMeta.some(m => m.id === 'freight_highway');
    if (hasFreight) return rawModesMeta;
    return [...rawModesMeta, ...FREIGHT_AND_TOURISM_MODES_META];
  }, [rawModesMeta]);

  const studyData = data?.study_data || {};

  const rawCorridors = data?.map_corridors || [];
  const corridors = useMemo(() => {
    return [...rawCorridors, ...FREIGHT_AND_TOURISM_CORRIDORS];
  }, [rawCorridors]);

  const rawStationsGeo = data?.stations_geo || {};
  const stationsGeo = useMemo(() => {
    return { ...rawStationsGeo, ...FREIGHT_AND_TOURISM_STATIONS };
  }, [rawStationsGeo]);

  const progressData = data?.progress_data || {};

  if (loading) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#07090E',
        color: '#38BDF8',
        fontFamily: 'Outfit, sans-serif'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid rgba(56, 189, 248, 0.2)',
          borderTopColor: '#38BDF8',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }} />
        <div style={{ fontSize: '18px', fontWeight: '600', letterSpacing: '0.5px' }}>
          正在載入全台多模態動態人流資料庫...
        </div>
        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
          TICP 4.48 億筆票證分析、114 條代表性動態走廊與全台 77 大跨運具轉乘樞紐
        </div>
      </div>
    );
  }

  if (fetchError && !data) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#07090E',
        color: '#EF4444',
        fontFamily: 'Outfit, sans-serif',
        padding: '24px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
          {fetchError}
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '16px',
            padding: '10px 24px',
            borderRadius: '8px',
            background: '#38BDF8',
            color: '#0F172A',
            border: 'none',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          重新載入
        </button>
      </div>
    );
  }

  const getHourPhase = (h) => {
    if (h >= 7 && h <= 9) return { text: '早尖峰通勤狂潮 (Morning Rush Peak)', color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.2)' };
    if (h >= 17 && h <= 19) return { text: '晚尖峰返家大遷徙 (Evening Rush Peak)', color: '#F43F5E', bg: 'rgba(244, 63, 94, 0.2)' };
    if (h >= 11 && h <= 14) return { text: '中午商務與午餐移動 (Midday Movement)', color: '#10B981', bg: 'rgba(16, 185, 129, 0.2)' };
    if (h >= 22 || h <= 4) return { text: '深夜靜息與收班離峰 (Night Low Flow)', color: '#64748B', bg: 'rgba(100, 116, 139, 0.2)' };
    return { text: '日間常態運量 (Normal Flow)', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.2)' };
  };

  const hourPhase = getHourPhase(currentHour);
  const currentStage = WEATHER_STAGES.find(s => s.id === weatherStage) || WEATHER_STAGES[0];
  const CurrentWeatherIcon = currentStage.icon;

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#07090E', overflow: 'hidden' }}>
      
      {/* Top Header Navbar */}
      <header style={{
        height: isTopHeaderCollapsed ? '0px' : '60px',
        minHeight: isTopHeaderCollapsed ? '0px' : '60px',
        opacity: isTopHeaderCollapsed ? 0 : 1,
        overflow: 'hidden',
        background: 'rgba(13, 18, 30, 0.95)',
        borderBottom: isTopHeaderCollapsed ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isTopHeaderCollapsed ? '0 20px' : '0 20px',
        zIndex: 100,
        backdropFilter: 'blur(10px)',
        transition: 'height 0.28s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease, min-height 0.28s ease',
        pointerEvents: isTopHeaderCollapsed ? 'none' : 'auto'
      }}>
        {/* Brand Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #0284C7, #06B6D4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: '900',
            fontSize: '18px'
          }}>
            🚆
          </div>
          <div>
            <h1 style={{ fontSize: '15px', fontWeight: '800', color: '#f8fafc', letterSpacing: '0.5px' }}>
              臺灣多模態公共運輸票證大數據分析與模擬平台
            </h1>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              TICP Transit Analytics & AI Decision Suite
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '4px',
          background: 'rgba(30, 41, 59, 0.5)',
          padding: '3px 5px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          overflowX: 'auto',
          maxWidth: 'calc(100vw - 420px)',
          scrollbarWidth: 'none'
        }}>
          {[
            { id: 'gis_map', label: '🗺️ GIS 時空地圖', icon: Navigation },
            { id: 'tourism', label: '🏞️ 觀光名勝與CCTV', icon: Camera, badge: '74處' },
            { id: 'climate', label: '🌤️ 氣候脈動與宜居地圖', icon: Sun },
            { id: 'ai_lab', label: '🤖 AI客群與軌道決策', icon: Sparkles },
            { id: 'personas', label: '👥 客群轉乘應用', icon: Users },
            { id: 'analytics', label: '📊 運具對比與商業角色', icon: BarChart3 },
            { id: 'telecom', label: '📡 票證 vs 電信', icon: Radio },
            { id: 'tpass', label: '💳 TPASS 月票效益', icon: CreditCard }
          ].map(tab => {
            const isSelected = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 13px',
                  borderRadius: '7px',
                  border: 'none',
                  background: isSelected ? '#38BDF8' : 'transparent',
                  color: isSelected ? '#0F172A' : '#94A3B8',
                  fontSize: '12.5px',
                  fontWeight: isSelected ? '700' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span style={{
                    fontSize: '9.5px',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    background: isSelected ? '#0369A1' : '#F59E0B',
                    color: '#FFFFFF',
                    fontWeight: '800'
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Global Key Stats Badge & Guidebook Download */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          {/* Guidebook Download Button */}
          <button
            onClick={() => setIsGuidebookModalOpen(true)}
            title="下載中/英雙語完整說明書與專著 (v1.3.2 PDF / HTML)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.25) 0%, rgba(59, 130, 246, 0.35) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.5)',
              borderRadius: '8px',
              color: '#38BDF8',
              cursor: 'pointer',
              fontSize: '12.5px',
              fontWeight: '700',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            <BookOpen size={14} />
            <span>說明書下載</span>
            <span style={{
              background: '#0284C7',
              color: '#FFFFFF',
              fontSize: '9.5px',
              padding: '1px 5px',
              borderRadius: '4px',
              fontWeight: '800'
            }}>中/英 PDF</span>
          </button>

          <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.1)' }} />

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: '#64748b' }}>總分析票證筆數</div>
            <div style={{ fontSize: '14px', fontWeight: '800', fontFamily: 'JetBrains Mono, monospace', color: '#38BDF8' }}>
              {data?.metadata?.total_rows ? data.metadata.total_rows.toLocaleString() : '448,688,705'}
            </div>
          </div>
          <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: '#64748b' }}>全台動態走廊</div>
            <div style={{ fontSize: '14px', fontWeight: '800', fontFamily: 'JetBrains Mono, monospace', color: '#10B981' }}>
              {corridors.length} 條
            </div>
          </div>

          <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.1)' }} />

          {/* Collapse Header Button */}
          <button
            onClick={() => setIsTopHeaderCollapsed(true)}
            title="收合頂部導航列 (最大化視覺空間)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 10px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              color: '#94A3B8',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#38BDF8'; e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)'; e.currentTarget.style.background = 'rgba(56, 189, 248, 0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'; }}
          >
            <ChevronUp size={13} />
            <span>收合頂部</span>
          </button>
        </div>
      </header>

      {/* Floating Expand Top Header Button (when header is collapsed) */}
      {isTopHeaderCollapsed && (
        <button
          onClick={() => setIsTopHeaderCollapsed(false)}
          title="展開頂部導航列"
          style={{
            position: 'fixed',
            top: '12px',
            right: '16px',
            zIndex: 9995,
            background: 'rgba(15, 23, 42, 0.94)',
            backdropFilter: 'blur(14px)',
            border: '1px solid rgba(56, 189, 248, 0.5)',
            borderRadius: '24px',
            padding: '6px 14px',
            color: '#38BDF8',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 12px rgba(56, 189, 248, 0.25)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(2, 132, 199, 0.9)'; e.currentTarget.style.color = '#FFFFFF'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.94)'; e.currentTarget.style.color = '#38BDF8'; }}
        >
          <ChevronDown size={14} />
          <span>展開頂部導航</span>
        </button>
      )}

      {/* Main Body View Switching */}
      <main style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        
        {/* VIEW 1: Interactive GIS Map Center */}
        {activeTab === 'gis_map' && (
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            {/* Top Center GIS Mode Switcher Floating Badge */}
            <div style={{
              position: 'absolute',
              top: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 450,
              background: 'rgba(15, 23, 42, 0.94)',
              backdropFilter: 'blur(14px)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: '30px',
              padding: '4px 6px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.6)'
            }}>
              <button
                onClick={() => setMapViewType('flows')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: 'none',
                  background: mapViewType === 'flows' ? '#38BDF8' : 'transparent',
                  color: mapViewType === 'flows' ? '#0F172A' : '#94A3B8',
                  fontSize: '12px',
                  fontWeight: mapViewType === 'flows' ? '800' : '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Navigation size={14} />
                <span>🌊 動態走廊流向圖</span>
              </button>
              <button
                onClick={() => setMapViewType('heatmap')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: 'none',
                  background: mapViewType === 'heatmap' ? 'linear-gradient(135deg, #F97316, #EF4444)' : 'transparent',
                  color: mapViewType === 'heatmap' ? '#FFFFFF' : '#94A3B8',
                  fontSize: '12px',
                  fontWeight: mapViewType === 'heatmap' ? '800' : '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Flame size={14} />
                <span>🔥 時空熱點與四維人群像</span>
              </button>
              <button
                onClick={() => setMapViewType('transfers')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: 'none',
                  background: mapViewType === 'transfers' ? 'linear-gradient(135deg, #0284C7, #A855F7)' : 'transparent',
                  color: mapViewType === 'transfers' ? '#FFFFFF' : '#94A3B8',
                  fontSize: '12px',
                  fontWeight: mapViewType === 'transfers' ? '800' : '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Shuffle size={14} />
                <span>🔀 跨運具轉乘脈衝 (身分接駁)</span>
              </button>
              <button
                onClick={() => setMapViewType('amenities')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: 'none',
                  background: mapViewType === 'amenities' ? 'linear-gradient(135deg, #10B981, #06B6D4)' : 'transparent',
                  color: mapViewType === 'amenities' ? '#FFFFFF' : '#94A3B8',
                  fontSize: '12px',
                  fontWeight: mapViewType === 'amenities' ? '800' : '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Store size={14} />
                <span>🏪 15分鐘微生活圈 (都市機能可達性)</span>
              </button>
              <button
                onClick={() => setMapViewType('commercial')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: 'none',
                  background: mapViewType === 'commercial' ? 'linear-gradient(135deg, #EC4899, #8B5CF6)' : 'transparent',
                  color: mapViewType === 'commercial' ? '#FFFFFF' : '#94A3B8',
                  fontSize: '12px',
                  fontWeight: mapViewType === 'commercial' ? '800' : '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Building2 size={14} />
                <span>🏬 商圈脈動與投資決策 (四維商業洞察)</span>
              </button>
            </div>

            {/* Sub-view 1A: Flow Map */}
            {mapViewType === 'flows' && (
              <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                <FlowMap
                  corridors={corridors}
                  stationsGeo={stationsGeo}
                  selectedMode={selectedMode}
                  selectedRegion={selectedRegion}
                  selectedPaxType={selectedPaxType}
                  selectedDayType={selectedDayType}
                  basemap={basemap}
                  currentHour={currentHour}
                  onSelectStation={setSelectedStation}
                  selectedStation={selectedStation}
                  onSelectCorridor={setSelectedCorridor}
                  selectedCorridor={selectedCorridor}
                />

            {/* Floating Top Left Controls: Modes + Regions + Pax Type + Day Type */}
            <div style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              zIndex: 400,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              {/* Row 1: Mode Filter Chips */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.88)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                padding: '8px 12px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                maxWidth: '680px'
              }}>
                <button
                  onClick={() => setSelectedMode('all')}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: selectedMode === 'all' ? '700' : '500',
                    border: selectedMode === 'all' ? '1px solid #38BDF8' : '1px solid rgba(255,255,255,0.08)',
                    background: selectedMode === 'all' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.5)',
                    color: selectedMode === 'all' ? '#f8fafc' : '#94a3b8',
                    cursor: 'pointer'
                  }}
                >
                  🌐 全部運具
                </button>
                {modesMeta.map(m => {
                  const isSel = selectedMode === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMode(m.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '5px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: isSel ? '700' : '500',
                        border: isSel ? `1px solid ${m.color}` : '1px solid rgba(255,255,255,0.08)',
                        background: isSel ? `${m.color}28` : 'rgba(30, 41, 59, 0.5)',
                        color: isSel ? '#f8fafc' : '#94a3b8',
                        cursor: 'pointer'
                      }}
                    >
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: m.color }} />
                      {m.short_name}
                    </button>
                  );
                })}
              </div>

              {/* Row 2: Region Zoom + Pax Type (Commuter vs Tourist) */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {/* Region Selector */}
                <div style={{
                  background: 'rgba(15, 23, 42, 0.88)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  padding: '6px 10px',
                  display: 'flex',
                  gap: '4px',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '11px', color: '#64748b', marginRight: '2px' }}>區域:</span>
                  {REGION_OPTIONS.map(r => {
                    const isSel = selectedRegion === r.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => setSelectedRegion(r.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          padding: '4px 8px',
                          borderRadius: '5px',
                          fontSize: '11px',
                          fontWeight: isSel ? '700' : '500',
                          border: isSel ? '1px solid #10B981' : '1px solid transparent',
                          background: isSel ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.04)',
                          color: isSel ? '#34D399' : '#94a3b8',
                          cursor: 'pointer'
                        }}
                      >
                        <span>{r.icon}</span>
                        <span>{r.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Pax Type Selector (通勤 / 觀光 / 銀髮 / 學生) */}
                <div style={{
                  background: 'rgba(15, 23, 42, 0.88)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  padding: '6px 10px',
                  display: 'flex',
                  gap: '4px',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '11px', color: '#64748b', marginRight: '2px' }}>客群:</span>
                  {PAX_OPTIONS.map(p => {
                    const isSel = selectedPaxType === p.id;
                    const pColor = p.id === 'commuter' ? '#38BDF8'
                                 : p.id === 'tourist' ? '#F97316'
                                 : p.id === 'freight' ? '#10B981'
                                 : p.id === 'senior' ? '#F43F5E'
                                 : p.id === 'student' ? '#14B8A6'
                                 : '#A855F7';
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPaxType(p.id)}
                        style={{
                          padding: '4px 9px',
                          borderRadius: '5px',
                          fontSize: '11px',
                          fontWeight: isSel ? '700' : '500',
                          border: isSel ? `1px solid ${pColor}` : '1px solid transparent',
                          background: isSel ? `${pColor}33` : 'rgba(255,255,255,0.04)',
                          color: isSel ? pColor : '#94a3b8',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Floating Top Right: Basemap Selector + Day Type Toggle + Hour Status */}
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              zIndex: 400,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              alignItems: 'flex-end'
            }}>
              {/* Day & Weather Scenario Controls (日型選擇 + 4 段天氣玻璃態下拉選單) */}
              <div style={{
                position: 'relative',
                display: 'flex',
                gap: '8px',
                alignItems: 'center'
              }}>
                {/* 1. 工作日 / 放假日 Segmented Toggle */}
                <div style={{
                  background: 'rgba(15, 23, 42, 0.92)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  padding: '4px',
                  display: 'flex',
                  gap: '3px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
                }}>
                  {DAY_TYPES.map(dt => {
                    const isSel = dayType === dt.id;
                    const dtColor = dt.id === 'holiday' ? '#F97316' : '#10B981';
                    return (
                      <button
                        key={dt.id}
                        onClick={() => setDayType(dt.id)}
                        title={dt.desc}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '7px',
                          fontSize: '11px',
                          fontWeight: isSel ? '800' : '500',
                          border: isSel ? `1px solid ${dtColor}` : '1px solid transparent',
                          background: isSel ? `${dtColor}26` : 'transparent',
                          color: isSel ? dtColor : '#94A3B8',
                          cursor: 'pointer',
                          boxShadow: isSel ? `0 0 10px ${dtColor}40` : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {dt.label}
                      </button>
                    );
                  })}
                </div>

                {/* 2. 4 段天氣狀態下拉選單 (☀️ 晴朗天 / ☁️ 陰天 / 🌧️ 常規雨 / ⛈️ 豪大雨) */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setIsWeatherDropdownOpen(prev => !prev)}
                    style={{
                      background: 'rgba(15, 23, 42, 0.92)',
                      backdropFilter: 'blur(12px)',
                      border: `1px solid ${currentStage.color}66`,
                      borderRadius: '10px',
                      padding: '6px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      color: '#F8FAFC',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      boxShadow: `0 4px 16px ${currentStage.color}22`,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: currentStage.color,
                      boxShadow: `0 0 8px ${currentStage.color}`
                    }} />
                    <CurrentWeatherIcon size={14} color={currentStage.color} />
                    <span>{currentStage.label}</span>
                    <ChevronDown
                      size={13}
                      color="#94A3B8"
                      style={{
                        transform: isWeatherDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease'
                      }}
                    />
                  </button>

                  {/* 下拉選單面板 */}
                  {isWeatherDropdownOpen && (
                    <>
                      {/* 點擊遮罩關閉 */}
                      <div
                        onClick={() => setIsWeatherDropdownOpen(false)}
                        style={{
                          position: 'fixed',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          zIndex: 499
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: 'calc(100% + 6px)',
                        right: 0,
                        zIndex: 500,
                        width: '275px',
                        background: 'rgba(15, 23, 42, 0.97)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.14)',
                        borderRadius: '12px',
                        padding: '6px',
                        boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}>
                        <div style={{
                          padding: '6px 8px 4px 8px',
                          fontSize: '10px',
                          fontWeight: '700',
                          color: '#64748b',
                          letterSpacing: '0.5px',
                          borderBottom: '1px solid rgba(255,255,255,0.06)',
                          marginBottom: '2px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span>🌧️ 氣象署實證 4 段天候情境</span>
                          <span style={{ color: '#38BDF8' }}>CWA 觀測校準</span>
                        </div>
                        {WEATHER_STAGES.map(stage => {
                          const isSel = weatherStage === stage.id;
                          const SIcon = stage.icon;
                          return (
                            <button
                              key={stage.id}
                              onClick={() => {
                                setWeatherStage(stage.id);
                                setIsWeatherDropdownOpen(false);
                              }}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '3px',
                                padding: '8px 10px',
                                borderRadius: '8px',
                                border: isSel ? `1px solid ${stage.color}88` : '1px solid transparent',
                                background: isSel ? `${stage.color}18` : 'transparent',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <SIcon size={14} color={stage.color} />
                                  <span style={{ fontSize: '12px', fontWeight: isSel ? '800' : '600', color: isSel ? stage.color : '#F1F5F9' }}>
                                    {stage.label}
                                  </span>
                                </div>
                                {isSel && (
                                  <span style={{ fontSize: '10px', color: stage.color, fontWeight: '700' }}>
                                    ● 啟用中
                                  </span>
                                )}
                              </div>
                              <span style={{ fontSize: '10px', color: '#94A3B8', lineHeight: '1.4' }}>
                                {stage.desc}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Basemap Switcher */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                padding: '6px 10px',
                display: 'flex',
                gap: '6px',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '11px', color: '#64748b', marginRight: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Layers size={13} /> 底圖:
                </span>
                {BASEMAP_OPTIONS.map(b => {
                  const isSel = basemap === b.id;
                  const Icon = b.icon;
                  return (
                    <button
                      key={b.id}
                      onClick={() => setBasemap(b.id)}
                      title={b.desc}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '5px 9px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: isSel ? '700' : '500',
                        border: isSel ? '1px solid #38BDF8' : '1px solid transparent',
                        background: isSel ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255,255,255,0.05)',
                        color: isSel ? '#f8fafc' : '#94a3b8',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Icon size={13} color={isSel ? '#38BDF8' : '#94A3B8'} />
                      <span>{b.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic 24-Hour Phase Badge */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.9)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${hourPhase.color}44`,
                borderRadius: '10px',
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: hourPhase.color, animation: 'pulse 1.5s infinite' }} />
                <span style={{ fontSize: '12px', fontWeight: '700', color: hourPhase.color }}>
                  {hourPhase.text}
                </span>
              </div>
            </div>

            {/* Floating Bottom Time Scrubbing & Playback Controller */}
            <div style={{
              position: 'absolute',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 400,
              background: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              borderRadius: '30px',
              padding: '10px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.6)'
            }}>
              {/* Play / Pause */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#38BDF8',
                  color: '#0F172A',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
              </button>

              {/* Time Slider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '16px', fontWeight: '800', fontFamily: 'JetBrains Mono, monospace', color: '#38BDF8', minWidth: '55px' }}>
                  {String(currentHour).padStart(2, '0')}:00
                </span>
                <input
                  type="range"
                  min="0"
                  max="23"
                  value={currentHour}
                  onChange={e => setCurrentHour(Number(e.target.value))}
                  style={{ width: '220px', accentColor: '#38BDF8' }}
                />
              </div>

              {/* Speed Switcher */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {[1, 2, 5].map(s => (
                  <button
                    key={s}
                    onClick={() => setPlaySpeed(s)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '700',
                      border: 'none',
                      background: playSpeed === s ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255,255,255,0.06)',
                      color: playSpeed === s ? '#38BDF8' : '#94A3B8',
                      cursor: 'pointer'
                    }}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Station Inspector (Bottom Left Floating) */}
            {selectedStation && (
              <div style={{
                position: 'absolute',
                bottom: '90px',
                left: '16px',
                zIndex: 400,
                background: 'rgba(15, 23, 42, 0.92)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '12px',
                padding: '14px 16px',
                width: '280px',
                boxShadow: '0 8px 20px rgba(0,0,0,0.5)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={15} color="#38BDF8" /> {selectedStation}
                  </h4>
                  <button onClick={() => setSelectedStation(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' }}>✕</button>
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  座標 (WGS84)：<code style={{ color: '#38BDF8' }}>{stationsGeo[selectedStation]?.join(', ') || 'N/A'}</code>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sub-view 1B: Heatmap View & 4-Personas */}
        {activeTab === 'gis_map' && mapViewType === 'heatmap' && (
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <Suspense fallback={
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '14px' }}>
                🔥 熱點與人群像模組載入中...
              </div>
            }>
              <ErrorBoundary>
                <HeatmapView 
                  basemap={basemap} 
                  initialPaxType={selectedPaxType} 
                  initialTimeScope={selectedDayType}
                  onOpenWeatherLab={() => {
                    setPersonaSubTab('weather');
                    setActiveTab('personas');
                  }}
                />
              </ErrorBoundary>
            </Suspense>
          </div>
        )}

        {/* Sub-view 1C: Multi-modal Transfer Map View (Golden Combination) */}
        {activeTab === 'gis_map' && mapViewType === 'transfers' && (
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <Suspense fallback={
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '14px' }}>
                🔀 跨運具轉乘脈衝模組載入中...
              </div>
            }>
              <ErrorBoundary>
                <TransferMapView basemap={basemap} />
              </ErrorBoundary>
            </Suspense>
          </div>
        )}

        {/* Sub-view 1D: 15-Minute Urban Living & Mobility Accessibility Lab */}
        {activeTab === 'gis_map' && mapViewType === 'amenities' && (
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <Suspense fallback={
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '14px' }}>
                🏪 15分鐘微生活圈 · 都市機能與客群可達性模組載入中...
              </div>
            }>
              <ErrorBoundary>
                <UrbanAmenityAccessibilityLab basemap={basemap} />
              </ErrorBoundary>
            </Suspense>
          </div>
        )}

        {/* Sub-view 1E: Commercial Pulse & Retail Investment Lab */}
        {activeTab === 'gis_map' && mapViewType === 'commercial' && (
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <Suspense fallback={
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '14px' }}>
                🏬 全台商圈繁榮沒落與商業投資決策地圖載入中...
              </div>
            }>
              <ErrorBoundary>
                <CommercialPulseLab basemap={basemap} />
              </ErrorBoundary>
            </Suspense>
          </div>
        )}
      </div>
    )}

    {/* Suspense Wrapper for Lazy Loaded Views (Analytics, Telecom, Policy Labs, Pipeline) */}
    <Suspense fallback={
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '14px' }}>
        ⚡ 模組載入中...
      </div>
    }>
      {/* VIEW: AI Unsupervised Latent Personas & Rail Decision Lab */}
      {activeTab === 'ai_lab' && (
        <div style={{ height: '100%', overflowY: 'auto', backgroundColor: '#07090E' }}>
          <ErrorBoundary>
            <UnsupervisedRailLab />
          </ErrorBoundary>
        </div>
      )}

      {/* VIEW: Persona Deep Analytics (Commuters, Seniors & Students & Transfers) */}
      {activeTab === 'personas' && (
        <div style={{ height: '100%', overflowY: 'auto' }}>
          <ErrorBoundary>
            <PersonaAnalyticsView 
              initialSubTab={personaSubTab}
              onSwitchToTransferMap={() => {
                setActiveTab('gis_map');
                setMapViewType('transfers');
              }} 
              onSwitchToAmenityMap={() => {
                setActiveTab('gis_map');
                setMapViewType('amenities');
              }}
              onSwitchToAiLab={() => {
                setActiveTab('ai_lab');
              }}
            />
          </ErrorBoundary>
        </div>
      )}

      {/* VIEW 2: Analytics & Comparison + OD Diagnosis */}
      {activeTab === 'analytics' && (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Secondary Sub-view Switcher Bar */}
          <div style={{
            background: '#0B0F17',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '10px 24px',
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '12px', color: '#64748B', marginRight: '4px' }}>分析視圖：</span>
            <button
              onClick={() => setAnalyticsSubView('comparison')}
              style={{
                padding: '6px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: analyticsSubView === 'comparison' ? '700' : '500',
                border: analyticsSubView === 'comparison' ? '1px solid #38BDF8' : '1px solid rgba(255,255,255,0.08)',
                background: analyticsSubView === 'comparison' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.03)',
                color: analyticsSubView === 'comparison' ? '#38BDF8' : '#94A3B8',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              📊 10大運具綜合對比與四維人群商家選址模擬
            </button>
            <button
              onClick={() => setAnalyticsSubView('od')}
              style={{
                padding: '6px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: analyticsSubView === 'od' ? '700' : '500',
                border: analyticsSubView === 'od' ? '1px solid #10B981' : '1px solid rgba(255,255,255,0.08)',
                background: analyticsSubView === 'od' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.03)',
                color: analyticsSubView === 'od' ? '#34D399' : '#94A3B8',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              🎯 OD 核心樞紐與車站微觀診斷
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            <ErrorBoundary>
              {analyticsSubView === 'comparison' ? (
                <ComparisonDashboard studyData={studyData} modesMeta={modesMeta} />
              ) : (
                <ODStationView studyData={studyData} modesMeta={modesMeta} />
              )}
            </ErrorBoundary>
          </div>
        </div>
      )}

      {/* VIEW 3: Telecom vs Smart Card Strategy View */}
      {activeTab === 'telecom' && (
        <div style={{ height: '100%', overflowY: 'auto' }}>
          <ErrorBoundary>
            <TelecomComparisonView />
          </ErrorBoundary>
        </div>
      )}

      {/* VIEW 6: TPASS Policy Analytics */}
      {activeTab === 'tpass' && (
        <div style={{ height: '100%', overflowY: 'auto' }}>
          <ErrorBoundary>
            <TPASSDashboard />
          </ErrorBoundary>
        </div>
      )}

      {/* VIEW 7: Taiwan Climate Pulse & Microclimate Livability Lab */}
      {activeTab === 'climate' && (
        <div style={{ height: '100%', overflow: 'hidden' }}>
          <ErrorBoundary>
            <ClimatePulseLab basemap={basemap} />
          </ErrorBoundary>
        </div>
      )}

      {/* VIEW 8: Tourism & Mobility Artery Lab (TDX CCTV + CODiS Climate + eTag) */}
      {activeTab === 'tourism' && (
        <div style={{ height: '100%', overflowY: 'auto' }}>
          <ErrorBoundary>
            <TourismMobilityLab />
          </ErrorBoundary>
        </div>
      )}


    </Suspense>
      </main>

      {/* GUIDEBOOK & DOCUMENTATION DOWNLOAD MODAL */}
      {isGuidebookModalOpen && (
        <div 
          onClick={() => setIsGuidebookModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '920px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#0F172A',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '20px',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 30px rgba(56, 189, 248, 0.2)',
              color: '#F8FAFC',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '24px 28px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0) 100%)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    background: 'rgba(56, 189, 248, 0.15)',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    fontSize: '12px',
                    color: '#38BDF8',
                    fontWeight: '700'
                  }}>
                    <BookOpen size={13} />
                    <span>國家級大數據專著 · 出版典藏版 v1.3.2</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#10B981', fontWeight: '700', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    雙語雙格式支援 (中/英 · PDF/HTML)
                  </span>
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#FFFFFF', margin: '0 0 4px 0', letterSpacing: '0.3px' }}>
                  臺灣動態移動脈搏 · 專著與說明書下載中心
                </h2>
                <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>
                  Master Guidebook & National Spatial Intelligence Documentation Download Center
                </p>
              </div>
              <button
                onClick={() => setIsGuidebookModalOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'; }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: Two Language Cards */}
            <div style={{ padding: '28px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
              
              {/* Card 1: 繁體中文版 */}
              <div style={{
                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
                
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '26px' }}>🇹🇼</span>
                      <div>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#F8FAFC' }}>繁體中文完整典藏版</div>
                        <div style={{ fontSize: '11px', color: '#38BDF8', fontWeight: '600' }}>Traditional Chinese Master Edition</div>
                      </div>
                    </div>
                    <span style={{ background: '#0284C7', color: '#FFFFFF', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px' }}>
                      87 頁 · 25.7 MB
                    </span>
                  </div>

                  <p style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: '1.6', marginBottom: '16px' }}>
                    全景式收錄 10 大全景巨章。涵蓋數據哲學底座（4.48 億筆票證 vs eTag 門架）、114 條動態走廊、下匝道輻射光暈、四大微觀人群像、30 年氣候脈動、74 處風景區即時影像 CCTV，以及 <strong>v1.3.2 全新第 10 章：TDX 歷史道安重大事故 (A1) 黑點空間圖譜</strong>。
                  </p>

                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '12px 14px', marginBottom: '20px', fontSize: '12px', color: '#94A3B8' }}>
                    <div style={{ color: '#F1F5F9', fontWeight: '700', marginBottom: '4px' }}>📌 專著特色與亮點：</div>
                    <ul style={{ margin: 0, paddingLeft: '18px', lineHeight: '1.7' }}>
                      <li>內建 112+ 個可點擊跳轉線上系統的「🚀 互動傳送門」</li>
                      <li>出版級 A4 專業排版、全彩向量圖表與三向戰略對照表</li>
                      <li>提供 PDF 離線閱讀與獨立 HTML 兩種完整格式</li>
                    </ul>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <a
                    href={`${cleanBase}docs/taiwan_mobility_pulse_guidebook.pdf`}
                    download="Taiwan_Mobility_Pulse_Guidebook_v1.3.2_zh.pdf"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px',
                      background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                      border: '1px solid #38BDF8',
                      borderRadius: '10px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: '800',
                      textDecoration: 'none',
                      boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Download size={16} />
                    <span>📥 另存 PDF (下載繁中版 25.7MB)</span>
                  </a>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <a
                      href={`${cleanBase}docs/taiwan_mobility_pulse_guidebook.html`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '9px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '8px',
                        color: '#E2E8F0',
                        fontSize: '12.5px',
                        fontWeight: '600',
                        textDecoration: 'none'
                      }}
                    >
                      <ExternalLink size={13} />
                      <span>線上閱讀 HTML</span>
                    </a>

                    <a
                      href="https://github.com/tobytoy/taiwan-mobility-pulse/tree/main/docs"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '9px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '8px',
                        color: '#94A3B8',
                        fontSize: '12.5px',
                        fontWeight: '600',
                        textDecoration: 'none'
                      }}
                    >
                      <FileText size={13} />
                      <span>Markdown 目錄</span>
                    </a>
                  </div>
                </div>

              </div>

              {/* Card 2: 英文版 */}
              <div style={{
                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
                
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '26px' }}>🇬🇧</span>
                      <div>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#F8FAFC' }}>English Master Edition</div>
                        <div style={{ fontSize: '11px', color: '#34D399', fontWeight: '600' }}>Full Bilingual Documentation Suite</div>
                      </div>
                    </div>
                    <span style={{ background: '#059669', color: '#FFFFFF', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px' }}>
                      83 Pages · 24.9 MB
                    </span>
                  </div>

                  <p style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: '1.6', marginBottom: '16px' }}>
                    Comprehensive 10-chapter English master monograph. Covers the data philosophy (448M census records vs. eTag freeway flows), 114 flow corridors, off-ramp halos, 4 micro-personas, 30-year climatology, 74 scenic live CCTVs, and <strong>v1.3.2 Chapter 10: TDX Historical Traffic Safety & A1 Fatal Blackspot Spatial Atlas</strong>.
                  </p>

                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '12px 14px', marginBottom: '20px', fontSize: '12px', color: '#94A3B8' }}>
                    <div style={{ color: '#F1F5F9', fontWeight: '700', marginBottom: '4px' }}>📌 Key Highlights & Features:</div>
                    <ul style={{ margin: 0, paddingLeft: '18px', lineHeight: '1.7' }}>
                      <li>100+ active clickable portals linking back to live web tools</li>
                      <li>Publication-grade typography, CSS diagrams & comparison tables</li>
                      <li>Available as standalone A4 PDF & responsive single-file HTML</li>
                    </ul>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <a
                    href={`${cleanBase}docs/taiwan_mobility_pulse_guidebook_en.pdf`}
                    download="Taiwan_Mobility_Pulse_Guidebook_v1.3.2_en.pdf"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px',
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      border: '1px solid #34D399',
                      borderRadius: '10px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: '800',
                      textDecoration: 'none',
                      boxShadow: '0 4px 14px rgba(5, 150, 105, 0.4)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Download size={16} />
                    <span>📥 Save PDF (Download English 24.9MB)</span>
                  </a>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <a
                      href={`${cleanBase}docs/taiwan_mobility_pulse_guidebook_en.html`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '9px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '8px',
                        color: '#E2E8F0',
                        fontSize: '12.5px',
                        fontWeight: '600',
                        textDecoration: 'none'
                      }}
                    >
                      <ExternalLink size={13} />
                      <span>Read Online HTML</span>
                    </a>

                    <a
                      href="https://github.com/tobytoy/taiwan-mobility-pulse/tree/main/docs/en"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '9px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '8px',
                        color: '#94A3B8',
                        fontSize: '12.5px',
                        fontWeight: '600',
                        textDecoration: 'none'
                      }}
                    >
                      <FileText size={13} />
                      <span>English Docs</span>
                    </a>
                  </div>
                </div>

              </div>

            </div>

            {/* Modal Footer / Download Instructions */}
            <div style={{
              padding: '16px 28px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(15, 23, 42, 0.95)',
              borderRadius: '0 0 20px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#94A3B8' }}>
                <span style={{ color: '#F59E0B' }}>💡</span>
                <span><strong>快速下載提示：</strong>點擊「另存 PDF」將直接保存至本機。以「線上閱讀」開啟時，亦可使用快捷鍵 <strong>Ctrl + S</strong> (Windows) 或 <strong>Cmd + S</strong> (Mac) 另存為單一離線網頁。</span>
              </div>
              <button
                onClick={() => setIsGuidebookModalOpen(false)}
                style={{
                  padding: '7px 18px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  color: '#CBD5E1',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                關閉視窗 (Close)
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
