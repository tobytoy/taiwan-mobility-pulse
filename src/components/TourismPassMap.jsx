import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Sparkles, Compass, MapPin, Tag, TrendingUp, Sun, Ticket } from 'lucide-react';

export const TOURISM_CORRIDORS_CONFIG = {
  '市府轉運站 <-> 宜蘭/羅東 (國道客運)': {
    name: '蘭陽經典遊：市府轉運站 ⟷ 宜蘭 / 羅東 (綠活暢遊套票)',
    center: [24.7800, 121.7200],
    zoom: 11,
    corridorLegs: [
      { name: '國道五號客運直達 (市府 ➔ 礁溪 ➔ 羅東)', path: [[25.0400, 121.5650], [24.9800, 121.6500], [24.8250, 121.7700], [24.7550, 121.7580], [24.6775, 121.7725]], color: '#F97316', mode: 'Highway Bus' },
      { name: '宜蘭在地綠活串聯 (礁溪溫泉 ➔ 幾米廣場 ➔ 羅東夜市)', path: [[24.8250, 121.7700], [24.7550, 121.7580], [24.6775, 121.7725]], color: '#FBBF24', mode: 'YouBike 2.0' }
    ],
    attractions: [
      { name: '♨️ 礁溪溫泉觀光聚落', coords: [24.8280, 121.7720], desc: '全台碳酸氫鈉泉核心，假日日均湧入 18,000 人次' },
      { name: '🎨 宜蘭幾米主題廣場', coords: [24.7530, 121.7570], desc: '鐵路與公車轉運核心景點，親子客群佔比 65%' },
      { name: '🍜 羅東觀光夜市商圈', coords: [24.6760, 121.7680], desc: '東部最高密度美食走廊，晚間 18-21 時客流峰值' },
      { name: '🌲 羅東林業文化園區', coords: [24.6850, 121.7720], desc: '森林鐵路文史重鎮，結合單車騎行漫遊' }
    ],
    passProduct: {
      name: '綠活蘭陽 24 小時暢遊卡',
      features: ['國道客運雙向自由搭乘', '宜蘭全區公車無限次', 'YouBike 2.0 前 60 分鐘免費']
    }
  },
  '左營 <-> 巨蛋/三多/駁二 (高鐵+高捷)': {
    name: '高雄港灣山海遊：高鐵左營 ⟷ 巨蛋 ⟷ 駁二特區 (港都多模態聯票)',
    center: [22.6500, 120.3000],
    zoom: 13,
    corridorLegs: [
      { name: '高捷紅線主幹 (左營 ➔ 巨蛋 ➔ 高雄車站 ➔ 三多)', path: [[22.6872, 120.3082], [22.6660, 120.3020], [22.6397, 120.3022], [22.6140, 120.3060]], color: '#EC4899', mode: 'Metro Red Line' },
      { name: '高捷橘線/輕軌 (美麗島 ➔ 駁二大義 ➔ 旗津渡輪)', path: [[22.6310, 120.3020], [22.6200, 120.2830], [22.6170, 120.2700]], color: '#06B6D4', mode: 'LRT & Ferry' }
    ],
    attractions: [
      { name: '🛍️ 漢神巨蛋購物商圈', coords: [22.6680, 120.3030], desc: '北高雄時尚消費與演唱會經濟核心' },
      { name: '🎨 駁二藝術特區 / 大港橋', coords: [22.6190, 120.2815], desc: '港灣文創旗艦景點，週末遊客增幅 +165%' },
      { name: '🏝️ 旗津海濱海鮮老街', coords: [22.6150, 120.2680], desc: '搭乘渡輪綠色接駁，夕陽海景打卡熱點' }
    ],
    passProduct: {
      name: '高雄港灣藝文 48 小時暢遊套票',
      features: ['高捷全線+高雄輕軌無限搭乘', '旗津渡輪來回兌換券', '駁二當代館門票折抵']
    }
  },
  '台北 <-> 青埔高鐵/華泰 (高鐵+桃捷)': {
    name: '桃捷青埔都會遊：台北車站 ⟷ 青埔高鐵 / 華泰 Outlet (雙鐵潮旅券)',
    center: [25.0300, 121.3600],
    zoom: 11,
    corridorLegs: [
      { name: '高鐵北桃極速直達 (台北 ➔ 板橋 ➔ 桃園高鐵)', path: [[25.0478, 121.5170], [25.0143, 121.4638], [25.0130, 121.2148]], color: '#F97316', mode: 'THSR' },
      { name: '桃園機捷串聯 (A1 台北 ➔ A18 高鐵 ➔ A19 體育園區)', path: [[25.0485, 121.5130], [25.0135, 121.2155], [25.0020, 121.2010]], color: '#8B5CF6', mode: 'Taoyuan Metro' }
    ],
    attractions: [
      { name: '🛍️ 華泰名品城 GLORIA OUTLETS', coords: [25.0160, 121.2160], desc: '露天美式名品購物村，直通機捷 A18' },
      { name: '🐟 Xpark 都會型水生公園', coords: [25.0175, 121.2150], desc: '日本八景島水族館海外首館' },
      { name: '🖌️ 橫山書法藝術館 (公園湖畔)', coords: [25.0190, 121.2235], desc: '全台首座書法主題美術館' }
    ],
    passProduct: {
      name: '青埔雙鐵潮流購樂一日通',
      features: ['高鐵來回指定班次 8 折', '桃捷一日無限暢遊', '華泰名品城 VIP 優惠券']
    }
  }
};

export default function TourismPassMap({
  selectedCorridorKey = '市府轉運站 <-> 宜蘭/羅東 (國道客運)',
  bundleDiscount = 15
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const layerGroupRef = useRef(null);

  const corridor = TOURISM_CORRIDORS_CONFIG[selectedCorridorKey] || TOURISM_CORRIDORS_CONFIG['市府轉運站 <-> 宜蘭/羅東 (國道客運)'];

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: corridor.center,
      zoom: corridor.zoom,
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

  // FlyTo on Corridor Change
  useEffect(() => {
    if (!mapRef.current || !corridor) return;
    mapRef.current.flyTo(corridor.center, corridor.zoom, { duration: 1.2 });
  }, [selectedCorridorKey]);

  // Render Scenic Paths & Attraction POIs
  useEffect(() => {
    if (!mapRef.current || !layerGroupRef.current) return;
    const lg = layerGroupRef.current;
    lg.clearLayers();

    // 1. Scenic Corridor Polyline Legs
    corridor.corridorLegs.forEach(leg => {
      const poly = L.polyline(leg.path, {
        color: leg.color,
        weight: 5,
        opacity: 0.9,
        lineCap: 'round'
      }).addTo(lg);

      poly.bindPopup(`
        <div style="color: #0f172a; font-size: 12px; min-width: 180px;">
          <strong style="color: ${leg.color}; font-size: 13px;">✨ 觀光綠動脈：${leg.name}</strong><br/>
          運具類型: <strong>${leg.mode}</strong><br/>
          <em>套票享有 ${bundleDiscount}% 彈性聯運折扣</em>
        </div>
      `);
    });

    // 2. Attraction / POI Pins (Gold & Sparkling)
    corridor.attractions.forEach(att => {
      const poiHtml = `
        <div style="position: relative; width: 34px; height: 34px;">
          <div style="
            position: absolute; inset: 0; border-radius: 50%;
            background: #FBBF24; opacity: 0.35;
            animation: pulse-ring 2s infinite;
          "></div>
          <div style="
            position: absolute; inset: 3px; border-radius: 50%;
            background: linear-gradient(135deg, #F59E0B, #D97706);
            border: 2px solid #fff; display: flex; align-items: center; justify-content: center;
            color: #000; font-size: 15px; font-weight: bold;
            box-shadow: 0 0 16px rgba(245,158,11,0.9);
          ">
            ⭐
          </div>
        </div>
      `;

      L.marker(att.coords, {
        icon: L.divIcon({ html: poiHtml, className: '', iconSize: [34, 34], iconAnchor: [17, 17] })
      }).addTo(lg).bindPopup(`
        <div style="color: #0f172a; font-size: 12px; min-width: 200px;">
          <div style="font-weight: 800; font-size: 14px; color: #b45309; margin-bottom: 4px;">${att.name}</div>
          <p style="color: #475569; margin: 0 0 6px 0; font-size: 11px; line-height: 1.4;">${att.desc}</p>
          <div style="background: #fffbeb; border: 1px solid #fde68a; color: #92400e; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 700;">
            ✓ 包含於「${corridor.passProduct.name}」專屬優惠圈
          </div>
        </div>
      `);
    });

  }, [selectedCorridorKey, bundleDiscount]);

  const growthPct = (bundleDiscount * 1.45).toFixed(1);
  const extraTrips = Math.round(bundleDiscount * 2800);
  const monthlyRevenue = Math.round(bundleDiscount * 125);

  return (
    <div style={{ position: 'relative', width: '100%', height: '420px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Top Left HUD */}
      <div style={{
        position: 'absolute', top: '12px', left: '12px', zIndex: 500,
        background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px',
        padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '14px'
      }}>
        <div>
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>預估週末遊客吸引成長</div>
          <div style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'JetBrains Mono', color: '#F97316' }}>
            +{growthPct}%
          </div>
        </div>
        <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
        <div>
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>預估月增休閒旅次</div>
          <div style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'JetBrains Mono', color: '#34D399' }}>
            +{extraTrips.toLocaleString()} <span style={{ fontSize: '11px', color: '#94a3b8' }}>人次</span>
          </div>
        </div>
        <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
        <div>
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>帶動在地觀光產值</div>
          <div style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'JetBrains Mono', color: '#FBBF24' }}>
            +NT${monthlyRevenue} 萬/月
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
          <span style={{ width: '14px', height: '3px', backgroundColor: '#F97316', display: 'inline-block' }} /> 跨城際客運/高鐵段
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '14px', height: '3px', backgroundColor: '#EC4899', display: 'inline-block' }} /> 市區捷運/輕軌段
        </span>
        <span>⭐ 推薦觀光熱點 (Attractions)</span>
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
