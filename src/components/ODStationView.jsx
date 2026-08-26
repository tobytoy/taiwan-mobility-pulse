import React, { useState } from 'react';
import { 
  ArrowRight, Compass, MapPin, Award, 
  Layers, BarChart2, Calendar, Filter, Users, Navigation
} from 'lucide-react';

export default function ODStationView({ studyData = {}, modesMeta = [] }) {
  const [selectedModeKey, setSelectedModeKey] = useState('臺北捷運 (TRTC)');
  const [selectedDayType, setSelectedDayType] = useState('Weekday');

  const selectedModeData = studyData[selectedModeKey] || {};
  const topODList = selectedModeData.top_od?.[selectedDayType] || [];
  const topCommuter = selectedModeData.top_commuter_stations || selectedModeData.top_commuter_routes || [];
  const topTourist = selectedModeData.top_tourist_stations || selectedModeData.top_tourist_routes || [];

  const maxODVol = Math.max(1, ...(topODList.map(d => d.vol) || [1]));

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', color: '#f8fafc' }}>
      
      {/* Top Filter Bar: Modes + DayTypes */}
      <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '18px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          
          {/* Mode Selector Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginRight: '6px' }}>
              <Filter size={14} /> 運具路網:
            </span>
            {modesMeta.map(m => {
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
                    background: isSelected ? `${m.color}22` : 'rgba(30, 41, 59, 0.5)',
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

          {/* Day Type Toggle */}
          <div style={{ display: 'flex', background: 'rgba(30, 41, 59, 0.8)', padding: '3px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
            {[
              { id: 'Weekday', label: '平日 (Weekday)' },
              { id: 'Weekend', label: '週末 (Weekend)' },
              { id: 'Holiday', label: '連假 (Holiday)' }
            ].map(dt => {
              const isSelected = selectedDayType === dt.id;
              return (
                <button
                  key={dt.id}
                  onClick={() => setSelectedDayType(dt.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: isSelected ? '700' : '500',
                    background: isSelected ? '#38BDF8' : 'transparent',
                    color: isSelected ? '#0F172A' : '#94a3b8',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {dt.label}
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* Main Content Grid: Top ODs + Station Rankings */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '20px' }}>
        
        {/* Left Column: Top OD Corridors */}
        <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Navigation size={18} color="#38BDF8" /> 
              {selectedModeKey} — {selectedDayType === 'Weekday' ? '平日' : (selectedDayType === 'Weekend' ? '週末' : '連假')} Top 8 起訖走廊 (OD)
            </h3>
            <span style={{ fontSize: '11px', color: '#64748b' }}>累計總旅運量</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topODList.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>暫無此時段 OD 資料</div>
            ) : (
              topODList.map((odItem, idx) => {
                const pair = odItem.od.split(' -> ');
                const orig = pair[0] || '起點';
                const dest = pair[1] || '迄點';
                const pct = (odItem.vol / maxODVol) * 100;

                return (
                  <div 
                    key={idx}
                    style={{ 
                      background: 'rgba(30, 41, 59, 0.4)', 
                      border: '1px solid rgba(255,255,255,0.04)', 
                      borderRadius: '8px', 
                      padding: '12px 14px' 
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600' }}>
                        <span style={{ 
                          width: '20px', 
                          height: '20px', 
                          borderRadius: '50%', 
                          background: idx < 3 ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.06)',
                          color: idx < 3 ? '#38BDF8' : '#94A3B8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: '800'
                        }}>
                          {idx + 1}
                        </span>
                        <span style={{ color: '#f8fafc' }}>{orig}</span>
                        <ArrowRight size={14} color="#64748b" />
                        <span style={{ color: '#38BDF8' }}>{dest}</span>
                      </div>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', fontWeight: '700', color: '#f8fafc' }}>
                        {odItem.vol.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>

                    <div style={{ width: '100%', height: '5px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: idx === 0 ? '#38BDF8' : (idx < 3 ? '#60A5FA' : '#94A3B8') }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Station Commuter vs Tourist Archetypes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Top Commuter Stations */}
          <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', color: '#34D399' }}>
                <Award size={18} color="#34D399" /> 通勤特化主幹 (平日日均 遠大於 週末)
              </h3>
              <span style={{ fontSize: '11px', color: '#64748b' }}>通勤乘數 = 平日日均 / 週末日均</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              {topCommuter.length === 0 ? (
                <div style={{ color: '#64748b', fontSize: '12px' }}>無特殊通勤站點</div>
              ) : (
                topCommuter.map((st, i) => {
                  const name = st.origin || st.rent_station || st.route_name || '站點';
                  const ratio = st.commuter_ratio || 1;
                  const wdAvg = st.wd_daily_avg || 0;

                  return (
                    <div key={i} style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', padding: '10px 12px' }}>
                      <div style={{ fontWeight: '700', fontSize: '13px', color: '#f8fafc', marginBottom: '4px' }}>{name}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8' }}>
                        <span>平日日均: {wdAvg.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        <strong style={{ color: '#34D399' }}>{ratio.toFixed(2)}x</strong>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Top Tourist / Leisure Stations */}
          <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', color: '#F472B6' }}>
                <Compass size={18} color="#F472B6" /> 觀光遊憩特化 (週末日均 遠大於 平日)
              </h3>
              <span style={{ fontSize: '11px', color: '#64748b' }}>假日溢量商圈 / 景點站</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              {topTourist.length === 0 ? (
                <div style={{ color: '#64748b', fontSize: '12px' }}>無特殊觀光站點</div>
              ) : (
                topTourist.map((st, i) => {
                  const name = st.origin || st.rent_station || st.route_name || '站點';
                  const ratio = st.commuter_ratio || 1;
                  const weAvg = st.we_daily_avg || 0;

                  return (
                    <div key={i} style={{ background: 'rgba(236, 72, 153, 0.08)', border: '1px solid rgba(236, 72, 153, 0.2)', borderRadius: '8px', padding: '10px 12px' }}>
                      <div style={{ fontWeight: '700', fontSize: '13px', color: '#f8fafc', marginBottom: '4px' }}>{name}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8' }}>
                        <span>週末日均: {weAvg.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        <strong style={{ color: '#F472B6' }}>{(1/ratio).toFixed(2)}x 假日爆量</strong>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
