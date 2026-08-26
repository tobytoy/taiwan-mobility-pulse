import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

const BASEMAP_TILES = {
  dark: {
    name: '賽博深色',
    desc: 'Dark Matter',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB &copy; OpenStreetMap',
    subdomains: 'abcd',
    maxZoom: 19
  },
  satellite: {
    name: '高解析衛星',
    desc: 'ESRI Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    maxZoom: 18
  },
  osm: {
    name: '開放街圖',
    desc: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap',
    maxZoom: 19
  },
  light: {
    name: '極簡淺色',
    desc: 'Positron',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB',
    subdomains: 'abcd',
    maxZoom: 19
  }
};

const REGION_BOUNDS = {
  all: { center: [23.9, 120.9], zoom: 8 },
  North: { center: [25.05, 121.50], zoom: 10 },
  Central: { center: [24.15, 120.65], zoom: 10 },
  South: { center: [22.65, 120.32], zoom: 10 },
  East: { center: [24.30, 121.70], zoom: 9 }
};

export default function FlowMap({
  corridors = [],
  stationsGeo = {},
  selectedMode = 'all',
  selectedRegion = 'all',
  selectedPaxType = 'all', // 'all', 'commuter', 'tourist'
  selectedDayType = 'Weekday', // 'Weekday', 'Weekend', 'Holiday'
  basemap = 'dark',
  currentHour = 8,
  onSelectStation,
  selectedStation,
  onSelectCorridor,
  selectedCorridor
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const tileLayerRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const particlesRef = useRef([]);
  const markersRef = useRef([]);

  // 1. 初始化 Leaflet 地圖
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [23.9, 120.9],
      zoom: 8,
      minZoom: 7,
      maxZoom: 16,
      zoomControl: false,
      attributionControl: false
    });

    tileLayerRef.current = L.tileLayer(BASEMAP_TILES[basemap].url, {
      attribution: BASEMAP_TILES[basemap].attribution,
      subdomains: BASEMAP_TILES[basemap].subdomains || 'abc',
      maxZoom: BASEMAP_TILES[basemap].maxZoom
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapRef.current = map;

    // 建立 Canvas Overlay
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '350';
    map.getPanes().overlayPane.appendChild(canvas);
    canvasRef.current = canvas;

    const resizeCanvas = () => {
      const size = map.getSize();
      canvas.width = size.x * window.devicePixelRatio;
      canvas.height = size.y * window.devicePixelRatio;
      canvas.style.width = `${size.x}px`;
      canvas.style.height = `${size.y}px`;
    };

    resizeCanvas();
    map.on('resize', resizeCanvas);
    map.on('move', () => {
      const bounds = map.getBounds();
      const nw = map.latLngToLayerPoint(bounds.getNorthWest());
      canvas.style.transform = `translate3d(${nw.x}px, ${nw.y}px, 0px)`;
    });

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. 切換底圖圖層 (Basemap Switching)
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;
    mapRef.current.removeLayer(tileLayerRef.current);
    tileLayerRef.current = L.tileLayer(BASEMAP_TILES[basemap].url, {
      attribution: BASEMAP_TILES[basemap].attribution,
      subdomains: BASEMAP_TILES[basemap].subdomains || 'abc',
      maxZoom: BASEMAP_TILES[basemap].maxZoom
    }).addTo(mapRef.current);
  }, [basemap]);

  // 3. 切換區域視角平移 (Region View Change)
  useEffect(() => {
    if (!mapRef.current) return;
    const target = REGION_BOUNDS[selectedRegion] || REGION_BOUNDS.all;
    mapRef.current.flyTo(target.center, target.zoom, {
      duration: 1.2,
      easeLinearity: 0.25
    });
  }, [selectedRegion]);

  // 4. 繪製車站標記點 (Station Markers)
  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach(m => mapRef.current.removeLayer(m));
    markersRef.current = [];

    const filteredCorridors = corridors.filter(c => {
      const matchMode = selectedMode === 'all' || c.mode_id === selectedMode;
      const matchRegion = selectedRegion === 'all' || c.region === selectedRegion;
      const matchPax = selectedPaxType === 'all' || c.pax_type === selectedPaxType;
      return matchMode && matchRegion && matchPax;
    });

    const activeStations = new Set();
    filteredCorridors.forEach(c => {
      activeStations.add(c.origin);
      activeStations.add(c.destination);
    });

    Object.entries(stationsGeo).forEach(([name, coords]) => {
      if (activeStations.size > 0 && !activeStations.has(name)) return;

      const isSelected = selectedStation === name;
      const marker = L.circleMarker(coords, {
        radius: isSelected ? 8 : 4.5,
        fillColor: isSelected ? '#38BDF8' : '#F8FAFC',
        color: isSelected ? '#38BDF8' : '#0F172A',
        weight: isSelected ? 3 : 1.5,
        opacity: 0.9,
        fillOpacity: isSelected ? 1 : 0.75
      });

      marker.bindTooltip(`
        <div style="font-family: Outfit, sans-serif; font-size: 12px; font-weight: 600; padding: 2px 4px;">
          <span style="color: #38BDF8;">●</span> ${name}
        </div>
      `, { className: 'custom-leaflet-tooltip', direction: 'top', offset: [0, -6] });

      marker.on('click', () => {
        if (onSelectStation) onSelectStation(name);
      });

      marker.addTo(mapRef.current);
      markersRef.current.push(marker);
    });
  }, [corridors, stationsGeo, selectedMode, selectedRegion, selectedPaxType, selectedStation]);

  // 5. 隨時間 (currentHour) 與乘客身分 (selectedPaxType) 動態粒子渲染
  useEffect(() => {
    if (!mapRef.current || !canvasRef.current) return;

    const filteredCorridors = corridors.filter(c => {
      const matchMode = selectedMode === 'all' || c.mode_id === selectedMode;
      const matchRegion = selectedRegion === 'all' || c.region === selectedRegion;
      const matchPax = selectedPaxType === 'all' || c.pax_type === selectedPaxType;
      return matchMode && matchRegion && matchPax;
    });

    const particles = [];
    filteredCorridors.forEach((corr) => {
      // 若處於假日模式且為純通勤線路，強度乘上衰減；若處於觀光模式，則觀光線路強度增益
      let hourFactor = corr.hourly_curve ? corr.hourly_curve[currentHour] : 0.5;
      
      if (selectedDayType === 'Weekend' || selectedDayType === 'Holiday') {
        if (corr.pax_type === 'commuter') hourFactor *= 0.35; // 假日通勤線量大減
        if (corr.pax_type === 'tourist') hourFactor *= 1.45;  // 假日觀光線大增
      } else {
        if (corr.pax_type === 'tourist') hourFactor *= 0.55;  // 平日觀光線略降
      }

      const maxCount = Math.min(14, Math.max(3, Math.floor(Math.log10(corr.total_vol || 10000) * 2.8)));
      const activeCount = Math.round(maxCount * Math.min(1.2, hourFactor));

      for (let i = 0; i < activeCount; i++) {
        particles.push({
          corridor: corr,
          progress: Math.random(),
          speed: (0.003 + Math.random() * 0.004) * (0.6 + hourFactor * 0.8),
          color: corr.color || '#38BDF8',
          paxType: corr.pax_type,
          hourFactor: hourFactor
        });
      }
    });
    particlesRef.current = particles;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const render = () => {
      if (!mapRef.current) return;
      const map = mapRef.current;
      const dpr = window.devicePixelRatio || 1;
      const bounds = map.getBounds();
      const nw = map.latLngToLayerPoint(bounds.getNorthWest());

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      // 繪製 OD 弧線背景光暈
      filteredCorridors.forEach(corr => {
        let hourFactor = corr.hourly_curve ? corr.hourly_curve[currentHour] : 0.5;
        if (selectedDayType === 'Weekend' || selectedDayType === 'Holiday') {
          if (corr.pax_type === 'commuter') hourFactor *= 0.35;
          if (corr.pax_type === 'tourist') hourFactor *= 1.45;
        }
        if (hourFactor < 0.02) return;

        const p1 = map.latLngToLayerPoint(corr.origin_coord);
        const p2 = map.latLngToLayerPoint(corr.dest_coord);

        const x1 = p1.x - nw.x;
        const y1 = p1.y - nw.y;
        const x2 = p2.x - nw.x;
        const y2 = p2.y - nw.y;

        const isFocused = selectedCorridor && (
          selectedCorridor.origin === corr.origin && selectedCorridor.destination === corr.destination
        );

        const dx = x2 - x1;
        const dy = y2 - y1;
        const cx = (x1 + x2) / 2 - dy * 0.15;
        const cy = (y1 + y2) / 2 + dx * 0.15;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(cx, cy, x2, y2);

        // 通勤走廊採藍/綠光，觀光走廊採粉/橘光微調
        const alpha = isFocused ? 'ee' : Math.floor(Math.min(255, Math.max(30, hourFactor * 160))).toString(16).padStart(2, '0');
        ctx.strokeStyle = isFocused ? 'rgba(255, 255, 255, 0.95)' : (corr.color + alpha);
        ctx.lineWidth = isFocused ? 4.0 : Math.min(3.5, Math.max(0.8, hourFactor * 3.0));
        ctx.stroke();
      });

      // 繪製時間與乘客身分動態粒子
      particlesRef.current.forEach(p => {
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;

        const p1 = map.latLngToLayerPoint(p.corridor.origin_coord);
        const p2 = map.latLngToLayerPoint(p.corridor.dest_coord);

        const x1 = p1.x - nw.x;
        const y1 = p1.y - nw.y;
        const x2 = p2.x - nw.x;
        const y2 = p2.y - nw.y;

        const dx = x2 - x1;
        const dy = y2 - y1;
        const cx = (x1 + x2) / 2 - dy * 0.15;
        const cy = (y1 + y2) / 2 + dx * 0.15;

        const t = p.progress;
        const px = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2;
        const py = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2;

        ctx.beginPath();
        const pRadius = 1.8 + p.hourFactor * 1.5;
        ctx.arc(px, py, pRadius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 4 + p.hourFactor * 4;
        ctx.fill();
      });

      ctx.restore();
      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [corridors, selectedMode, selectedRegion, selectedPaxType, selectedDayType, currentHour, selectedCorridor]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', background: '#07090E' }} />
    </div>
  );
}
