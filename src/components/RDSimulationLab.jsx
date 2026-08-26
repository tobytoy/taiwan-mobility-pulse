import React, { useState } from 'react';
import RebalancingMap from './RebalancingMap';
import TransitGapMap, { GAP_AREAS_CONFIG } from './TransitGapMap';
import CarbonShiftMap from './CarbonShiftMap';
import EvacuationMap from './EvacuationMap';
import TourismPassMap from './TourismPassMap';
import { 
  FlaskConical, Bike, Bus, Train, MapPin, ShieldAlert, 
  Sparkles, Leaf, TrendingUp, Sliders, Play, 
  CheckCircle, AlertTriangle, ArrowRight, RefreshCw, Cpu,
  Compass, Navigation, Eye, CheckCircle2, ChevronRight, Zap, DollarSign, Activity
} from 'lucide-react';

export default function RDSimulationLab({ rdProposals = [] }) {
  const [activeLabId, setActiveLabId] = useState('rebalancing');

  // Lab 1 State: YouBike Rebalancing
  const [bikeStation, setBikeStation] = useState('陽光舊宗路口 (內科)');
  const [bikeDemandSurge, setBikeDemandSurge] = useState(25); // +25%
  const [bikeTruckCount, setBikeTruckCount] = useState(6);

  // Lab 2 State: Transit Gap Detection
  const [gapArea, setGapArea] = useState('淡海新市鎮');
  const [bufferRadius, setBufferRadius] = useState(800); // meters
  const [selectedColdSpot, setSelectedColdSpot] = useState(null);

  // Lab 3 State: TPASS & Carbon
  const [tpassZone, setTpassZone] = useState('mega_taipei');
  const [tpassPrice, setTpassPrice] = useState(1200);
  const [modeShiftRate, setModeShiftRate] = useState(18); // %
  // Lab 4 State: Emergency Evacuation
  const [incidentCorridor, setIncidentCorridor] = useState('台北車站 <-> 西門 (北捷核心走廊)');
  const [incidentDuration, setIncidentDuration] = useState(45); // minutes
  const [isPeakHour, setIsPeakHour] = useState(true);

  // Lab 5 State: Tourism Pass
  const [tourismCorridor, setTourismCorridor] = useState('市府轉運站 <-> 宜蘭/羅東 (國道客運)');
  const [bundleDiscount, setBundleDiscount] = useState(15); // %

  // Calculations for Lab 1 (YouBike)
  const baseDeficitRate = 45; // bikes/hr
  const totalDeficit = Math.round(baseDeficitRate * (1 + bikeDemandSurge / 100) * 2);
  const truckCapacity = 20; // bikes/truck
  const truckReplenish = bikeTruckCount * truckCapacity * 1.5;
  const slaScore = Math.min(99, Math.max(40, Math.round((truckReplenish / totalDeficit) * 100)));
  const waitTimeSaved = Math.round(totalDeficit * 8.5); // minutes

  // Calculations for Lab 3 (TPASS & Carbon)
  const annualPassHolders = Math.round(380000 * (1500 / tpassPrice));
  const annualShiftedTrips = Math.round(annualPassHolders * 240 * 2 * (modeShiftRate / 100));
  const avgDistanceKm = 12.5;
  const carCO2PerKm = 0.170; // kg CO2 / km
  const transitCO2PerKm = 0.045; // kg CO2 / km
  const netCO2SavedTons = Math.round((annualShiftedTrips * avgDistanceKm * (carCO2PerKm - transitCO2PerKm)) / 1000);
  const gasolineSavedLiters = Math.round((annualShiftedTrips * avgDistanceKm) / 11.5);

  // Calculations for Lab 4 (Evacuation)
  const flowPerMin = isPeakHour ? 280 : 90;
  const strandedPax = flowPerMin * incidentDuration;
  const busCapacity = 45;
  const requiredBuses = Math.ceil(strandedPax / (busCapacity * 2.5));
  const recommendedHeadwayMins = Math.max(2, Math.round(60 / (requiredBuses * 1.5)));
  const clearTimeMins = Math.round(incidentDuration * 1.25);

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', color: '#f8fafc' }}>
      
      {/* Top Header */}
      <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', color: '#38BDF8' }}>
              <FlaskConical size={22} color="#38BDF8" /> 五大 AI 演算法研發與政策模擬實驗室 (R&D Simulation Labs)
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
              基於全台 4.49 億筆多模態票證大數據與機器學習演算法之即時互動式決策模擬
            </p>
          </div>
          <span style={{ fontSize: '12px', background: 'rgba(56, 189, 248, 0.12)', color: '#38BDF8', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '4px 12px', borderRadius: '20px', fontWeight: '600' }}>
            ML & ST-GNN Powered
          </span>
        </div>

        {/* Lab Switcher Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginTop: '18px' }}>
          {[
            { id: 'rebalancing', name: '1. YouBike 潮汐調度 AI', icon: Bike, color: '#06B6D4' },
            { id: 'gap_detection', name: '2. 第一/最後一哩缺口檢測', icon: MapPin, color: '#10B981' },
            { id: 'tpass_carbon', name: '3. TPASS & ESG 減碳量化', icon: Leaf, color: '#3B82F6' },
            { id: 'resilience', name: '4. 軌道突發中斷應變 AI', icon: ShieldAlert, color: '#F43F5E' },
            { id: 'tourism', name: '5. 觀光廊帶智慧聯票推薦', icon: Sparkles, color: '#F97316' }
          ].map(lab => {
            const isSelected = activeLabId === lab.id;
            const Icon = lab.icon;
            return (
              <button
                key={lab.id}
                onClick={() => setActiveLabId(lab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: isSelected ? `1px solid ${lab.color}` : '1px solid rgba(255,255,255,0.06)',
                  background: isSelected ? `${lab.color}22` : 'rgba(30, 41, 59, 0.4)',
                  color: isSelected ? '#f8fafc' : '#94a3b8',
                  fontSize: '13px',
                  fontWeight: isSelected ? '700' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} color={lab.color} />
                <span>{lab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Simulation Panel */}
      <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '24px' }}>
        
        {/* ================= LAB 1: YouBike Rebalancing (GIS Map Enabled) ================= */}
        {activeLabId === 'rebalancing' && (
          <div>
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#06B6D4', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bike size={20} color="#06B6D4" /> 實驗室 1：YouBike 潮汐再平衡與智慧調度最佳化 (ST-GNN Fleet Rebalancing)
                </h3>
                <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px' }}>
                  針對科技園區與學區早尖峰湧入人流，預測缺車站點並求解調度貨車最佳補車排班與即時巡迴路徑。
                </p>
              </div>
              <span style={{ fontSize: '12px', background: 'rgba(6, 182, 212, 0.15)', color: '#06B6D4', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '4px 10px', borderRadius: '6px', fontWeight: '700' }}>
                🗺️ GIS 車隊調度地圖已啟用
              </span>
            </div>

            {/* Main 2-Column Grid: Left Controls & KPIs, Right Interactive Map */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: '20px', marginBottom: '24px' }}>
              
              {/* Left Controls & Parameters */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sliders size={16} color="#06B6D4" /> 調度需求與車隊配置
                  </h4>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>目標調度高頻節點 (Hub)</label>
                    <select 
                      value={bikeStation} 
                      onChange={e => setBikeStation(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'rgba(15, 23, 42, 0.9)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.15)', fontSize: '13px', fontWeight: '600' }}
                    >
                      <option value="陽光舊宗路口 (內科)">YouBike2.0 陽光舊宗路口 (內科)</option>
                      <option value="瑞光路548巷 (內科)">YouBike2.0 瑞光路548巷 (內科)</option>
                      <option value="捷運公館站 (學區)">YouBike2.0 捷運公館站 (學區)</option>
                      <option value="高鐵桃園站 (青埔)">YouBike2.0 高鐵桃園站 (青埔)</option>
                      <option value="國家生技園區 (南港)">YouBike2.0 國家生技園區 (南港)</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                      <span>早尖峰需求激增 (Surge Rate)</span>
                      <strong style={{ color: '#06B6D4', fontFamily: 'JetBrains Mono' }}>+{bikeDemandSurge}%</strong>
                    </div>
                    <input 
                      type="range" min="0" max="60" step="5"
                      value={bikeDemandSurge} 
                      onChange={e => setBikeDemandSurge(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#06B6D4', cursor: 'pointer' }} 
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                      <span>調度巡迴卡車規模</span>
                      <strong style={{ color: '#06B6D4', fontFamily: 'JetBrains Mono' }}>{bikeTruckCount} 輛 (每輛 20 車)</strong>
                    </div>
                    <input 
                      type="range" min="2" max="15" step="1"
                      value={bikeTruckCount} 
                      onChange={e => setBikeTruckCount(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#06B6D4', cursor: 'pointer' }} 
                    />
                  </div>
                </div>

                {/* AI SLA Output Box */}
                <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.2)', padding: '12px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>預期服務水準 (SLA)</div>
                      <div style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'JetBrains Mono', color: slaScore > 85 ? '#10B981' : '#F59E0B' }}>
                        {slaScore}%
                      </div>
                    </div>
                    <div style={{ background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.2)', padding: '12px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>節省轉乘等待時間</div>
                      <div style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'JetBrains Mono', color: '#38BDF8' }}>
                        {waitTimeSaved.toLocaleString()} <span style={{ fontSize: '11px' }}>分鐘</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                    💡 <strong>ST-GNN 預測：</strong> 於 07:30 ~ 08:30 尖峰區間，調度車隊將自鄰近溢車站（滿位站點）轉移收車，即時挹注目標缺車站。
                  </div>
                </div>

              </div>

              {/* Right Interactive GIS Map */}
              <div>
                <RebalancingMap 
                  selectedStationKey={bikeStation}
                  demandSurge={bikeDemandSurge}
                  truckCount={bikeTruckCount}
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= LAB 2: Transit Gap Detection (GIS Map Enabled) ================= */}
        {activeLabId === 'gap_detection' && (() => {
          const currentAreaConfig = GAP_AREAS_CONFIG[gapArea] || GAP_AREAS_CONFIG['淡海新市鎮'];
          const totalSpots = currentAreaConfig.coldSpots.length;
          const coverageScore = Math.min(96, Math.max(38, Math.round((bufferRadius / 1500) * 65 + 32)));
          const resolvedCount = bufferRadius >= 1200 ? 2 : (bufferRadius >= 800 ? 1 : 0);
          const activeGaps = Math.max(1, totalSpots - resolvedCount);

          return (
            <div>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#10B981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={20} color="#10B981" /> 實驗室 2：第一哩/最後一哩路網斷點與冷區缺口檢測 (Transit Gap AI)
                  </h3>
                  <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px' }}>
                    以空間幾何緩衝區 (Buffer {bufferRadius}m) 交叉比對高鐵/捷運/臺鐵出站量與公車/單車覆蓋率，即時於 GIS 地圖探勘人流冷區與轉乘盲點。
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '4px 10px', borderRadius: '6px', fontWeight: '700' }}>
                    🗺️ GIS 地圖互動模式中
                  </span>
                </div>
              </div>

              {/* Main 2-Column Grid: Left Controls & KPIs, Right Interactive Map */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: '20px', marginBottom: '24px' }}>
                
                {/* Left Controls & Analytics Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Area & Buffer Slider Box */}
                  <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sliders size={16} color="#10B981" /> 空間分析參數設定
                    </h4>
                    
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>分析重點重劃區 / 園區</label>
                      <select 
                        value={gapArea} 
                        onChange={e => {
                          setGapArea(e.target.value);
                          setSelectedColdSpot(null);
                        }}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'rgba(15, 23, 42, 0.9)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.15)', fontSize: '13px', fontWeight: '600' }}
                      >
                        <option value="淡海新市鎮">淡海新市鎮 (新北捷運輕軌沿線)</option>
                        <option value="內湖科技園區">內湖科技園區 & 五期重劃區</option>
                        <option value="桃園青埔特區">桃園青埔特區 (高鐵桃園站/機捷)</option>
                        <option value="新莊副都心">新莊副都心 (機捷/環狀線交界)</option>
                        <option value="楠梓產業園區">楠梓產業園區 (高捷/半導體走廊)</option>
                      </select>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                        <span>步行舒適接駁半徑 (Catchment)</span>
                        <strong style={{ color: '#10B981', fontFamily: 'JetBrains Mono' }}>{bufferRadius} 公尺</strong>
                      </div>
                      <input 
                        type="range" min="400" max="1500" step="100"
                        value={bufferRadius} 
                        onChange={e => setBufferRadius(Number(e.target.value))}
                        style={{ width: '100%', accentColor: '#10B981', cursor: 'pointer' }} 
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
                        <span>400m (5分鐘步程)</span>
                        <span>800m (標準)</span>
                        <span>1500m (單車圈)</span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic KPI Score Cards */}
                  <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '8px' }}>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>接駁涵蓋率評分</div>
                        <div style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'JetBrains Mono', color: coverageScore > 75 ? '#10B981' : '#F59E0B' }}>
                          {coverageScore}%
                        </div>
                      </div>
                      <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '8px' }}>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>未解服務冷區</div>
                        <div style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'JetBrains Mono', color: '#EF4444' }}>
                          {activeGaps} <span style={{ fontSize: '12px', color: '#94a3b8' }}>處</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5' }}>
                      <p style={{ margin: 0 }}>
                        💡 <strong>動態評估：</strong> 當設定接駁半徑為 <strong>{bufferRadius}m</strong> 時，該區仍有 <strong>{activeGaps} 處</strong> 密集住宅/廠辦落於有效服務圈外，建議透過下方的 AI 補強方案改善。
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Interactive GIS Map */}
                <div>
                  <TransitGapMap 
                    selectedAreaKey={gapArea}
                    bufferRadius={bufferRadius}
                    onSelectColdSpot={spot => setSelectedColdSpot(spot)}
                  />
                </div>
              </div>

              {/* Bottom Deep Dive: Cold Spots List + AI Interventions */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
                
                {/* Cold Spots Inspection Cards */}
                <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#EF4444', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={16} /> 偵測到之路網斷點與服務冷區明細 ({currentAreaConfig.coldSpots.length} 處)
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {currentAreaConfig.coldSpots.map(cs => {
                      const isSelected = selectedColdSpot?.id === cs.id;
                      return (
                        <div 
                          key={cs.id}
                          onClick={() => setSelectedColdSpot(cs)}
                          style={{
                            background: isSelected ? 'rgba(239, 68, 68, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                            border: isSelected ? '1px solid #EF4444' : '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '8px',
                            padding: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontWeight: '700', fontSize: '13px', color: '#f8fafc' }}>
                              🔴 [{cs.id}] {cs.name}
                            </span>
                            <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: cs.severity === 'high' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: cs.severity === 'high' ? '#EF4444' : '#F59E0B', fontWeight: '700' }}>
                              {cs.severity.toUpperCase()}
                            </span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                            📍 鄰近站點: {cs.nearestStation} | <strong style={{ color: '#F87171' }}>{cs.deficitTrips}</strong>
                          </div>
                          <p style={{ fontSize: '11px', color: '#cbd5e1', margin: 0, lineHeight: '1.4' }}>
                            {cs.reason}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* AI Proposed Recommendations */}
                <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#10B981', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={16} /> AI 最佳化接駁改善計畫方案 (AI Interventions)
                  </h4>

                  {/* 1. New YouBike Stations */}
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#FBBF24', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                      <Bike size={14} /> 建議新設 YouBike 2.0 租賃站：
                    </div>
                    {currentAreaConfig.recommendations?.newStations?.map((ns, idx) => (
                      <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(251, 191, 36, 0.2)', fontSize: '12px', color: '#e2e8f0', marginBottom: '6px' }}>
                        <strong>{ns.name}</strong> ➔ <span style={{ color: '#10B981' }}>{ns.impact}</span>
                      </div>
                    ))}
                  </div>

                  {/* 2. Feeder Bus Routes */}
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#38BDF8', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                      <Bus size={14} /> 建議新闢/微調動態接駁中巴：
                    </div>
                    {currentAreaConfig.recommendations?.feederRoutes?.map((fr, idx) => (
                      <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.2)', fontSize: '12px', color: '#e2e8f0' }}>
                        <div style={{ fontWeight: '700', color: fr.color, marginBottom: '4px' }}>{fr.name}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>⏱️ 營運模式: {fr.headway}</div>
                        <div style={{ fontSize: '11px', color: '#10B981', fontWeight: '700' }}>📈 預期效益: {fr.benefit}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          );
        })()}

        {/* ================= LAB 3: TPASS & Carbon (GIS Map Enabled) ================= */}
        {activeLabId === 'tpass_carbon' && (
          <div>
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#3B82F6', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Leaf size={20} color="#3B82F6" /> 實驗室 3：TPASS 政策成效模擬與 ESG 減碳量化歸因系統 (Carbon Engine)
                </h3>
                <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px' }}>
                  以月票票價彈性模型與行程鏈重構，量化三大都會圈私人運具轉移率與走廊減碳光譜 (ΔCO₂)。
                </p>
              </div>
              <span style={{ fontSize: '12px', background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '4px 10px', borderRadius: '6px', fontWeight: '700' }}>
                🗺️ 綠色減碳光廊地圖已啟用
              </span>
            </div>

            {/* Main 2-Column Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: '20px', marginBottom: '24px' }}>
              
              {/* Left Controls & Parameters */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sliders size={16} color="#3B82F6" /> 政策補貼與都會圈設定
                  </h4>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>目標生活圈</label>
                    <select 
                      value={tpassZone} 
                      onChange={e => setTpassZone(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'rgba(15, 23, 42, 0.9)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.15)', fontSize: '13px', fontWeight: '600' }}
                    >
                      <option value="mega_taipei">基北北桃都會生活圈 (TPASS 1200)</option>
                      <option value="central">中彰投都會生活圈 (TPASS 999/699)</option>
                      <option value="southern">南高屏都會生活圈 (TPASS 999/399)</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                      <span>TPASS 月票定價</span>
                      <strong style={{ color: '#3B82F6', fontFamily: 'JetBrains Mono' }}>NT$ {tpassPrice} / 月</strong>
                    </div>
                    <input 
                      type="range" min="800" max="1800" step="100"
                      value={tpassPrice} 
                      onChange={e => setTpassPrice(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#3B82F6', cursor: 'pointer' }} 
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                      <span>汽機車轉移率 (Mode Shift)</span>
                      <strong style={{ color: '#3B82F6', fontFamily: 'JetBrains Mono' }}>+{modeShiftRate}%</strong>
                    </div>
                    <input 
                      type="range" min="5" max="35" step="1"
                      value={modeShiftRate} 
                      onChange={e => setModeShiftRate(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#3B82F6', cursor: 'pointer' }} 
                    />
                  </div>
                </div>

                {/* Carbon ESG KPI Card */}
                <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '12px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>年化減碳量 (CO₂e)</div>
                      <div style={{ fontSize: '20px', fontWeight: '800', color: '#38BDF8', fontFamily: 'JetBrains Mono' }}>
                        {netCO2SavedTons.toLocaleString()} <span style={{ fontSize: '11px' }}>噸</span>
                      </div>
                    </div>
                    <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>年化節省汽油</div>
                      <div style={{ fontSize: '20px', fontWeight: '800', color: '#34D399', fontFamily: 'JetBrains Mono' }}>
                        {gasolineSavedLiters.toLocaleString()} <span style={{ fontSize: '11px' }}>L</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                    🌱 相當於為台灣種植 <strong>{(netCO2SavedTons * 45).toLocaleString()} 棵樹木</strong> 的吸碳效益，可直接作為 ISO 14064 企業綠色通勤碳權佐證。
                  </div>
                </div>

              </div>

              {/* Right Interactive GIS Map */}
              <div>
                <CarbonShiftMap 
                  selectedZoneKey={tpassZone}
                  tpassPrice={tpassPrice}
                  modeShiftRate={modeShiftRate}
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= LAB 4: Emergency Evacuation (GIS Map Enabled) ================= */}
        {activeLabId === 'resilience' && (
          <div>
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#F43F5E', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={20} color="#F43F5E" /> 實驗室 4：軌道突發中斷事件之動態應變與替代接駁最佳化 (Resilient Evacuation AI)
                </h3>
                <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px' }}>
                  遇地震或號誌故障時，依歷史 OD 矩陣即時運算滯留客流擴散半徑，於地圖動態求解接駁專車最佳化調派動線。
                </p>
              </div>
              <span style={{ fontSize: '12px', background: 'rgba(244, 63, 94, 0.15)', color: '#F43F5E', border: '1px solid rgba(244, 63, 94, 0.3)', padding: '4px 10px', borderRadius: '6px', fontWeight: '700' }}>
                🗺️ GIS 緊急疏運應變地圖已啟用
              </span>
            </div>

            {/* Main 2-Column Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: '20px', marginBottom: '24px' }}>
              
              {/* Left Controls & Parameters */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sliders size={16} color="#F43F5E" /> 突發事件情境設定
                  </h4>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>中斷軌道區間</label>
                    <select 
                      value={incidentCorridor} 
                      onChange={e => setIncidentCorridor(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'rgba(15, 23, 42, 0.9)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.15)', fontSize: '13px', fontWeight: '600' }}
                    >
                      <option value="台北車站 <-> 西門 (北捷核心走廊)">台北車站 ⟷ 西門 (北捷核心雙向走廊)</option>
                      <option value="新北產業園區 <-> 板橋 (環狀線)">新北產業園區 ⟷ 板橋 (新北捷運環狀線)</option>
                      <option value="左營 <-> 巨蛋 (高捷紅線)">左營 ⟷ 巨蛋 (高雄捷運紅線走廊)</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                      <span>預估營運中斷時長</span>
                      <strong style={{ color: '#F43F5E', fontFamily: 'JetBrains Mono' }}>{incidentDuration} 分鐘</strong>
                    </div>
                    <input 
                      type="range" min="15" max="90" step="5"
                      value={incidentDuration} 
                      onChange={e => setIncidentDuration(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#F43F5E', cursor: 'pointer' }} 
                    />
                  </div>

                  <div>
                    <button
                      onClick={() => setIsPeakHour(!isPeakHour)}
                      style={{
                        width: '100%',
                        padding: '9px 16px',
                        borderRadius: '6px',
                        background: isPeakHour ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255,255,255,0.06)',
                        border: `1px solid ${isPeakHour ? '#F43F5E' : 'rgba(255,255,255,0.1)'}`,
                        color: isPeakHour ? '#F43F5E' : '#94a3b8',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {isPeakHour ? '⚡ 上下班尖峰時段 (08:00 湧量)' : '🌤 離峰時段 (14:00 平穩)'}
                    </button>
                  </div>
                </div>

                {/* Evacuation KPI Box */}
                <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.2)', padding: '12px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>預估滯留人次</div>
                      <div style={{ fontSize: '20px', fontWeight: '800', color: '#F43F5E', fontFamily: 'JetBrains Mono' }}>
                        {strandedPax.toLocaleString()} <span style={{ fontSize: '11px' }}>人</span>
                      </div>
                    </div>
                    <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '12px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>需調派專車車隊</div>
                      <div style={{ fontSize: '20px', fontWeight: '800', color: '#FBBF24', fontFamily: 'JetBrains Mono' }}>
                        {requiredBuses} <span style={{ fontSize: '11px' }}>輛</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                    ⏱️ 建議接駁專車發車間距為 <strong>每 {recommendedHeadwayMins} 分鐘/班</strong>，預計於事件排除後 <strong>{clearTimeMins} 分鐘內</strong> 完全清空滯留客流。
                  </div>
                </div>

              </div>

              {/* Right Interactive GIS Map */}
              <div>
                <EvacuationMap 
                  selectedIncidentKey={incidentCorridor}
                  incidentDuration={incidentDuration}
                  isPeakHour={isPeakHour}
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= LAB 5: Tourism Pass (GIS Map Enabled) ================= */}
        {activeLabId === 'tourism' && (
          <div>
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#F97316', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={20} color="#F97316" /> 實驗室 5：觀光廊帶人流挖掘與跨運具動態套票推薦 (Tourism Mobility AI)
                </h3>
                <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px' }}>
                  過濾出假日高頻且平日低頻之純休閒 OD，推薦「高鐵 + 捷運 + 客運 + YouBike」彈性聯票並於地圖直觀呈現觀光動態廊道。
                </p>
              </div>
              <span style={{ fontSize: '12px', background: 'rgba(249, 115, 22, 0.15)', color: '#F97316', border: '1px solid rgba(249, 115, 22, 0.3)', padding: '4px 10px', borderRadius: '6px', fontWeight: '700' }}>
                🗺️ 觀光廊帶推薦地圖已啟用
              </span>
            </div>

            {/* Main 2-Column Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: '20px', marginBottom: '24px' }}>
              
              {/* Left Controls & Parameters */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sliders size={16} color="#F97316" /> 觀光廊帶選擇與定價
                  </h4>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>目標觀光動脈走廊</label>
                    <select 
                      value={tourismCorridor} 
                      onChange={e => setTourismCorridor(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'rgba(15, 23, 42, 0.9)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.15)', fontSize: '13px', fontWeight: '600' }}
                    >
                      <option value="市府轉運站 <-> 宜蘭/羅東 (國道客運)">市府轉運站 ⟷ 宜蘭/羅東 (國道客運 + 宜蘭 YouBike)</option>
                      <option value="左營 <-> 巨蛋/三多/駁二 (高鐵+高捷)">高鐵左營 ⟷ 巨蛋/駁二特區 (高鐵 + 高捷 + 輕軌)</option>
                      <option value="台北 <-> 青埔高鐵/華泰 (高鐵+桃捷)">台北車站 ⟷ 青埔高鐵/華泰名品城 (高鐵 + 桃捷 + 單車)</option>
                    </select>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                      <span>觀光聯票折扣率</span>
                      <strong style={{ color: '#F97316', fontFamily: 'JetBrains Mono' }}>{bundleDiscount}% OFF</strong>
                    </div>
                    <input 
                      type="range" min="5" max="30" step="5"
                      value={bundleDiscount} 
                      onChange={e => setBundleDiscount(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#F97316', cursor: 'pointer' }} 
                    />
                  </div>
                </div>

                {/* Tourism KPI Box */}
                <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ background: 'rgba(249, 115, 22, 0.08)', border: '1px solid rgba(249, 115, 22, 0.2)', padding: '12px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>週末遊客增長率</div>
                      <div style={{ fontSize: '20px', fontWeight: '800', color: '#F97316', fontFamily: 'JetBrains Mono' }}>
                        +{(bundleDiscount * 1.45).toFixed(1)}%
                      </div>
                    </div>
                    <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>在地觀光產值</div>
                      <div style={{ fontSize: '20px', fontWeight: '800', color: '#34D399', fontFamily: 'JetBrains Mono' }}>
                        +NT${(bundleDiscount * 125)}萬
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                    🎁 推薦套裝產品：<strong>「綠活暢遊卡」</strong>（跨運具自由搭乘 + 沿線觀光景點門票優惠券）。
                  </div>
                </div>

              </div>

              {/* Right Interactive GIS Map */}
              <div>
                <TourismPassMap 
                  selectedCorridorKey={tourismCorridor}
                  bundleDiscount={bundleDiscount}
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
