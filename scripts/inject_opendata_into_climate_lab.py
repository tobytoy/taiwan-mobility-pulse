#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Taiwan Mobility Pulse - ClimatePulseLab.jsx OpenData Inundation Integration
Updates src/components/ClimatePulseLab.jsx to include:
- Mode: 'inundation_opendata' (🌊 淹水災點與路網韌性 OpenData 印證)
- Subtabs:
  1. zones: 🌀 歷年強颱淹水面 (水利署 25770)
  2. hotspots: 📍 NCDR 淹水災點 (國科會 130016)
  3. sensors: 📡 IoT 路面水深 (水利署 142980)
- Polygon map rendering, Hotspot clustering/markers, IoT real-time depth meter
- Tri-Force Nexus (CODiS Rain ➔ Flood Extent/Depth ➔ Road Disruption/Speed Drop)
"""

import os
import re

TARGET_FILE = "/home/toby/projects/Github/taiwan-mobility-pulse/src/components/ClimatePulseLab.jsx"

with open(TARGET_FILE, "r", encoding="utf-8") as f:
    content = f.read()

# 1. State hooks injection
state_decl_target = "  const [selectedReservoirId, setSelectedReservoirId] = useState('tsengwen');"
state_decl_replacement = """  const [selectedReservoirId, setSelectedReservoirId] = useState('tsengwen');

  // OpenData Inundation & Mobility Nexus state
  const [inundationSubTab, setInundationSubTab] = useState('zones'); // 'zones', 'hotspots', 'sensors'
  const [selectedInundationTyphoonId, setSelectedInundationTyphoonId] = useState('gaemi_2024');
  const [selectedHotspotFid, setSelectedHotspotFid] = useState('NCDR-FL-001');
  const [selectedSensorId, setSelectedSensorId] = useState('IOW-RS-TP01');
  const [sensorScenario, setSensorScenario] = useState('heavy_rain'); // 'sunny', 'drizzle', 'heavy_rain', 'deluge_extreme'
  const [hotspotAgencyFilter, setHotspotAgencyFilter] = useState('all');
  const polygonsRef = useRef([]);"""

content = content.replace(state_decl_target, state_decl_replacement, 1)

# 2. Data extracts injection
data_extract_target = "  const reservoirs = data?.reservoir_drought_deluge || [];"
data_extract_replacement = """  const reservoirs = data?.reservoir_drought_deluge || [];
  
  // OpenData Inundation extracts
  const opendataNexus = data?.opendata_inundation_mobility_nexus || {};
  const floodTyphoons = opendataNexus.historical_typhoon_flood_zones || [];
  const floodHotspots = opendataNexus.ncdr_flood_incident_hotspots || [];
  const floodSensors = opendataNexus.iow_road_flood_sensors || [];
  const floodPotential = opendataNexus.flood_potential_summary || {};

  const selectedInundationTyphoon = useMemo(() => {
    return floodTyphoons.find(t => t.id === selectedInundationTyphoonId) || floodTyphoons[0];
  }, [floodTyphoons, selectedInundationTyphoonId]);

  const selectedHotspot = useMemo(() => {
    return floodHotspots.find(h => h.fid === selectedHotspotFid) || floodHotspots[0];
  }, [floodHotspots, selectedHotspotFid]);

  const selectedSensor = useMemo(() => {
    return floodSensors.find(s => s.sensor_id === selectedSensorId) || floodSensors[0];
  }, [floodSensors, selectedSensorId]);"""

content = content.replace(data_extract_target, data_extract_replacement, 1)

# 3. Polygon cleanup in map drawing effect
cleanup_target = """    // Clear existing markers
    Object.values(markersRef.current).forEach(m => map.removeLayer(m));
    markersRef.current = {};"""

cleanup_replacement = """    // Clear existing markers & polygons
    Object.values(markersRef.current).forEach(m => map.removeLayer(m));
    markersRef.current = {};
    if (polygonsRef.current) {
      polygonsRef.current.forEach(p => map.removeLayer(p));
      polygonsRef.current = [];
    }"""

content = content.replace(cleanup_target, cleanup_replacement, 1)

# 4. Map rendering for inundation_opendata mode
render_mode_target = "    // 1. RETAIL CONVECTION MODE"
render_mode_replacement = """    // 0. OPENDATA INUNDATION & MOBILITY NEXUS MODE
    if (activeMode === 'inundation_opendata') {
      // 0A. Historical Typhoon Flood Zones (Dataset 25770)
      if (inundationSubTab === 'zones' && selectedInundationTyphoon) {
        // Draw polygons
        (selectedInundationTyphoon.polygons || []).forEach(p => {
          const poly = L.polygon(p.coordinates, {
            color: '#38BDF8',
            weight: 2.5,
            dashArray: '6, 6',
            fillColor: p.severity === 'disaster' ? '#EF4444' : p.severity === 'extreme' ? '#0284C7' : '#0EA5E9',
            fillOpacity: 0.38
          }).addTo(map);

          poly.bindTooltip(`<b>${p.zone_name}</b><br/>平均積水深度: ${p.avg_depth_cm}cm`, {
            direction: 'center',
            className: 'flood-polygon-tooltip'
          });
          polygonsRef.current.push(poly);

          // Add center label marker
          const centerLat = p.coordinates.reduce((sum, c) => sum + c[0], 0) / p.coordinates.length;
          const centerLng = p.coordinates.reduce((sum, c) => sum + c[1], 0) / p.coordinates.length;

          const iconHtml = `
            <div style="
              background: rgba(11, 17, 32, 0.95);
              border: 1.5px solid #38BDF8;
              border-radius: 6px;
              padding: 3px 8px;
              color: #FFFFFF;
              font-size: 11px;
              font-weight: 800;
              box-shadow: 0 4px 12px rgba(0,0,0,0.7);
              white-space: nowrap;
              display: flex;
              align-items: center;
              gap: 4px;
            ">
              <span>🌊</span>
              <span>${p.zone_name.split('(')[0]}</span>
              <span style="color: #38BDF8; font-weight: 900;">${p.avg_depth_cm}cm</span>
            </div>
          `;
          const customIcon = L.divIcon({
            html: iconHtml,
            className: 'flood-zone-center-marker',
            iconSize: [120, 28],
            iconAnchor: [60, 14]
          });
          const centerMarker = L.marker([centerLat, centerLng], { icon: customIcon }).addTo(map);
          markersRef.current[`poly_${p.zone_name}`] = centerMarker;
        });

        // Add Peak CODiS Weather Station
        if (selectedInundationTyphoon.codis_peak_station) {
          const stn = selectedInundationTyphoon.codis_peak_station;
          // Find station lat/lng from stations list or fallback
          const stationObj = stations.find(s => s.id === stn.station_id || s.name === stn.station_name);
          const sLat = stationObj ? stationObj.lat : 23.5;
          const sLng = stationObj ? stationObj.lng : 120.8;

          const iconHtml = `
            <div style="
              position: relative;
              display: flex;
              flex-direction: column;
              align-items: center;
              cursor: pointer;
              transform: scale(1.3);
              z-index: 1000;
            ">
              <div style="
                position: absolute;
                top: -8px; left: -8px; right: -8px; bottom: 8px;
                border-radius: 50%;
                background: rgba(239, 68, 68, 0.45);
                animation: pulse-halo 1.6s infinite;
              "></div>
              <div style="
                width: 42px;
                height: 42px;
                border-radius: 50%;
                background: #0B1120;
                border: 3px solid #EF4444;
                box-shadow: 0 4px 16px rgba(239, 68, 68, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
              ">
                ⛈️
              </div>
              <div style="
                margin-top: 3px;
                background: rgba(11, 17, 32, 0.95);
                border: 1px solid #EF4444;
                border-radius: 6px;
                padding: 2px 8px;
                display: flex;
                gap: 4px;
                white-space: nowrap;
              ">
                <span style="font-size: 11px; font-weight: 900; color: #FFFFFF;">${stn.station_name}暴雨極值</span>
                <span style="font-size: 11px; font-weight: 900; color: #EF4444;">${stn.max_hourly_rain_mm}mm/h</span>
              </div>
            </div>
          `;
          const customIcon = L.divIcon({
            html: iconHtml,
            className: 'climate-codis-peak-marker',
            iconSize: [120, 60],
            iconAnchor: [60, 50]
          });
          const peakMarker = L.marker([sLat, sLng], { icon: customIcon }).addTo(map);
          markersRef.current['codis_peak'] = peakMarker;
        }
        return;
      }

      // 0B. NCDR 5-Year Flood Hotspots (Dataset 130016)
      if (inundationSubTab === 'hotspots') {
        const filtered = floodHotspots.filter(h => {
          if (hotspotAgencyFilter === 'all') return true;
          return h.source.includes(hotspotAgencyFilter);
        });

        filtered.forEach(h => {
          const isSelected = h.fid === selectedHotspotFid;
          const color = h.flood_count_5y >= 12 ? '#EF4444' : h.flood_count_5y >= 8 ? '#F59E0B' : '#0EA5E9';

          const iconHtml = `
            <div style="
              position: relative;
              display: flex;
              flex-direction: column;
              align-items: center;
              cursor: pointer;
              transform: ${isSelected ? 'scale(1.28)' : 'scale(1)'};
              transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
              z-index: ${isSelected ? 1000 : 500};
            ">
              ${isSelected ? `<div style="
                position: absolute;
                top: -6px; left: -6px; right: -6px; bottom: 8px;
                border-radius: 50%;
                background: ${color}44;
                animation: pulse-halo 1.8s infinite;
              "></div>` : ''}

              <div style="
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: #0B1120;
                border: ${isSelected ? '3px solid #FFFFFF' : `2px solid ${color}`};
                box-shadow: 0 4px 14px rgba(0,0,0,0.7), 0 0 14px ${color}66;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
              ">
                ⚠️
              </div>

              <div style="
                margin-top: 3px;
                background: rgba(11, 17, 32, 0.95);
                border: 1px solid ${color};
                border-radius: 5px;
                padding: 1px 6px;
                display: flex;
                gap: 4px;
                white-space: nowrap;
              ">
                <span style="font-size: 10px; font-weight: 800; color: #FFFFFF;">${h.name.split('(')[0]}</span>
                <span style="font-size: 10px; font-weight: 900; color: ${color};">${h.flood_count_5y}次</span>
              </div>
            </div>
          `;

          const customIcon = L.divIcon({
            html: iconHtml,
            className: 'ncdr-hotspot-marker',
            iconSize: [90, 52],
            iconAnchor: [45, 44]
          });

          const marker = L.marker([h.lat, h.lng], { icon: customIcon }).addTo(map);
          marker.on('click', () => {
            setSelectedHotspotFid(h.fid);
            map.flyTo([h.lat, h.lng], 12, { duration: 1.2 });
          });
          markersRef.current[h.fid] = marker;
        });
        return;
      }

      // 0C. IoW Road Flood Sensors (Dataset 142980)
      if (inundationSubTab === 'sensors') {
        floodSensors.forEach(s => {
          const isSelected = s.sensor_id === selectedSensorId;
          const scen = s.scenarios[sensorScenario] || s.scenarios.sunny;
          const color = scen.depth_cm >= s.closure_threshold_cm ? '#EF4444' : scen.depth_cm >= s.warning_threshold_cm ? '#F59E0B' : '#10B981';

          const iconHtml = `
            <div style="
              position: relative;
              display: flex;
              flex-direction: column;
              align-items: center;
              cursor: pointer;
              transform: ${isSelected ? 'scale(1.28)' : 'scale(1)'};
              transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
              z-index: ${isSelected ? 1000 : 500};
            ">
              ${isSelected ? `<div style="
                position: absolute;
                top: -6px; left: -6px; right: -6px; bottom: 8px;
                border-radius: 50%;
                background: ${color}44;
                animation: pulse-halo 1.8s infinite;
              "></div>` : ''}

              <div style="
                width: 38px;
                height: 38px;
                border-radius: 50%;
                background: #0B1120;
                border: ${isSelected ? '3px solid #FFFFFF' : `2px solid ${color}`};
                box-shadow: 0 4px 14px rgba(0,0,0,0.7), 0 0 16px ${color}66;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
              ">
                📡
              </div>

              <div style="
                margin-top: 3px;
                background: rgba(11, 17, 32, 0.95);
                border: 1px solid ${color};
                border-radius: 5px;
                padding: 1px 6px;
                display: flex;
                gap: 4px;
                white-space: nowrap;
              ">
                <span style="font-size: 10px; font-weight: 800; color: #FFFFFF;">${s.county} ${s.name.split('(')[0].slice(0, 6)}</span>
                <span style="font-size: 10.5px; font-weight: 900; color: ${color};">${scen.depth_cm}cm</span>
              </div>
            </div>
          `;

          const customIcon = L.divIcon({
            html: iconHtml,
            className: 'iow-sensor-marker',
            iconSize: [90, 54],
            iconAnchor: [45, 46]
          });

          const marker = L.marker([s.lat, s.lng], { icon: customIcon }).addTo(map);
          marker.on('click', () => {
            setSelectedSensorId(s.sensor_id);
            map.flyTo([s.lat, s.lng], 13, { duration: 1.2 });
          });
          markersRef.current[s.sensor_id] = marker;
        });
        return;
      }
    }

    // 1. RETAIL CONVECTION MODE"""

content = content.replace(render_mode_target, render_mode_replacement, 1)

# 5. Add mode navigation button in main pill
nav_target = """            <button
              onClick={() => setActiveMode('typhoon_reservoir')}"""

nav_button = """            <button
              onClick={() => setActiveMode('inundation_opendata')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '7px 12px',
                borderRadius: '7px',
                border: 'none',
                background: activeMode === 'inundation_opendata' ? 'linear-gradient(135deg, #0284C7, #06B6D4)' : 'transparent',
                color: activeMode === 'inundation_opendata' ? '#FFFFFF' : '#94A3B8',
                fontWeight: '800',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              <Waves size={13} />
              <span>🌊 淹水災點與路網韌性 (OpenData)</span>
            </button>

            <button
              onClick={() => setActiveMode('typhoon_reservoir')}"""

content = content.replace(nav_target, nav_button, 1)

# 6. Add sub-control strip for inundation_opendata
sub_strip_target = "          {/* Sub Control Strip for Category 4 (Retail & Solar) */}"
sub_strip_code = """          {/* Sub Control Strip for OpenData Inundation & Mobility */}
          {activeMode === 'inundation_opendata' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(15, 23, 42, 0.94)',
              backdropFilter: 'blur(12px)',
              borderRadius: '9px',
              padding: '6px 12px',
              border: '1px solid rgba(2, 132, 199, 0.4)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
              pointerEvents: 'auto',
              width: 'fit-content'
            }}>
              <div style={{ display: 'flex', gap: '4px', background: 'rgba(30, 41, 59, 0.6)', padding: '2px', borderRadius: '6px' }}>
                <button
                  onClick={() => setInundationSubTab('zones')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '5px',
                    border: 'none',
                    background: inundationSubTab === 'zones' ? '#0284C7' : 'transparent',
                    color: inundationSubTab === 'zones' ? '#FFFFFF' : '#94A3B8',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  🌀 歷年強颱淹水面 (水利署 25770)
                </button>
                <button
                  onClick={() => setInundationSubTab('hotspots')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '5px',
                    border: 'none',
                    background: inundationSubTab === 'hotspots' ? '#0284C7' : 'transparent',
                    color: inundationSubTab === 'hotspots' ? '#FFFFFF' : '#94A3B8',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  📍 NCDR 淹水災點 (國科會 130016)
                </button>
                <button
                  onClick={() => setInundationSubTab('sensors')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '5px',
                    border: 'none',
                    background: inundationSubTab === 'sensors' ? '#0284C7' : 'transparent',
                    color: inundationSubTab === 'sensors' ? '#FFFFFF' : '#94A3B8',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  📡 IoT 路面水深 (水利署 142980)
                </button>
              </div>

              {inundationSubTab === 'zones' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#38BDF8', fontWeight: '700' }}>選擇颱風:</span>
                  <select
                    value={selectedInundationTyphoonId}
                    onChange={e => {
                      setSelectedInundationTyphoonId(e.target.value);
                      const t = floodTyphoons.find(item => item.id === e.target.value);
                      if (t && t.polygons && t.polygons[0]) {
                        const c = t.polygons[0].coordinates[0];
                        if (mapInstanceRef.current) mapInstanceRef.current.flyTo(c, 10, { duration: 1.2 });
                      }
                    }}
                    style={{
                      background: '#1E293B',
                      border: '1px solid rgba(56, 189, 248, 0.4)',
                      borderRadius: '5px',
                      color: '#F8FAFC',
                      fontSize: '11px',
                      padding: '3px 8px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {floodTyphoons.map(t => (
                      <option key={t.id} value={t.id}>{t.name} (淹水 {t.total_inundated_km2}km²)</option>
                    ))}
                  </select>
                </div>
              )}

              {inundationSubTab === 'hotspots' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#38BDF8', fontWeight: '700' }}>機關來源:</span>
                  <select
                    value={hotspotAgencyFilter}
                    onChange={e => setHotspotAgencyFilter(e.target.value)}
                    style={{
                      background: '#1E293B',
                      border: '1px solid rgba(56, 189, 248, 0.4)',
                      borderRadius: '5px',
                      color: '#F8FAFC',
                      fontSize: '11px',
                      padding: '3px 8px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">全台所有部會 (水利署/EMIC/公路局)</option>
                    <option value="水利署">經濟部水利署</option>
                    <option value="EMIC">內政部消防署 (EMIC)</option>
                    <option value="公路局">交通部公路局</option>
                  </select>
                </div>
              )}

              {inundationSubTab === 'sensors' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#38BDF8', fontWeight: '700' }}>暴雨強度模擬:</span>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {[
                      { id: 'sunny', label: '☀️ 晴天', color: '#10B981' },
                      { id: 'drizzle', label: '🌧️ 細雨', color: '#38BDF8' },
                      { id: 'heavy_rain', label: '⛈️ 豪雨', color: '#F59E0B' },
                      { id: 'deluge_extreme', label: '🌊 破紀錄暴雨', color: '#EF4444' }
                    ].map(sc => (
                      <button
                        key={sc.id}
                        onClick={() => setSensorScenario(sc.id)}
                        style={{
                          padding: '3px 7px',
                          borderRadius: '4px',
                          border: 'none',
                          background: sensorScenario === sc.id ? sc.color : 'rgba(30, 41, 59, 0.8)',
                          color: sensorScenario === sc.id ? '#0F172A' : '#94A3B8',
                          fontSize: '10.5px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        {sc.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sub Control Strip for Category 4 (Retail & Solar) */}"""

content = content.replace(sub_strip_target, sub_strip_code, 1)

# 7. Sidebar header icon and title update
header_icon_target = "{activeMode === 'retail_solar' ? '🏬' : activeMode === 'typhoon_reservoir' ? '🌪️' : activeMode === 'seasons' ? '⏱️' : activeMode === 'change' ? '🌡️' : '🏆'}"
header_icon_replacement = "{activeMode === 'inundation_opendata' ? '🌊' : activeMode === 'retail_solar' ? '🏬' : activeMode === 'typhoon_reservoir' ? '🌪️' : activeMode === 'seasons' ? '⏱️' : activeMode === 'change' ? '🌡️' : '🏆'}"
content = content.replace(header_icon_target, header_icon_replacement, 1)

header_title_target = """                  {activeMode === 'retail_solar' 
                    ? (retailSolarTab === 'retail' ? '晴雨商圈乾濕人流對流模型' : '全島 30 年光電與 EV 快充 ROI')
                    : activeMode === 'typhoon_reservoir'
                    ? (typhoonReservoirTab === 'typhoon' ? '中央山脈 30 年抗颱屏障大回測' : '四大水庫連續乾旱與旱澇急轉')
                    : activeMode === 'seasons' 
                    ? '全島四季氣候潮汐動態看板' 
                    : activeMode === 'change' 
                    ? '全台 30 年氣候變遷戰略報告' 
                    : '全台微氣候宜居極值排行'}"""

header_title_replacement = """                  {activeMode === 'inundation_opendata'
                    ? (inundationSubTab === 'zones' ? '歷年強颱淹水範圍與路網衝擊 (水利署 25770)' : inundationSubTab === 'hotspots' ? '全台近5年淹水災點與交通延誤 (NCDR 130016)' : 'IoT 路面淹水深度即時監測 (IoW 142980)')
                    : activeMode === 'retail_solar' 
                    ? (retailSolarTab === 'retail' ? '晴雨商圈乾濕人流對流模型' : '全島 30 年光電與 EV 快充 ROI')
                    : activeMode === 'typhoon_reservoir'
                    ? (typhoonReservoirTab === 'typhoon' ? '中央山脈 30 年抗颱屏障大回測' : '四大水庫連續乾旱與旱澇急轉')
                    : activeMode === 'seasons' 
                    ? '全島四季氣候潮汐動態看板' 
                    : activeMode === 'change' 
                    ? '全台 30 年氣候變遷戰略報告' 
                    : '全台微氣候宜居極值排行'}"""

content = content.replace(header_title_target, header_title_replacement, 1)

# 8. Sidebar Panel Body for inundation_opendata
panel_body_target = "          {/* 1. RETAIL CONVECTION SUB-PANEL */}"
panel_body_code = """          {/* 0. OPENDATA INUNDATION & MOBILITY NEXUS PANEL */}
          {activeMode === 'inundation_opendata' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Tri-Force Nexus Summary Banner */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.25), rgba(15, 23, 42, 0.8))',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: '10px',
                padding: '14px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '16px' }}>🌊</span>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#F8FAFC' }}>
                      政府開放資料 (OpenData) 氣候與交通三向印證閉環
                    </span>
                  </div>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '800',
                    background: '#0284C7',
                    color: '#FFFFFF',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    OpenData Verified
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '10px' }}>
                  <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: '6px', padding: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '10px', color: '#38BDF8', fontWeight: '700' }}>① 暴雨因果 (Cause)</div>
                    <div style={{ fontSize: '11px', color: '#FFFFFF', fontWeight: '800', marginTop: '2px' }}>CODiS 氣象署測站</div>
                    <div style={{ fontSize: '9.5px', color: '#94A3B8' }}>時雨量 >50mm / 24h 累積</div>
                  </div>
                  <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: '6px', padding: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '10px', color: '#F59E0B', fontWeight: '700' }}>② 災情實體 (Effect)</div>
                    <div style={{ fontSize: '11px', color: '#FFFFFF', fontWeight: '800', marginTop: '2px' }}>水利署 / NCDR 開放資料</div>
                    <div style={{ fontSize: '9.5px', color: '#94A3B8' }}>25770 淹水面 · 130016 災點</div>
                  </div>
                  <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: '6px', padding: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '10px', color: '#EF4444', fontWeight: '700' }}>③ 交通衝擊 (Impact)</div>
                    <div style={{ fontSize: '11px', color: '#FFFFFF', fontWeight: '800', marginTop: '2px' }}>eTag & TICP 大數據</div>
                    <div style={{ fontSize: '9.5px', color: '#94A3B8' }}>車速驟跌 · 匝道閉鎖 · 公車停駛</div>
                  </div>
                </div>
              </div>

              {/* 0A. Historical Typhoon Flood Zones Details */}
              {inundationSubTab === 'zones' && selectedInundationTyphoon && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{
                    background: 'rgba(15, 23, 42, 0.7)',
                    borderRadius: '10px',
                    padding: '14px',
                    border: '1px solid rgba(56, 189, 248, 0.25)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '15px', fontWeight: '900', color: '#38BDF8' }}>
                        🌀 {selectedInundationTyphoon.name}
                      </span>
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                        提供機關: {selectedInundationTyphoon.agency} (代碼 {selectedInundationTyphoon.opendata_id})
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '12px' }}>
                      <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '10px', borderRadius: '7px' }}>
                        <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>全台淹水總面積</div>
                        <div style={{ fontSize: '18px', fontWeight: '900', color: '#FFFFFF', marginTop: '2px' }}>
                          {selectedInundationTyphoon.total_inundated_km2} <span style={{ fontSize: '11px', color: '#38BDF8' }}>km²</span>
                        </div>
                      </div>
                      <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '10px', borderRadius: '7px' }}>
                        <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>最大積淹水深度</div>
                        <div style={{ fontSize: '18px', fontWeight: '900', color: '#EF4444', marginTop: '2px' }}>
                          {selectedInundationTyphoon.max_depth_cm} <span style={{ fontSize: '11px', color: '#EF4444' }}>cm</span>
                        </div>
                      </div>
                    </div>

                    {/* Peak CODiS Rain Box */}
                    <div style={{
                      marginTop: '10px',
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '7px',
                      padding: '10px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#EF4444' }}>
                          ⛈️ 對應 CODiS 測站暴雨記錄: {selectedInundationTyphoon.codis_peak_station.station_name}測站
                        </span>
                        <span style={{ fontSize: '10.5px', color: '#FCA5A5' }}>
                          時雨量 {selectedInundationTyphoon.codis_peak_station.max_hourly_rain_mm}mm/h
                        </span>
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#E2E8F0', marginTop: '4px' }}>
                        {selectedInundationTyphoon.codis_peak_station.surge_note} (24h 累積 {selectedInundationTyphoon.codis_peak_station.max_24h_rain_mm} mm)
                      </div>
                    </div>

                    {/* Mobility Impacts */}
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#F8FAFC', marginBottom: '6px' }}>
                        🚗 多模態交通中斷與大數據衝擊矩陣:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '8px', borderRadius: '6px', fontSize: '11px', color: '#CBD5E1' }}>
                          <span style={{ fontWeight: '800', color: '#F59E0B' }}>🛣️ 高快速公路: </span>
                          {selectedInundationTyphoon.mobility_impact.highway_disruption}
                        </div>
                        <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '8px', borderRadius: '6px', fontSize: '11px', color: '#CBD5E1' }}>
                          <span style={{ fontWeight: '800', color: '#38BDF8' }}>🚆 軌道運輸: </span>
                          {selectedInundationTyphoon.mobility_impact.railway_disruption}
                        </div>
                        <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '8px', borderRadius: '6px', fontSize: '11px', color: '#CBD5E1' }}>
                          <span style={{ fontWeight: '800', color: '#10B981' }}>🚌 公車與市區: </span>
                          {selectedInundationTyphoon.mobility_impact.bus_metro_effect}
                        </div>
                        <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '8px', borderRadius: '6px', fontSize: '11.5px', color: '#FCA5A5', fontWeight: '800', display: 'flex', justifyContent: 'space-between' }}>
                          <span>📉 國道 eTag 平均車速驟挫幅:</span>
                          <span style={{ color: '#EF4444' }}>{selectedInundationTyphoon.mobility_impact.etag_speed_drop_pct}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Polygon list */}
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#94A3B8', marginBottom: '6px' }}>
                        地圖淹水多邊形圖層 (點選縮放定位):
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {selectedInundationTyphoon.polygons.map((p, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              if (mapInstanceRef.current) mapInstanceRef.current.flyTo(p.coordinates[0], 11, { duration: 1.2 });
                            }}
                            style={{
                              padding: '6px 10px',
                              background: 'rgba(30, 41, 59, 0.5)',
                              borderRadius: '5px',
                              border: '1px solid rgba(56, 189, 248, 0.15)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              cursor: 'pointer',
                              fontSize: '11px'
                            }}
                          >
                            <span style={{ color: '#FFFFFF', fontWeight: '700' }}>📍 {p.zone_name}</span>
                            <span style={{ color: '#38BDF8', fontWeight: '800' }}>均深 {p.avg_depth_cm}cm</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 0B. NCDR Flood Hotspots Details */}
              {inundationSubTab === 'hotspots' && selectedHotspot && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{
                    background: 'rgba(15, 23, 42, 0.7)',
                    borderRadius: '10px',
                    padding: '14px',
                    border: '1px solid rgba(245, 158, 11, 0.3)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: '900', color: '#F59E0B' }}>
                        📍 {selectedHotspot.name}
                      </span>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: '800',
                        background: '#1E293B',
                        color: '#94A3B8',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {selectedHotspot.source}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '10px' }}>
                      <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', color: '#94A3B8' }}>近5年通報</div>
                        <div style={{ fontSize: '16px', fontWeight: '900', color: '#EF4444', marginTop: '2px' }}>
                          {selectedHotspot.flood_count_5y} <span style={{ fontSize: '10px' }}>次</span>
                        </div>
                      </div>
                      <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', color: '#94A3B8' }}>致災降雨門檻</div>
                        <div style={{ fontSize: '16px', fontWeight: '900', color: '#F59E0B', marginTop: '2px' }}>
                          {selectedHotspot.threshold_rain_mm_hr} <span style={{ fontSize: '10px' }}>mm/h</span>
                        </div>
                      </div>
                      <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', color: '#94A3B8' }}>典型積水深度</div>
                        <div style={{ fontSize: '16px', fontWeight: '900', color: '#38BDF8', marginTop: '2px' }}>
                          {selectedHotspot.typical_depth_cm} <span style={{ fontSize: '10px' }}>cm</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '10px', fontSize: '11px', color: '#CBD5E1', background: 'rgba(30, 41, 59, 0.4)', padding: '8px', borderRadius: '6px' }}>
                      <div style={{ fontWeight: '800', color: '#38BDF8' }}>🚇 鄰近重大交通設施: {selectedHotspot.adjacent_transit}</div>
                      <div style={{ marginTop: '4px', color: '#94A3B8' }}>⚠️ 交通衝擊延誤: {selectedHotspot.transit_impact}</div>
                      <div style={{ marginTop: '4px', color: '#64748B', fontSize: '10px' }}>對應鄰近 CODiS 測站: {selectedHotspot.nearest_codis}</div>
                    </div>

                    {/* Hotspot List */}
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#94A3B8', marginBottom: '6px' }}>
                        全台高頻淹水災點清單 (點選定位):
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '180px', overflowY: 'auto' }}>
                        {floodHotspots.map(h => (
                          <div
                            key={h.fid}
                            onClick={() => {
                              setSelectedHotspotFid(h.fid);
                              if (mapInstanceRef.current) mapInstanceRef.current.flyTo([h.lat, h.lng], 12, { duration: 1.2 });
                            }}
                            style={{
                              padding: '6px 8px',
                              background: selectedHotspotFid === h.fid ? 'rgba(245, 158, 11, 0.2)' : 'rgba(30, 41, 59, 0.4)',
                              border: selectedHotspotFid === h.fid ? '1px solid #F59E0B' : '1px solid rgba(255, 255, 255, 0.05)',
                              borderRadius: '5px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              cursor: 'pointer',
                              fontSize: '10.5px'
                            }}
                          >
                            <span style={{ color: '#FFFFFF', fontWeight: '700' }}>{h.county} {h.name.split('(')[0]}</span>
                            <span style={{ color: h.flood_count_5y >= 12 ? '#EF4444' : '#F59E0B', fontWeight: '800' }}>5年 {h.flood_count_5y}次</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 0C. IoW Road Flood Sensors Details */}
              {inundationSubTab === 'sensors' && selectedSensor && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(() => {
                    const scen = selectedSensor.scenarios[sensorScenario] || selectedSensor.scenarios.sunny;
                    const isClosed = scen.depth_cm >= selectedSensor.closure_threshold_cm;
                    const isWarning = scen.depth_cm >= selectedSensor.warning_threshold_cm;
                    const statusColor = isClosed ? '#EF4444' : isWarning ? '#F59E0B' : '#10B981';

                    return (
                      <div style={{
                        background: 'rgba(15, 23, 42, 0.7)',
                        borderRadius: '10px',
                        padding: '14px',
                        border: `1px solid ${statusColor}55`
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '14px', fontWeight: '900', color: '#F8FAFC' }}>
                            📡 {selectedSensor.name}
                          </span>
                          <span style={{ fontSize: '10.5px', color: '#94A3B8' }}>{selectedSensor.county}</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                          幹道: {selectedSensor.base_road} · 感測設備: {selectedSensor.installation_type}
                        </div>

                        {/* Real-time Depth Meter */}
                        <div style={{
                          marginTop: '12px',
                          background: 'rgba(30, 41, 59, 0.6)',
                          borderRadius: '8px',
                          padding: '12px',
                          border: `1px solid ${statusColor}44`
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>即時模擬路面水深</div>
                              <div style={{ fontSize: '24px', fontWeight: '900', color: statusColor, marginTop: '2px' }}>
                                {scen.depth_cm} <span style={{ fontSize: '12px', color: '#94A3B8' }}>cm</span>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                background: `${statusColor}22`,
                                border: `1px solid ${statusColor}`,
                                color: statusColor,
                                fontWeight: '800',
                                fontSize: '12px'
                              }}>
                                {scen.status}
                              </div>
                              <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '4px' }}>
                                車速折損: <span style={{ color: statusColor, fontWeight: '800' }}>{scen.drop_pct}%</span> ({scen.speed_kmh}km/h)
                              </div>
                            </div>
                          </div>

                          {/* Depth Bar Progress */}
                          <div style={{ marginTop: '10px' }}>
                            <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                              <div style={{
                                height: '100%',
                                width: `${Math.min(100, (scen.depth_cm / 60) * 100)}%`,
                                background: `linear-gradient(90deg, #10B981, ${statusColor})`,
                                transition: 'width 0.4s ease'
                              }}></div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#64748B', marginTop: '3px' }}>
                              <span>0cm (安全)</span>
                              <span>警戒線 {selectedSensor.warning_threshold_cm}cm</span>
                              <span>封路門檻 {selectedSensor.closure_threshold_cm}cm</span>
                              <span>60cm+</span>
                            </div>
                          </div>
                        </div>

                        {/* Scenario comparative table */}
                        <div style={{ marginTop: '12px' }}>
                          <div style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', marginBottom: '6px' }}>
                            4 種雨量情境即時感測水位對照:
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                            {Object.entries(selectedSensor.scenarios).map(([scKey, scVal]) => (
                              <div
                                key={scKey}
                                onClick={() => setSensorScenario(scKey)}
                                style={{
                                  padding: '6px 4px',
                                  textAlign: 'center',
                                  borderRadius: '5px',
                                  background: sensorScenario === scKey ? 'rgba(56, 189, 248, 0.2)' : 'rgba(30, 41, 59, 0.4)',
                                  border: sensorScenario === scKey ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.05)',
                                  cursor: 'pointer'
                                }}
                              >
                                <div style={{ fontSize: '9.5px', color: '#94A3B8' }}>{scKey === 'sunny' ? '晴天' : scKey === 'drizzle' ? '細雨' : scKey === 'heavy_rain' ? '豪雨' : '破紀錄'}</div>
                                <div style={{ fontSize: '12px', fontWeight: '800', color: '#FFFFFF', marginTop: '2px' }}>{scVal.depth_cm}cm</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Flood Potential (Dataset 25766) & Warnings (Dataset 5982) Standard */}
              {floodPotential.return_period_scenarios && (
                <div style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  borderRadius: '10px',
                  padding: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#F8FAFC', marginBottom: '6px' }}>
                    🛡️ 經濟部水利署 淹水潛勢圖 (Dataset 25766) 重現期衝擊標準
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {floodPotential.return_period_scenarios.map((rp, idx) => (
                      <div key={idx} style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '8px', borderRadius: '6px', fontSize: '10.5px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38BDF8', fontWeight: '800' }}>
                          <span>{rp.period} ({rp.rainfall_intensity})</span>
                          <span>淹水潛勢: {rp.flood_risk_area_km2} km²</span>
                        </div>
                        <div style={{ color: '#94A3B8', marginTop: '3px' }}>
                          • 易淹交流道: {rp.at_risk_interchanges.join('、')}
                        </div>
                        <div style={{ color: '#E2E8F0', marginTop: '2px' }}>
                          • 交通系統狀態: {rp.mobility_system_status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 1. RETAIL CONVECTION SUB-PANEL */}"""

content = content.replace(panel_body_target, panel_body_code, 1)

with open(TARGET_FILE, "w", encoding="utf-8") as f:
    f.write(content)

print(f"Successfully injected OpenData Inundation & Mobility Nexus into {TARGET_FILE}")
