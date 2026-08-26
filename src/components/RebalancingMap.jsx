import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Truck, Bike, AlertCircle, CheckCircle2, RotateCcw, Sliders, Zap } from 'lucide-react';

export const REBALANCING_HUBS_CONFIG = {
  '陽光舊宗路口 (內科)': {
    name: '內湖科技園區 (陽光舊宗路口生活圈)',
    center: [25.0640, 121.5760],
    zoom: 14,
    targetStation: { name: 'YouBike2.0 陽光舊宗路口 (目標缺車站)', coords: [25.0600, 121.5740], currentBikes: 2, capacity: 45, deficit: 38 },
    depot: { name: '港墘路調度物流主倉', coords: [25.0797, 121.5755] },
    nearbyStations: [
      { name: 'YouBike2.0 港墘站(2號出口)', coords: [25.0800, 121.5760], status: 'overflow', bikes: 42, cap: 45 },
      { name: 'YouBike2.0 瑞光路548巷', coords: [25.0760, 121.5720], status: 'deficit', bikes: 4, cap: 40 },
      { name: 'YouBike2.0 洲子立體停車場', coords: [25.0780, 121.5690], status: 'normal', bikes: 22, cap: 35 },
      { name: 'YouBike2.0 舊宗行善路口', coords: [25.0560, 121.5790], status: 'deficit', bikes: 1, cap: 30 }
    ],
    route: [
      [25.0797, 121.5755], // Depot (港墘)
      [25.0800, 121.5760], // Pick up overflow bikes
      [25.0760, 121.5720], // Deliver 15 bikes
      [25.0600, 121.5740], // Target station: Deliver 25 bikes
      [25.0560, 121.5790]  // Deliver 10 bikes
    ]
  },
  '瑞光路548巷 (內科)': {
    name: '內科核心軸帶 (瑞光路研發走廊)',
    center: [25.0770, 121.5720],
    zoom: 15,
    targetStation: { name: 'YouBike2.0 瑞光路548巷 (目標缺車站)', coords: [25.0760, 121.5720], currentBikes: 3, capacity: 40, deficit: 32 },
    depot: { name: '西湖捷運儲車場', coords: [25.0820, 121.5670] },
    nearbyStations: [
      { name: 'YouBike2.0 捷運西湖站', coords: [25.0820, 121.5670], status: 'overflow', bikes: 48, cap: 50 },
      { name: 'YouBike2.0 瑞光港墘路口', coords: [25.0750, 121.5770], status: 'deficit', bikes: 2, cap: 35 }
    ],
    route: [
      [25.0820, 121.5670],
      [25.0760, 121.5720],
      [25.0750, 121.5770]
    ]
  },
  '捷運公館站 (學區)': {
    name: '公館學區大樞紐 (臺大/臺科大)',
    center: [25.0140, 121.5340],
    zoom: 15,
    targetStation: { name: 'YouBike2.0 捷運公館站(2號出口)', coords: [25.0130, 121.5340], currentBikes: 5, capacity: 60, deficit: 48 },
    depot: { name: '基隆路調度大倉', coords: [25.0190, 121.5420] },
    nearbyStations: [
      { name: 'YouBike2.0 臺科大後門', coords: [25.0120, 121.5400], status: 'deficit', bikes: 2, cap: 40 },
      { name: 'YouBike2.0 臺大尊賢館', coords: [25.0150, 121.5330], status: 'overflow', bikes: 38, cap: 40 },
      { name: 'YouBike2.0 自來水園區', coords: [25.0110, 121.5300], status: 'normal', bikes: 18, cap: 30 }
    ],
    route: [
      [25.0190, 121.5420],
      [25.0150, 121.5330],
      [25.0130, 121.5340],
      [25.0120, 121.5400]
    ]
  },
  '高鐵桃園站 (青埔)': {
    name: '青埔高鐵轉乘專區',
    center: [25.0130, 121.2150],
    zoom: 14,
    targetStation: { name: 'YouBike2.0 高鐵桃園站(3號出口)', coords: [25.0130, 121.2148], currentBikes: 4, capacity: 50, deficit: 36 },
    depot: { name: '青昇路轉運集配場', coords: [25.0220, 121.2220] },
    nearbyStations: [
      { name: 'YouBike2.0 公七公園', coords: [25.0105, 121.2185], status: 'deficit', bikes: 3, cap: 30 },
      { name: 'YouBike2.0 華泰名品城', coords: [25.0160, 121.2160], status: 'overflow', bikes: 35, cap: 40 }
    ],
    route: [
      [25.0220, 121.2220],
      [25.0160, 121.2160],
      [25.0130, 121.2148],
      [25.0105, 121.2185]
    ]
  },
  '國家生技園區 (南港)': {
    name: '南港生技研發聚落',
    center: [25.0480, 121.6150],
    zoom: 14,
    targetStation: { name: 'YouBike2.0 國家生技園區', coords: [25.0480, 121.6150], currentBikes: 2, capacity: 35, deficit: 28 },
    depot: { name: '南港展覽館調度倉', coords: [25.0560, 121.6170] },
    nearbyStations: [
      { name: 'YouBike2.0 捷運南港展覽館站', coords: [25.0555, 121.6165], status: 'overflow', bikes: 45, cap: 50 },
      { name: 'YouBike2.0 中研院人文館', coords: [25.0420, 121.6130], status: 'deficit', bikes: 1, cap: 25 }
    ],
    route: [
      [25.0560, 121.6170],
      [25.0555, 121.6165],
      [25.0480, 121.6150],
      [25.0420, 121.6130]
    ]
  }
};

export default function RebalancingMap({ 
  selectedStationKey = '陽光舊宗路口 (內科)',
  demandSurge = 25,
  truckCount = 6
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const layerGroupRef = useRef(null);
  const animRef = useRef(null);

  const hubConfig = REBALANCING_HUBS_CONFIG[selectedStationKey] || REBALANCING_HUBS_CONFIG['陽光舊宗路口 (內科)'];

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: hubConfig.center,
      zoom: hubConfig.zoom,
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

  // FlyTo on Station Change
  useEffect(() => {
    if (!mapRef.current || !hubConfig) return;
    mapRef.current.flyTo(hubConfig.center, hubConfig.zoom, { duration: 1.2 });
  }, [selectedStationKey]);

  // Render Dispatch Routes & Stations
  useEffect(() => {
    if (!mapRef.current || !layerGroupRef.current) return;
    const lg = layerGroupRef.current;
    lg.clearLayers();

    // 1. Dispatch Polyline Route
    const poly = L.polyline(hubConfig.route, {
      color: '#06B6D4',
      weight: 4,
      dashArray: '8, 8',
      opacity: 0.85
    }).addTo(lg);

    poly.bindPopup(`
      <div style="color: #0f172a; font-size: 12px;">
        <strong>🚛 AI 智慧調度專用路徑</strong><br/>
        總長度: 約 ${(hubConfig.route.length * 0.85).toFixed(1)} km<br/>
        調度規模: ${truckCount} 輛卡車聯巡<br/>
        預期補給車數: ${truckCount * 20} 台 YouBike
      </div>
    `);

    // 2. Depot Marker
    const depotHtml = `
      <div style="
        width: 32px; height: 32px; border-radius: 8px;
        background: #0284C7; border: 2px solid #fff;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 0 14px rgba(2,132,199,0.9); font-size: 16px;
      ">
        🏢
      </div>
    `;
    L.marker(hubConfig.depot.coords, {
      icon: L.divIcon({ html: depotHtml, className: '', iconSize: [32, 32], iconAnchor: [16, 16] })
    }).addTo(lg).bindPopup(`<b>${hubConfig.depot.name}</b><br/>調度車隊即時發車基準點`);

    // 3. Target Deficit Station (Pulsing Red)
    const target = hubConfig.targetStation;
    const targetDeficitActual = Math.round(target.deficit * (1 + demandSurge / 100));
    const targetHtml = `
      <div style="position: relative; width: 38px; height: 38px;">
        <div style="
          position: absolute; inset: 0; border-radius: 50%;
          background: #EF4444; opacity: 0.4;
          animation: pulse-ring 1.5s infinite;
        "></div>
        <div style="
          position: absolute; inset: 4px; border-radius: 50%;
          background: #0f172a; border: 2px solid #EF4444;
          display: flex; align-items: center; justify-content: center;
          color: #EF4444; font-size: 12px; font-weight: 800;
          box-shadow: 0 0 14px #EF4444;
        ">
          -${targetDeficitActual}
        </div>
      </div>
    `;
    L.marker(target.coords, {
      icon: L.divIcon({ html: targetHtml, className: '', iconSize: [38, 38], iconAnchor: [19, 19] })
    }).addTo(lg).bindPopup(`
      <div style="color: #0f172a; font-size: 12px;">
        <strong style="color: #dc2626;">🚨 重點缺車站：${target.name}</strong><br/>
        當前在庫: ${target.currentBikes} / 柱數 ${target.capacity}<br/>
        尖峰預警缺口: <b style="color: #dc2626;">-${targetDeficitActual} 台</b><br/>
        <em>AI 優先指派調度車補車 25 台</em>
      </div>
    `);

    // 4. Nearby Stations (Overflow / Normal)
    hubConfig.nearbyStations.forEach(st => {
      const isOver = st.status === 'overflow';
      const color = isOver ? '#F59E0B' : (st.status === 'deficit' ? '#EF4444' : '#10B981');
      const stHtml = `
        <div style="
          width: 28px; height: 28px; border-radius: 50%;
          background: #0f172a; border: 2px solid ${color};
          display: flex; align-items: center; justify-content: center;
          color: ${color}; font-size: 11px; font-weight: 700;
          box-shadow: 0 0 10px ${color}88;
        ">
          ${st.bikes}
        </div>
      `;
      L.marker(st.coords, {
        icon: L.divIcon({ html: stHtml, className: '', iconSize: [28, 28], iconAnchor: [14, 14] })
      }).addTo(lg).bindPopup(`
        <div style="color: #0f172a; font-size: 12px;">
          <strong>${st.name}</strong><br/>
          狀態: ${isOver ? '🟡 溢車滿位 (可收車)' : (st.status === 'deficit' ? '🔴 缺車預警' : '🟢 正常')}<br/>
          現有車數: ${st.bikes} / 容量: ${st.cap}
        </div>
      `);
    });

    // 5. Active Truck Marker Animation along Route
    const truckHtml = `
      <div style="
        width: 30px; height: 30px; border-radius: 50%;
        background: #06B6D4; border: 2px solid #fff;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 0 16px rgba(6,182,212,1); font-size: 16px;
      ">
        🚛
      </div>
    `;
    const truckMarker = L.marker(hubConfig.route[0], {
      icon: L.divIcon({ html: truckHtml, className: '', iconSize: [30, 30], iconAnchor: [15, 15] })
    }).addTo(lg);

    let progress = 0;
    const animateTruck = () => {
      progress += 0.003;
      if (progress > 1) progress = 0;

      const totalSegments = hubConfig.route.length - 1;
      const currentSegment = Math.min(totalSegments - 1, Math.floor(progress * totalSegments));
      const segmentT = (progress * totalSegments) - currentSegment;

      const p1 = hubConfig.route[currentSegment];
      const p2 = hubConfig.route[currentSegment + 1];

      const lat = p1[0] + (p2[0] - p1[0]) * segmentT;
      const lng = p1[1] + (p2[1] - p1[1]) * segmentT;

      truckMarker.setLatLng([lat, lng]);
      animRef.current = requestAnimationFrame(animateTruck);
    };

    animRef.current = requestAnimationFrame(animateTruck);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };

  }, [selectedStationKey, demandSurge, truckCount]);

  const totalDeficitActual = Math.round(hubConfig.targetStation.deficit * (1 + demandSurge / 100));
  const truckReplenish = truckCount * 20 * 1.5;
  const sla = Math.min(99, Math.max(40, Math.round((truckReplenish / (totalDeficitActual * 2)) * 100)));

  return (
    <div style={{ position: 'relative', width: '100%', height: '420px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Top Left KPI HUD */}
      <div style={{
        position: 'absolute', top: '12px', left: '12px', zIndex: 500,
        background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px',
        padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '14px'
      }}>
        <div>
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>即時求解 SLA 水準</div>
          <div style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'JetBrains Mono', color: sla > 85 ? '#10B981' : '#F59E0B' }}>
            {sla}%
          </div>
        </div>
        <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
        <div>
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>調度車隊規模</div>
          <div style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'JetBrains Mono', color: '#06B6D4' }}>
            {truckCount} 輛巡迴中
          </div>
        </div>
        <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
        <div>
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>尖峰缺口預警</div>
          <div style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'JetBrains Mono', color: '#EF4444' }}>
            -{totalDeficitActual} 台
          </div>
        </div>
      </div>

      {/* Bottom Center Legend */}
      <div style={{
        position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', zIndex: 500,
        background: 'rgba(15, 23, 42, 0.92)', backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px',
        padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '12px',
        fontSize: '11px', color: '#cbd5e1'
      }}>
        <span>🏢 捷運/物流主倉</span>
        <span>🔴 預警缺車站點</span>
        <span>🟡 滿位溢車站點</span>
        <span>🚛 動態補車巡迴中</span>
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
