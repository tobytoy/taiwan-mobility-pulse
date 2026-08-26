import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Leaf, DollarSign, TrendingUp, Trees, Zap, Globe } from 'lucide-react';
import { esc } from '../utils/sanitize';
export const TPASS_ZONES_CONFIG = {
  'mega_taipei': {
    name: '基北北桃都會生活圈 (TPASS 1200)',
    center: [25.0478, 121.5170],
    zoom: 11,
    highwayCorridors: [
      { name: '國道一號 (汐止 - 內湖 - 台北 - 桃園)', path: [[25.0673, 121.6624], [25.0640, 121.5760], [25.0478, 121.5170], [25.0130, 121.2148]] },
      { name: '台64/65 快速公路 (八里 - 板橋 - 新店)', path: [[25.1400, 121.4100], [25.0143, 121.4638], [24.9700, 121.5400]] }
    ],
    transitCorridors: [
      { name: '北捷淡水信義線 (淡水 - 台北 - 象山)', path: [[25.1680, 121.4450], [25.0478, 121.5170], [25.0330, 121.5700]], baseVol: 380000 },
      { name: '北捷板南線 (南港 - 台北 - 板橋 - 頂埔)', path: [[25.0531, 121.6071], [25.0478, 121.5170], [25.0143, 121.4638], [24.9600, 121.4200]], baseVol: 450000 },
      { name: '臺鐵縱貫線 (基隆 - 台北 - 桃園)', path: [[25.1320, 121.7397], [25.0478, 121.5170], [24.9912, 121.4244], [24.9536, 121.2256]], baseVol: 280000 },
      { name: '高鐵北桃走廊 (台北 - 板橋 - 桃園)', path: [[25.0478, 121.5170], [25.0143, 121.4638], [25.0130, 121.2148]], baseVol: 95000 }
    ],
    ecoNodes: [
      { name: '大安森林公園 碳吸附核心', coords: [25.0300, 121.5350], capacity: '年吸碳 450 噸' },
      { name: '新北水漾綠帶 濕地碳匯', coords: [25.0500, 121.4800], capacity: '年吸碳 620 噸' }
    ]
  },
  'central': {
    name: '中彰投都會生活圈 (TPASS 999/699)',
    center: [24.1121, 120.6159],
    zoom: 11,
    highwayCorridors: [
      { name: '台74線快速道路 (台中環線)', path: [[24.1700, 120.6200], [24.1400, 120.6800], [24.1100, 120.6150]] }
    ],
    transitCorridors: [
      { name: '中捷綠線 (北屯 - 台中高鐵新烏日)', path: [[24.1800, 120.7100], [24.1500, 120.6500], [24.1121, 120.6159]], baseVol: 65000 },
      { name: '臺鐵山線 (豐原 - 台中 - 彰化)', path: [[24.2536, 120.7231], [24.1370, 120.6870], [24.0810, 120.5380]], baseVol: 120000 }
    ],
    ecoNodes: [
      { name: '台中中央公園 綠色肺葉', coords: [24.1850, 120.6530], capacity: '年吸碳 380 噸' }
    ]
  },
  'southern': {
    name: '南高屏都會生活圈 (TPASS 999/399)',
    center: [22.6872, 120.3082],
    zoom: 11,
    highwayCorridors: [
      { name: '國道一號 (台南 - 岡山 - 左營 - 前鎮)', path: [[22.9900, 120.2400], [22.7900, 120.2900], [22.6400, 120.3200]] }
    ],
    transitCorridors: [
      { name: '高捷紅線 (南岡山 - 左營 - 高雄車站 - 小港)', path: [[22.7900, 120.2950], [22.6872, 120.3082], [22.6397, 120.3022], [22.5650, 120.3550]], baseVol: 180000 },
      { name: '臺鐵雙城走廊 (台南 ⟷ 高雄 ⟷ 屏東)', path: [[22.9970, 120.2120], [22.6872, 120.3082], [22.6258, 120.3581], [22.6692, 120.4861]], baseVol: 160000 }
    ],
    ecoNodes: [
      { name: '高雄凹子底森林綠帶', coords: [22.6580, 120.3040], capacity: '年吸碳 290 噸' }
    ]
  }
};

export default function CarbonShiftMap({ 
  selectedZoneKey = 'mega_taipei',
  tpassPrice = 1200,
  modeShiftRate = 18
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const layerGroupRef = useRef(null);

  const zone = TPASS_ZONES_CONFIG[selectedZoneKey] || TPASS_ZONES_CONFIG['mega_taipei'];

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: zone.center,
      zoom: zone.zoom,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    layerGroupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // FlyTo on Zone Change
  useEffect(() => {
    if (!mapRef.current || !zone) return;
    mapRef.current.flyTo(zone.center, zone.zoom, { duration: 1.2 });
  }, [selectedZoneKey]);

  // Render Corridors and Carbon Nodes
  useEffect(() => {
    if (!mapRef.current || !layerGroupRef.current) return;
    const lg = layerGroupRef.current;
    lg.clearLayers();

    // 1. Reduced Highway Traffic Corridors (Gray-red dashed)
    zone.highwayCorridors.forEach(hc => {
      const poly = L.polyline(hc.path, {
        color: '#94A3B8',
        weight: 3,
        dashArray: '6, 6',
        opacity: 0.6
      }).addTo(lg);

      poly.bindPopup(`
        <div style="color: #0f172a; font-size: 12px;">
          <strong>🚗 私有運具減量廊帶：${esc(hc.name)}</strong><br/>
          預估尖峰車流減少: <span style="color: #059669; font-weight: 700;">-${(modeShiftRate * 0.85).toFixed(1)}%</span><br/>
          每日減少約 ${Math.round(modeShiftRate * 420)} 輛汽車行駛
        </div>
      `);
    });

    // 2. Surging Green Transit Corridors (Luminous Green with live weight)
    const glowWeight = Math.min(8, Math.max(3, Math.round(3 + (modeShiftRate / 10))));
    zone.transitCorridors.forEach(tc => {
      const poly = L.polyline(tc.path, {
        color: '#10B981',
        weight: glowWeight,
        opacity: 0.9,
        lineCap: 'round'
      }).addTo(lg);

      const addedTrips = Math.round(tc.baseVol * (modeShiftRate / 100));
      const savedCO2 = Math.round((addedTrips * 12.5 * (0.170 - 0.045)) / 1000 * 300);

        poly.bindPopup(`
          <div style="color: #0f172a; font-size: 12px; min-width: 180px;">
            <strong style="color: #059669; font-size: 13px;">🌿 綠色轉移廊帶：${esc(tc.name)}</strong><br/>
            TPASS 帶動日均增量: <span style="color: #059669; font-weight: 700;">+${addedTrips.toLocaleString()} 旅次</span><br/>
            年化減碳貢獻: <span style="color: #0284c7; font-weight: 800;">${savedCO2.toLocaleString()} 噸 CO₂e</span>
          </div>
        `);
    });

    // 3. Eco Nodes (Tree and Forest Carbon Sinks)
    zone.ecoNodes.forEach(en => {
      const ecoHtml = `
        <div style="
          width: 32px; height: 32px; border-radius: 50%;
          background: #10B981; border: 2px solid #fff;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 16px rgba(16,185,129,0.9); font-size: 16px;
        ">
          🌳
        </div>
      `;
      L.marker(en.coords, {
        icon: L.divIcon({ html: ecoHtml, className: '', iconSize: [32, 32], iconAnchor: [16, 16] })
      }).addTo(lg).bindPopup(`
        <div style="color: #0f172a; font-size: 12px;">
          <strong>🌲 都市生態碳匯節點：${esc(en.name)}</strong><br/>
          自然碳匯能力: ${esc(en.capacity)}<br/>
          <em>與 TPASS 減碳效益相輔相成</em>
        </div>
      `);
    });

  }, [selectedZoneKey, tpassPrice, modeShiftRate]);

  // Derived metrics
  const annualPassHolders = Math.round(380000 * (1500 / tpassPrice));
  const annualShiftedTrips = Math.round(annualPassHolders * 240 * 2 * (modeShiftRate / 100));
  const netCO2SavedTons = Math.round((annualShiftedTrips * 12.5 * (0.170 - 0.045)) / 1000);

  return (
    <div 
      role="region"
      aria-label="TPASS 政策成效模擬與 ESG 減碳量化歸因地圖"
      tabIndex={0}
      style={{ position: 'relative', width: '100%', height: 'clamp(360px, 48vh, 560px)', minHeight: '360px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}
    >

      {/* Top Left HUD */}
      <div style={{
        position: 'absolute', top: '12px', left: '12px', zIndex: 500,
        background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px',
        padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '14px'
      }}>
        <div>
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>生活圈年化總減碳</div>
          <div style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'JetBrains Mono', color: '#34D399' }}>
            {netCO2SavedTons.toLocaleString()} <span style={{ fontSize: '12px' }}>噸 CO₂e</span>
          </div>
        </div>
        <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
        <div>
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>等效造林吸收量</div>
          <div style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'JetBrains Mono', color: '#10B981' }}>
            {(netCO2SavedTons * 45).toLocaleString()} <span style={{ fontSize: '11px', color: '#94a3b8' }}>棵樹</span>
          </div>
        </div>
        <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
        <div>
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>汽機車轉移率</div>
          <div style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'JetBrains Mono', color: '#38BDF8' }}>
            +{modeShiftRate}%
          </div>
        </div>
      </div>

      {/* Bottom Center Legend */}
      <div style={{
        position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', zIndex: 500,
        background: 'rgba(15, 23, 42, 0.92)', backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px',
        padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '14px',
        fontSize: '11px', color: '#cbd5e1'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '14px', height: '3px', backgroundColor: '#10B981', display: 'inline-block' }} /> 綠色大眾運輸激增走廊
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '14px', height: '2px', borderTop: '2px dashed #94A3B8', display: 'inline-block' }} /> 私家車流減量路段
        </span>
        <span>🌳 城市生態碳匯節點</span>
      </div>
    </div>
  );
}
