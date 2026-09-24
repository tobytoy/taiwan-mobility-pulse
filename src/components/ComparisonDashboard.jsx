import React, { useState } from 'react';
import { 
  BarChart3, Activity, Clock, TrendingUp, 
  Layers, ArrowUpRight, ArrowDownRight, CheckCircle2, XCircle, Zap, Train, Compass, Bike, Bus,
  Users, Briefcase, Sparkles, Calendar, HelpCircle, Check, MapPin,
  Flame, Store, Coffee, ShoppingBag, Utensils, BatteryCharging, Camera, Waves, AlertTriangle, ShieldCheck
} from 'lucide-react';

export default function ComparisonDashboard({ studyData = {}, modesMeta = [] }) {
  // Default to High Speed Rail
  const [selectedModeKey, setSelectedModeKey] = useState('高鐵 (THSR)');
  const [selectedPersona, setSelectedPersona] = useState('breakfast');
  const [algorithmView, setAlgorithmView] = useState('comparison'); // 'comparison', 'flow_modes'

  const selectedModeData = (studyData && studyData[selectedModeKey]) || {};
  const hourlyProfile = selectedModeData.hourly_profile || {};
  const daytypeSummary = selectedModeData.daytype_summary || {};
  const weekdaySummary = selectedModeData.weekday_summary || {};

  // Extract Comparative Metrics for All Modes with defensive fallbacks
  const comparisonList = (modesMeta || []).map(m => {
    const data = (studyData && studyData[m.key]) || {};
    const dt = data.daytype_summary || {};
    const wdAvg = dt.Weekday?.daily_avg || 0;
    const weAvg = dt.Weekend?.daily_avg || 0;
    const hdAvg = dt.Holiday?.daily_avg || 0;
    const totVol = data.total_volume || data.total_trips || 0;
    const commuterIdx = data.commuter_index || (weAvg > 0 ? wdAvg / weAvg : 1.0);
    const rushHourRatio = data.rush_hour_ratio || 0;

    return {
      ...m,
      total_vol: totVol,
      unique_dates: data.unique_dates || 181,
      wd_avg: wdAvg,
      we_avg: weAvg,
      hd_avg: hdAvg,
      commuter_index: commuterIdx,
      rush_hour_ratio: rushHourRatio
    };
  });

  // Calculate 24-Hour Hourly Polyline Points (SVG)
  const renderHourlyChart = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const wdData = hours.map(h => {
      const v = hourlyProfile.Weekday ? (hourlyProfile.Weekday[h] ?? hourlyProfile.Weekday[String(h)] ?? 0) : 0;
      return typeof v === 'number' && !isNaN(v) ? v : 0;
    });
    const weData = hours.map(h => {
      const v = hourlyProfile.Weekend ? (hourlyProfile.Weekend[h] ?? hourlyProfile.Weekend[String(h)] ?? 0) : 0;
      return typeof v === 'number' && !isNaN(v) ? v : 0;
    });
    const hdData = hours.map(h => {
      const v = hourlyProfile.Holiday ? (hourlyProfile.Holiday[h] ?? hourlyProfile.Holiday[String(h)] ?? 0) : 0;
      return typeof v === 'number' && !isNaN(v) ? v : 0;
    });

    const maxVal = Math.max(1, ...wdData, ...weData, ...hdData);
    const width = 640;
    const height = 180;
    const padX = 45;
    const padY = 25;

    const toPoints = (dataArr) => {
      return dataArr.map((v, i) => {
        const x = padX + (i / 23) * (width - padX * 2);
        const y = height - padY - (v / maxVal) * (height - padY * 2);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(' ');
    };

    return (
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = height - padY - ratio * (height - padY * 2);
            return (
              <g key={idx}>
                <line x1={padX} y1={y} x2={width - padX} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
                <text x={padX - 8} y={y + 4} fill="#64748b" fontSize="10" textAnchor="end" fontFamily="monospace">
                  {maxVal >= 1000 ? `${Math.round((maxVal * ratio) / 1000)}k` : Math.round(maxVal * ratio)}
                </text>
              </g>
            );
          })}

          {[0, 4, 8, 12, 16, 20, 23].map(h => {
            const x = padX + (h / 23) * (width - padX * 2);
            return (
              <text key={h} x={x} y={height - 6} fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="monospace">
                {h}:00
              </text>
            );
          })}

          <rect x={padX + (7 / 23) * (width - padX * 2)} y={padY} width={(2 / 23) * (width - padX * 2)} height={height - padY * 2} fill="rgba(56, 189, 248, 0.08)" />
          <rect x={padX + (17 / 23) * (width - padX * 2)} y={padY} width={(2 / 23) * (width - padX * 2)} height={height - padY * 2} fill="rgba(56, 189, 248, 0.08)" />

          <polyline points={toPoints(hdData)} fill="none" stroke="#F59E0B" strokeWidth="2" opacity="0.75" />
          <polyline points={toPoints(weData)} fill="none" stroke="#EC4899" strokeWidth="2.5" opacity="0.85" />
          <polyline points={toPoints(wdData)} fill="none" stroke="#38BDF8" strokeWidth="3" />
        </svg>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '3px', backgroundColor: '#38BDF8', borderRadius: '2px' }} />
            <span style={{ color: '#f8fafc' }}>平日 (Weekday)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '3px', backgroundColor: '#EC4899', borderRadius: '2px' }} />
            <span style={{ color: '#f8fafc' }}>週末 (Weekend)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '3px', backgroundColor: '#F59E0B', borderRadius: '2px' }} />
            <span style={{ color: '#f8fafc' }}>連假 (Holiday)</span>
          </div>
        </div>
      </div>
    );
  };

  // Day of Week Mon -> Sun Bar Chart
  const renderDayOfWeekChart = () => {
    const daysOrder = ['Mon (一)', 'Tue (二)', 'Wed (三)', 'Thu (四)', 'Fri (五)', 'Sat (六)', 'Sun (日)'];
    const values = daysOrder.map(d => {
      const dayObj = weekdaySummary ? weekdaySummary[d] : null;
      const v = dayObj?.daily_avg || 0;
      return typeof v === 'number' && !isNaN(v) ? v : 0;
    });
    const maxDayVal = Math.max(1, ...values);

    return (
      <div style={{ marginTop: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', alignItems: 'flex-end', height: '140px', paddingTop: '15px' }}>
          {daysOrder.map((dayName, idx) => {
            const val = values[idx];
            const pct = (val / maxDayVal) * 100;
            const isFri = idx === 4;
            const isSun = idx === 6;
            const isWeekend = idx >= 5;

            return (
              <div key={dayName} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '10px', color: isFri ? '#FBBF24' : (isSun ? '#F472B6' : '#94A3B8'), marginBottom: '4px', fontFamily: 'monospace' }}>
                  {val >= 1000 ? `${(val/1000).toFixed(1)}k` : val.toLocaleString()}
                </span>
                <div style={{ width: '100%', maxWidth: '38px', height: `${Math.max(8, pct)}%`, background: isFri ? '#F59E0B' : (isWeekend ? '#EC4899' : '#38BDF8'), borderRadius: '4px 4px 0 0', transition: 'height 0.3s ease' }} />
                <span style={{ fontSize: '11px', color: isFri ? '#FBBF24' : (isWeekend ? '#EC4899' : '#94a3b8'), marginTop: '6px', fontWeight: isFri || isWeekend ? '700' : '400' }}>
                  {dayName.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '10px', textAlign: 'center' }}>
          ⭐ <strong style={{ color: '#FBBF24' }}>週五</strong> 下午返鄉出遊潮爆發；<strong style={{ color: '#EC4899' }}>週日</strong> 達全週長途返程極值。
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', color: '#f8fafc' }}>
      
      {/* SECTION 1: Top Mode Selector Chips */}
      <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} color="#38BDF8" />
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#f8fafc' }}>快速選定觀察運具：</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {(modesMeta || []).map(m => {
              const isSelected = selectedModeKey === m.key;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedModeKey(m.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: isSelected ? '700' : '500',
                    border: isSelected ? `1px solid ${m.color}` : '1px solid rgba(255,255,255,0.1)',
                    background: isSelected ? `${m.color}25` : 'rgba(30, 41, 59, 0.5)',
                    color: isSelected ? '#f8fafc' : '#94a3b8',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: m.color }} />
                  {m.short_name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 2: How we separate Commuters vs Tourists & Persona-driven Business Diagnosis */}
      <div style={{ background: 'rgba(15, 23, 42, 0.88)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 12px 36px rgba(0,0,0,0.4)' }}>
        
        {/* Header with Title and Mode Sub-navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '800' }}>
                核心研發特輯
              </span>
              <span style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#EC4899', border: '1px solid rgba(236, 72, 153, 0.3)', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '800' }}>
                落地商業賦能
              </span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', color: '#F8FAFC' }}>
              <Users size={22} color="#38BDF8" /> 核心診斷：如何從 4.4 億筆票證大數據精準分離「通勤族 vs. 觀光旅客」？
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
              提供<strong>四大分離演算法優缺點嚴謹比較</strong>、<strong>進入 vs 離開熱點算式定義</strong>，並帶入<strong>四大商業角色身分實戰選址體感診斷</strong>：
            </p>
          </div>

          {/* Sub-tabs for Section 2 */}
          <div style={{ display: 'flex', gap: '6px', background: 'rgba(30, 41, 59, 0.6)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            {[
              { id: 'comparison', label: '📐 4大判斷演算法優缺點', icon: Layers },
              { id: 'flow_modes', label: '🌊 進入 vs 離開熱點算式', icon: Waves },
              { id: 'personas', label: '🛍️ 四大商務角色體感診斷', icon: Store }
            ].map(tab => {
              const isSel = algorithmView === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setAlgorithmView(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '7px',
                    border: 'none',
                    background: isSel ? '#38BDF8' : 'transparent',
                    color: isSel ? '#0F172A' : '#94A3B8',
                    fontSize: '12px',
                    fontWeight: isSel ? '700' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: 4大判斷演算法優缺點深度比較 (Hybrid Pipeline) */}
        {algorithmView === 'comparison' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '14px', marginBottom: '18px' }}>
              
              {/* Algorithm 1 */}
              <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#38BDF8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Briefcase size={15} /> 算法一：票種與定期票標籤法
                  </div>
                  <span style={{ fontSize: '10px', background: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8', padding: '2px 6px', borderRadius: '4px' }}>
                    TPASS Gating
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px', lineHeight: '1.4' }}>
                  <strong>依據欄位</strong>：<code>TicketType == 4</code> (定期票/TPASS)、<code>PaymentPrice == 0</code>、<code>TicketClass == 'N-IC'</code> (單程票/Token/紙票)。
                </div>
                <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5', marginBottom: '10px' }}>
                  <strong>規則</strong>：TPASS 扣款為 0 元者 100% 標定通勤族；購買捷運代幣 (Token) 或現場紙票者 100% 標定為觀光/偶發客。
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
                  <div style={{ color: '#10B981', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                    <CheckCircle2 size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span><strong>優點</strong>：O(1) 確定性極高，單筆 transaction 即可分類，無須跨天歷程。</span>
                  </div>
                  <div style={{ color: '#F43F5E', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                    <XCircle size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span><strong>缺點</strong>：遺漏非月票的一般卡通勤者（短程或部分上班族仍刷一般悠遊卡）。</span>
                  </div>
                </div>
              </div>

              {/* Algorithm 2 */}
              <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={15} /> 算法二：卡號月重複度分群法
                  </div>
                  <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', padding: '2px 6px', borderRadius: '4px' }}>
                    Recurrence Profiling
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px', lineHeight: '1.4' }}>
                  <strong>依據欄位</strong>：公車/自行車去識別化卡號 <code>ID</code> + <code>TripDate</code> + <code>BoardingTime</code>。
                </div>
                <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5', marginBottom: '10px' }}>
                  <strong>規則</strong>：以 30 天為視窗，平日出現天數 &ge; 10 天且集中於早晚尖峰者標記為通勤；全月出現 &le; 3 天或假日集中者為旅客。
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
                  <div style={{ color: '#10B981', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                    <CheckCircle2 size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span><strong>優點</strong>：交通規劃黃金標準，能抓出沒買月票的隱性通勤族，行為最真實。</span>
                  </div>
                  <div style={{ color: '#F43F5E', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                    <XCircle size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span><strong>缺點</strong>：台鐵/捷運 OD 表已預先聚合無卡號 Hash；全量分組運算極耗 RAM。</span>
                  </div>
                </div>
              </div>

              {/* Algorithm 3 */}
              <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Compass size={15} /> 算法三：空間起訖對稱性走廊法
                  </div>
                  <span style={{ fontSize: '10px', background: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', padding: '2px 6px', borderRadius: '4px' }}>
                    OD Symmetry
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px', lineHeight: '1.4' }}>
                  <strong>依據欄位</strong>：<code>BoardingStop</code> &rarr; <code>DeboardingStop</code> 上下車站名。
                </div>
                <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5', marginBottom: '10px' }}>
                  <strong>規則</strong>：同一張卡常態出現「A&rarr;B (上午)」與「B&rarr;A (傍晚)」對稱雙向往返即為通勤；單向跳躍或以景點為端點者為旅客。
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
                  <div style={{ color: '#10B981', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                    <CheckCircle2 size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span><strong>優點</strong>：完美體現「家 &harr; 工作地 (Home-Work)」雙向潮汐本質。</span>
                  </div>
                  <div style={{ color: '#F43F5E', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                    <XCircle size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span><strong>缺點</strong>：下車漏刷卡、多段公車/步行轉乘時容易軌跡斷鏈。</span>
                  </div>
                </div>
              </div>

              {/* Algorithm 4 */}
              <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(236, 72, 153, 0.2)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#EC4899', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <TrendingUp size={15} /> 算法四：時空機率統計模型
                  </div>
                  <span style={{ fontSize: '10px', background: 'rgba(236, 72, 153, 0.2)', color: '#EC4899', padding: '2px 6px', borderRadius: '4px' }}>
                    OD Spatial Bayesian
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px', lineHeight: '1.4' }}>
                  <strong>依據欄位</strong>：<code>OriginStation</code>, <code>DestinationStation</code>, <code>TripHour</code>, <code>Volume</code>。
                </div>
                <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5', marginBottom: '10px' }}>
                  <strong>規則</strong>：在無卡號聚合 OD 下，依站點之平日/週末比 (Commuter Index) 與尖峰小時曲線，以先驗機率分配拆解人次。
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
                  <div style={{ color: '#10B981', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                    <CheckCircle2 size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span><strong>優點</strong>：通用性極強，讓無卡號的台鐵、高鐵、北捷、高捷全網能統一大數據分析。</span>
                  </div>
                  <div style={{ color: '#F43F5E', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                    <XCircle size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span><strong>缺點</strong>：屬巨觀機率推估，住商觀光混合站（如台北車站、西門）存在平滑誤差。</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom: Hybrid Pipeline Solution */}
            <div style={{ background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.15), rgba(16, 185, 129, 0.15))', border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={24} color="#38BDF8" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#F8FAFC' }}>
                    💡 本平台採用的最佳工程落地實踐：【階層混合判定（Hybrid Pipeline）】
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                    第一層以 <strong>TPASS (TicketType=4)</strong> 鎖定 100% 通勤；第一層以 <strong>N-IC (單程票/Token)</strong> 鎖定 100% 旅客；第二層一般卡依尖峰/離峰加權；第三層軌道 OD 依統計機率拆分，兼顧 100% 覆蓋率與微觀精準度。
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 進入 (Inflow) vs 離開 (Outflow) vs 活動總量算式解析 */}
        {algorithmView === 'flow_modes' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '16px' }}>
              
              <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(249, 115, 22, 0.3)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#F97316', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Flame size={16} /> 🔥 活動人流總熱點 (預設模式)
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: '6px', color: '#FDBA74', marginBottom: '8px' }}>
                  熱度 = Inflow (進入) + Outflow (離開)
                </div>
                <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6' }}>
                  <p>• <strong>物理意涵</strong>：此時此刻該區域的「人流周轉強度與吞吐量」。</p>
                  <p>• <strong>優點</strong>：數值永遠為正，最符合 GIS 熱力圖 (KDE) 視覺呈現；如實反映台北車站、板橋等核心交通樞紐超高人氣，不會因進出互相抵銷。</p>
                  <p>• <strong>缺點</strong>：無法一眼辨別該區是「人潮正在聚集」還是「人潮正在散去」。</p>
                </div>
              </div>

              <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#38BDF8', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ArrowDownRight size={16} /> 📍 目的地湧入熱點 (Inflow)
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: '6px', color: '#7DD3FC', marginBottom: '8px' }}>
                  熱度 = Deboarding (下車) + Return (還車)
                </div>
                <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6' }}>
                  <p>• <strong>物理意涵</strong>：該時段「人潮進入或抵達」該區域的目的地吸納量。</p>
                  <p>• <strong>優點</strong>：業務直覺最清晰！週三上午 9 點下車爆滿的站點（如市政府、南京復興、內科）立刻顯現為鮮紅熱點，精確描繪<strong>工作商辦聚集地</strong>。</p>
                  <p>• <strong>缺點</strong>：忽略了住宅臥城（中永和、淡水）將人大量輸送出去的活躍動能。</p>
                </div>
              </div>

              <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#F59E0B', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ArrowUpRight size={16} /> 🛫 出發流出熱點 (Outflow)
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: '6px', color: '#FDE68A', marginBottom: '8px' }}>
                  熱度 = Boarding (上車) + Rent (借車)
                </div>
                <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6' }}>
                  <p>• <strong>物理意涵</strong>：該時段「人潮出發離開」該區域的發送量。</p>
                  <p>• <strong>優點</strong>：專門觀察<strong>居住地住宅臥城</strong>（新埔、頂溪、景安）與<strong>活動散場</strong>，精準回答「每天早晨的人都是從哪裡湧出來的」。</p>
                  <p>• <strong>缺點</strong>：無法反映商業區下午或中午的活躍情況。</p>
                </div>
              </div>

              <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#10B981', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Waves size={16} /> 🌊 淨流入聚集熱度 (Net Flow)
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: '6px', color: '#6EE7B7', marginBottom: '8px' }}>
                  淨熱度 = Inflow (進入) - Outflow (離開)
                </div>
                <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6' }}>
                  <p>• <strong>物理意涵</strong>：呈現該區人口正在「像海綿吸水般增加」或「排空消退」。</p>
                  <p>• <strong>優點</strong>：能動態展示潮汐人流吸納效應，上午工作區為正值，住宅區為負值。</p>
                  <p>• <strong>缺點</strong>：有負數產生，傳統單色熱圖無法表現，需採雙色發散圖呈現。</p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: 四大商務角色身分帶入實戰分析 (Persona Simulation) */}
        {algorithmView === 'personas' && (
          <div>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '14px' }}>
              💡 <strong>點擊選擇您的商業角色身分</strong>，系統將以真實大數據為您診斷「該選在什麼站點、鎖定什麼時段做生意」：
            </div>

            {/* Persona Selector Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px', marginBottom: '16px' }}>
              {[
                { id: 'breakfast', label: '🍙 日常早餐/便當快銷', sub: '民生剛需、依賴高頻與速度', color: '#38BDF8' },
                { id: 'cafe', label: '📸 潮流網紅打卡甜點店', sub: '重體驗、高溢價、需逗留時間', color: '#EC4899' },
                { id: 'vending', label: '🔋 拍貼機/自販/共享充電', sub: '非餐飲、等人碎片時間變現', color: '#10B981' },
                { id: 'fitness', label: '💼 24h 智能健身/生活服務', sub: '鎖定早出晚歸雙峰白領', color: '#F59E0B' }
              ].map(p => {
                const isSel = selectedPersona === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPersona(p.id)}
                    style={{
                      background: isSel ? `${p.color}25` : 'rgba(30, 41, 59, 0.4)',
                      border: isSel ? `2px solid ${p.color}` : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: '800', color: isSel ? '#F8FAFC' : '#cbd5e1' }}>
                      {p.label}
                    </div>
                    <div style={{ fontSize: '10px', color: isSel ? p.color : '#64748b', marginTop: '2px' }}>
                      {p.sub}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Persona Detailed Content Card */}
            {selectedPersona === 'breakfast' && (
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '14px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#38BDF8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Utensils size={20} color="#38BDF8" /> 角色一：日常食品攤商（飯糰、三明治早點 / 上班族外帶便當）
                  </div>
                  <span style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                    鎖定客群：通勤通勤族 (Commuter Ratio &gt; 85%)
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', fontSize: '12px', lineHeight: '1.6' }}>
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '10px', borderLeft: '3px solid #38BDF8' }}>
                    <div style={{ fontWeight: '700', color: '#38BDF8', marginBottom: '6px' }}>🎯 最佳選址與落點時段：</div>
                    <p>• <strong>早晨 07:00-08:45 早餐攤</strong>：選在【居住流出站 (Outflow)】進站閘口動線旁，如 <strong>板橋新埔站 (出發 2,284/h)、永和頂溪站 (出發 2,152/h)、中和景安站</strong>。</p>
                    <p>• <strong>午間 11:30-13:00 便當店</strong>：選在【商辦流入站 (Inflow)】周邊，如 <strong>信義市政府站 (流入 3,602/h)、南京復興、內科瑞光路</strong>。</p>
                  </div>

                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '10px', borderLeft: '3px solid #10B981' }}>
                    <div style={{ fontWeight: '700', color: '#10B981', marginBottom: '6px' }}>💬 老闆體感心聲與數據背書：</div>
                    <p style={{ fontStyle: 'italic', color: '#e2e8f0' }}>
                      「通勤族早上在捷運站外停留時間只有 <strong>30 至 60 秒</strong>，他要的是『拿了就走、銅板價、免等待』！新埔跟頂溪早尖峰通勤佔比高達 <strong>87%</strong>，人流如滔滔江水，單靠早尖峰 1.5 小時就能賣出 350 份飯糰，每週回購率超高！」
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#FCA5A5', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={18} color="#EF4444" style={{ flexShrink: 0 }} />
                  <div>
                    <strong>❌ 致命選址禁區</strong>：千萬別開在純觀光站（如週三早上的淡水老街、高雄駁二、花蓮車站）！非假日早上這些地方遊客還在飯店睡覺，出門也是慢慢吃早午餐，趕著買飯糰的通勤客近乎為零，必虧無疑。
                  </div>
                </div>
              </div>
            )}

            {selectedPersona === 'cafe' && (
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(236, 72, 153, 0.3)', borderRadius: '14px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#EC4899', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Camera size={20} color="#EC4899" /> 角色二：潮流網紅咖啡館、打卡甜點店、文創選品店
                  </div>
                  <span style={{ background: 'rgba(236, 72, 153, 0.2)', color: '#EC4899', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                    鎖定客群：觀光旅客 (Tourist Ratio &gt; 55%)
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', fontSize: '12px', lineHeight: '1.6' }}>
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '10px', borderLeft: '3px solid #EC4899' }}>
                    <div style={{ fontWeight: '700', color: '#EC4899', marginBottom: '6px' }}>🎯 最佳選址與落點時段：</div>
                    <p>• <strong>首選落點</strong>：<strong>西門町、淡水老街、高捷駁二大義 (遊客佔比 &gt; 70%)、台南赤崁商圈 (遊客 58%)、高捷巨蛋商圈</strong>。</p>
                    <p>• <strong>熱門時段</strong>：平日午後 13:00-17:00，週五傍晚至週末全天 (客流單峰平緩且高額延續)。</p>
                  </div>

                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '10px', borderLeft: '3px solid #A855F7' }}>
                    <div style={{ fontWeight: '700', color: '#A855F7', marginBottom: '6px' }}>💬 老闆體感心聲與數據背書：</div>
                    <p style={{ fontStyle: 'italic', color: '#e2e8f0' }}>
                      「旅客出遊求的是『體驗、放鬆與社群炫耀感』！他們願意排隊 40 分鐘，為一杯拉花咖啡加千層蛋糕支付 <strong>350-450 元的高額溢價</strong>。在店裡逗留 90 分鐘拍照打卡，每一位客人都在社群自發傳播，替我們帶來全台灣的外地新客！」
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#FCA5A5', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={18} color="#EF4444" style={{ flexShrink: 0 }} />
                  <div>
                    <strong>❌ 致命選址禁區</strong>：千萬別開在汐科站、新北產業園區、南港軟體園區等純通勤站！上班族步履匆匆急著打卡，店面弄得再唯美，通勤族連抬頭看一眼的閒情逸致都沒有。
                  </div>
                </div>
              </div>
            )}

            {selectedPersona === 'vending' && (
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '14px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#10B981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BatteryCharging size={20} color="#10B981" /> 角色三：快閃拍貼機、共享行動電源、扭蛋潮玩、智能自販機（非餐飲零售）
                  </div>
                  <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                    鎖定客群：活動總熱點 (Activity Volume &gt; 5,000/h)
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', fontSize: '12px', lineHeight: '1.6' }}>
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '10px', borderLeft: '3px solid #10B981' }}>
                    <div style={{ fontWeight: '700', color: '#10B981', marginBottom: '6px' }}>🎯 最佳選址與落點時段：</div>
                    <p>• <strong>首選落點</strong>：<strong>台北車站 (總活動 10,986/h)、板橋車站 (6,648/h)、市府轉運站、高鐵左營站</strong>。</p>
                    <p>• <strong>核心特徵</strong>：多運具轉乘動線、長途候車月台口、具有 <strong>5 至 15 分鐘無聊空檔</strong> 的交會處。</p>
                  </div>

                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '10px', borderLeft: '3px solid #38BDF8' }}>
                    <div style={{ fontWeight: '700', color: '#38BDF8', marginBottom: '6px' }}>💬 老闆體感心聲與數據背書：</div>
                    <p style={{ fontStyle: 'italic', color: '#e2e8f0' }}>
                      「我們賣的不是商品，是『<strong>解急與填補空檔的即興娛樂</strong>』！遊客手機拍照到沒電急著借行動電源；情侶等火車還有 12 分鐘，看到韓式拍貼機順手花 200 元拍一張；學生等客運隨手扭個扭蛋。在這種總活動人流破萬的樞紐，機台佔地不到 1 坪，坪效卻高得驚人！」
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#FCA5A5', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={18} color="#EF4444" style={{ flexShrink: 0 }} />
                  <div>
                    <strong>❌ 致命選址禁區</strong>：避免擺在單一直通型通道（大家快步通行無停留）或缺乏轉乘等待的小站。人潮如果沒有『停下來等車』的空檔，再便宜的租金也是無人問津。
                  </div>
                </div>
              </div>
            )}

            {selectedPersona === 'fitness' && (
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '14px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Store size={20} color="#F59E0B" /> 角色四：24h 智能健身房、乾洗自提櫃、共享商務會議室（都會白領生活服務）
                  </div>
                  <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                    鎖定客群：雙峰高頻白領 (高規律性行程鏈)
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', fontSize: '12px', lineHeight: '1.6' }}>
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '10px', borderLeft: '3px solid #F59E0B' }}>
                    <div style={{ fontWeight: '700', color: '#F59E0B', marginBottom: '6px' }}>🎯 最佳雙端選址策略：</div>
                    <p>• <strong>工作端 (Inflow 目的地)</strong>：<strong>松江南京、南京復興、南港軟體園區</strong> ── 瞄準中午 12:00-13:30 午休 45 分鐘高效率重訓，以及出差白領的臨時會議室。</p>
                    <p>• <strong>居住端 (Outflow 出發地)</strong>：<strong>中和景安、永和頂溪、板橋府中</strong> ── 瞄準晚上 19:30-22:30 返家出閘後，下樓運動或取乾洗西裝。</p>
                  </div>

                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '10px', borderLeft: '3px solid #38BDF8' }}>
                    <div style={{ fontWeight: '700', color: '#38BDF8', marginBottom: '6px' }}>💬 營運長體感心聲與數據背書：</div>
                    <p style={{ fontStyle: 'italic', color: '#e2e8f0' }}>
                      「都會上班族的動線高度被捷運站綁定！只要掌握『<strong>週三早上 9 點高達 86% 的通勤集中度</strong>』，在居住端提供下班回家路徑上的乾洗自提與深夜健身，在工作端提供午休沖澡與商務辦公，就能完美嵌進白領日常習慣，形成極度穩固的月費訂閱制！」
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#FCA5A5', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={18} color="#EF4444" style={{ flexShrink: 0 }} />
                  <div>
                    <strong>❌ 致命選址禁區</strong>：千萬不要把會員制健身房或乾洗店開在週末型的風景觀光區！觀光客不會去九份或駁二洗西裝做重訓，沒有在地固定出勤居民作為基本盤，店面完全撐不住固定租金成本。
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* SECTION 3: 1-5 Mon-Fri vs Weekend Difference */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Left: Day of Week Bar Chart */}
        <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color="#FBBF24" /> 1-5 日有顯著交通差別嗎？週一至週日逐日走勢
            </h3>
          </div>
          <p style={{ fontSize: '12px', color: '#94a3b8' }}>
            目前觀察運具：<strong style={{ color: '#38BDF8' }}>{selectedModeKey}</strong>
          </p>

          {renderDayOfWeekChart()}

          <div style={{ background: 'rgba(30, 41, 59, 0.4)', borderRadius: '8px', padding: '12px', marginTop: '16px', fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6' }}>
            <div style={{ fontWeight: '700', color: '#FBBF24', marginBottom: '4px' }}>📌 1-5 日顯著差異量化發現：</div>
            <p>1. <strong>週二至週四</strong>：為「純硬通勤基線」，每日旅次高度穩定，中長途旅次最少。</p>
            <p>2. <strong>週五大爆發</strong>：高鐵日均自週二的 4,272 暴增至 <strong>8,334 (+95% 翻倍！)</strong>，臺鐵自 60.5 萬暴增至 <strong>72.3 萬 (+19.5%)</strong>，呈現極強的午後跨城返鄉出遊潮。</p>
            <p>3. <strong>週日收假峰值</strong>：高鐵在週日達到全週最高峰 <strong>8,736</strong>，呈現全台大回流。</p>
          </div>
        </div>

        {/* Right: 24-Hour Profile for Selected Mode */}
        <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="#38BDF8" /> 24 小時分時曲線 (平日 vs 週末 vs 連假)
            </h3>
          </div>

          {renderHourlyChart()}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '20px' }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '10px 14px', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>平日 (Weekday) 日均</div>
              <div style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'JetBrains Mono, monospace', color: '#38BDF8' }}>
                {(daytypeSummary.Weekday?.daily_avg || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
            <div style={{ background: 'rgba(236, 72, 153, 0.08)', border: '1px solid rgba(236, 72, 153, 0.2)', padding: '10px 14px', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>週末 (Weekend) 日均</div>
              <div style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'JetBrains Mono, monospace', color: '#EC4899' }}>
                {(daytypeSummary.Weekend?.daily_avg || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
            <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '10px 14px', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>連假 (Holiday) 日均</div>
              <div style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'JetBrains Mono, monospace', color: '#F59E0B' }}>
                {(daytypeSummary.Holiday?.daily_avg || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 4: 8 Modes Comparison Table */}
      <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <BarChart3 size={18} color="#38BDF8" /> 8 大運具全量觀察總表（點擊任一行即可切換上方分析走勢）
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
                <th style={{ padding: '10px 8px' }}>運具名稱</th>
                <th style={{ padding: '10px 8px' }}>平日日均</th>
                <th style={{ padding: '10px 8px' }}>週末日均</th>
                <th style={{ padding: '10px 8px' }}>通勤偏向指數</th>
                <th style={{ padding: '10px 8px' }}>主導客群屬性</th>
                <th style={{ padding: '10px 8px' }}>尖峰集中度</th>
              </tr>
            </thead>
            <tbody>
              {comparisonList.map(item => {
                const isSelected = selectedModeKey === item.key;
                const isCommuter = item.commuter_index >= 1.0;
                return (
                  <tr 
                    key={item.id}
                    onClick={() => setSelectedModeKey(item.key)}
                    style={{ 
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <td style={{ padding: '12px 8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color }} />
                      {item.short_name}
                      {isSelected && <span style={{ fontSize: '10px', color: '#38BDF8', background: 'rgba(56,189,248,0.2)', padding: '1px 6px', borderRadius: '4px' }}>正在檢視</span>}
                    </td>
                    <td style={{ padding: '12px 8px', fontFamily: 'JetBrains Mono, monospace' }}>
                      {item.wd_avg.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td style={{ padding: '12px 8px', fontFamily: 'JetBrains Mono, monospace' }}>
                      {item.we_avg.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <strong style={{ color: isCommuter ? '#34D399' : '#F472B6' }}>
                        {item.commuter_index.toFixed(2)}x
                      </strong>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{ 
                        padding: '3px 8px', 
                        borderRadius: '4px', 
                        fontSize: '11px', 
                        fontWeight: '700',
                        backgroundColor: isCommuter ? 'rgba(16, 185, 129, 0.2)' : 'rgba(236, 72, 153, 0.2)',
                        color: isCommuter ? '#34D399' : '#F472B6'
                      }}>
                        {isCommuter ? '💼 日常通勤型' : '🧳 假日觀光/返鄉型'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', fontFamily: 'JetBrains Mono, monospace', color: item.rush_hour_ratio > 0.4 ? '#FBBF24' : '#94A3B8' }}>
                      {(item.rush_hour_ratio * 100).toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
