import React, { useState, useEffect, Suspense, lazy } from 'react';
import FlowMap from './components/FlowMap';
import ErrorBoundary from './components/ErrorBoundary';

const ComparisonDashboard = lazy(() => import('./components/ComparisonDashboard'));
const TPASSDashboard = lazy(() => import('./components/TPASSDashboard'));
const ODStationView = lazy(() => import('./components/ODStationView'));
const RDSimulationLab = lazy(() => import('./components/RDSimulationLab'));
const PipelineMonitor = lazy(() => import('./components/PipelineMonitor'));
import { 
  Play, Pause, RotateCcw, Layers, Compass, 
  Activity, Train, Clock, MapPin, Award, 
  ArrowRight, ShieldCheck, ChevronRight, ChevronLeft, Eye,
  BarChart3, FlaskConical, Zap, LayoutDashboard, Navigation, CreditCard,
  Globe, Sun, Moon, Map as MapIcon, Sparkles, Users, Briefcase, Calendar
} from 'lucide-react';

const BASEMAP_OPTIONS = [
  { id: 'dark', label: '賽博深色', icon: Moon, desc: 'Dark Matter' },
  { id: 'satellite', label: '高解析衛星', icon: Globe, desc: 'ESRI Satellite' },
  { id: 'osm', label: '開放街圖', icon: MapIcon, desc: 'OpenStreetMap' },
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
  { id: 'all', label: '全體人流', icon: '🔘' },
  { id: 'commuter', label: '💼 通勤族走廊', icon: '💼' },
  { id: 'tourist', label: '🧳 觀光旅客走廊', icon: '🧳' }
];

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [activeTab, setActiveTab] = useState('map'); // 'map', 'comparison', 'tpass', 'od', 'rd_labs', 'pipeline'
  // Map Controls State
  const [currentHour, setCurrentHour] = useState(8);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1);
  const [selectedMode, setSelectedMode] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedPaxType, setSelectedPaxType] = useState('all');
  const [selectedDayType, setSelectedDayType] = useState('Weekday');
  const [basemap, setBasemap] = useState('dark');
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedCorridor, setSelectedCorridor] = useState(null);

  useEffect(() => {
    const baseUrl = import.meta.env.BASE_URL || '/';
    const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
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
  }, []);

  // Time playback loop
  useEffect(() => {
    if (!isPlaying || activeTab !== 'map') return;
    const intervalMs = Math.max(140, 1400 / playSpeed);
    const timer = setInterval(() => {
      setCurrentHour(prev => (prev >= 23 ? 0 : prev + 1));
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, playSpeed, activeTab]);

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
          TICP 4.48 億筆票證分析與 111 條動態人流走廊
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

  const modesMeta = data?.modes_meta || [];
  const studyData = data?.study_data || {};
  const corridors = data?.map_corridors || [];
  const stationsGeo = data?.stations_geo || {};
  const progressData = data?.progress_data || {};
  const rdProposals = data?.rd_proposals || [];

  const getHourPhase = (h) => {
    if (h >= 7 && h <= 9) return { text: '早尖峰通勤狂潮 (Morning Rush Peak)', color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.2)' };
    if (h >= 17 && h <= 19) return { text: '晚尖峰返家大遷徙 (Evening Rush Peak)', color: '#F43F5E', bg: 'rgba(244, 63, 94, 0.2)' };
    if (h >= 11 && h <= 14) return { text: '中午商務與午餐移動 (Midday Movement)', color: '#10B981', bg: 'rgba(16, 185, 129, 0.2)' };
    if (h >= 22 || h <= 4) return { text: '深夜靜息與收班離峰 (Night Low Flow)', color: '#64748B', bg: 'rgba(100, 116, 139, 0.2)' };
    return { text: '日間常態運量 (Normal Flow)', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.2)' };
  };

  const hourPhase = getHourPhase(currentHour);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#07090E', overflow: 'hidden' }}>
      
      {/* Top Header Navbar */}
      <header style={{
        height: '60px',
        background: 'rgba(13, 18, 30, 0.95)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 100,
        backdropFilter: 'blur(10px)'
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
        <div style={{ display: 'flex', gap: '6px', background: 'rgba(30, 41, 59, 0.5)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          {[
            { id: 'map', label: '全台流向地圖', icon: Navigation },
            { id: 'comparison', label: '10大運具綜合對比', icon: BarChart3 },
            { id: 'tpass', label: 'TPASS 政策效益分析', icon: CreditCard },
            { id: 'od', label: 'OD 走廊與站點診斷', icon: Compass },
            { id: 'rd_labs', label: '五大 AI 研發實驗室', icon: FlaskConical },
            { id: 'pipeline', label: '管線效能與監控', icon: Zap }
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
                  padding: '7px 14px',
                  borderRadius: '7px',
                  border: 'none',
                  background: isSelected ? '#38BDF8' : 'transparent',
                  color: isSelected ? '#0F172A' : '#94A3B8',
                  fontSize: '13px',
                  fontWeight: isSelected ? '700' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Global Key Stats Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
        </div>
      </header>

      {/* Main Body View Switching */}
      <main style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        
        {/* VIEW 1: Interactive Flow Map */}
        {activeTab === 'map' && (
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

                {/* Pax Type Selector (通勤 vs 觀光) */}
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
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPaxType(p.id)}
                        style={{
                          padding: '4px 9px',
                          borderRadius: '5px',
                          fontSize: '11px',
                          fontWeight: isSel ? '700' : '500',
                          border: isSel ? '1px solid #EC4899' : '1px solid transparent',
                          background: isSel ? 'rgba(236, 72, 153, 0.25)' : 'rgba(255,255,255,0.04)',
                          color: isSel ? '#F472B6' : '#94a3b8',
                          cursor: 'pointer'
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
              {/* Day Type Toggle (平日 / 週末 / 連假) */}
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
                  <Calendar size={13} /> 時段:
                </span>
                {[
                  { id: 'Weekday', label: '💼 平日 (1-5)' },
                  { id: 'Weekend', label: '🏖️ 週末 (六日)' },
                  { id: 'Holiday', label: '🎉 連假節慶' }
                ].map(dt => {
                  const isSel = selectedDayType === dt.id;
                  return (
                    <button
                      key={dt.id}
                      onClick={() => setSelectedDayType(dt.id)}
                      style={{
                        padding: '4px 9px',
                        borderRadius: '5px',
                        fontSize: '11px',
                        fontWeight: isSel ? '700' : '500',
                        border: isSel ? '1px solid #F59E0B' : '1px solid transparent',
                        background: isSel ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255,255,255,0.05)',
                        color: isSel ? '#FBBF24' : '#94a3b8',
                        cursor: 'pointer'
                      }}
                    >
                      {dt.label}
                    </button>
                  );
                })}
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

        {/* Suspense Wrapper for Lazy Loaded Views */}
        <Suspense fallback={
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '14px' }}>
            ⚡ 模組載入中...
          </div>
        }>
          {/* VIEW 2: Comparison Dashboard */}
          {activeTab === 'comparison' && (
            <div style={{ height: '100%', overflowY: 'auto' }}>
              <ErrorBoundary>
                <ComparisonDashboard studyData={studyData} modesMeta={modesMeta} />
              </ErrorBoundary>
            </div>
          )}

          {/* VIEW 3: TPASS Policy Analytics Dashboard */}
          {activeTab === 'tpass' && (
            <div style={{ height: '100%', overflowY: 'auto' }}>
              <ErrorBoundary>
                <TPASSDashboard />
              </ErrorBoundary>
            </div>
          )}

          {/* VIEW 4: OD & Station Diagnosis */}
          {activeTab === 'od' && (
            <div style={{ height: '100%', overflowY: 'auto' }}>
              <ErrorBoundary>
                <ODStationView studyData={studyData} modesMeta={modesMeta} />
              </ErrorBoundary>
            </div>
          )}

          {/* VIEW 5: 5 R&D Simulation Labs */}
          {activeTab === 'rd_labs' && (
            <div style={{ height: '100%', overflowY: 'auto' }}>
              <ErrorBoundary>
                <RDSimulationLab rdProposals={rdProposals} />
              </ErrorBoundary>
            </div>
          )}

          {/* VIEW 6: Pipeline & Resource Monitor */}
          {activeTab === 'pipeline' && (
            <div style={{ height: '100%', overflowY: 'auto' }}>
              <ErrorBoundary>
                <PipelineMonitor progressData={progressData} />
              </ErrorBoundary>
            </div>
          )}
        </Suspense>
      </main>
    </div>
  );
}
