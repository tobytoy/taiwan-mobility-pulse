import React, { useState, useMemo } from 'react';
import { 
  TDX_TOURISM_SPOTS, 
  TOURISM_REGIONS 
} from '../data/tdxTourismMobilityData';
import { 
  Camera, Video, Play, ExternalLink, MapPin, 
  Thermometer, CloudRain, Sun, Calendar, Car, Bus, 
  Navigation, Sparkles, TrendingUp, Eye, Info, X, 
  Maximize2, Search, Filter, ShieldCheck, ChevronRight,
  Layers, Compass, Flame, AlertCircle, RefreshCw
} from 'lucide-react';

export default function TourismMobilityLab() {
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedCounty, setSelectedCounty] = useState('all');
  const [selectedViewType, setSelectedViewType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalSpot, setActiveModalSpot] = useState(null);
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [activeTab, setActiveTab] = useState('grid'); // 'grid' | 'matrix' | 'corridors'

  // Extract unique counties for current region
  const availableCounties = useMemo(() => {
    let list = TDX_TOURISM_SPOTS;
    if (selectedRegion !== 'all') {
      list = list.filter(s => s.region === selectedRegion);
    }
    const counties = Array.from(new Set(list.map(s => s.county_name))).filter(Boolean);
    return ['all', ...counties];
  }, [selectedRegion]);

  // Filtered spots
  const filteredSpots = useMemo(() => {
    return TDX_TOURISM_SPOTS.filter(s => {
      if (selectedRegion !== 'all' && s.region !== selectedRegion) return false;
      if (selectedCounty !== 'all' && s.county_name !== selectedCounty) return false;
      if (selectedViewType !== 'all' && s.view_type !== selectedViewType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = s.location.toLowerCase().includes(q);
        const matchCounty = s.county_name.toLowerCase().includes(q);
        const matchDesc = s.description.toLowerCase().includes(q);
        const matchCorridor = s.mobility_profile?.connected_corridor?.toLowerCase().includes(q);
        if (!matchName && !matchCounty && !matchDesc && !matchCorridor) return false;
      }
      return true;
    });
  }, [selectedRegion, selectedCounty, selectedViewType, searchQuery]);

  return (
    <div style={{ padding: '24px 32px', color: '#F8FAFC', minHeight: '100%', maxWidth: '1600px', margin: '0 auto' }}>
      
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '16px',
        padding: '24px 28px',
        marginBottom: '24px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '260px',
          height: '260px',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '20px', color: '#38BDF8', fontSize: '12px', fontWeight: '700', marginBottom: '10px' }}>
              <Sparkles size={14} />
              <span>觀光署 × 中央氣象署 CODiS × 高公局 eTag 大數據融合</span>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-0.5px', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>🏞️ 臺灣全域觀光名勝 × 交通動脈 × 氣候脈動決策實驗室</span>
            </h1>
            <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8', maxWidth: '900px', lineHeight: 1.6 }}>
              深度整合交通部觀光署轄下國家風景區之 <strong>74 處高畫質／4K 即時影像 (CCTV)</strong>、中央氣象署 <strong>CODiS 歷史氣候測站實測數據</strong>、高公局 <strong>eTag 車流爆發時段</strong> 與 <strong>台灣好行接駁公車</strong>。出發前秒懂現場實況、氣候舒適度與避開壅塞時段！
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px 16px', textAlign: 'center', minWidth: '95px' }}>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>即時影像鏡頭</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#38BDF8', fontFamily: 'JetBrains Mono, monospace' }}>74 處</div>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px 16px', textAlign: 'center', minWidth: '95px' }}>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>涵蓋縣市</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#10B981', fontFamily: 'JetBrains Mono, monospace' }}>14 縣市</div>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px 16px', textAlign: 'center', minWidth: '95px' }}>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>假日車流激增</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#F59E0B', fontFamily: 'JetBrains Mono, monospace' }}>+320%</div>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px 16px', textAlign: 'center', minWidth: '95px' }}>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>台灣好行接駁</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#A855F7', fontFamily: 'JetBrains Mono, monospace' }}>92 條</div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Toolbar: Regions, County, ViewType, and Search */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '14px',
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        {/* Row 1: Region Selector & Sub-Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {TOURISM_REGIONS.map(reg => {
              const active = selectedRegion === reg.id;
              return (
                <button
                  key={reg.id}
                  onClick={() => {
                    setSelectedRegion(reg.id);
                    setSelectedCounty('all');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: active ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.08)',
                    background: active ? 'rgba(56, 189, 248, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                    color: active ? '#38BDF8' : '#94A3B8',
                    fontWeight: active ? '700' : '500',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{reg.icon}</span>
                  <span>{reg.label}</span>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '6px', background: 'rgba(30, 41, 59, 0.5)', padding: '3px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            {[
              { id: 'grid', label: '📇 景點全景卡片' },
              { id: 'matrix', label: '📊 氣候與車流決策矩陣' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  background: activeTab === tab.id ? '#38BDF8' : 'transparent',
                  color: activeTab === tab.id ? '#0F172A' : '#94A3B8',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Secondary Filters & Search */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search Bar */}
          <div style={{ position: 'relative', flex: '1 1 280px', minWidth: '220px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
            <input
              type="text"
              placeholder="搜尋景點名稱、走廊 (如: 阿里山、二延平、野柳、小琉球、日月潭...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                background: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* County Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#64748B', whiteSpace: 'nowrap' }}>縣市:</span>
            <select
              value={selectedCounty}
              onChange={(e) => setSelectedCounty(e.target.value)}
              style={{
                padding: '8px 12px',
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                color: '#E2E8F0',
                fontSize: '13px',
                outline: 'none'
              }}
            >
              {availableCounties.map(c => (
                <option key={c} value={c}>{c === 'all' ? '全部縣市' : c}</option>
              ))}
            </select>
          </div>

          {/* Camera View Type Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#64748B', whiteSpace: 'nowrap' }}>鏡頭型態:</span>
            <select
              value={selectedViewType}
              onChange={(e) => setSelectedViewType(e.target.value)}
              style={{
                padding: '8px 12px',
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                color: '#E2E8F0',
                fontSize: '13px',
                outline: 'none'
              }}
            >
              <option value="all">全部鏡頭</option>
              <option value="可動型">可動型 (PTZ)</option>
              <option value="360°全景">360° 全景視角</option>
              <option value="固定視角">固定視角</option>
            </select>
          </div>

          <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#94A3B8' }}>
            顯示 <strong>{filteredSpots.length}</strong> / {TDX_TOURISM_SPOTS.length} 處風景區
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'grid' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(370px, 1fr))',
          gap: '20px'
        }}>
          {filteredSpots.map(spot => {
            const isExpanded = expandedCardId === spot.id;
            const hasYoutube = !!spot.youtube_id;

            return (
              <div
                key={spot.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.25)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
                  e.currentTarget.style.boxShadow = '0 12px 25px rgba(56, 189, 248, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.25)';
                }}
              >
                {/* CCTV Preview Header / Hero */}
                <div style={{
                  position: 'relative',
                  height: '180px',
                  background: '#0B1120',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {hasYoutube ? (
                    <img 
                      src={`https://img.youtube.com/vi/${spot.youtube_id}/hqdefault.jpg`}
                      alt={spot.location}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: 0.75,
                        transition: 'opacity 0.2s'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : null}

                  {/* Gradient Overlay */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.3) 50%, rgba(0,0,0,0.4) 100%)'
                  }} />

                  {/* Badges on Top */}
                  <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
                    <span style={{
                      padding: '3px 8px',
                      background: 'rgba(15, 23, 42, 0.85)',
                      border: '1px solid rgba(56, 189, 248, 0.4)',
                      borderRadius: '6px',
                      color: '#38BDF8',
                      fontSize: '11px',
                      fontWeight: '700'
                    }}>
                      {spot.county_name}
                    </span>
                    <span style={{
                      padding: '3px 8px',
                      background: 'rgba(15, 23, 42, 0.85)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '6px',
                      color: '#E2E8F0',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      {spot.view_type}
                    </span>
                  </div>

                  <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      background: spot.status === '運作中' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      border: `1px solid ${spot.status === '運作中' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                      borderRadius: '6px',
                      color: spot.status === '運作中' ? '#34D399' : '#F87171',
                      fontSize: '11px',
                      fontWeight: '700'
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: spot.status === '運作中' ? '#34D399' : '#F87171' }} />
                      {spot.status}
                    </span>
                  </div>

                  {/* Center Play Button Action */}
                  <button
                    onClick={() => setActiveModalSpot(spot)}
                    style={{
                      position: 'absolute',
                      zIndex: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '9px 18px',
                      background: 'rgba(239, 68, 68, 0.9)',
                      border: 'none',
                      borderRadius: '30px',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
                      transition: 'transform 0.15s ease, background 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.background = '#DC2626';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1.0)';
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.9)';
                    }}
                  >
                    <Play size={14} fill="#FFFFFF" />
                    <span>即時 CCTV 串流</span>
                  </button>

                  {/* Location Title Bottom */}
                  <div style={{ position: 'absolute', bottom: '12px', left: '16px', right: '16px', zIndex: 2 }}>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={17} color="#38BDF8" />
                      <span>{spot.location}</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  
                  {/* Spot Description */}
                  <div style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.5 }}>
                    <p style={{
                      margin: 0,
                      display: isExpanded ? 'block' : '-webkit-box',
                      WebkitLineClamp: isExpanded ? 'unset' : 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {spot.description}
                    </p>
                    {spot.description && spot.description.length > 60 && (
                      <button
                        onClick={() => setExpandedCardId(isExpanded ? null : spot.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#38BDF8',
                          fontSize: '11px',
                          padding: 0,
                          marginTop: '4px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        {isExpanded ? '收合簡介 ▲' : '展開完整簡介 ▼'}
                      </button>
                    )}
                  </div>

                  {/* Climate & Weather Block (CODiS) */}
                  <div style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#38BDF8', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Sun size={13} />
                        <span>CODiS 歷史氣候脈動</span>
                      </span>
                      <span style={{ fontSize: '10px', color: '#64748B' }}>
                        {spot.climate_profile.nearest_codis}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px' }}>
                      <div>
                        <span style={{ color: '#64748B' }}>年均溫: </span>
                        <strong style={{ color: '#F8FAFC' }}>{spot.climate_profile.annual_avg_temp}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B' }}>夏季均溫: </span>
                        <strong style={{ color: '#F8FAFC' }}>{spot.climate_profile.summer_temp}</strong>
                      </div>
                    </div>

                    <div style={{ fontSize: '11px', color: '#CBD5E1' }}>
                      <span style={{ color: '#F59E0B', fontWeight: '700' }}>最佳旅遊期: </span>
                      <span>{spot.climate_profile.best_seasons}</span>
                    </div>

                    {spot.climate_profile.climate_risk && (
                      <div style={{ fontSize: '10px', color: '#F87171', background: 'rgba(239, 68, 68, 0.1)', padding: '3px 6px', borderRadius: '4px', marginTop: '2px' }}>
                        ⚠️ {spot.climate_profile.climate_risk}
                      </div>
                    )}
                  </div>

                  {/* Mobility & Artery Block (eTag + Transit) */}
                  <div style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#10B981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Car size={13} />
                        <span>eTag 交通流向與疏運</span>
                      </span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '800',
                        color: '#F59E0B',
                        background: 'rgba(245, 158, 11, 0.15)',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontFamily: 'JetBrains Mono, monospace'
                      }}>
                        假日 {spot.mobility_profile.holiday_surge}
                      </span>
                    </div>

                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                      <span style={{ color: '#64748B' }}>聯外走廊: </span>
                      <strong style={{ color: '#E2E8F0' }}>{spot.mobility_profile.connected_corridor}</strong>
                    </div>

                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                      <span style={{ color: '#64748B' }}>尖峰湧浪: </span>
                      <span style={{ color: '#CBD5E1' }}>{spot.mobility_profile.peak_hours}</span>
                    </div>

                    <div style={{ fontSize: '11px', color: '#94A3B8', borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '5px', marginTop: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#A855F7', fontWeight: '700', marginBottom: '2px' }}>
                        <Bus size={12} />
                        <span>大眾運輸與台灣好行接駁:</span>
                      </div>
                      <div style={{ color: '#E2E8F0' }}>
                        {spot.mobility_profile.transit_routes}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '8px' }}>
                    <div style={{ fontSize: '10px', color: '#64748B' }}>
                      更新週期: 每日同步
                    </div>

                    <button
                      onClick={() => setActiveModalSpot(spot)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 12px',
                        background: 'rgba(56, 189, 248, 0.15)',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        borderRadius: '6px',
                        color: '#38BDF8',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      <span>觀看現場 CCTV</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Matrix Decision View */
        <div style={{
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '24px',
          overflowX: 'auto'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#FFFFFF' }}>
              📊 全台觀光熱點假日車流爆發比 vs 氣候適宜度矩陣
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8' }}>
              對比各地景點之 eTag 假期擁擠程度、最佳造訪期、歷史均溫與大眾運輸可及性，輔助旅運決策。
            </p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.12)', color: '#64748B', fontSize: '11px', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 14px' }}>景點名稱</th>
                <th style={{ padding: '12px 14px' }}>縣市/分區</th>
                <th style={{ padding: '12px 14px' }}>鏡頭型態</th>
                <th style={{ padding: '12px 14px' }}>假日車流激增</th>
                <th style={{ padding: '12px 14px' }}>年均溫 / 夏季</th>
                <th style={{ padding: '12px 14px' }}>最佳造訪期</th>
                <th style={{ padding: '12px 14px' }}>主要接駁運具</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredSpots.map(s => (
                <tr 
                  key={s.id}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px 14px', fontWeight: '700', color: '#FFFFFF' }}>
                    {s.location}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#94A3B8' }}>
                    {s.county_name}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: '11px', padding: '2px 6px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', color: '#CBD5E1' }}>
                      {s.view_type}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: '800', color: '#F59E0B', fontFamily: 'JetBrains Mono, monospace' }}>
                    {s.mobility_profile.holiday_surge}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#E2E8F0' }}>
                    {s.climate_profile.annual_avg_temp} / {s.climate_profile.summer_temp.split(' ')[0]}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#38BDF8' }}>
                    {s.climate_profile.best_seasons}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#A855F7' }}>
                    {s.mobility_profile.transit_routes}
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    <button
                      onClick={() => setActiveModalSpot(s)}
                      style={{
                        padding: '4px 10px',
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        borderRadius: '6px',
                        color: '#F87171',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      開啟 CCTV
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CCTV Interactive Modal Player */}
      {activeModalSpot && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{
            background: '#0F172A',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '20px',
            maxWidth: '1000px',
            width: '100%',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(30, 41, 59, 0.6)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  padding: '4px 10px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '6px',
                  color: '#EF4444',
                  fontSize: '12px',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
                  LIVE 直播
                </span>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#FFFFFF' }}>
                  {activeModalSpot.location}（{activeModalSpot.county_name}）
                </h2>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  鏡頭型態: {activeModalSpot.view_type}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {activeModalSpot.live_url && (
                  <a
                    href={activeModalSpot.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '6px',
                      color: '#38BDF8',
                      fontSize: '12px',
                      textDecoration: 'none',
                      fontWeight: '600'
                    }}
                  >
                    <span>YouTube 官網開啟</span>
                    <ExternalLink size={13} />
                  </a>
                )}
                <button
                  onClick={() => setActiveModalSpot(null)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body: Embedded Video + Stats Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
              {/* 16:9 Video Player */}
              <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000000' }}>
                {activeModalSpot.embed_player_url ? (
                  <iframe
                    src={activeModalSpot.embed_player_url}
                    title={activeModalSpot.location}
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
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '12px',
                    color: '#94A3B8'
                  }}>
                    <Video size={40} />
                    <div>此即時影像無直接嵌入識別碼</div>
                    <a
                      href={activeModalSpot.live_url || activeModalSpot.iframe_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#38BDF8', textDecoration: 'underline' }}
                    >
                      點擊前往官方影像串流
                    </a>
                  </div>
                )}
              </div>

              {/* Bottom Info Grid in Modal */}
              <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', background: 'rgba(15, 23, 42, 0.95)' }}>
                {/* Tourism Description */}
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#38BDF8', marginBottom: '6px' }}>
                    景點介紹與特色
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.6, maxHeight: '110px', overflowY: 'auto' }}>
                    {activeModalSpot.description || '無詳細描述'}
                  </div>
                </div>

                {/* Climate Insights */}
                <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#F59E0B', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sun size={14} />
                    <span>CODiS 氣象數據與適遊指標</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#E2E8F0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>測站: {activeModalSpot.climate_profile.nearest_codis}</div>
                    <div>四季均溫: {activeModalSpot.climate_profile.annual_avg_temp} (夏季 {activeModalSpot.climate_profile.summer_temp})</div>
                    <div>最佳造訪期: <strong style={{ color: '#38BDF8' }}>{activeModalSpot.climate_profile.best_seasons}</strong></div>
                    <div style={{ color: '#F87171' }}>防汛/坍方警示: {activeModalSpot.climate_profile.climate_risk}</div>
                  </div>
                </div>

                {/* Mobility & Artery */}
                <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#10B981', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Car size={14} />
                    <span>eTag 交通走廊與台灣好行接駁</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#E2E8F0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>主要走廊: {activeModalSpot.mobility_profile.connected_corridor}</div>
                    <div>假日暴增: <strong style={{ color: '#F59E0B' }}>{activeModalSpot.mobility_profile.holiday_surge}</strong></div>
                    <div>去/回程尖峰: {activeModalSpot.mobility_profile.peak_hours}</div>
                    <div>大眾接駁: <strong style={{ color: '#A855F7' }}>{activeModalSpot.mobility_profile.transit_routes}</strong></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
