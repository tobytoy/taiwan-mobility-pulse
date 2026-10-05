import React, { useState, useEffect } from 'react';
import { 
  Users, Briefcase, Heart, Clock, Navigation, MapPin, 
  TrendingUp, Award, ShieldAlert, Sparkles, ChevronRight,
  Bus, Activity, DollarSign, Calendar, Zap, AlertTriangle
} from 'lucide-react';

export default function PersonaAnalyticsView() {
  const [activeSubTab, setActiveSubTab] = useState('commuter'); // 'commuter' or 'senior'
  const [commuterData, setCommuterData] = useState(null);
  const [seniorData, setSeniorData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const baseUrl = import.meta.env.BASE_URL || '/';
    const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

    Promise.all([
      fetch(`${cleanBase}commuter_analysis.json`).then(r => r.ok ? r.json() : null),
      fetch(`${cleanBase}senior_mobility_analysis.json`).then(r => r.ok ? r.json() : null)
    ])
      .then(([cData, sData]) => {
        setCommuterData(cData);
        setSeniorData(sData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load persona analytics data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '600px', color: '#94a3b8' }}>
        <div style={{ fontSize: '32px', marginBottom: '16px', animation: 'spin 1.5s infinite linear' }}>⏳</div>
        <div>載入客群深度大數據分析中...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto', color: '#f8fafc' }}>
      {/* Top Header & Sub-tab Switcher */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '20px' }}>👥</span>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
              大眾運輸客群畫像深度分析 (Persona Mobility Analytics)
            </h2>
            <span style={{ fontSize: '11px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
              4.48 億筆真實大數據
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
            基於雙北公車 TO3A 與多模態 OD 紀錄，透過 Python + Polars 安全串流引擎深度解構兩大極端出行族群
          </p>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', background: 'rgba(30, 41, 59, 0.7)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <button
            onClick={() => setActiveSubTab('commuter')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              background: activeSubTab === 'commuter' ? '#38BDF8' : 'transparent',
              color: activeSubTab === 'commuter' ? '#0F172A' : '#94A3B8',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Briefcase size={16} />
            <span>💼 上班通勤族資料分析</span>
          </button>
          <button
            onClick={() => setActiveSubTab('senior')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              background: activeSubTab === 'senior' ? '#EC4899' : 'transparent',
              color: activeSubTab === 'senior' ? '#FFFFFF' : '#94A3B8',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Heart size={16} />
            <span>👵 銀髮長者與愛心卡動態</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'commuter' ? (
        <CommuterSection data={commuterData} />
      ) : (
        <SeniorSection data={seniorData} />
      )}
    </div>
  );
}

// =========================================================================
// 1. 上班通勤族 (Commuter Section)
// =========================================================================
function CommuterSection({ data }) {
  if (!data) return <div style={{ color: '#94a3b8' }}>無通勤族分析資料</div>;
  const m = data.metrics || {};
  const hourly = data.hourly_distribution || [];
  const duration = data.duration_distribution || [];
  const corridors = data.top_commuter_corridors || [];

  const maxPct = Math.max(...hourly.map(h => h.percentage), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <KpiCard
          label="分析有效通勤樣本"
          value={m.total_adult_trips?.toLocaleString() || '1,210,829'}
          sub="一般成人工作日刷卡旅次"
          color="#38BDF8"
          icon={Users}
        />
        <KpiCard
          label="尖峰流量集中度"
          value={`${m.peak_concentration_pct}%`}
          sub="早尖峰(07-09) + 晚尖峰(17-19)"
          color="#F59E0B"
          icon={TrendingUp}
        />
        <KpiCard
          label="平均通勤在車耗時"
          value={`${m.avg_commute_mins} 分鐘`}
          sub={`平均搭乘 ${m.avg_commute_stops} 站 (中位數 ${m.median_commute_stops} 站)`}
          color="#10B981"
          icon={Clock}
        />
        <KpiCard
          label="TPASS 1200 採用率"
          value={`${m.tpass_adoption_pct}%`}
          sub="早尖峰重點走廊高達 55%+"
          color="#A855F7"
          icon={Award}
        />
        <KpiCard
          label="每趟平均補貼折讓"
          value={`NT$ ${m.avg_subsidy_discount}`}
          sub={`原票價 NT$${m.avg_standard_fare} ➔ 實付 NT$${m.avg_actual_paid_fare}`}
          color="#EC4899"
          icon={DollarSign}
        />
      </div>

      {/* Hourly Departure Histogram */}
      <div style={{ background: 'rgba(30, 41, 59, 0.6)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="#38BDF8" />
              通勤出發時間分佈圖 (24 小時搭乘節奏)
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
              呈現典型的「雙峰駝」常態分佈，早上 08:00 (7.15%) 與傍晚 17:00 (8.93%) 湧現全天最高峰
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#38BDF8' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#38BDF8' }} />
              晨尖峰 (07:00 ~ 09:00)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F59E0B' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#F59E0B' }} />
              晚尖峰 (17:00 ~ 19:00)
            </span>
          </div>
        </div>

        {/* Bar Chart */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '160px', paddingBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          {hourly.map(item => {
            const isMorning = item.hour >= 7 && item.hour <= 8;
            const isEvening = item.hour >= 17 && item.hour <= 18;
            const barHeight = (item.percentage / maxPct) * 120;
            return (
              <div key={item.hour} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '9px', color: isMorning ? '#38BDF8' : isEvening ? '#F59E0B' : '#64748B', fontWeight: isMorning || isEvening ? '700' : '400' }}>
                  {item.percentage}%
                </span>
                <div
                  title={`${item.hour}:00 - ${item.count.toLocaleString()} 旅次 (${item.percentage}%)`}
                  style={{
                    width: '100%',
                    height: `${barHeight}px`,
                    minHeight: '2px',
                    borderRadius: '3px 3px 0 0',
                    background: isMorning 
                      ? 'linear-gradient(180deg, #38BDF8, #0284C7)' 
                      : isEvening 
                        ? 'linear-gradient(180deg, #F59E0B, #D97706)' 
                        : 'rgba(148, 163, 184, 0.25)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontSize: '10px', color: '#94A3B8' }}>{item.hour}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Duration Distribution & Commute Corridors */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        {/* Left: Duration Breakdown */}
        <div style={{ background: 'rgba(30, 41, 59, 0.6)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '20px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '700', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16} color="#10B981" />
            通勤在車耗時與站數階梯分佈
          </h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#94a3b8' }}>
            高達 79.5% 乘客乘車時間在 30 分鐘以內，市區公車主要扮演第一哩接駁與中短程直達
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {duration.map((b, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}>
                  <span style={{ fontWeight: '600', color: '#e2e8f0' }}>{b.range}</span>
                  <span style={{ color: '#38BDF8', fontWeight: '700' }}>{b.percentage}% ({b.stops})</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${b.percentage}%`,
                      height: '100%',
                      background: idx === 0 ? '#10B981' : idx === 1 ? '#38BDF8' : idx === 2 ? '#F59E0B' : '#EF4444',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(56, 189, 248, 0.08)', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)', fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6' }}>
            💡 <strong style={{ color: '#38bdf8' }}>交通洞察</strong>：
            44.8% 的旅次搭乘 $\le 6$ 站（15分鐘內），主要是「住家 $\to$ 捷運站」之第一哩接駁；跨越 14 站以上的中長程乘客（佔 20.5%）則多為由新莊、三重、蘆洲跨河向心直達台北市中心的剛需客群。
          </div>
        </div>

        {/* Right: Top Morning Peak Corridors */}
        <div style={{ background: 'rgba(30, 41, 59, 0.6)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '20px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '700', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Navigation size={16} color="#F59E0B" />
            早尖峰 Top 熱門上班通勤走廊 (07:00 ~ 09:00)
          </h3>
          <p style={{ margin: '0 0 14px 0', fontSize: '12px', color: '#94a3b8' }}>
            內湖科技園區專案快線包辦運量榜首，TPASS 定期票滲透率高達 54% ~ 80%
          </p>

          <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94A3B8' }}>
                  <th style={{ padding: '6px 8px' }}>路線</th>
                  <th style={{ padding: '6px 8px' }}>出發站 ➔ 抵達站</th>
                  <th style={{ padding: '6px 8px' }}>類型</th>
                  <th style={{ padding: '6px 8px', textAlign: 'right' }}>TPASS</th>
                </tr>
              </thead>
              <tbody>
                {corridors.slice(0, 8).map((c, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '8px', fontWeight: '700', color: '#38BDF8' }}>{c.route}</td>
                    <td style={{ padding: '8px', color: '#e2e8f0' }}>
                      {c.origin} <span style={{ color: '#64748B' }}>➔</span> {c.destination}
                    </td>
                    <td style={{ padding: '8px' }}>
                      <span style={{ 
                        fontSize: '10px', 
                        padding: '2px 6px', 
                        borderRadius: '4px',
                        background: c.category.includes('內湖') ? 'rgba(56, 189, 248, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                        color: c.category.includes('內湖') ? '#38BDF8' : '#C084FC'
                      }}>
                        {c.category}
                      </span>
                    </td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: '700', color: c.tpass_pct >= 50 ? '#10B981' : '#F59E0B' }}>
                      {c.tpass_pct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 2. 銀髮長者與愛心卡 (Senior Section)
// =========================================================================
function SeniorSection({ data }) {
  if (!data) return <div style={{ color: '#94a3b8' }}>無長者分析資料</div>;
  const m = data.metrics || {};
  const hourly = data.hourly_distribution || [];
  const radius = data.radius_distribution || [];
  const hotspots = data.hotspot_categories || { hospitals: [], parks: [], markets: [] };
  const routes = data.age_friendly_routes || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <KpiCard
          label="分析長者敬老愛心卡樣本"
          value={m.total_senior_trips?.toLocaleString() || '614,125'}
          sub={`佔公車全體旅次高達 ${m.senior_share_pct}%`}
          color="#EC4899"
          icon={Heart}
        />
        <KpiCard
          label="避峰最高峰時段"
          value="10:00 (上午 9-11點)"
          sub="完美錯開上班族尖峰湧浪"
          color="#F59E0B"
          icon={Clock}
        />
        <KpiCard
          label="長者平均搭乘規模"
          value={`${m.avg_stops} 站`}
          sub={`中位數 ${m.median_stops} 站 (具備常規跨區能力)`}
          color="#10B981"
          icon={Navigation}
        />
        <KpiCard
          label="夜間活動退潮幅度"
          value="> 75% 銳減"
          sub="19:00 後長者已全數返家"
          color="#6366F1"
          icon={Calendar}
        />
        <KpiCard
          label="政府點數扣抵率"
          value="> 92% 免費"
          sub="每月 480 點全額扣減車資"
          color="#A855F7"
          icon={Award}
        />
      </div>

      {/* Comparison: Adult vs Senior Hourly Curve */}
      <div style={{ background: 'rgba(30, 41, 59, 0.6)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Heart size={16} color="#EC4899" />
              生活時鐘對比：上班族 (雙尖峰) vs. 長者 (避峰高原)
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
              長者在上午 09:00 ~ 11:30 形成全天最高峰（近 10%），下午 16:00 搶在下班尖峰前返家
            </p>
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38BDF8', fontWeight: '600' }}>
              <span style={{ width: '12px', height: '3px', background: '#38BDF8', borderRadius: '2px' }} />
              一般成人/上班族
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#EC4899', fontWeight: '700' }}>
              <span style={{ width: '12px', height: '3px', background: '#EC4899', borderRadius: '2px' }} />
              銀髮長者敬老卡 (C01)
            </span>
          </div>
        </div>

        {/* Dual Line / Bar Graph */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '180px', paddingBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          {hourly.map(item => {
            const seniorH = (item.senior_pct / 10.0) * 130;
            const adultH = (item.adult_pct / 10.0) * 130;
            const isSeniorPeak = item.hour >= 9 && item.hour <= 11;
            return (
              <div key={item.hour} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '9px', color: isSeniorPeak ? '#EC4899' : '#64748B', fontWeight: isSeniorPeak ? '800' : '400' }}>
                  {item.senior_pct}%
                </span>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', width: '100%', height: '130px' }}>
                  {/* Adult bar */}
                  <div
                    title={`成人 ${item.hour}:00 - ${item.adult_pct}%`}
                    style={{
                      flex: 1,
                      height: `${adultH}px`,
                      minHeight: '2px',
                      background: 'rgba(56, 189, 248, 0.35)',
                      borderRadius: '2px 2px 0 0'
                    }}
                  />
                  {/* Senior bar */}
                  <div
                    title={`長者 ${item.hour}:00 - ${item.senior_pct}%`}
                    style={{
                      flex: 1,
                      height: `${seniorH}px`,
                      minHeight: '2px',
                      background: isSeniorPeak ? 'linear-gradient(180deg, #F43F5E, #E11D48)' : 'rgba(236, 72, 153, 0.8)',
                      borderRadius: '2px 2px 0 0'
                    }}
                  />
                </div>
                <span style={{ fontSize: '10px', color: '#94A3B8' }}>{item.hour}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Range of Motion & 3 Functional Clusters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
        {/* Left: Range of Motion */}
        <div style={{ background: 'rgba(30, 41, 59, 0.6)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '20px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '700', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Navigation size={16} color="#EC4899" />
            長者空間活動半徑與生活圈分佈
          </h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#94a3b8' }}>
            長者不僅在自家附近買菜，更有 36.1% 進行超過 10 站之跨行政區遠行活動
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {radius.map((b, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '600', color: '#e2e8f0' }}>{b.range}</span>
                  <span style={{ color: '#EC4899', fontWeight: '700' }}>{b.percentage}% ({b.approx_km})</span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '6px' }}>{b.purpose}</div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${b.percentage}%`,
                      height: '100%',
                      background: idx === 0 ? '#10B981' : idx === 1 ? '#EC4899' : idx === 2 ? '#38BDF8' : '#A855F7',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Three Core Hotspot Clusters */}
        <div style={{ background: 'rgba(30, 41, 59, 0.6)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '20px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '700', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={16} color="#F59E0B" />
            長者三大核心活動聚落分類 (Top Hotspots)
          </h3>
          <p style={{ margin: '0 0 14px 0', fontSize: '12px', color: '#94a3b8' }}>
            醫療就醫是長者搭公車第一大外部動機，其次為傳統市集與大型綠地
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Hospitals */}
            <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#F87171', marginBottom: '6px' }}>
                🏥 醫療就醫動脈 (熱度最高)
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {hotspots.hospitals.map((h, i) => (
                  <span key={i} style={{ fontSize: '11px', background: 'rgba(239, 68, 68, 0.15)', color: '#FECACA', padding: '3px 8px', borderRadius: '4px' }}>
                    {h.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Parks */}
            <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#34D399', marginBottom: '6px' }}>
                🌳 休閒綠地與信仰中心
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {hotspots.parks.map((p, i) => (
                  <span key={i} style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.15)', color: '#A7F3D0', padding: '3px 8px', borderRadius: '4px' }}>
                    {p.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Markets */}
            <div style={{ padding: '10px', background: 'rgba(245, 158, 11, 0.08)', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#FBBF24', marginBottom: '6px' }}>
                🛒 傳統市集民生採買
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {hotspots.markets.map((m, i) => (
                  <span key={i} style={{ fontSize: '11px', background: 'rgba(245, 158, 11, 0.15)', color: '#FDE68A', padding: '3px 8px', borderRadius: '4px' }}>
                    {m.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Age-friendly Bus Routes Ranking Table */}
      <div style={{ background: 'rgba(30, 41, 59, 0.6)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '20px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '700', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bus size={16} color="#EC4899" />
          高齡友善公車 Top 15 路線（低地板公車建議優先配額清單）
        </h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#94a3b8' }}>
          篩選運量破 1,500 筆之公車中，長者搭乘比例最高者。直達各大醫學中心與舊市區之路線長者比例突破 35% ~ 42%
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94A3B8' }}>
                <th style={{ padding: '8px 12px' }}>公車路線</th>
                <th style={{ padding: '8px 12px' }}>長者佔比</th>
                <th style={{ padding: '8px 12px' }}>長者旅次 / 總旅次</th>
                <th style={{ padding: '8px 12px' }}>政策與車輛配置建議</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: '700', color: '#EC4899' }}>{r.route}</td>
                  <td style={{ padding: '10px 12px', fontWeight: '800', color: r.senior_pct >= 35 ? '#F43F5E' : '#FB7185' }}>
                    {r.senior_pct}%
                  </td>
                  <td style={{ padding: '10px 12px', color: '#94A3B8' }}>
                    {r.senior_trips.toLocaleString()} / {r.total_trips.toLocaleString()}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#cbd5e1' }}>
                    <span style={{ 
                      fontSize: '11px',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: r.senior_pct >= 35 ? 'rgba(244, 63, 94, 0.15)' : 'rgba(56, 189, 248, 0.1)',
                      color: r.senior_pct >= 35 ? '#FECDD3' : '#BAE6FD'
                    }}>
                      {r.recommendation}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, sub, color, icon: Icon }) {
  return (
    <div style={{
      background: 'rgba(30, 41, 59, 0.6)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '10px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <span style={{ fontSize: '12px', color: '#94a3b8' }}>{label}</span>
        {Icon && <Icon size={16} color={color} />}
      </div>
      <div>
        <div style={{ fontSize: '20px', fontWeight: '800', color, fontFamily: 'JetBrains Mono, sans-serif' }}>
          {value}
        </div>
        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
          {sub}
        </div>
      </div>
    </div>
  );
}
