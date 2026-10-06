import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Train, Users, Clock, Navigation, MapPin, 
  TrendingUp, Award, ShieldAlert, ArrowRight, CheckCircle2,
  Activity, DollarSign, Calendar, Zap, AlertTriangle,
  Shuffle, Layers, ShieldCheck, Search, Filter,
  ArrowUpRight, BarChart3, Compass, RefreshCw, Cpu
} from 'lucide-react';

export default function UnsupervisedRailLab() {
  const [activeMainSection, setActiveMainSection] = useState('personas'); // 'personas' or 'corridors'
  const [personasData, setPersonasData] = useState(null);
  const [corridorsData, setCorridorsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Personas State
  const [selectedClusterId, setSelectedClusterId] = useState(null);
  const [pcaFilterCluster, setPcaFilterCluster] = useState('all'); // 'all' or cluster id

  // Corridors State
  const [selectedCorridorId, setSelectedCorridorId] = useState(null);
  const [corridorFilterCategory, setCorridorFilterCategory] = useState('all');

  useEffect(() => {
    const baseUrl = import.meta.env.BASE_URL || '/';
    const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

    Promise.all([
      fetch(`${cleanBase}unsupervised_personas.json`).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status} fetching personas`);
        return r.json();
      }),
      fetch(`${cleanBase}corridor_recommendations.json`).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status} fetching corridors`);
        return r.json();
      })
    ])
      .then(([pData, cData]) => {
        setPersonasData(pData);
        setCorridorsData(cData);
        if (pData?.clusters?.length > 0) {
          setSelectedClusterId(pData.clusters[0].id);
        }
        if (cData?.corridors?.length > 0) {
          setSelectedCorridorId(cData.corridors[0].id);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load unsupervised lab data:', err);
        setFetchError('資料讀取失敗，請確認資料檔已生成並重新整理。');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '700px',
        color: '#38BDF8',
        fontFamily: 'Outfit, sans-serif'
      }}>
        <div style={{ fontSize: '36px', marginBottom: '16px', animation: 'spin 1.5s infinite linear' }}>
          <Cpu size={40} />
        </div>
        <div style={{ fontSize: '18px', fontWeight: '700' }}>載入 AI 非監督學習與軌道走廊大數據分析中...</div>
        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>
          讀取 32.7 萬活躍卡片 K-Means 模型與全台 4.48 億筆跨運具旅次矩陣
        </div>
      </div>
    );
  }

  if (fetchError || !personasData || !corridorsData) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#EF4444' }}>
        <AlertTriangle size={48} style={{ margin: '0 auto 16px' }} />
        <div style={{ fontSize: '18px', fontWeight: '700' }}>{fetchError || '無法載入分析數據'}</div>
      </div>
    );
  }

  const selectedCluster = personasData.clusters.find(c => c.id === selectedClusterId) || personasData.clusters[0];
  const selectedCorridor = corridorsData.corridors.find(c => c.id === selectedCorridorId) || corridorsData.corridors[0];

  // Filter corridors
  const filteredCorridors = corridorFilterCategory === 'all' 
    ? corridorsData.corridors 
    : corridorsData.corridors.filter(c => {
        if (corridorFilterCategory === 'urgent') return c.priority_score >= 94;
        if (corridorFilterCategory === 'high') return c.priority_score >= 90 && c.priority_score < 94;
        if (corridorFilterCategory === 'metro') return c.proposed_solution.system_type.includes('捷運');
        if (corridorFilterCategory === 'hsr') return c.proposed_solution.system_type.includes('高鐵');
        return true;
      });

  return (
    <div style={{
      width: '100%',
      maxWidth: '1560px',
      margin: '0 auto',
      padding: '24px 28px 60px',
      color: '#F8FAFC',
      fontFamily: 'Outfit, -apple-system, sans-serif',
      boxSizing: 'border-box'
    }}>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.85) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '16px',
        padding: '24px 28px',
        marginBottom: '24px',
        boxShadow: '0 10px 35px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(12px)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-60px',
          right: '-40px',
          width: '280px',
          height: '280px',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, rgba(168, 85, 247, 0.05) 70%, transparent 100%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #0284C7, #9333EA)',
                borderRadius: '8px',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)'
              }}>
                <Cpu size={22} color="#FFFFFF" />
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: '900', margin: 0, letterSpacing: '-0.02em', color: '#F8FAFC' }}>
                AI 非監督客群分群與軌道推薦決策實驗室
              </h1>
              <span style={{
                fontSize: '11px',
                fontWeight: '700',
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38BDF8',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '2px 8px',
                borderRadius: '20px'
              }}>
                K-Means (K=6) + PCA 2D
              </span>
              <span style={{
                fontSize: '11px',
                fontWeight: '700',
                background: 'rgba(168, 85, 247, 0.15)',
                color: '#C084FC',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                padding: '2px 8px',
                borderRadius: '20px'
              }}>
                七大全台軌道建設走廊
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '13.5px', color: '#94A3B8', maxWidth: '920px', lineHeight: '1.6' }}>
              突破傳統「官方卡別」預設標籤！利用真實票卡刷卡時序、搭乘站數、TPASS 依賴度、週末活躍性進行高維無監督分群；並交叉比對台鐵、高鐵、北捷與國道客運大數據，精準量化高轉乘摩擦走廊，提供具備實證效益之新闢捷運與高鐵增班決策依據。
            </p>
          </div>

          {/* Main Module Switcher (Personas vs Rail Corridors) */}
          <div style={{
            display: 'flex',
            background: 'rgba(15, 23, 42, 0.8)',
            padding: '4px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.12)'
          }}>
            <button
              id="tab-btn-personas"
              onClick={() => setActiveMainSection('personas')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '9px',
                border: 'none',
                background: activeMainSection === 'personas' ? 'linear-gradient(135deg, #0284C7, #2563EB)' : 'transparent',
                color: activeMainSection === 'personas' ? '#FFFFFF' : '#94A3B8',
                fontSize: '13.5px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: activeMainSection === 'personas' ? '0 4px 15px rgba(2, 132, 199, 0.4)' : 'none'
              }}
            >
              <Users size={16} />
              <span>👥 AI 乘客真實畫像 (6大分群)</span>
            </button>
            <button
              id="tab-btn-corridors"
              onClick={() => setActiveMainSection('corridors')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '9px',
                border: 'none',
                background: activeMainSection === 'corridors' ? 'linear-gradient(135deg, #7C3AED, #9333EA)' : 'transparent',
                color: activeMainSection === 'corridors' ? '#FFFFFF' : '#94A3B8',
                fontSize: '13.5px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: activeMainSection === 'corridors' ? '0 4px 15px rgba(124, 58, 237, 0.4)' : 'none'
              }}
            >
              <Train size={16} />
              <span>🚄 全台軌道／捷運／高鐵決策 (7大走廊)</span>
            </button>
          </div>
        </div>

        {/* Global Pipeline Statistics Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginTop: '20px',
          paddingTop: '18px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>抽樣分析交易母體</div>
            <div style={{ fontSize: '17px', fontWeight: '800', color: '#38BDF8', fontFamily: 'JetBrains Mono, monospace' }}>
              {personasData.metadata.sample_trips_analyzed?.toLocaleString()} 筆
            </div>
            <div style={{ fontSize: '10px', color: '#64748B' }}>涵蓋早晚峰、離峰與週末全時段</div>
          </div>
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>活躍分群票卡總數</div>
            <div style={{ fontSize: '17px', fontWeight: '800', color: '#10B981', fontFamily: 'JetBrains Mono, monospace' }}>
              {personasData.metadata.unique_cards_clustered?.toLocaleString()} 張
            </div>
            <div style={{ fontSize: '10px', color: '#64748B' }}>至少搭乘 3 次之習慣穩固票卡</div>
          </div>
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>非典型身分發現率</div>
            <div style={{ fontSize: '17px', fontWeight: '800', color: '#F59E0B', fontFamily: 'JetBrains Mono, monospace' }}>
              40.1% 普通卡
            </div>
            <div style={{ fontSize: '10px', color: '#64748B' }}>普通卡呈現白晝醫療生活作息</div>
          </div>
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>最高單趟節省時間</div>
            <div style={{ fontSize: '17px', fontWeight: '800', color: '#EC4899', fontFamily: 'JetBrains Mono, monospace' }}>
              70 分鐘 (北宜高鐵)
            </div>
            <div style={{ fontSize: '10px', color: '#64748B' }}>南港直達宜蘭避開雪隧塞車</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: AI UNSUPERVISED PERSONAS VIEW                                  */}
      {/* ========================================================================= */}
      {activeMainSection === 'personas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Cluster Selection Cards Carousel */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="#38BDF8" />
                <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#F8FAFC' }}>
                  機器學習萃取之 6 大真實乘客習慣分群 (點擊卡片切換深入解析)
                </h3>
              </div>
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                依活躍卡片規模由大至小排列
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '12px'
            }}>
              {personasData.clusters.map(cluster => {
                const isSelected = cluster.id === selectedCluster.id;
                return (
                  <div
                    key={cluster.id}
                    id={`cluster-card-${cluster.id}`}
                    onClick={() => {
                      setSelectedClusterId(cluster.id);
                      setPcaFilterCluster(cluster.id);
                    }}
                    style={{
                      background: isSelected 
                        ? `linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))`
                        : 'rgba(30, 41, 59, 0.5)',
                      border: isSelected ? `2px solid ${cluster.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: isSelected ? `0 8px 24px ${cluster.color}33` : 'none',
                      transform: isSelected ? 'translateY(-2px)' : 'none',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '4px',
                      height: '100%',
                      backgroundColor: cluster.color
                    }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{
                        fontSize: '10.5px',
                        fontWeight: '800',
                        backgroundColor: `${cluster.color}22`,
                        color: cluster.color,
                        padding: '2px 8px',
                        borderRadius: '12px',
                        border: `1px solid ${cluster.color}44`
                      }}>
                        Cluster #{cluster.id}
                      </span>
                      <span style={{ fontSize: '16px', fontWeight: '900', color: '#FFFFFF', fontFamily: 'JetBrains Mono, monospace' }}>
                        {cluster.percentage}%
                      </span>
                    </div>

                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#F8FAFC', marginBottom: '4px' }}>
                      {cluster.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '12px', lineHeight: '1.4' }}>
                      {cluster.subtitle}
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '8px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                      fontSize: '11px',
                      color: '#64748B'
                    }}>
                      <span>活躍票卡數</span>
                      <span style={{ fontWeight: '700', color: '#E2E8F0', fontFamily: 'JetBrains Mono, monospace' }}>
                        {cluster.card_count.toLocaleString()} 張
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deep Dive Details of Selected Cluster */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 1.3fr',
            gap: '24px'
          }}>
            {/* Left Panel: PCA 2D Latent Space & 24hr Curve */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* PCA Latent Space Scatter View */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '20px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#F8FAFC', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Compass size={16} color="#38BDF8" />
                      <span>PCA 2維高維特徵流形投影 (Latent Feature Space)</span>
                    </h4>
                    <div style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '2px' }}>
                      解釋變異量: PC1 ({((personasData.metadata.variance_explained_2d?.[0] || 0.28) * 100).toFixed(1)}%) + PC2 ({((personasData.metadata.variance_explained_2d?.[1] || 0.21) * 100).toFixed(1)}%)
                    </div>
                  </div>

                  {/* Filter PCA toggle */}
                  <div style={{ display: 'flex', gap: '4px', background: 'rgba(30, 41, 59, 0.7)', padding: '2px', borderRadius: '6px' }}>
                    <button
                      id="pca-toggle-selected"
                      onClick={() => setPcaFilterCluster(selectedCluster.id)}
                      style={{
                        padding: '3px 8px',
                        fontSize: '11px',
                        fontWeight: '700',
                        borderRadius: '4px',
                        border: 'none',
                        background: pcaFilterCluster === selectedCluster.id ? selectedCluster.color : 'transparent',
                        color: pcaFilterCluster === selectedCluster.id ? '#0F172A' : '#94A3B8',
                        cursor: 'pointer'
                      }}
                    >
                      僅看本群
                    </button>
                    <button
                      id="pca-toggle-all"
                      onClick={() => setPcaFilterCluster('all')}
                      style={{
                        padding: '3px 8px',
                        fontSize: '11px',
                        fontWeight: '700',
                        borderRadius: '4px',
                        border: 'none',
                        background: pcaFilterCluster === 'all' ? '#38BDF8' : 'transparent',
                        color: pcaFilterCluster === 'all' ? '#0F172A' : '#94A3B8',
                        cursor: 'pointer'
                      }}
                    >
                      全體流形
                    </button>
                  </div>
                </div>

                {/* SVG PCA Scatter Plot */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '270px',
                  backgroundColor: '#090D16',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  overflow: 'hidden'
                }}>
                  <svg width="100%" height="100%" viewBox="-4 -4 8 8" style={{ transform: 'scale(1, -1)' }}>
                    {/* Grid lines */}
                    <line x1="-4" y1="0" x2="4" y2="0" stroke="rgba(255,255,255,0.08)" strokeWidth="0.03" />
                    <line x1="0" y1="-4" x2="0" y2="4" stroke="rgba(255,255,255,0.08)" strokeWidth="0.03" />
                    <circle cx="0" cy="0" r="1.5" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.02" />
                    <circle cx="0" cy="0" r="3" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.02" />

                    {/* Points for all or selected clusters */}
                    {personasData.clusters.map(c => {
                      if (pcaFilterCluster !== 'all' && pcaFilterCluster !== c.id) return null;
                      const isCurrent = c.id === selectedCluster.id;
                      return (
                        <g key={c.id}>
                          {c.scatter_points?.map((pt, i) => (
                            <circle
                              key={i}
                              cx={Math.max(-3.8, Math.min(3.8, pt.pca_x * 0.9))}
                              cy={Math.max(-3.8, Math.min(3.8, pt.pca_y * 0.9))}
                              r={isCurrent ? 0.08 : 0.05}
                              fill={c.color}
                              opacity={isCurrent ? 0.85 : 0.35}
                            />
                          ))}
                        </g>
                      );
                    })}
                  </svg>

                  {/* Corner Labels */}
                  <div style={{ position: 'absolute', bottom: '6px', left: '10px', fontSize: '10px', color: '#64748B' }}>
                    PC1 (通勤尖峰 ↔ 離峰休閒)
                  </div>
                  <div style={{ position: 'absolute', top: '8px', right: '10px', fontSize: '10px', color: '#64748B' }}>
                    PC2 (TPASS 吃到飽 ↔ 逐次扣款)
                  </div>
                </div>

                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📌 機器學習聚類可清楚見到 6 個群集的拓撲分化邊界，證明搭乘模式具有顯著客群區隔度。</span>
                </div>
              </div>

              {/* 24-hr Departure Curve */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '20px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#F8FAFC', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={16} color={selectedCluster.color} />
                    <span>24 小時出發時間曲線 ({selectedCluster.name})</span>
                  </h4>
                  <span style={{ fontSize: '11px', color: selectedCluster.color, fontWeight: '700' }}>
                    每小時佔全日百分比 (%)
                  </span>
                </div>

                {/* Bar Chart 24 Hours */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '3px',
                  height: '140px',
                  padding: '10px 4px 0',
                  background: 'rgba(9, 13, 22, 0.6)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  {selectedCluster.hourly_profile?.map(item => {
                    const maxPct = Math.max(...selectedCluster.hourly_profile.map(p => p.percentage), 12);
                    const barHeight = Math.max(4, (item.percentage / maxPct) * 110);
                    const isRush = item.hour === 8 || item.hour === 18;
                    const isMidday = item.hour >= 11 && item.hour <= 14;

                    return (
                      <div
                        key={item.hour}
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          height: '100%',
                          justifyContent: 'flex-end'
                        }}
                        title={`${item.hour}:00 - ${item.percentage}%`}
                      >
                        <div
                          style={{
                            width: '100%',
                            height: `${barHeight}px`,
                            backgroundColor: isRush ? '#F43F5E' : isMidday ? '#F59E0B' : selectedCluster.color,
                            borderRadius: '3px 3px 0 0',
                            transition: 'height 0.3s ease',
                            opacity: 0.9
                          }}
                        />
                        <span style={{ fontSize: '9px', color: '#64748B', fontFamily: 'JetBrains Mono, monospace' }}>
                          {item.hour % 3 === 0 ? item.hour : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '10px', fontSize: '11px', color: '#94A3B8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#F43F5E', borderRadius: '2px' }} />
                    <span>上下班雙峰 (08, 18時)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#F59E0B', borderRadius: '2px' }} />
                    <span>午間離峰醫療採買 (11-14時)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel: Behavioral Radar Chart, Official Card breakdown, Top Routes & Policy */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Radar Chart & High-Level Metrics */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '20px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '900', color: selectedCluster.color, margin: 0 }}>
                        {selectedCluster.name}
                      </h3>
                      <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                        佔全體 {selectedCluster.percentage}%
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '12.5px', color: '#CBD5E1', lineHeight: '1.5' }}>
                      {selectedCluster.description}
                    </p>
                  </div>
                </div>

                {/* Behavioral Metrics Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '10px',
                  marginBottom: '20px'
                }}>
                  <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>尖峰時段佔比</div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#38BDF8', fontFamily: 'JetBrains Mono, monospace' }}>
                      {(selectedCluster.metrics.peak_ratio * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>午間離峰佔比</div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#F59E0B', fontFamily: 'JetBrains Mono, monospace' }}>
                      {(selectedCluster.metrics.midday_ratio * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>深夜出行佔比</div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#A855F7', fontFamily: 'JetBrains Mono, monospace' }}>
                      {(selectedCluster.metrics.night_ratio * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>平均單趟搭乘站數</div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#10B981', fontFamily: 'JetBrains Mono, monospace' }}>
                      {selectedCluster.metrics.avg_stops.toFixed(1)} 站
                    </div>
                  </div>
                </div>

                {/* Behavioral Radar Chart Visual */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                  padding: '14px',
                  backgroundColor: 'rgba(9, 13, 22, 0.5)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  {/* SVG Radar */}
                  <div style={{ width: '180px', height: '180px', position: 'relative' }}>
                    <svg width="180" height="180" viewBox="-100 -100 200 200">
                      {/* Polygon background webs */}
                      {[0.25, 0.5, 0.75, 1.0].map((level, idx) => (
                        <circle
                          key={idx}
                          cx="0"
                          cy="0"
                          r={level * 80}
                          fill="none"
                          stroke="rgba(255,255,255,0.08)"
                          strokeWidth="1"
                        />
                      ))}

                      {/* Radar Axes (6 directions) */}
                      {['尖峰', '午間', '夜間', '週末', '站數', 'TPASS'].map((label, idx) => {
                        const angle = (idx * 60 - 90) * (Math.PI / 180);
                        const x = Math.cos(angle) * 80;
                        const y = Math.sin(angle) * 80;
                        return (
                          <line
                            key={label}
                            x1="0"
                            y1="0"
                            x2={x}
                            y2={y}
                            stroke="rgba(255,255,255,0.12)"
                            strokeWidth="1"
                          />
                        );
                      })}

                      {/* Cluster Radar Polygon */}
                      {(() => {
                        const r = selectedCluster.radar;
                        const vals = [
                          r.peak_intensity,
                          r.midday_activity,
                          r.night_mobility,
                          r.weekend_frequency,
                          r.trip_distance,
                          r.tpass_loyalty
                        ];
                        const points = vals.map((v, idx) => {
                          const angle = (idx * 60 - 90) * (Math.PI / 180);
                          const radius = (Math.min(100, Math.max(10, v)) / 100) * 80;
                          return `${Math.cos(angle) * radius},${Math.sin(angle) * radius}`;
                        }).join(' ');

                        return (
                          <polygon
                            points={points}
                            fill={`${selectedCluster.color}33`}
                            stroke={selectedCluster.color}
                            strokeWidth="2.5"
                          />
                        );
                      })()}
                    </svg>
                  </div>

                  {/* Radar Labels & Explanations */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '160px' }}>
                      <span style={{ color: '#94A3B8' }}>尖峰集中度:</span>
                      <span style={{ fontWeight: '700', color: '#F8FAFC' }}>{selectedCluster.radar.peak_intensity}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '160px' }}>
                      <span style={{ color: '#94A3B8' }}>白晝活躍度:</span>
                      <span style={{ fontWeight: '700', color: '#F8FAFC' }}>{selectedCluster.radar.midday_activity}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '160px' }}>
                      <span style={{ color: '#94A3B8' }}>深夜出行率:</span>
                      <span style={{ fontWeight: '700', color: '#F8FAFC' }}>{selectedCluster.radar.night_mobility}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '160px' }}>
                      <span style={{ color: '#94A3B8' }}>跨區行駛長度:</span>
                      <span style={{ fontWeight: '700', color: '#F8FAFC' }}>{selectedCluster.radar.trip_distance}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '160px' }}>
                      <span style={{ color: '#94A3B8' }}>TPASS 忠誠度:</span>
                      <span style={{ fontWeight: '700', color: '#38BDF8' }}>{selectedCluster.radar.tpass_loyalty}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Official Card Type vs True Behavior Breakdown */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '20px',
                backdropFilter: 'blur(10px)'
              }}>
                <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#F8FAFC', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} color="#10B981" />
                  <span>身分卡別組成交叉驗證 (為何行為分群勝過官方票種？)</span>
                </h4>

                {/* Stacked Breakdown Bar */}
                <div style={{
                  display: 'flex',
                  height: '24px',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  marginBottom: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
                }}>
                  {selectedCluster.dominant_card_types?.map((h, i) => {
                    const colors = ['#38BDF8', '#F59E0B', '#10B981', '#A855F7', '#EC4899'];
                    return (
                      <div
                        key={h.code}
                        style={{
                          width: `${h.percentage}%`,
                          backgroundColor: colors[i % colors.length],
                          title: `${h.label}: ${h.percentage}%`
                        }}
                      />
                    );
                  })}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                  {selectedCluster.dominant_card_types?.map((h, i) => {
                    const colors = ['#38BDF8', '#F59E0B', '#10B981', '#A855F7', '#EC4899'];
                    return (
                      <div key={h.code} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px' }}>
                        <div style={{ width: '10px', height: '10px', backgroundColor: colors[i % colors.length], borderRadius: '2px' }} />
                        <span style={{ color: '#E2E8F0', fontWeight: '600' }}>{h.label}</span>
                        <span style={{ color: '#94A3B8', fontFamily: 'JetBrains Mono, monospace' }}>{h.percentage}%</span>
                      </div>
                    );
                  })}
                </div>

                {/* Top Routes Tags */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '11.5px', color: '#94A3B8', marginBottom: '6px' }}>
                    🚌 該客群最常搭乘主力公車路線 (Top 5 Routes)：
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedCluster.top_routes?.map((r, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '11.5px',
                          fontWeight: '700',
                          backgroundColor: 'rgba(56, 189, 248, 0.12)',
                          color: '#38BDF8',
                          border: '1px solid rgba(56, 189, 248, 0.25)',
                          padding: '3px 8px',
                          borderRadius: '6px'
                        }}
                      >
                        {r.route} 號公車 ({r.trips?.toLocaleString()} 次)
                      </span>
                    ))}
                  </div>
                </div>

                {/* Policy Recommendation Callout */}
                <div style={{
                  backgroundColor: 'rgba(2, 132, 199, 0.12)',
                  border: '1px solid rgba(2, 132, 199, 0.3)',
                  borderRadius: '10px',
                  padding: '12px 14px'
                }}>
                  <div style={{ fontSize: '11px', color: '#38BDF8', fontWeight: '800', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Zap size={14} />
                    <span>交通運營決策與排班建議</span>
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#F1F5F9', lineHeight: '1.5' }}>
                    {selectedCluster.policy_recommendation}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: ALL-TAIWAN RAIL & METRO CORRIDOR DECISION LAB                  */}
      {/* ========================================================================= */}
      {activeMainSection === 'corridors' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Top Filter Bar */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(15, 23, 42, 0.7)',
            padding: '12px 18px',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={16} color="#A855F7" />
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#E2E8F0' }}>走廊急迫性與運具篩選：</span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {[
                { id: 'all', label: '全部 7 大走廊' },
                { id: 'urgent', label: '🔥 極急迫 (評分 >= 94)' },
                { id: 'high', label: '⚡ 高急迫 (評分 90-93)' },
                { id: 'metro', label: '🚇 捷運新闢與延伸' },
                { id: 'hsr', label: '🚅 高鐵捷運化與直達' }
              ].map(f => (
                <button
                  key={f.id}
                  id={`filter-corridor-${f.id}`}
                  onClick={() => setCorridorFilterCategory(f.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: corridorFilterCategory === f.id ? 'linear-gradient(135deg, #7C3AED, #9333EA)' : 'rgba(30, 41, 59, 0.7)',
                    color: corridorFilterCategory === f.id ? '#FFFFFF' : '#94A3B8',
                    fontSize: '12px',
                    fontWeight: corridorFilterCategory === f.id ? '700' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main 2-Column Layout: Left List of Corridors, Right Deep Dive Simulator */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1.6fr',
            gap: '24px'
          }}>
            {/* Left Column: Corridor Selection Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredCorridors.map(c => {
                const isSelected = c.id === selectedCorridor.id;
                const isUrgent = c.priority_score >= 94;

                return (
                  <div
                    key={c.id}
                    id={`corridor-card-${c.id}`}
                    onClick={() => setSelectedCorridorId(c.id)}
                    style={{
                      background: isSelected 
                        ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))' 
                        : 'rgba(30, 41, 59, 0.45)',
                      border: isSelected ? '2px solid #A855F7' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 8px 25px rgba(168, 85, 247, 0.25)' : 'none',
                      transform: isSelected ? 'translateX(4px)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '800',
                          backgroundColor: isUrgent ? 'rgba(239, 68, 68, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                          color: isUrgent ? '#F87171' : '#C084FC',
                          padding: '2px 8px',
                          borderRadius: '10px'
                        }}>
                          {c.urgency}
                        </span>
                        <span style={{ fontSize: '11px', color: '#94A3B8' }}>{c.category}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '10px', color: '#64748B' }}>評分</span>
                        <span style={{
                          fontSize: '15px',
                          fontWeight: '900',
                          color: isUrgent ? '#F43F5E' : '#A855F7',
                          fontFamily: 'JetBrains Mono, monospace'
                        }}>
                          {c.priority_score}
                        </span>
                      </div>
                    </div>

                    <div style={{ fontSize: '15.5px', fontWeight: '800', color: '#F8FAFC', marginBottom: '6px' }}>
                      {c.title}
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12px',
                      color: '#94A3B8',
                      marginBottom: '10px'
                    }}>
                      <MapPin size={13} color="#38BDF8" />
                      <span style={{ color: '#E2E8F0', fontWeight: '600' }}>{c.origin}</span>
                      <ArrowRight size={12} color="#64748B" />
                      <span style={{ color: '#E2E8F0', fontWeight: '600' }}>{c.destination}</span>
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '8px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                      fontSize: '11.5px'
                    }}>
                      <span style={{ color: '#64748B' }}>{c.big_data_evidence.period_trips_label}</span>
                      <span style={{ color: '#10B981', fontWeight: '700' }}>
                        省 {c.proposed_solution.time_saved_minutes} 分鐘
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: In-Depth Corridor Blueprint & Simulation */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: '16px',
              padding: '24px',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)'
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      background: 'rgba(168, 85, 247, 0.2)',
                      color: '#C084FC',
                      padding: '2px 8px',
                      borderRadius: '6px'
                    }}>
                      {selectedCorridor.category}
                    </span>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>走廊代號: {selectedCorridor.id}</span>
                  </div>
                  <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#F8FAFC', margin: 0 }}>
                    {selectedCorridor.title}
                  </h2>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>綜合決策優先評分</div>
                  <div style={{ fontSize: '26px', fontWeight: '900', color: '#A855F7', fontFamily: 'JetBrains Mono, monospace' }}>
                    {selectedCorridor.priority_score} <span style={{ fontSize: '13px', color: '#64748B' }}>/ 100</span>
                  </div>
                </div>
              </div>

              {/* Travel Time Before vs After Graphic */}
              <div style={{
                background: 'rgba(9, 13, 22, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#E2E8F0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={15} color="#38BDF8" />
                    <span>尖峰單趟旅行耗時大幅縮減 (Travel Time Savings)</span>
                  </span>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '800',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10B981',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}>
                    省下 {selectedCorridor.proposed_solution.time_saved_minutes} 分鐘 (大幅加速!)
                  </span>
                </div>

                {/* Progress bar comparison */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Current */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#94A3B8', marginBottom: '4px' }}>
                      <span>🔴 現況公路客運/多次轉乘耗時 (含塞車風險)</span>
                      <span style={{ color: '#F87171', fontWeight: '700' }}>{selectedCorridor.proposed_solution.travel_time_before}</span>
                    </div>
                    <div style={{ height: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{ width: '92%', height: '100%', background: 'linear-gradient(90deg, #EF4444, #F87171)', borderRadius: '5px' }} />
                    </div>
                  </div>

                  {/* Future */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#94A3B8', marginBottom: '4px' }}>
                      <span>🟢 建議軌道建設後直達車程 (準點不可替代)</span>
                      <span style={{ color: '#34D399', fontWeight: '700' }}>{selectedCorridor.proposed_solution.travel_time_after}</span>
                    </div>
                    <div style={{ height: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.max(25, 92 - (selectedCorridor.proposed_solution.time_saved_minutes / 70) * 60)}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #10B981, #34D399)',
                        borderRadius: '5px'
                      }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Big Data Evidence Details */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#38BDF8', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BarChart3 size={15} />
                  <span>交通部票證大數據實證依據 (Big Data Evidence)</span>
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '2px' }}>實際統計旅次規模</div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#F8FAFC' }}>
                      {selectedCorridor.big_data_evidence.period_trips_label}
                    </div>
                  </div>
                  <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '2px' }}>運具移轉效益預測</div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#10B981' }}>
                      {selectedCorridor.proposed_solution.projected_modal_shift}
                    </div>
                  </div>
                </div>

                <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px', padding: '12px', marginBottom: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#F87171', fontWeight: '800', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertTriangle size={13} />
                    <span>現況瓶頸與轉乘摩擦</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#E2E8F0', lineHeight: '1.5' }}>
                    {selectedCorridor.big_data_evidence.current_bottleneck}
                  </div>
                </div>

                <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#FBBF24', fontWeight: '800', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldAlert size={13} />
                    <span>國道／公路客運壅塞實況</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#E2E8F0', lineHeight: '1.5' }}>
                    {selectedCorridor.big_data_evidence.bus_congestion}
                  </div>
                </div>
              </div>

              {/* Proposed Infrastructure Project Card */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(56, 189, 248, 0.1))',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <div style={{ fontSize: '11px', color: '#C084FC', fontWeight: '800', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Train size={14} />
                  <span>建議新闢／增班軌道方案規格</span>
                </div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#FFFFFF', marginBottom: '6px' }}>
                  {selectedCorridor.proposed_solution.recommended_project}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '12px', color: '#CBD5E1', marginBottom: '8px' }}>
                  <span style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '4px' }}>
                    系統運量: {selectedCorridor.proposed_solution.system_type}
                  </span>
                  <span style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '4px' }}>
                    發車規格: {selectedCorridor.proposed_solution.peak_headway}
                  </span>
                </div>
                <div style={{ fontSize: '12.5px', color: '#E2E8F0', lineHeight: '1.5', marginTop: '6px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <strong>戰略定位：</strong> {selectedCorridor.strategic_impact}
                </div>
              </div>

              {/* Stylized Transit Route Schematic */}
              <div style={{
                background: '#090D16',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '10px',
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', zIndex: 2 }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#38BDF8', border: '2px solid #FFFFFF' }} />
                  <div>
                    <div style={{ fontSize: '10px', color: '#94A3B8' }}>起點端</div>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#F8FAFC' }}>{selectedCorridor.origin}</div>
                  </div>
                </div>

                {/* Connecting Transit Track with pulsating train */}
                <div style={{ flex: 1, margin: '0 16px', position: 'relative', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                  <div style={{
                    width: '60%',
                    height: '100%',
                    background: 'linear-gradient(90deg, #38BDF8, #A855F7)',
                    borderRadius: '3px'
                  }} />
                  <div style={{
                    position: 'absolute',
                    top: '-6px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#A855F7',
                    color: '#FFFFFF',
                    borderRadius: '10px',
                    padding: '1px 6px',
                    fontSize: '9px',
                    fontWeight: '800'
                  }}>
                    直達特快
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', zIndex: 2 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: '#94A3B8' }}>終點端</div>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#F8FAFC' }}>{selectedCorridor.destination}</div>
                  </div>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10B981', border: '2px solid #FFFFFF' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
