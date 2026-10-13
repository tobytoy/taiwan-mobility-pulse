import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Leaf, Sliders, MapPin, Trees } from 'lucide-react';
import { esc } from '../utils/sanitize';
import { CARTO_TILES, CARTO_ATTRIBUTION } from '../utils/basemap';

export const TPASS_ZONES_CONFIG = {
  'mega_taipei': {
    name: '基北北桃都會生活圈 (TPASS 1200)',
    shortName: '基北北桃',
    center: [25.0478, 121.5170],
    zoom: 11,
    product: '#NOR-1200',
    highwayCorridors: [
      { 
        name: '國道一號 (汐止 - 內湖 - 台北 - 泰山 - 桃園)', 
        path: [[25.0673, 121.6624], [25.0640, 121.5760], [25.0478, 121.5170], [25.0400, 121.4300], [25.0130, 121.2148]],
        gantry: '01F0320S / 01F0413S',
        baselineCars: 98500,
        vcRatio: '1.32 (LOS F 嚴重回堵)'
      },
      { 
        name: '台64/65 快速公路 (八里 - 五股 - 板橋 - 新店)', 
        path: [[25.1400, 121.4100], [25.0700, 121.4400], [25.0143, 121.4638], [24.9700, 121.5400]],
        gantry: '台64八里五股監測點',
        baselineCars: 42000,
        vcRatio: '1.25 (LOS E 尖峰常態延滯)'
      }
    ],
    transitCorridors: [
      { name: '北捷淡水信義線 (淡水 - 台北 - 象山)', path: [[25.1680, 121.4450], [25.0478, 121.5170], [25.0330, 121.5700]], baseVol: 380000, shiftPct: '31.0%' },
      { name: '北捷板南線 (南港 - 台北 - 板橋 - 頂埔)', path: [[25.0531, 121.6071], [25.0478, 121.5170], [25.0143, 121.4638], [24.9600, 121.4200]], baseVol: 450000, shiftPct: '35.2%' },
      { name: '臺鐵縱貫線 (基隆 - 台北 - 桃園)', path: [[25.1320, 121.7397], [25.0478, 121.5170], [24.9912, 121.4244], [24.9536, 121.2256]], baseVol: 280000, shiftPct: '38.0%' },
      { name: '國道客運 2088 / 9005 / 9023 跨城幹線', path: [[25.1300, 121.7400], [25.0400, 121.5600], [24.9900, 121.3000]], baseVol: 110000, shiftPct: '42.8%' }
    ],
    ecoNodes: [
      { name: '大安森林公園 碳吸附核心', coords: [25.0300, 121.5350], capacity: '年吸碳 450 噸' },
      { name: '新北水漾綠帶 濕地碳匯', coords: [25.0500, 121.4800], capacity: '年吸碳 620 噸' }
    ]
  },
  'eastern': {
    name: '宜蘭花東生活圈 (TPASS 1800/299)',
    shortName: '宜蘭花東',
    center: [24.7500, 121.7500],
    zoom: 10,
    product: '#ILA-1800',
    highwayCorridors: [
      { 
        name: '國道五號 雪山隧道 (南港 - 坪林 - 頭城 - 羅東)', 
        path: [[25.0350, 121.6150], [24.9400, 121.7100], [24.8550, 121.8200], [24.6750, 121.7700]],
        gantry: '05F0055S / 05F0439S',
        baselineCars: 21231,
        vcRatio: '0.93~1.40 (假日雪隧回堵常態 LOS F)'
      }
    ],
    transitCorridors: [
      { name: '國道五號客運 (市府/板橋/圓山 ⟷ 羅東/宜蘭)', path: [[25.0400, 121.5650], [24.8550, 121.8200], [24.6750, 121.7700]], baseVol: 78000, shiftPct: '42.5%' },
      { name: '臺鐵北迴鐵路 (台北 ⟷ 宜蘭 ⟷ 花蓮)', path: [[25.0478, 121.5170], [24.8500, 121.8200], [24.6750, 121.7700], [23.9900, 121.6000]], baseVol: 65000, shiftPct: '36.0%' }
    ],
    ecoNodes: [
      { name: '羅東運動公園 綠色森林核心', coords: [24.6850, 121.7500], capacity: '年吸碳 340 噸' },
      { name: '冬山河生態綠舟 濕地碳匯', coords: [24.6300, 121.7900], capacity: '年吸碳 410 噸' }
    ]
  },
  'central': {
    name: '中彰投都會生活圈 (TPASS 999/699)',
    shortName: '中彰投',
    center: [24.1121, 120.6159],
    zoom: 11,
    product: '#CEN-999',
    highwayCorridors: [
      { 
        name: '台74線快速道路 (台中環線/中港交流道)', 
        path: [[24.1700, 120.6200], [24.1400, 120.6800], [24.1100, 120.6150]],
        gantry: '台74西屯/南屯監測點',
        baselineCars: 78000,
        vcRatio: '1.20 (LOS E/F 尖峰塞車)'
      },
      { 
        name: '國道一號 (大雅 - 台中中港 - 王田 - 彰化)', 
        path: [[24.2200, 120.6500], [24.1600, 120.6300], [24.0800, 120.5400]],
        gantry: '01F1745S / 01F1980S',
        baselineCars: 92000,
        vcRatio: '1.26 (LOS F 王田彰化段瓶頸)'
      }
    ],
    transitCorridors: [
      { name: '中捷綠線 (北屯 - 台中高鐵新烏日)', path: [[24.1800, 120.7100], [24.1500, 120.6500], [24.1121, 120.6159]], baseVol: 65000, shiftPct: '24.5%' },
      { name: '臺鐵山線 (豐原 - 台中 - 烏日 - 彰化)', path: [[24.2536, 120.7231], [24.1370, 120.6870], [24.0810, 120.5380]], baseVol: 120000, shiftPct: '32.0%' }
    ],
    ecoNodes: [
      { name: '台中中央公園 綠色肺葉', coords: [24.1850, 120.6530], capacity: '年吸碳 380 噸' }
    ]
  },
  'southern': {
    name: '南高屏都會生活圈 (TPASS 999/399)',
    shortName: '南高屏',
    center: [22.6872, 120.3082],
    zoom: 11,
    product: '#SOU-999',
    highwayCorridors: [
      { 
        name: '國道一號 (台南永康 - 仁德 - 岡山 - 楠梓 - 左營)', 
        path: [[22.9900, 120.2400], [22.7900, 120.2900], [22.6800, 120.3100], [22.6400, 120.3200]],
        gantry: '01F3185S (永康) / 01F3252S (仁德)',
        baselineCars: 85857,
        vcRatio: '1.28 (LOS F 永康大灣匝道回堵)'
      }
    ],
    transitCorridors: [
      { name: '高捷紅線 (南岡山 - 左營 - 高雄車站 - 小港)', path: [[22.7900, 120.2950], [22.6872, 120.3082], [22.6397, 120.3022], [22.5650, 120.3550]], baseVol: 180000, shiftPct: '28.0%' },
      { name: '臺鐵雙城走廊 (台南 ⟷ 新左營 ⟷ 高雄 ⟷ 屏東)', path: [[22.9970, 120.2120], [22.6872, 120.3082], [22.6258, 120.3581], [22.6692, 120.4861]], baseVol: 160000, shiftPct: '27.5%' }
    ],
    ecoNodes: [
      { name: '高雄凹子底森林綠帶', coords: [22.6580, 120.3040], capacity: '年吸碳 290 噸' },
      { name: '台南巴克禮紀念公園', coords: [22.9750, 120.2220], capacity: '年吸碳 210 噸' }
    ]
  }
};

export default function CarbonShiftMap({ 
  selectedZoneKey,
  onZoneChange,
  tpassPrice = 1200,
  modeShiftRate: controlledShiftRate,
  onShiftRateChange
}) {
  const [internalZoneKey, setInternalZoneKey] = useState('mega_taipei');
  const [internalShiftRate, setInternalShiftRate] = useState(20);

  const activeZoneKey = selectedZoneKey !== undefined ? selectedZoneKey : internalZoneKey;
  const activeShiftRate = controlledShiftRate !== undefined ? controlledShiftRate : internalShiftRate;

  const handleZoneSelect = (zk) => {
    setInternalZoneKey(zk);
    if (onZoneChange) onZoneChange(zk);
  };

  const handleShiftChange = (r) => {
    setInternalShiftRate(r);
    if (onShiftRateChange) onShiftRateChange(r);
  };

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const layerGroupRef = useRef(null);

  const zone = TPASS_ZONES_CONFIG[activeZoneKey] || TPASS_ZONES_CONFIG['mega_taipei'];

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

    L.tileLayer(CARTO_TILES.dark, {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: CARTO_ATTRIBUTION
    }).addTo(map);

    layerGroupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    setTimeout(() => {
      if (mapRef.current) mapRef.current.invalidateSize();
    }, 250);

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
    const timer = setTimeout(() => {
      if (mapRef.current) mapRef.current.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [activeZoneKey]);

  // Render Corridors and Carbon Nodes
  useEffect(() => {
    if (!mapRef.current || !layerGroupRef.current) return;
    const lg = layerGroupRef.current;
    lg.clearLayers();

    // 1. Reduced Highway Traffic Corridors (Gray-red dashed)
    zone.highwayCorridors.forEach(hc => {
      const poly = L.polyline(hc.path, {
        color: '#94A3B8',
        weight: 3.5,
        dashArray: '6, 6',
        opacity: 0.75
      }).addTo(lg);

      const reducedCars = Math.round((hc.baselineCars || 50000) * (activeShiftRate / 100));
      const dailySavedCO2 = ((reducedCars * 35.0 * 0.128) / 1000).toFixed(1);

      poly.bindPopup(`
        <div style="color: #0f172a; font-size: 12px; font-family: Outfit, sans-serif; line-height: 1.5; min-width: 220px;">
          <div style="font-weight: 800; color: #DC2626; font-size: 13px; margin-bottom: 4px;">
            🚗 國道私有運具減量廊帶
          </div>
          <div style="font-weight: 700; color: #1E293B; margin-bottom: 4px;">
            ${esc(hc.name)}
          </div>
          <div style="font-size: 11px; color: #64748B; margin-bottom: 6px;">
            eTag 門架：<code style="color: #0284C7; font-weight: 700;">${esc(hc.gantry || '國道監測點')}</code><br/>
            常態壅塞：${esc(hc.vcRatio || 'LOS F 飽和')}
          </div>
          <div style="background: #FEF2F2; padding: 6px 8px; border-radius: 6px; border: 1px solid #FECACA;">
            <div>預估轉移減量: <strong style="color: #059669;">-${activeShiftRate}% 自駕車流</strong></div>
            <div>每日減少: <strong style="color: #DC2626;">-${reducedCars.toLocaleString()} 輛汽車</strong></div>
            <div>走廊每日減碳: <strong style="color: #059669;">${dailySavedCO2} 噸 CO₂e/日</strong></div>
          </div>
        </div>
      `);
    });

    // 2. Surging Green Transit Corridors (Luminous Green with live weight)
    const glowWeight = Math.min(8, Math.max(3, Math.round(3 + (activeShiftRate / 8))));
    zone.transitCorridors.forEach(tc => {
      const poly = L.polyline(tc.path, {
        color: '#10B981',
        weight: glowWeight,
        opacity: 0.9,
        lineCap: 'round'
      }).addTo(lg);

      const addedTrips = Math.round(tc.baseVol * (activeShiftRate / 100));
      const savedCO2 = Math.round((addedTrips * 18.0 * (0.173 - 0.045)) / 1000 * 250);

      poly.bindPopup(`
        <div style="color: #0f172a; font-size: 12px; font-family: Outfit, sans-serif; min-width: 210px; line-height: 1.5;">
          <div style="color: #059669; font-weight: 800; font-size: 13px; margin-bottom: 4px;">
            🌿 綠色公共運輸承接廊帶
          </div>
          <div style="font-weight: 700; color: #1E293B; margin-bottom: 4px;">
            ${esc(tc.name)}
          </div>
          <div style="background: #ECFDF5; padding: 6px 8px; border-radius: 6px; border: 1px solid #A7F3D0;">
            <div>TPASS 自駕移轉率: <strong style="color: #059669;">${esc(tc.shiftPct || '32.0%')}</strong></div>
            <div>日均承接湧浪: <strong style="color: #0284c7;">+${addedTrips.toLocaleString()} 旅次/日</strong></div>
            <div>年化減碳貢獻: <strong style="color: #059669;">${savedCO2.toLocaleString()} 噸 CO₂e</strong></div>
          </div>
        </div>
      `);
    });

    // 3. Eco Nodes (Tree and Forest Carbon Sinks)
    zone.ecoNodes.forEach(en => {
      const ecoHtml = `
        <div style="
          width: 30px; height: 30px; border-radius: 50%;
          background: #10B981; border: 2px solid #fff;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 16px rgba(16,185,129,0.9); font-size: 15px;
          cursor: pointer;
        ">
          🌳
        </div>
      `;
      L.marker(en.coords, {
        icon: L.divIcon({ html: ecoHtml, className: '', iconSize: [30, 30], iconAnchor: [15, 15] })
      }).addTo(lg).bindPopup(`
        <div style="color: #0f172a; font-size: 12px; font-family: Outfit, sans-serif;">
          <strong style="color: #059669; font-size: 13px;">🌲 都市生態碳匯節點</strong><br/>
          <strong>${esc(en.name)}</strong><br/>
          自然碳匯能力: <span style="color: #0284c7; font-weight: 700;">${esc(en.capacity)}</span><br/>
          <span style="font-size: 11px; color: #64748B;">與 TPASS 運具移轉效益共同建構淨零永續生活圈</span>
        </div>
      `);
    });

  }, [activeZoneKey, tpassPrice, activeShiftRate]);

  // Derived metrics for HUD
  const annualPassHolders = Math.round(380000 * (1500 / tpassPrice));
  const annualShiftedTrips = Math.round(annualPassHolders * 240 * 2 * (activeShiftRate / 100));
  const netCO2SavedTons = Math.round((annualShiftedTrips * 16.5 * (0.173 - 0.045)) / 1000);
  const fuelSavedLiters = Math.round((annualShiftedTrips * 16.5 * 0.08));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      
      {/* Interactive Controls Bar: Zone Tabs & Mode Shift Slider */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        background: 'rgba(30, 41, 59, 0.7)',
        padding: '10px 14px',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        {/* Zone Selector Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', marginRight: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={13} color="#38BDF8" /> 生活圈切換：
          </span>
          {Object.entries(TPASS_ZONES_CONFIG).map(([k, cfg]) => {
            const isSelected = activeZoneKey === k;
            return (
              <button
                key={k}
                onClick={() => handleZoneSelect(k)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: isSelected ? '1px solid #10B981' : '1px solid rgba(255,255,255,0.08)',
                  background: isSelected ? 'rgba(16, 185, 129, 0.25)' : 'rgba(15, 23, 42, 0.5)',
                  color: isSelected ? '#34D399' : '#cbd5e1',
                  fontSize: '12px',
                  fontWeight: isSelected ? '800' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {cfg.shortName} <span style={{ fontSize: '10px', opacity: 0.7 }}>({cfg.product})</span>
              </button>
            );
          })}
        </div>

        {/* Mode Shift Rate Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sliders size={13} color="#10B981" /> 模擬自駕轉移率：
          </span>
          <input
            type="range"
            min="5"
            max="35"
            step="1"
            value={activeShiftRate}
            onChange={(e) => handleShiftChange(Number(e.target.value))}
            style={{ width: '110px', accentColor: '#10B981', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '13px', fontWeight: '800', fontFamily: 'JetBrains Mono', color: '#10B981', minWidth: '42px' }}>
            +{activeShiftRate}%
          </span>
        </div>
      </div>

      {/* Map Container */}
      <div 
        role="region"
        aria-label="TPASS 政策成效模擬與 ESG 減碳量化歸因地圖"
        tabIndex={0}
        style={{ 
          position: 'relative', 
          width: '100%', 
          height: '420px', 
          minHeight: '380px', 
          borderRadius: '12px', 
          overflow: 'hidden', 
          border: '1px solid rgba(255,255,255,0.1)' 
        }}
      >
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

        {/* Top Left HUD */}
        <div style={{
          position: 'absolute', top: '12px', left: '12px', zIndex: 500,
          background: 'rgba(15, 23, 42, 0.92)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '10px',
          padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <div>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>生活圈年化總減碳</div>
            <div style={{ fontSize: '18px', fontWeight: '900', fontFamily: 'JetBrains Mono', color: '#34D399' }}>
              {netCO2SavedTons.toLocaleString()} <span style={{ fontSize: '11px', color: '#94a3b8' }}>噸 CO₂e</span>
            </div>
          </div>
          <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <div>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>等效造林吸收量</div>
            <div style={{ fontSize: '16px', fontWeight: '800', fontFamily: 'JetBrains Mono', color: '#10B981' }}>
              {(netCO2SavedTons * 48).toLocaleString()} <span style={{ fontSize: '11px', color: '#94a3b8' }}>棵樹</span>
            </div>
          </div>
          <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <div>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>等效節省燃油</div>
            <div style={{ fontSize: '16px', fontWeight: '800', fontFamily: 'JetBrains Mono', color: '#38BDF8' }}>
              {(fuelSavedLiters / 10000).toFixed(1)} <span style={{ fontSize: '11px', color: '#94a3b8' }}>萬公升</span>
            </div>
          </div>
        </div>

        {/* Bottom Center Legend */}
        <div style={{
          position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', zIndex: 500,
          background: 'rgba(15, 23, 42, 0.92)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.12)', borderRadius: '20px',
          padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '14px',
          fontSize: '11px', color: '#cbd5e1', whiteSpace: 'nowrap'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '14px', height: '3px', backgroundColor: '#10B981', borderRadius: '2px', display: 'inline-block' }} /> 綠色公共運輸承接走廊
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '14px', height: '2px', borderTop: '2px dashed #94A3B8', display: 'inline-block' }} /> 🚗 國道 eTag 私家車減量路段
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            🌳 城市生態碳匯節點
          </span>
        </div>
      </div>

    </div>
  );
}
