import React, { useState, useId } from 'react';
import {
  Umbrella, Sun, CloudRain, Calendar, Clock, Sparkles, TrendingUp,
  TrendingDown, ArrowRight, ShieldAlert, Users, Bus, Train, Bike,
  ChevronRight, Info, AlertTriangle, Layers
} from 'lucide-react';

const PERSONA_COLORS = {
  2: { base: '#38BDF8', glow: 'rgba(56, 189, 248, 0.4)', icon: '💼', shortName: '早鳥上班族' },
  3: { base: '#10B981', glow: 'rgba(16, 185, 129, 0.4)', icon: '🎓', shortName: '學生通學族' },
  5: { base: '#F43F5E', glow: 'rgba(244, 63, 94, 0.4)', icon: '👵', shortName: '銀髮醫療族' },
  1: { base: '#A855F7', glow: 'rgba(168, 85, 247, 0.4)', icon: '🚄', shortName: '跨城返鄉族' },
  0: { base: '#F97316', glow: 'rgba(249, 115, 22, 0.4)', icon: '🧳', shortName: '偶發休閒族' },
  4: { base: '#EAB308', glow: 'rgba(234, 179, 8, 0.4)', icon: '🌙', shortName: '夜貓商務族' }
};

export default function WeatherPersonaComparisonLab({ weatherData }) {
  const [dayType, setDayType] = useState('workday'); // 'workday' or 'holiday'
  const [selectedPersonaId, setSelectedPersonaId] = useState(3); // 預設學生通學族 (最富故事性)
  const [hoveredHour, setHoveredHour] = useState(null);
  const [activeModeLeakage, setActiveModeLeakage] = useState('taipei_bike');
  const [visibleCurves, setVisibleCurves] = useState({
    sunny: true,
    cloudy: true,
    rainy: true,
    heavy_rain: true
  });
  const [modeWeatherView, setModeWeatherView] = useState('rainy'); // 'cloudy', 'rainy', 'heavy_rain'
  const gradientPrefix = useId();

  if (!weatherData) {
    return (
      <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
        正在載入全台晴雨多模態客群衝擊大數據...
      </div>
    );
  }

  const personas = weatherData.persona_weather_profiles || [];
  const matrixData = weatherData.weather_persona_diurnal_matrix?.[dayType] || [];
  const modes = weatherData.mode_weather_elasticity || [];

  const currentPersona = personas.find(p => p.cluster_id === selectedPersonaId) || personas[0] || {};
  const diurnalCurves = currentPersona?.diurnal_curves || {};
  const diurnal = diurnalCurves[dayType] || {};

  const hours = Array.isArray(diurnalCurves.hours) ? diurnalCurves.hours : Array.from({ length: 24 }, (_, i) => i);
  const sunnyVals = Array.isArray(diurnal?.sunny) ? diurnal.sunny : Array(24).fill(0);
  const cloudyVals = Array.isArray(diurnal?.cloudy) ? diurnal.cloudy : Array(24).fill(0);
  const rainyVals = Array.isArray(diurnal?.rainy) ? diurnal.rainy : Array(24).fill(0);
  const heavyRainVals = Array.isArray(diurnal?.heavy_rain) ? diurnal.heavy_rain : Array(24).fill(0);
  const deltaPcts = Array.isArray(diurnal?.delta_pct) ? diurnal.delta_pct : Array(24).fill(0);
  const deltaPctsCloudy = Array.isArray(diurnal?.delta_pct_cloudy) ? diurnal.delta_pct_cloudy : Array(24).fill(0);
  const deltaPctsHeavyRain = Array.isArray(diurnal?.delta_pct_heavy_rain) ? diurnal.delta_pct_heavy_rain : Array(24).fill(0);

  // 計算 SVG 曲線座標 (寬度 840，高度 260，padding 40)
  const activeCurveVals = [
    ...(visibleCurves.sunny ? sunnyVals : []),
    ...(visibleCurves.cloudy ? cloudyVals : []),
    ...(visibleCurves.rainy ? rainyVals : []),
    ...(visibleCurves.heavy_rain ? heavyRainVals : []),
    1000
  ];
  const maxVal = Math.max(...activeCurveVals) * 1.15;
  const svgWidth = 840;
  const svgHeight = 260;
  const padLeft = 55;
  const padRight = 25;
  const padTop = 30;
  const padBottom = 35;
  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  const getX = (idx) => padLeft + (idx / 23) * chartW;
  const getY = (val) => padTop + chartH - (val / maxVal) * chartH;

  // 產生 SVG Path (貝茲曲線)
  const createSmoothPath = (pts) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i < pts.length - 2 ? pts[i + 2] : p2;
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const sunnyPoints = hours.map((h, i) => ({ x: getX(i), y: getY(sunnyVals[i] || 0) }));
  const cloudyPoints = hours.map((h, i) => ({ x: getX(i), y: getY(cloudyVals[i] || 0) }));
  const rainyPoints = hours.map((h, i) => ({ x: getX(i), y: getY(rainyVals[i] || 0) }));
  const heavyRainPoints = hours.map((h, i) => ({ x: getX(i), y: getY(heavyRainVals[i] || 0) }));

  const sunnyPath = createSmoothPath(sunnyPoints);
  const cloudyPath = createSmoothPath(cloudyPoints);
  const rainyPath = createSmoothPath(rainyPoints);
  const heavyRainPath = createSmoothPath(heavyRainPoints);

  // 建立陰影差值閉合多邊形
  const lastRainy = rainyPoints[rainyPoints.length - 1] || { x: getX(23), y: getY(0) };
  const diffAreaPath = rainyPoints.length > 0 && visibleCurves.sunny && visibleCurves.rainy
    ? `${sunnyPath} L ${lastRainy.x} ${lastRainy.y} ` +
      createSmoothPath([...rainyPoints].reverse()).replace(/^M [0-9\.]+ [0-9\.]+/, '') +
      ` Z`
    : '';

  const currColor = PERSONA_COLORS[currentPersona?.cluster_id] || PERSONA_COLORS[3];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Header Banner & Scenario Toggles */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.85))',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        borderRadius: '16px',
        padding: '20px 24px',
        boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ fontSize: '24px' }}>🌦️</span>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#f8fafc', letterSpacing: '0.3px' }}>
                全台客群晴雨作息與天候敏感度對比實驗室
              </h2>
              <span style={{
                fontSize: '11px',
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38BDF8',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                padding: '3px 8px',
                borderRadius: '6px',
                fontWeight: '700'
              }}>
                24H 實證時鐘解析
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', lineHeight: '1.6' }}>
              解決空間地圖尺度壓縮陷阱，透過「<strong>時段作息波形覆疊</strong>」與「<strong>全族群天候衝擊矩陣</strong>」，直觀洞察暴雨在何時引發擠壓湧浪、何時導致活動凍結。
            </p>
          </div>

          {/* 日型快速切換按鈕 (工作日 vs 放假日) */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '10px',
            padding: '4px',
            display: 'flex',
            gap: '4px'
          }}>
            <button
              onClick={() => setDayType('workday')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: dayType === 'workday' ? '800' : '600',
                border: 'none',
                background: dayType === 'workday' ? 'linear-gradient(135deg, #0284C7, #06B6D4)' : 'transparent',
                color: dayType === 'workday' ? '#FFFFFF' : '#94A3B8',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Calendar size={13} />
              <span>💼 常規上班日 (Workday)</span>
            </button>
            <button
              onClick={() => setDayType('holiday')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: dayType === 'holiday' ? '800' : '600',
                border: 'none',
                background: dayType === 'holiday' ? 'linear-gradient(135deg, #7C3AED, #A855F7)' : 'transparent',
                color: dayType === 'holiday' ? '#FFFFFF' : '#94A3B8',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Sparkles size={13} />
              <span>🏖️ 實質放假日 (Holiday)</span>
            </button>
          </div>
        </div>

        {/* 六大客群快速切換 Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {personas.map(p => {
            const isSel = p.cluster_id === selectedPersonaId;
            const meta = PERSONA_COLORS[p.cluster_id] || PERSONA_COLORS[3];
            return (
              <button
                key={p.cluster_id}
                onClick={() => setSelectedPersonaId(p.cluster_id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: isSel ? '800' : '500',
                  border: isSel ? `1px solid ${meta.base}` : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isSel ? `${meta.glow}` : 'rgba(30, 41, 59, 0.6)',
                  color: isSel ? '#F8FAFC' : '#94A3B8',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{meta.icon}</span>
                <span>{p.name.split(' (')[0]}</span>
                <span style={{
                  fontSize: '10px',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  background: 'rgba(0,0,0,0.3)',
                  color: isSel ? meta.base : '#64748b'
                }}>
                  {p.rigidity_score}% 剛性
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. 核心主圖：24 小時晴雨作息波形雙線覆疊圖 */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.09)',
        borderRadius: '16px',
        padding: '22px 24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        {/* 圖表頂部指標與圖例說明 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>{currColor.icon}</span>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#f8fafc' }}>
                {currentPersona.name} — 24 小時晴雨出行波形覆疊對照
              </h3>
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>
              情境：<strong style={{ color: dayType === 'workday' ? '#38BDF8' : '#A855F7' }}>{dayType === 'workday' ? '💼 常規上班日' : '🏖️ 實質放假日'}</strong> | 
              天候反應型態：<strong style={{ color: currColor.base }}>{currentPersona.weather_response_type}</strong>
            </div>
          </div>

          {/* 4 段天候互動式曲線切換 Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: '#64748b', marginRight: '2px' }}>波形圖例：</span>
            {[
              { id: 'sunny', label: '☀️ 晴朗天', color: '#F59E0B', active: visibleCurves.sunny },
              { id: 'cloudy', label: '☁️ 陰天', color: '#94A3B8', active: visibleCurves.cloudy },
              { id: 'rainy', label: '🌧️ 常規雨', color: '#38BDF8', active: visibleCurves.rainy },
              { id: 'heavy_rain', label: '⛈️ 豪大雨', color: '#F43F5E', active: visibleCurves.heavy_rain }
            ].map(btn => (
              <button
                key={btn.id}
                onClick={() => setVisibleCurves(prev => {
                  const next = { ...prev, [btn.id]: !prev[btn.id] };
                  if (!next.sunny && !next.cloudy && !next.rainy && !next.heavy_rain) return prev;
                  return next;
                })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 9px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '700',
                  border: btn.active ? `1px solid ${btn.color}` : '1px solid rgba(255,255,255,0.08)',
                  background: btn.active ? `${btn.color}25` : 'rgba(255,255,255,0.03)',
                  color: btn.active ? btn.color : '#64748b',
                  cursor: 'pointer',
                  opacity: btn.active ? 1 : 0.45,
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: btn.color }} />
                <span>{btn.label}</span>
                <span style={{ fontSize: '9px', opacity: 0.8 }}>{btn.active ? '✓' : 'off'}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 實證關鍵洞察診斷條 */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.6)',
          borderLeft: `4px solid ${currColor.base}`,
          borderRadius: '4px 8px 8px 4px',
          padding: '10px 14px',
          fontSize: '12px',
          color: '#e2e8f0',
          lineHeight: '1.5',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Sparkles size={15} color={currColor.base} style={{ flexShrink: 0 }} />
          <span><strong>時空行為實證解析：</strong>{diurnal.highlight}</span>
        </div>

        {/* 互動式 SVG 曲線圖主體 */}
        <div style={{ width: '100%', position: 'relative', overflowX: 'auto' }}>
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            style={{ width: '100%', height: 'auto', minWidth: '700px', display: 'block' }}
          >
            <defs>
              <linearGradient id={`${gradientPrefix}-diffGrad`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#0284C7" stopOpacity="0.22" />
              </linearGradient>
              <linearGradient id={`${gradientPrefix}-rainGlow`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0284C7" />
                <stop offset="100%" stopColor="#38BDF8" />
              </linearGradient>
            </defs>

            {/* Y 軸格線 */}
            {[0, 0.25, 0.5, 0.75, 1.0].map((ratio, i) => {
              const yVal = padTop + chartH * (1 - ratio);
              const label = Math.round((maxVal * ratio) / 1000);
              return (
                <g key={i}>
                  <line
                    x1={padLeft}
                    y1={yVal}
                    x2={svgWidth - padRight}
                    y2={yVal}
                    stroke="rgba(255, 255, 255, 0.07)"
                    strokeDasharray={i === 0 ? 'none' : '3,3'}
                  />
                  <text
                    x={padLeft - 8}
                    y={yVal + 4}
                    textAnchor="end"
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {label}k
                  </text>
                </g>
              );
            })}

            {/* 晴雨差值填充帶 */}
            {diffAreaPath && (
              <path
                d={diffAreaPath}
                fill={`url(#${gradientPrefix}-diffGrad)`}
              />
            )}

            {/* ☀️ 晴天常態曲線 */}
            {visibleCurves.sunny && (
              <path
                d={sunnyPath}
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2.4"
                strokeDasharray="5,4"
                opacity="0.85"
              />
            )}

            {/* ☁️ 陰天平穩曲線 */}
            {visibleCurves.cloudy && (
              <path
                d={cloudyPath}
                fill="none"
                stroke="#94A3B8"
                strokeWidth="2.2"
                strokeDasharray="3,3"
                opacity="0.9"
              />
            )}

            {/* 🌧️ 常規雨實況曲線 */}
            {visibleCurves.rainy && (
              <path
                d={rainyPath}
                fill="none"
                stroke={`url(#${gradientPrefix}-rainGlow)`}
                strokeWidth="3.2"
                filter="drop-shadow(0 2px 8px rgba(56, 189, 248, 0.35))"
              />
            )}

            {/* ⛈️ 豪大雨極端實況曲線 */}
            {visibleCurves.heavy_rain && (
              <path
                d={heavyRainPath}
                fill="none"
                stroke="#F43F5E"
                strokeWidth="3.4"
                filter="drop-shadow(0 2px 10px rgba(244, 63, 94, 0.5))"
              />
            )}

            {/* X 軸小時刻度與文字 */}
            {hours.map((h, i) => {
              const xVal = getX(i);
              const isPeakHour = (h >= 7 && h <= 9) || (h >= 16 && h <= 18) || (h === 21);
              return (
                <g key={h}>
                  <line
                    x1={xVal}
                    y1={padTop + chartH}
                    x2={xVal}
                    y2={padTop + chartH + 5}
                    stroke="rgba(255, 255, 255, 0.2)"
                  />
                  <text
                    x={xVal}
                    y={padTop + chartH + 18}
                    textAnchor="middle"
                    fill={isPeakHour ? '#f8fafc' : '#64748b'}
                    fontWeight={isPeakHour ? '700' : '400'}
                    fontSize={isPeakHour ? '11' : '10'}
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {String(h).padStart(2, '0')}
                  </text>
                </g>
              );
            })}

            {/* 懸浮時間導引垂直線與交點高亮 */}
            {hoveredHour !== null && (
              <g>
                <line
                  x1={getX(hoveredHour)}
                  y1={padTop}
                  x2={getX(hoveredHour)}
                  y2={padTop + chartH}
                  stroke="#38BDF8"
                  strokeWidth="1.5"
                  strokeDasharray="4,4"
                />
                {/* 晴天交點 */}
                {visibleCurves.sunny && (
                  <circle
                    cx={getX(hoveredHour)}
                    cy={getY(sunnyVals[hoveredHour])}
                    r="5"
                    fill="#F59E0B"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                )}
                {/* 陰天交點 */}
                {visibleCurves.cloudy && (
                  <circle
                    cx={getX(hoveredHour)}
                    cy={getY(cloudyVals[hoveredHour])}
                    r="5"
                    fill="#94A3B8"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                )}
                {/* 雨天交點 */}
                {visibleCurves.rainy && (
                  <circle
                    cx={getX(hoveredHour)}
                    cy={getY(rainyVals[hoveredHour])}
                    r="6"
                    fill="#38BDF8"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                  />
                )}
                {/* 豪大雨交點 */}
                {visibleCurves.heavy_rain && (
                  <circle
                    cx={getX(hoveredHour)}
                    cy={getY(heavyRainVals[hoveredHour])}
                    r="6.5"
                    fill="#F43F5E"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                  />
                )}
              </g>
            )}

            {/* 滑鼠感應透明柱 (提供流暢 Hover 體驗) */}
            {hours.map((h, i) => {
              const xLeft = i === 0 ? padLeft : getX(i) - (chartW / 46);
              const colW = chartW / 23;
              return (
                <rect
                  key={h}
                  x={xLeft}
                  y={padTop}
                  width={colW}
                  height={chartH}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredHour(i)}
                  onMouseLeave={() => setHoveredHour(null)}
                />
              );
            })}
          </svg>

          {/* 懸浮時段精確指標卡 (Tooltip HUD) */}
          {hoveredHour !== null && (
            <div style={{
              position: 'absolute',
              top: '12px',
              left: `${Math.min(75, Math.max(15, (getX(hoveredHour) / svgWidth) * 100))}%`,
              transform: 'translateX(-50%)',
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '11px',
              color: '#f8fafc',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              pointerEvents: 'none',
              zIndex: 10,
              minWidth: '220px'
            }}>
              <div style={{ fontWeight: '800', color: '#38BDF8', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '3px', marginBottom: '5px' }}>
                時段：{String(hoveredHour).padStart(2, '0')}:00 ~ {String(hoveredHour + 1).padStart(2, '0')}:00
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={{ color: '#FCD34D' }}>☀️ 晴天常態：</span>
                <strong style={{ fontFamily: 'JetBrains Mono, monospace' }}>{sunnyVals[hoveredHour].toLocaleString()} 人次</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={{ color: '#94A3B8' }}>☁️ 陰天實況：</span>
                <strong style={{ fontFamily: 'JetBrains Mono, monospace', color: '#CBD5E1' }}>
                  {cloudyVals[hoveredHour].toLocaleString()} ({deltaPctsCloudy[hoveredHour] >= 0 ? `+${deltaPctsCloudy[hoveredHour]}` : deltaPctsCloudy[hoveredHour]}%)
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={{ color: '#38BDF8' }}>🌧️ 常規雨天：</span>
                <strong style={{ fontFamily: 'JetBrains Mono, monospace', color: '#38BDF8' }}>
                  {rainyVals[hoveredHour].toLocaleString()} ({deltaPcts[hoveredHour] >= 0 ? `+${deltaPcts[hoveredHour]}` : deltaPcts[hoveredHour]}%)
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '3px', marginTop: '3px' }}>
                <span style={{ color: '#F43F5E' }}>⛈️ 豪大雨實況：</span>
                <strong style={{ fontFamily: 'JetBrains Mono, monospace', color: '#FDA4AF' }}>
                  {heavyRainVals[hoveredHour].toLocaleString()} ({deltaPctsHeavyRain[hoveredHour] >= 0 ? `+${deltaPctsHeavyRain[hoveredHour]}` : deltaPctsHeavyRain[hoveredHour]}%)
                </strong>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. 核心矩陣：全台 6 大客群 × 24 小時「晴雨衝擊熱力矩陣」 */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.09)',
        borderRadius: '16px',
        padding: '22px 24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '800', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="#A855F7" />
              <span>全客群 × 24 小時晴雨衝擊熱力方陣（Weather Delta Heat Grid）</span>
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
              點擊任一客群列可快速切換上方波形圖。色階代表雨天相較晴天的增減率：<span style={{ color: '#F43F5E' }}>紅色湧浪聚集</span>、<span style={{ color: '#38BDF8' }}>藍色急凍停滯</span>、<span style={{ color: '#64748b' }}>灰色剛性穩定</span>。
            </p>
          </div>
          <span style={{ fontSize: '11px', background: 'rgba(168, 85, 247, 0.15)', color: '#C084FC', padding: '4px 10px', borderRadius: '6px', fontWeight: '700' }}>
            {dayType === 'workday' ? '💼 上班日對照模式' : '🏖️ 放假日對照模式'}
          </span>
        </div>

        {/* 矩陣本體 */}
        <div style={{ overflowX: 'auto', paddingBottom: '6px' }}>
          <table style={{ width: '100%', minWidth: '760px', borderCollapse: 'separate', borderSpacing: '3px', fontSize: '11px' }}>
            <thead>
              <tr>
                <th style={{ width: '140px', textAlign: 'left', color: '#94a3b8', padding: '6px 8px' }}>客群類別</th>
                {hours.map(h => (
                  <th key={h} style={{ textAlign: 'center', color: '#64748b', padding: '6px 2px', fontFamily: 'JetBrains Mono, monospace', fontSize: '10px' }}>
                    {String(h).padStart(2, '0')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrixData.map(row => {
                const isSelected = row.cluster_id === selectedPersonaId;
                const meta = PERSONA_COLORS[row.cluster_id] || PERSONA_COLORS[3];
                return (
                  <tr
                    key={row.cluster_id}
                    onClick={() => setSelectedPersonaId(row.cluster_id)}
                    style={{
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <td style={{
                      padding: '8px 8px',
                      fontWeight: isSelected ? '800' : '600',
                      color: isSelected ? meta.base : '#e2e8f0',
                      whiteSpace: 'nowrap',
                      borderLeft: isSelected ? `3px solid ${meta.base}` : '3px solid transparent'
                    }}>
                      <span style={{ marginRight: '6px' }}>{meta.icon}</span>
                      <span>{meta.shortName}</span>
                    </td>
                    {(row.delta_pct || Array(24).fill(0)).map((d, hIdx) => {
                      // 色彩映射：
                      // d >= +20: 深紅
                      // d >= +10: 淺紅/橘紅
                      // d >= +3: 微粉
                      // d <= -40: 深冰藍
                      // d <= -20: 冰藍
                      // d <= -10: 淺藍
                      let cellBg = 'rgba(255, 255, 255, 0.03)';
                      let cellColor = '#64748b';
                      if (d >= 20) {
                        cellBg = 'rgba(244, 63, 94, 0.75)';
                        cellColor = '#FFFFFF';
                      } else if (d >= 10) {
                        cellBg = 'rgba(244, 63, 94, 0.40)';
                        cellColor = '#FDA4AF';
                      } else if (d >= 3) {
                        cellBg = 'rgba(251, 146, 60, 0.25)';
                        cellColor = '#FED7AA';
                      } else if (d <= -40) {
                        cellBg = 'rgba(2, 132, 199, 0.85)';
                        cellColor = '#FFFFFF';
                      } else if (d <= -20) {
                        cellBg = 'rgba(2, 132, 199, 0.48)';
                        cellColor = '#BAE6FD';
                      } else if (d <= -10) {
                        cellBg = 'rgba(2, 132, 199, 0.25)';
                        cellColor = '#7DD3FC';
                      }

                      return (
                        <td
                          key={hIdx}
                          title={`${row.name} @ ${hIdx}:00 -> 晴雨變動 ${d >= 0 ? '+' : ''}${d}%`}
                          style={{
                            background: cellBg,
                            color: cellColor,
                            textAlign: 'center',
                            borderRadius: '3px',
                            padding: '6px 1px',
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: '9.5px',
                            fontWeight: Math.abs(d) >= 15 ? '800' : '500',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {d > 0 ? `+${d.toFixed(0)}` : d < 0 ? d.toFixed(0) : '0'}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. 運具外溢與替代對比 (Mode Substitution Flows) */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.09)',
        borderRadius: '16px',
        padding: '22px 24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '800', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="#10B981" />
              <span>運具天候彈性對稱差值與微型移動外溢 (Mode Weather Diverging Shifts)</span>
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
              對稱橫條圖展示各運具在不同天候情境之「暴跌流失」vs「湧浪吸收」，點擊 YouBike 可展開其外溢路徑。
            </p>
          </div>

          {/* 天候情境切換按鈕 (陰天 / 常規雨 / 豪大雨) */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '3px',
            display: 'flex',
            gap: '3px'
          }}>
            {[
              { id: 'cloudy', label: '☁️ 陰天微氣候', color: '#94A3B8' },
              { id: 'rainy', label: '🌧️ 常規雨 (0.1~10mm)', color: '#38BDF8' },
              { id: 'heavy_rain', label: '⛈️ 豪大雨 (≥10mm)', color: '#F43F5E' }
            ].map(mw => {
              const isSel = modeWeatherView === mw.id;
              return (
                <button
                  key={mw.id}
                  onClick={() => setModeWeatherView(mw.id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: isSel ? '700' : '500',
                    border: 'none',
                    background: isSel ? `${mw.color}25` : 'transparent',
                    color: isSel ? mw.color : '#94A3B8',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {mw.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* 左側：運具增減率對稱長條 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {modes.map(m => {
              const isSelected = activeModeLeakage === m.mode_id;
              const chgPct = modeWeatherView === 'heavy_rain'
                ? (m.heavy_rain_change_pct ?? m.change_pct)
                : modeWeatherView === 'cloudy'
                ? (m.cloudy_change_pct ?? 1.0)
                : m.change_pct;
              const isDrop = chgPct < 0;
              const barWidth = Math.min(100, Math.abs(chgPct) * 1.6);
              return (
                <div
                  key={m.mode_id}
                  onClick={() => m.leakage_destinations && setActiveModeLeakage(m.mode_id)}
                  style={{
                    background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'rgba(30, 41, 59, 0.5)',
                    border: isSelected ? '1px solid #38BDF8' : '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    cursor: m.leakage_destinations ? 'pointer' : 'default',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '700', color: '#f8fafc' }}>
                      {m.name} <span style={{ fontSize: '10px', color: '#64748b' }}>({m.category})</span>
                    </span>
                    <strong style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      color: isDrop ? '#EF4444' : '#10B981'
                    }}>
                      {chgPct > 0 ? `+${chgPct}%` : `${chgPct}%`}
                    </strong>
                  </div>
                  {/* 對稱長條 */}
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      left: isDrop ? `calc(50% - ${barWidth / 2}%)` : '50%',
                      width: `${barWidth / 2}%`,
                      height: '100%',
                      background: isDrop ? 'linear-gradient(90deg, #DC2626, #EF4444)' : 'linear-gradient(90deg, #059669, #10B981)',
                      borderRadius: '3px'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* 右側：YouBike 轉乘外溢路徑詳細展開卡 */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.7)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Bike size={18} color="#EF4444" />
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#f8fafc' }}>
                  臺北 YouBike 2.0 雨天微型移動外溢去向
                </h4>
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.5', margin: '0 0 14px 0' }}>
                晴天 YouBike 日均人次約 24.2 萬，陰天涼爽微升至 25.4 萬（+5.1%）；常規雨天驟跌至 11.2 萬（-53.7%），豪大雨日更暴跌至 4.5 萬（-81.4%）。微型移動中斷後的人流被重新分配至大眾運輸：
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { target: '雙北市區公車', share: 58.4, color: '#10B981', note: '短程接駁轉入公車復興、敦化等主要幹線' },
                  { target: '台北捷運', share: 32.1, color: '#06B6D4', note: '步行至最近地下捷運出入口避雨' },
                  { target: '放棄出行 / 計程車', share: 9.5, color: '#F59E0B', note: '非必要出行取消或改搭小型私人運具' }
                ].map((leak, idx) => (
                  <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '700', color: '#f8fafc' }}>➡️ 轉入 {leak.target}</span>
                      <strong style={{ color: leak.color, fontFamily: 'JetBrains Mono, monospace' }}>{leak.share}%</strong>
                    </div>
                    <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', marginBottom: '4px' }}>
                      <div style={{ width: `${leak.share}%`, height: '100%', background: leak.color, borderRadius: '3px' }} />
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#64748b' }}>{leak.note}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '11px',
              color: '#FDA4AF',
              marginTop: '12px'
            }}>
              ⚠️ <strong>政策調度啟示：</strong>雨天應即時通知公車調度站針對幹線公車發動加開區間加班車，防範 YouBike 轉乘外溢造成的路口公車站大排長龍。
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
