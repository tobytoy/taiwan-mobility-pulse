import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { ShieldAlert, AlertOctagon, Bus, Users, Clock, Flame } from 'lucide-react';
import { esc } from '../utils/sanitize';

export const INCIDENT_SCENARIOS_CONFIG = {
  '台北車站 <-> 西門 (北捷核心走廊)': {
    name: '北捷板南線 台北車站 ⟷ 西門 (全線癱瘓故障)',
    center: [25.0450, 121.5125],
    zoom: 15,
    closedSegment: [
      [25.0478, 121.5170], // 台北車站
      [25.0420, 121.5080]  // 西門
    ],
    affectedStations: [
      { name: '捷運台北車站 (重災區)', coords: [25.0478, 121.5170], normalFlow: '尖峰 45,000 人/時' },
      { name: '捷運西門站 (重災區)', coords: [25.0420, 121.5080], normalFlow: '尖峰 38,000 人/時' }
    ],
    evacuationBypassRoute: [
      [25.0478, 121.5170], // 台北車站南門
      [25.0460, 121.5120], // 忠孝西路一段
      [25.0425, 121.5095], // 中華路一段北向
      [25.0420, 121.5080]  // 西門站 6 號出口
    ],
    safeTransferHubs: [
      { name: '台鐵/高鐵 台北轉運站', coords: [25.0490, 121.5185] },
      { name: '捷運北門站 (替代松山新店線)', coords: [25.0500, 121.5105] }
    ]
  },
  '新北產業園區 <-> 板橋 (環狀線)': {
    name: '新北環狀線 新北產業園區 ⟷ 板橋 (號誌系統中斷)',
    center: [25.0380, 121.4620],
    zoom: 13,
    closedSegment: [
      [25.0610, 121.4600],
      [25.0550, 121.4600],
      [25.0490, 121.4600],
      [25.0143, 121.4638]
    ],
    affectedStations: [
      { name: '新北產業園區站', coords: [25.0610, 121.4600], normalFlow: '尖峰 12,000 人/時' },
      { name: '板橋車站 (環狀線)', coords: [25.0143, 121.4638], normalFlow: '尖峰 28,000 人/時' }
    ],
    evacuationBypassRoute: [
      [25.0610, 121.4600],
      [25.0500, 121.4580],
      [25.0300, 121.4620],
      [25.0143, 121.4638]
    ],
    safeTransferHubs: [
      { name: '捷運頭前庄站 (中和新蘆線轉乘)', coords: [25.0380, 121.4580] }
    ]
  },
  '左營 <-> 巨蛋 (高捷紅線)': {
    name: '高捷紅線 左營 ⟷ 巨蛋 (供電異常停駛)',
    center: [22.6780, 120.3040],
    zoom: 14,
    closedSegment: [
      [22.6872, 120.3082],
      [22.6770, 120.3040],
      [22.6660, 120.3020]
    ],
    affectedStations: [
      { name: '高捷左營站 (高鐵交界)', coords: [22.6872, 120.3082], normalFlow: '尖峰 18,000 人/時' },
      { name: '高捷巨蛋站 (商圈核心)', coords: [22.6660, 120.3020], normalFlow: '尖峰 22,000 人/時' }
    ],
    evacuationBypassRoute: [
      [22.6872, 120.3082],
      [22.6770, 120.3040],
      [22.6660, 120.3020]
    ],
    safeTransferHubs: [
      { name: '台鐵新左營站', coords: [22.6875, 120.3075] }
    ]
  }
};

export default function EvacuationMap({
  selectedIncidentKey = '台北車站 <-> 西門 (北捷核心走廊)',
  incidentDuration = 45,
  isPeakHour = true
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const layerGroupRef = useRef(null);
  const animRef = useRef(null);

  const scenario = INCIDENT_SCENARIOS_CONFIG[selectedIncidentKey] || INCIDENT_SCENARIOS_CONFIG['台北車站 <-> 西門 (北捷核心走廊)'];

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: scenario.center,
      zoom: scenario.zoom,
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
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // FlyTo on Scenario Change
  useEffect(() => {
    if (!mapRef.current || !scenario) return;
    mapRef.current.flyTo(scenario.center, scenario.zoom, { duration: 1.2 });
  }, [selectedIncidentKey]);

  // Render Evacuation Overlays
  useEffect(() => {
    if (!mapRef.current || !layerGroupRef.current) return;
    const lg = layerGroupRef.current;
    lg.clearLayers();

    // 1. Closed Rail Line (Pulsing Hazard Red with Warning Cross)
    const closedLine = L.polyline(scenario.closedSegment, {
      color: '#EF4444',
      weight: 6,
      opacity: 0.9,
      dashArray: '10, 10'
    }).addTo(lg);

    closedLine.bindPopup(`
      <div style="color: #dc2626; font-size: 12px; font-weight: 800;">
        ⛔ [中斷路段] ${esc(scenario.name)}<br/>
        <span style="color: #475569; font-weight: normal;">預估搶修時長: <strong>${incidentDuration} 分鐘</strong></span>
      </div>
    `);

    // 2. Crowd Density Isochrones (Expanding hazard circles)
    const flowPerMin = isPeakHour ? 280 : 90;
    const strandedPax = flowPerMin * incidentDuration;
    const crowdRadius = Math.min(600, Math.max(120, Math.round(strandedPax * 0.035)));

    scenario.affectedStations.forEach(st => {
      // Expanding crowd density circle
      L.circle(st.coords, {
        radius: crowdRadius,
        color: '#EF4444',
        weight: 1.5,
        fillColor: '#EF4444',
        fillOpacity: 0.22,
        dashArray: '4, 4'
      }).addTo(lg).bindTooltip(`<b>${esc(st.name)}</b><br/>人潮滯留擴散警戒半徑: ${crowdRadius}m`);
      // Pulsing Incident Hazard Marker
      const hazardHtml = `
        <div style="position: relative; width: 36px; height: 36px;">
          <div style="
            position: absolute; inset: 0; border-radius: 50%;
            background: #EF4444; opacity: 0.45;
            animation: pulse-ring 1.3s infinite;
          "></div>
          <div style="
            position: absolute; inset: 4px; border-radius: 50%;
            background: #EF4444; border: 2px solid #fff;
            display: flex; align-items: center; justify-content: center;
            color: #fff; font-size: 16px; font-weight: 900;
            box-shadow: 0 0 16px #EF4444;
          ">
            ❌
          </div>
        </div>
      `;
      L.marker(st.coords, {
        icon: L.divIcon({ html: hazardHtml, className: '', iconSize: [36, 36], iconAnchor: [18, 18] })
      }).addTo(lg).bindPopup(`
        <div style="color: #0f172a; font-size: 12px;">
          <strong style="color: #dc2626; font-size: 13px;">🚨 事故站點：${esc(st.name)}</strong><br/>
          常態流量: ${esc(st.normalFlow)}<br/>
          預估滯留: <b style="color: #dc2626;">${Math.round(strandedPax / 2).toLocaleString()} 人次</b><br/>
          <em>AI 啟動緊急疏運專線中</em>
        </div>
      `);
    });

    // 3. Emergency Shuttle Bypass Bus Route (Glowing Orange-Cyan Line)
    const bypassPoly = L.polyline(scenario.evacuationBypassRoute, {
      color: '#F59E0B',
      weight: 5,
      opacity: 0.95,
      dashArray: '6, 6',
      lineCap: 'round'
    }).addTo(lg);

    const requiredBuses = Math.ceil(strandedPax / (45 * 2.5));
    bypassPoly.bindPopup(`
      <div style="color: #0f172a; font-size: 12px;">
        <strong style="color: #d97706; font-size: 13px;">🚌 AI 緊急接駁疏運專線</strong><br/>
        調派車隊規模: <strong>${requiredBuses} 輛</strong><br/>
        預估發車班距: <strong>每 ${Math.max(2, Math.round(60 / (requiredBuses * 1.5)))} 分鐘/班</strong>
      </div>
    `);

    // 4. Safe Transfer Hub Markers (Green)
    scenario.safeTransferHubs.forEach(hub => {
      const hubHtml = `
        <div style="
          width: 28px; height: 28px; border-radius: 6px;
          background: #10B981; border: 2px solid #fff;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 12px rgba(16,185,129,0.9); font-size: 13px;
        ">
          🔄
        </div>
      `;
      L.marker(hub.coords, {
        icon: L.divIcon({ html: hubHtml, className: '', iconSize: [28, 28], iconAnchor: [14, 14] })
      }).addTo(lg).bindPopup(`
        <div style="color: #0f172a; font-size: 12px;">
          <strong style="color: #059669;">✓ 推薦安全分流轉乘節點</strong><br/>
          ${esc(hub.name)}
        </div>
      `);
    });

    // 5. Animated Emergency Bus Markers along Bypass Route
    const busMarkerHtml = `
      <div style="
        width: 28px; height: 28px; border-radius: 50%;
        background: #F59E0B; border: 2px solid #fff;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 0 14px rgba(245,158,11,1); font-size: 14px;
      ">
        🚌
      </div>
    `;
    const bus1 = L.marker(scenario.evacuationBypassRoute[0], {
      icon: L.divIcon({ html: busMarkerHtml, className: '', iconSize: [28, 28], iconAnchor: [14, 14] })
    }).addTo(lg);

    let progress = 0;
    const animateBuses = () => {
      progress += 0.004;
      if (progress > 1) progress = 0;

      const totalSegments = scenario.evacuationBypassRoute.length - 1;
      const currentSegment = Math.min(totalSegments - 1, Math.floor(progress * totalSegments));
      const segmentT = (progress * totalSegments) - currentSegment;

      const p1 = scenario.evacuationBypassRoute[currentSegment];
      const p2 = scenario.evacuationBypassRoute[currentSegment + 1];

      const lat = p1[0] + (p2[0] - p1[0]) * segmentT;
      const lng = p1[1] + (p2[1] - p1[1]) * segmentT;

      bus1.setLatLng([lat, lng]);
      animRef.current = requestAnimationFrame(animateBuses);
    };

    animRef.current = requestAnimationFrame(animateBuses);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };

  }, [selectedIncidentKey, incidentDuration, isPeakHour]);

  const flowPerMin = isPeakHour ? 280 : 90;
  const strandedPax = flowPerMin * incidentDuration;
  const requiredBuses = Math.ceil(strandedPax / (45 * 2.5));
  const clearTimeMins = Math.round(incidentDuration * 1.25);

  return (
    <div 
      role="region"
      aria-label="軌道突發中斷事件動態應變與替代接駁 GIS 地圖"
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
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>預估滯留客流總量</div>
          <div style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'JetBrains Mono', color: '#F43F5E' }}>
            {strandedPax.toLocaleString()} <span style={{ fontSize: '12px' }}>人次</span>
          </div>
        </div>
        <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
        <div>
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>需調派接駁專車</div>
          <div style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'JetBrains Mono', color: '#FBBF24' }}>
            {requiredBuses} 輛
          </div>
        </div>
        <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
        <div>
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>完全疏運排空時長</div>
          <div style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'JetBrains Mono', color: '#38BDF8' }}>
            ~{clearTimeMins} 分鐘
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
        <span>❌ 事故中斷軌道</span>
        <span>🔴 人潮滯留擴散警戒區</span>
        <span>🚌 緊急接駁專車巡迴動線</span>
        <span>🔄 安全分流節點</span>
      </div>

      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.6); opacity: 0.8; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
