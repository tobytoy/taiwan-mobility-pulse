import React from 'react';
import {
  ShoppingBag, Zap, Navigation, Award, Users, Car,
  DollarSign, Clock, ShieldCheck, AlertTriangle, ArrowRight,
  Sliders, BatteryCharging, Gauge, CheckCircle2, ChevronRight
} from 'lucide-react';
import {
  RETAIL_GRAVITY_HUBS,
  EV_CHARGING_SITING_HUBS,
  calculateInteractiveEVRoi
} from '../data/commercialRetailAndEVData';

/**
 * 方案 A：🏢 旗艦零售與 Outlet 跨縣市自駕引力水系決策 HUD 面板
 */
export function RetailGravityHUD({ hub, onSelectHub }) {
  if (!hub) return null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      color: '#F8FAFC'
    }}>
      {/* 抬頭與分類徽章 */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600' }}>
              📍 {hub.regionLabel}
            </span>
            <span style={{
              fontSize: '9.5px',
              background: `${hub.brandColor}22`,
              color: hub.brandColor,
              border: `1px solid ${hub.brandColor}55`,
              padding: '1px 6px',
              borderRadius: '10px',
              fontWeight: '800'
            }}>
              {hub.brandTag}
            </span>
          </div>
          <span style={{
            fontSize: '10px',
            padding: '2px 8px',
            borderRadius: '12px',
            background: 'rgba(236, 72, 153, 0.15)',
            border: '1px solid rgba(236, 72, 153, 0.4)',
            color: '#EC4899',
            fontWeight: '800'
          }}>
            引力指數 {hub.gravityScore} / 100
          </span>
        </div>
        <h2 style={{ margin: '4px 0 2px 0', fontSize: '18px', fontWeight: '900', color: '#F8FAFC', lineHeight: '1.3' }}>
          {hub.name}
        </h2>
        <div style={{ fontSize: '11px', color: '#38BDF8', marginTop: '2px' }}>
          🛣️ {hub.corridorName}
        </div>
        <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '1px' }}>
          eTag 門架：{(hub.gantryCodes || []).join(' · ')}
        </div>
      </div>

      {/* 核心 KPI 4 宮格 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
        <div style={{ background: 'rgba(30, 41, 59, 0.55)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '10px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Car size={12} color="#F43F5E" /> 週末自駕日車流
          </div>
          <div style={{ fontSize: '18px', fontWeight: '900', fontFamily: 'JetBrains Mono', color: '#F8FAFC', margin: '3px 0' }}>
            {hub.weekendCars.toLocaleString()} <span style={{ fontSize: '10px', color: '#94A3B8' }}>輛/日</span>
          </div>
          <div style={{ fontSize: '10px', color: '#FB923C' }}>
            自駕佔比 <strong>{hub.driveSharePct}%</strong>
          </div>
        </div>

        <div style={{ background: 'rgba(30, 41, 59, 0.55)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '10px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <DollarSign size={12} color="#34D399" /> 車均客單價估算
          </div>
          <div style={{ fontSize: '18px', fontWeight: '900', fontFamily: 'JetBrains Mono', color: '#34D399', margin: '3px 0' }}>
            NT$ {hub.avgTicketSpend.toLocaleString()}
          </div>
          <div style={{ fontSize: '10px', color: '#94A3B8' }}>
            高資產自駕家庭消費
          </div>
        </div>

        <div style={{ background: 'rgba(30, 41, 59, 0.55)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '10px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} color="#38BDF8" /> 平均自駕車程耗時
          </div>
          <div style={{ fontSize: '18px', fontWeight: '900', fontFamily: 'JetBrains Mono', color: '#38BDF8', margin: '3px 0' }}>
            {hub.avgDriveTimeMin} <span style={{ fontSize: '10px', color: '#94A3B8' }}>分鐘</span>
          </div>
          <div style={{ fontSize: '10px', color: '#94A3B8' }}>
            核心吸附半徑 <strong>{hub.catchmentRadiusKm} km</strong>
          </div>
        </div>

        <div style={{ background: 'rgba(30, 41, 59, 0.55)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '10px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertTriangle size={12} color="#FBBF24" /> 假日停車壓力指數
          </div>
          <div style={{ fontSize: '18px', fontWeight: '900', fontFamily: 'JetBrains Mono', color: hub.parkingStressRatio > 1.4 ? '#F87171' : '#FBBF24', margin: '3px 0' }}>
            {hub.parkingStressRatio}x
          </div>
          <div style={{ fontSize: '9.5px', color: hub.parkingStressRatio > 1.4 ? '#FCA5A5' : '#FDE68A' }}>
            {hub.parkingStressLabel}
          </div>
        </div>
      </div>

      {/* 🗺️ 跨縣市客源來源分解 (Catchment Origin OD Rays) */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.8)',
        borderRadius: '10px',
        border: '1px solid rgba(236, 72, 153, 0.3)',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#EC4899', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Navigation size={13} color="#EC4899" />
            <span>跨縣市客源水系分解 (OD Catchment Rays)</span>
          </div>
          <span style={{ fontSize: '9.5px', color: '#94A3B8' }}>
            {hub.catchmentFlowRays.length} 大核心流向
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
          {hub.catchmentFlowRays.map((ray, idx) => (
            <div key={idx} style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '7px 9px', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10.5px', marginBottom: '4px' }}>
                <span style={{ color: '#F1F5F9', fontWeight: '700' }}>
                  {idx + 1}. {ray.originName}
                </span>
                <span style={{ color: '#EC4899', fontWeight: '800', fontFamily: 'JetBrains Mono' }}>
                  {ray.flowPct}% <span style={{ fontSize: '9px', color: '#94A3B8' }}>({ray.estDistanceKm} km)</span>
                </span>
              </div>
              <div style={{ width: '100%', height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <div style={{ width: `${ray.flowPct}%`, height: '100%', background: 'linear-gradient(90deg, #F43F5E, #EC4899)' }} />
              </div>
              <div style={{ fontSize: '9.5px', color: '#94A3B8', marginTop: '3px' }}>
                走廊：{ray.route}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 👥 顧客族群畫像比例 */}
      <div style={{ background: 'rgba(30, 41, 59, 0.45)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: '11px', fontWeight: '800', color: '#CBD5E1', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Users size={13} color="#38BDF8" /> 自駕顧客族群結構與消費偏好
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
          {hub.customerDemographics.map((demo, i) => (
            <div key={i} style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '6px 8px', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '15px', fontWeight: '900', color: '#38BDF8', fontFamily: 'JetBrains Mono' }}>
                {demo.pct}%
              </div>
              <div style={{ fontSize: '9.5px', color: '#94A3B8', marginTop: '2px' }}>
                {demo.tag}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 💡 商業決策與精準數位廣告投放建議 */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.65)',
        borderLeft: '3px solid #EC4899',
        padding: '10px 12px',
        borderRadius: '6px',
        fontSize: '11px',
        color: '#CBD5E1',
        lineHeight: '1.5'
      }}>
        <div style={{ color: '#EC4899', fontWeight: '800', marginBottom: '3px' }}>
          💡 B2B 商業策略與跨縣市數位廣告投放建議：
        </div>
        {hub.commercialInsights}
      </div>

      {/* 快速切換全台其他旗艦商場標籤 */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
        <div style={{ fontSize: '10.5px', color: '#94A3B8', marginBottom: '6px' }}>
          🏢 快速切換全台 12 大旗艦零售 Outlet / 好市多：
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {RETAIL_GRAVITY_HUBS.map(rh => (
            <button
              key={rh.id}
              onClick={() => onSelectHub(rh)}
              style={{
                padding: '4px 8px',
                borderRadius: '5px',
                fontSize: '10px',
                border: hub.id === rh.id ? '1px solid #EC4899' : '1px solid rgba(255,255,255,0.08)',
                background: hub.id === rh.id ? 'rgba(236, 72, 153, 0.25)' : 'rgba(30, 41, 59, 0.5)',
                color: hub.id === rh.id ? '#FFFFFF' : '#94A3B8',
                fontWeight: hub.id === rh.id ? '800' : '500',
                cursor: 'pointer'
              }}
            >
              {rh.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * 方案 B：⚡ EV 高速超充黃金選址與 CPO 投資 ROI 互動模擬器 HUD 面板
 */
export function EVChargingSitingHUD({
  hub,
  stalls,
  setStalls,
  tariff,
  setTariff,
  powerCost,
  setPowerCost,
  onSelectHub
}) {
  if (!hub) return null;

  // 動態連動財務試算
  const roiResult = calculateInteractiveEVRoi({
    dailyTraffic: hub.dailyTrafficCars,
    longDistancePct: hub.longDistanceRatioPct,
    urgencyIndex: hub.urgencyIndex,
    stalls: stalls,
    tariffPerKwh: tariff,
    powerCostPerKwh: powerCost,
    capexPerStall: 2800000
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      color: '#F8FAFC'
    }}>
      {/* 抬頭與分類徽章 */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600' }}>
              📍 {hub.regionLabel}
            </span>
            <span style={{
              fontSize: '9.5px',
              background: `${hub.tierColor}22`,
              color: hub.tierColor,
              border: `1px solid ${hub.tierColor}55`,
              padding: '1px 6px',
              borderRadius: '10px',
              fontWeight: '800'
            }}>
              {hub.tierBadge}
            </span>
          </div>
          <span style={{
            fontSize: '10px',
            padding: '2px 8px',
            borderRadius: '12px',
            background: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            color: '#38BDF8',
            fontWeight: '800'
          }}>
            剛需評分 {hub.urgencyIndex} / 100
          </span>
        </div>
        <h2 style={{ margin: '4px 0 2px 0', fontSize: '18px', fontWeight: '900', color: '#F8FAFC', lineHeight: '1.3' }}>
          {hub.name}
        </h2>
        <div style={{ fontSize: '11px', color: '#FBBF24', marginTop: '2px' }}>
          🛣️ 交流道代碼：<strong>{hub.interchangeCode}</strong>
        </div>
        <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '1px' }}>
          eTag 門架編號：{hub.gantryCode}
        </div>
      </div>

      {/* 核心剛需 KPI 4 宮格 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
        <div style={{ background: 'rgba(30, 41, 59, 0.55)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '10px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} color="#34D399" /> 交流道下閘道抵達時長
          </div>
          <div style={{ fontSize: '18px', fontWeight: '900', fontFamily: 'JetBrains Mono', color: '#34D399', margin: '3px 0' }}>
            {hub.driveTimeToExitMin} <span style={{ fontSize: '10px', color: '#94A3B8' }}>分鐘</span>
          </div>
          <div style={{ fontSize: '10px', color: '#94A3B8' }}>
            離出口匝道 <strong>{hub.exitDistanceMeters}m</strong>
          </div>
        </div>

        <div style={{ background: 'rgba(30, 41, 59, 0.55)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '10px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Car size={12} color="#38BDF8" /> 門架日均小客車流
          </div>
          <div style={{ fontSize: '18px', fontWeight: '900', fontFamily: 'JetBrains Mono', color: '#F8FAFC', margin: '3px 0' }}>
            {hub.dailyTrafficCars.toLocaleString()} <span style={{ fontSize: '10px', color: '#94A3B8' }}>輛/日</span>
          </div>
          <div style={{ fontSize: '10px', color: '#38BDF8' }}>
            長途跨縣市 <strong>{hub.longDistanceRatioPct}%</strong>
          </div>
        </div>

        <div style={{ background: 'rgba(30, 41, 59, 0.55)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '10px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <BatteryCharging size={12} color="#FBBF24" /> 建議超充規格
          </div>
          <div style={{ fontSize: '17px', fontWeight: '900', fontFamily: 'JetBrains Mono', color: '#FBBF24', margin: '3px 0' }}>
            {hub.recommendedStalls} 樁 {hub.recommendedGuns} 槍
          </div>
          <div style={{ fontSize: '10px', color: '#94A3B8' }}>
            {hub.chargingPowerKw}kW 液冷超充
          </div>
        </div>

        <div style={{ background: 'rgba(30, 41, 59, 0.55)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '10px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Award size={12} color="#10B981" /> 基準投資回收期 (ROI)
          </div>
          <div style={{ fontSize: '18px', fontWeight: '900', fontFamily: 'JetBrains Mono', color: '#10B981', margin: '3px 0' }}>
            {hub.baselinePaybackYears} <span style={{ fontSize: '10px', color: '#94A3B8' }}>年</span>
          </div>
          <div style={{ fontSize: '10px', color: '#34D399' }}>
            基準建置回收期
          </div>
        </div>
      </div>

      {/* 🧮 互動式 CPO 投資財務試算引擎 (Live Financial Simulator) */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.85)',
        borderRadius: '10px',
        border: '1px solid rgba(56, 189, 248, 0.35)',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#38BDF8', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Sliders size={13} color="#38BDF8" />
            <span>互動式 CPO 投資試算引擎 (Interactive Simulator)</span>
          </div>
          <span style={{ fontSize: '9px', background: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8', padding: '1px 5px', borderRadius: '4px' }}>
            即時連動
          </span>
        </div>

        {/* 參數控制 1: 樁數配置 */}
        <div>
          <div style={{ fontSize: '10px', color: '#94A3B8', marginBottom: '4px' }}>
            1. 規劃建置超充樁數：
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
            {[
              { val: 2, label: '2樁 4槍' },
              { val: 4, label: '4樁 8槍' },
              { val: 6, label: '6樁 12槍' },
              { val: 8, label: '8樁 16槍' }
            ].map(item => (
              <button
                key={item.val}
                onClick={() => setStalls(item.val)}
                style={{
                  padding: '5px 2px',
                  borderRadius: '5px',
                  fontSize: '9.5px',
                  fontWeight: stalls === item.val ? '800' : '500',
                  border: stalls === item.val ? '1.5px solid #38BDF8' : '1px solid rgba(255,255,255,0.08)',
                  background: stalls === item.val ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.5)',
                  color: stalls === item.val ? '#FFFFFF' : '#94A3B8',
                  cursor: 'pointer'
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 參數控制 2: 度電零售價 */}
        <div>
          <div style={{ fontSize: '10px', color: '#94A3B8', marginBottom: '4px' }}>
            2. 零售充電定價 (每度電 NT$/kWh)：
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
            {[
              { val: 9.8, label: 'NT$ 9.8 優惠價' },
              { val: 10.8, label: 'NT$ 10.8 市場均價' },
              { val: 11.8, label: 'NT$ 11.8 尖峰溢價' }
            ].map(item => (
              <button
                key={item.val}
                onClick={() => setTariff(item.val)}
                style={{
                  padding: '5px 2px',
                  borderRadius: '5px',
                  fontSize: '9.5px',
                  fontWeight: tariff === item.val ? '800' : '500',
                  border: tariff === item.val ? '1.5px solid #10B981' : '1px solid rgba(255,255,255,0.08)',
                  background: tariff === item.val ? 'rgba(16, 185, 129, 0.25)' : 'rgba(30, 41, 59, 0.5)',
                  color: tariff === item.val ? '#FFFFFF' : '#94A3B8',
                  cursor: 'pointer'
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 即時試算財務成果卡 */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.7)',
          borderRadius: '8px',
          padding: '10px',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px'
        }}>
          <div>
            <div style={{ fontSize: '9.5px', color: '#94A3B8' }}>預估日充電車次</div>
            <div style={{ fontSize: '16px', fontWeight: '900', color: '#38BDF8', fontFamily: 'JetBrains Mono' }}>
              {roiResult.actualDailySessions} <span style={{ fontSize: '9px', color: '#94A3B8' }}>車次/日</span>
            </div>
            <div style={{ fontSize: '9px', color: '#94A3B8' }}>
              稼動率 <strong>{roiResult.utilizationRate}%</strong>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '9.5px', color: '#94A3B8' }}>年化營業營收</div>
            <div style={{ fontSize: '16px', fontWeight: '900', color: '#FBBF24', fontFamily: 'JetBrains Mono' }}>
              NT$ {(roiResult.annualRevenue / 10000).toFixed(0)} <span style={{ fontSize: '9px', color: '#94A3B8' }}>萬元</span>
            </div>
            <div style={{ fontSize: '9px', color: '#34D399' }}>
              淨利 NT$ {(roiResult.annualNetProfit / 10000).toFixed(0)} 萬
            </div>
          </div>

          <div>
            <div style={{ fontSize: '9.5px', color: '#94A3B8' }}>總建置成本 (CAPEX)</div>
            <div style={{ fontSize: '16px', fontWeight: '900', color: '#CBD5E1', fontFamily: 'JetBrains Mono' }}>
              NT$ {(roiResult.totalCapex / 10000).toFixed(0)} <span style={{ fontSize: '9px', color: '#94A3B8' }}>萬元</span>
            </div>
            <div style={{ fontSize: '9px', color: '#94A3B8' }}>
              含設備及地基工程
            </div>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '6px 8px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div style={{ fontSize: '9.5px', color: '#34D399', fontWeight: '700' }}>🌟 動態回本期 (ROI)</div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: '#10B981', fontFamily: 'JetBrains Mono' }}>
              {roiResult.paybackYears} <span style={{ fontSize: '10px' }}>年</span>
            </div>
            <div style={{ fontSize: '9px', color: '#A7F3D0' }}>
              {roiResult.paybackYears <= 2.0 ? '⚡ 超高獲利黃金期' : '穩健回收'}
            </div>
          </div>
        </div>
      </div>

      {/* ⚡ 電網與饋線容量評估 */}
      <div style={{ background: 'rgba(30, 41, 59, 0.45)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: '10.5px', fontWeight: '800', color: '#CBD5E1', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Gauge size={13} color="#FBBF24" /> 台電饋線容量與引電難易度評估
        </div>
        <div style={{ fontSize: '10px', color: '#94A3B8', lineHeight: '1.4' }}>
          {hub.gridFeederStatus}
        </div>
      </div>

      {/* 🎯 CPO 營運商適配度評級 */}
      <div style={{ background: 'rgba(30, 41, 59, 0.45)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: '10.5px', fontWeight: '800', color: '#CBD5E1', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <CheckCircle2 size={13} color="#10B981" /> 推薦優先進駐 CPO 營運商
        </div>
        <div style={{ fontSize: '10.5px', color: '#38BDF8', fontWeight: '700' }}>
          {hub.cpoSuitability}
        </div>
      </div>

      {/* 💡 選址與商業洞察 */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.65)',
        borderLeft: '3px solid #38BDF8',
        padding: '10px 12px',
        borderRadius: '6px',
        fontSize: '11px',
        color: '#CBD5E1',
        lineHeight: '1.5'
      }}>
        <div style={{ color: '#38BDF8', fontWeight: '800', marginBottom: '3px' }}>
          💡 高速公路選址決策洞察：
        </div>
        {hub.sitingRationale}
      </div>

      {/* 快速切換全台其他 10 大超充節點標籤 */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
        <div style={{ fontSize: '10.5px', color: '#94A3B8', marginBottom: '6px' }}>
          ⚡ 快速切換全台 10 大國道超充潛力站點：
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {EV_CHARGING_SITING_HUBS.map(eh => (
            <button
              key={eh.id}
              onClick={() => onSelectHub(eh)}
              style={{
                padding: '4px 8px',
                borderRadius: '5px',
                fontSize: '10px',
                border: hub.id === eh.id ? '1px solid #38BDF8' : '1px solid rgba(255,255,255,0.08)',
                background: hub.id === eh.id ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.5)',
                color: hub.id === eh.id ? '#FFFFFF' : '#94A3B8',
                fontWeight: hub.id === eh.id ? '800' : '500',
                cursor: 'pointer'
              }}
            >
              {eh.name.split(' ')[1] || eh.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
