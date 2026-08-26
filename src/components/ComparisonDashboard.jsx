import React, { useState } from 'react';
import { 
  BarChart3, Activity, Clock, TrendingUp, 
  Layers, ArrowUpRight, CheckCircle2, Zap, Train, Compass, Bike, Bus,
  Users, Briefcase, Sparkles, Calendar, HelpCircle, Check, MapPin
} from 'lucide-react';

export default function ComparisonDashboard({ studyData = {}, modesMeta = [] }) {
  // Default to High Speed Rail
  const [selectedModeKey, setSelectedModeKey] = useState('高鐵 (THSR)');

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

      {/* SECTION 2: How we separate Commuters vs Tourists */}
      <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '14px', padding: '22px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', color: '#38BDF8' }}>
              <Users size={20} color="#38BDF8" /> 核心診斷：如何從 2 億筆票證大數據精準分離「通勤族 vs. 觀光旅客」？
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
              透過【時序規律】、【起訖場站】、【卡號行程鏈 (TO2A/TO3A)】與【票種身分】四維特徵模型進行量化分流：
            </p>
          </div>
          <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
            四維 AI 分流模型
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#38BDF8', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={15} /> 1. 時序行為 (Temporal Profile)
            </div>
            <ul style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6', paddingLeft: '16px' }}>
              <li><strong>通勤族</strong>：呈現 07:30-08:45 與 17:30-18:45 雙峰，平日運量遠大於週末 (通勤指數 &gt; 1.35)。</li>
              <li><strong>觀光旅客</strong>：呈現中午至午後 (11:00-16:00) 單峰平緩高台，週五傍晚與週末假日暴衝。</li>
            </ul>
          </div>

          <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#10B981', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={15} /> 2. 空間場站 (Spatial Archetype)
            </div>
            <ul style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6', paddingLeft: '16px' }}>
              <li><strong>通勤族</strong>：高度集中於科技園區與工業聚落（內科港墘/西湖、新北產業園區、汐科、華亞、楠梓）。</li>
              <li><strong>觀光旅客</strong>：集中於商圈景點（高捷巨蛋/駁二、台北-宜蘭國道客運、高鐵左營/台中站、淡水）。</li>
            </ul>
          </div>

          <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#F59E0B', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={15} /> 3. 卡號月重複度 (Trip Frequency)
            </div>
            <ul style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6', paddingLeft: '16px' }}>
              <li><strong>通勤族</strong>：同卡號在同月同 OD 重複出現天數 <strong>&ge; 16 天</strong>，刷卡時間標準差 &lt; 20 分鐘。</li>
              <li><strong>觀光旅客</strong>：同月在該走廊出現天數 <strong>&le; 3 天</strong>，且多為跨縣市長途跳躍。</li>
            </ul>
          </div>

          <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#EC4899', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Briefcase size={15} /> 4. 票種身分 (Fare Class)
            </div>
            <ul style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6', paddingLeft: '16px' }}>
              <li><strong>通勤族</strong>：TPASS 定期票、學生卡、回數票、月票。</li>
              <li><strong>觀光旅客</strong>：單程票 (Token)、信用卡感應、行動支付、全票與觀光套票。</li>
            </ul>
          </div>

        </div>
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
