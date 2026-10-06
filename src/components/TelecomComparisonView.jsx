import React, { useState } from 'react';
import { 
  Radio, Ticket, ShieldCheck, AlertTriangle, Layers, 
  Sparkles, ArrowRight, Zap, Target, Globe, Compass, 
  TrendingUp, Users, CheckCircle2, XCircle, RefreshCw,
  Building, MapPin, Store, Database, Flame
} from 'lucide-react';

export default function TelecomComparisonView() {
  const [activeSubTab, setActiveSubTab] = useState('comparison'); // 'comparison', 'fusion', 'use_cases'

  return (
    <div style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto', color: '#f8fafc' }}>
      
      {/* Header Banner */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(168, 85, 247, 0.15))', 
        border: '1px solid rgba(56, 189, 248, 0.3)', 
        borderRadius: '16px', 
        padding: '24px 28px', 
        marginBottom: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8', border: '1px solid rgba(56, 189, 248, 0.4)', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '800' }}>
            戰略深度專題
          </span>
          <span style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#C084FC', border: '1px solid rgba(168, 85, 247, 0.4)', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '800' }}>
            跨界數據融合 (Data Fusion)
          </span>
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 8px 0' }}>
          <Radio size={26} color="#38BDF8" /> 票證大數據 vs. 電信信令大數據：優劣勢深度對比與雙向融合藍圖
        </h2>
        <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.6', maxWidth: '1100px', margin: 0 }}>
          深入解析「交通票證（Ticketing Data）」與「手機電信信令（Cellular Signaling Data）」在人流分析上的核心本質差異。釐清外籍旅客盲區、政策票種標籤、地下垂直精度與連續空間追蹤的各自極限，並提出<strong>「1 + 1 &gt; 2 門到門全域閉環人流（Door-to-Door Fusion）」</strong>的跨界合作方案。
        </p>

        {/* Top 3 Quick Impact Badges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginTop: '20px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>票證獨家優勢</div>
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#38BDF8', marginTop: '2px' }}>
              🎯 100% 物理普查真實交易，無抽樣推估偏差
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
              具備 TPASS 月票、敬老愛心與外籍單程票的政策身分與實付契約。
            </div>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>電信獨家優勢</div>
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#C084FC', marginTop: '2px' }}>
              🌐 全域室外連續移動追蹤，無閘門景點覆蓋
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
              覆蓋私家車、機車、徒步逛街與大稻埕煙火等無收費設施人潮。
            </div>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>雙劍合璧潛力</div>
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#10B981', marginTop: '2px' }}>
              🚀 閘門內精準契約 ＋ 閘門外商圈逛街停留
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
              還原「出站後停留逛街 90 分鐘轉 YouBike」之全台首創門到門旅程。
            </div>
          </div>
        </div>
      </div>

      {/* Nav Sub-tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: 'rgba(30, 41, 59, 0.6)', padding: '5px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', width: 'fit-content' }}>
        {[
          { id: 'comparison', label: '⚖️ 核心維度深度對比 (Matrix)', icon: Layers },
          { id: 'fusion', label: '🧬 雙方數據合作融合優化藍圖 (Data Fusion)', icon: Sparkles },
          { id: 'use_cases', label: '💼 商業與政策落地選型指南 (Use Cases)', icon: Target }
        ].map(t => {
          const isSel = activeSubTab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveSubTab(t.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: isSel ? '#38BDF8' : 'transparent',
                color: isSel ? '#0F172A' : '#94A3B8',
                fontSize: '13px',
                fontWeight: isSel ? '800' : '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={16} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUBTAB 1: Core Comparison Matrix */}
      {activeSubTab === 'comparison' && (
        <div>
          {/* Detailed Cards for Top 6 Core Differences */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            
            {/* 1. 樣本代表性與真實性 */}
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#F8FAFC' }}>
                  1. 樣本代表性 (Sample vs. Census)
                </span>
                <span style={{ fontSize: '11px', background: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                  票證大幅勝出
                </span>
              </div>
              <div style={{ fontSize: '12px', lineHeight: '1.6', color: '#cbd5e1' }}>
                <div style={{ padding: '8px 10px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', marginBottom: '8px', borderLeft: '3px solid #38BDF8' }}>
                  <strong style={{ color: '#38BDF8' }}>🚆 交通票證：100% 物理全量普查</strong><br />
                  每次進出閘門都是一筆不可磨滅的金融扣款紀錄，無抽樣誤差，數據即真實客流。
                </div>
                <div style={{ padding: '8px 10px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', borderLeft: '3px solid #C084FC' }}>
                  <strong style={{ color: '#C084FC' }}>📡 電信信令：依市佔率抽樣擴推 (Expansion)</strong><br />
                  單一電信業者（如中華電信市佔約 37%）必須乘上 2.7 倍係數。在特定族群（移工偏好某電信、外籍客使用特定旅遊卡）時會出現嚴重採樣偏差。
                </div>
              </div>
            </div>

            {/* 2. 意圖與經濟屬性 */}
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#F8FAFC' }}>
                  2. 政策契約與支付意圖 (Policy & Intent)
                </span>
                <span style={{ fontSize: '11px', background: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                  票證獨家護城河
                </span>
              </div>
              <div style={{ fontSize: '12px', lineHeight: '1.6', color: '#cbd5e1' }}>
                <div style={{ padding: '8px 10px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', marginBottom: '8px', borderLeft: '3px solid #38BDF8' }}>
                  <strong style={{ color: '#38BDF8' }}>🚆 交通票證：具備真實票種與實付車資</strong><br />
                  精準帶有 <code>TicketType=4</code> (TPASS 月票)、<code>PaymentPrice=0</code>、<code>TicketClass=N-IC</code> (單程票)。能直接區分「享受政策補助的剛需族」vs「自費觀光客」。
                </div>
                <div style={{ padding: '8px 10px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', borderLeft: '3px solid #C084FC' }}>
                  <strong style={{ color: '#C084FC' }}>📡 電信信令：只有位置座標，無消費意圖</strong><br />
                  只能辨識「有一支手機在西門町移動」，完全無法得知他買的是 1200 月票還是花 25 元單程票，無法做補貼效益評估。
                </div>
              </div>
            </div>

            {/* 3. 境外觀光客與外籍黑數 */}
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#F8FAFC' }}>
                  3. 境外觀光客與漫遊黑數 (Inbound Roaming)
                </span>
                <span style={{ fontSize: '11px', background: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                  票證精準捕獲
                </span>
              </div>
              <div style={{ fontSize: '12px', lineHeight: '1.6', color: '#cbd5e1' }}>
                <div style={{ padding: '8px 10px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', marginBottom: '8px', borderLeft: '3px solid #38BDF8' }}>
                  <strong style={{ color: '#38BDF8' }}>🚆 交通票證：出門移動一定要過閘門買票</strong><br />
                  外國旅客落地無論是買單程 Token、現場買悠遊卡、還是刷 Visa/Master 乘車碼，全部在票證系統中被 100% 完整捕捉。
                </div>
                <div style={{ padding: '8px 10px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', borderLeft: '3px solid #C084FC' }}>
                  <strong style={{ color: '#C084FC' }}>📡 電信信令：存在國外漫遊與未換 SIM 卡黑數</strong><br />
                  外國旅客使用國外原號漫遊、或僅租用隨身 Wi-Fi 分享器，在單一電信業者眼中常分類不清、國籍延遲甚至成為信令黑數。
                </div>
              </div>
            </div>

            {/* 4. 垂直三維與地下精度 */}
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#F8FAFC' }}>
                  4. 垂直高度與三維精度 (Z-axis Precision)
                </span>
                <span style={{ fontSize: '11px', background: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                  票證公分級鎖定
                </span>
              </div>
              <div style={{ fontSize: '12px', lineHeight: '1.6', color: '#cbd5e1' }}>
                <div style={{ padding: '8px 10px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', marginBottom: '8px', borderLeft: '3px solid #38BDF8' }}>
                  <strong style={{ color: '#38BDF8' }}>🚆 交通票證：公分級物理閘門校驗</strong><br />
                  精準確定旅客是在「地下三樓的捷運月台」進站，毫秒不差，完全無視建築遮蔽。
                </div>
                <div style={{ padding: '8px 10px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', borderLeft: '3px solid #C084FC' }}>
                  <strong style={{ color: '#C084FC' }}>📡 電信信令：基地台漂移 200~500m，無垂直高度</strong><br />
                  在台北車站樞紐，基地台乒乓切換（Ping-pong），難以區分人是在高架橋塞車、一樓逛微風、還是地下一樓搭高鐵。
                </div>
              </div>
            </div>

            {/* 5. 跨運具轉乘鏈結與政策身分核銷 */}
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#F8FAFC' }}>
                  5. 多模態轉乘與連續搭乘優惠碼 (Transfer Code & Identity)
                </span>
                <span style={{ fontSize: '11px', background: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                  票證不可替代之護城河
                </span>
              </div>
              <div style={{ fontSize: '12px', lineHeight: '1.6', color: '#cbd5e1' }}>
                <div style={{ padding: '8px 10px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', marginBottom: '8px', borderLeft: '3px solid #38BDF8' }}>
                  <strong style={{ color: '#38BDF8' }}>🚆 交通票證：精準還原行程鏈與法定核銷代碼 (TransferCode)</strong><br />
                  票證帶有精確物理扣款代碼，能判讀「捷運轉公車 (代碼 102)」、「台鐵轉公路客運 (代碼 403)」、「幹線公車轉乘 (代碼 9902)」以及長者愛心卡、學生卡身分。交通部與地方政府每週發放的 <strong>NT$ 5,503 萬元轉乘補貼</strong>，票證是<strong>唯一具備法律效力的物理交易核銷憑證</strong>！
                </div>
                <div style={{ padding: '8px 10px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', borderLeft: '3px solid #C084FC' }}>
                  <strong style={{ color: '#C084FC' }}>📡 電信信令：僅有空間位移，無身分與票價折扣資訊</strong><br />
                  電信基地台只知道手機在移動，完全無法判定是否享有政策轉乘減免、愛心卡 480 點扣減或 TPASS 月票，在財政預算補貼撥付與運具轉移歸因上完全無法作為審計憑證。
                </div>
              </div>
            </div>

            {/* 6. 閘門外連續追蹤 */}
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#F8FAFC' }}>
                  6. 站外商圈逛街與停留 (Out-of-Station Tracking)
                </span>
                <span style={{ fontSize: '11px', background: 'rgba(168, 85, 247, 0.2)', color: '#C084FC', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                  電信信令勝出
                </span>
              </div>
              <div style={{ fontSize: '12px', lineHeight: '1.6', color: '#cbd5e1' }}>
                <div style={{ padding: '8px 10px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', marginBottom: '8px', borderLeft: '3px solid #38BDF8' }}>
                  <strong style={{ color: '#38BDF8' }}>🚆 交通票證：出閘門後即進入「資料盲區」</strong><br />
                  旅客刷卡出西門站後，在徒步區停留多久、吃了什麼、逛哪條街，票證無法追蹤。
                </div>
                <div style={{ padding: '8px 10px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', borderLeft: '3px solid #C084FC' }}>
                  <strong style={{ color: '#C084FC' }}>📡 電信信令：全天候無死角停留追蹤</strong><br />
                  能持續記錄旅客在商圈逗留時間（如停留在西門徒步區 115 分鐘），並覆蓋自駕與機車族。
                </div>
              </div>
            </div>

          </div>

          {/* Deep Comparative Summary Table */}
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(30, 41, 59, 0.4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={18} color="#38BDF8" />
              <span style={{ fontSize: '14px', fontWeight: '800', color: '#F8FAFC' }}>
                票證大數據 vs. 電信信令大數據 全維度對照總表
              </span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(30, 41, 59, 0.7)', color: '#94a3b8', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <th style={{ padding: '12px 16px', width: '180px' }}>評估指標</th>
                    <th style={{ padding: '12px 16px', color: '#38BDF8' }}>🚆 交通部 TICP 票證大數據</th>
                    <th style={{ padding: '12px 16px', color: '#C084FC' }}>📡 電信公司信令大數據 (如 CHT/遠傳)</th>
                    <th style={{ padding: '12px 16px', width: '220px' }}>商業與研究實戰含金量</th>
                  </tr>
                </thead>
                <tbody style={{ color: '#cbd5e1' }}>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '700', color: '#F8FAFC' }}>數據源性質</td>
                    <td style={{ padding: '12px 16px' }}><strong>100% 物理普查 (Census)</strong>，閘門刷卡即入庫</td>
                    <td style={{ padding: '12px 16px' }}><strong>抽樣推估 (Sampling)</strong>，依市佔放大 2.5~2.8 倍</td>
                    <td style={{ padding: '12px 16px', color: '#38BDF8' }}>票證無抽樣誤差，審計稽核等級</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '700', color: '#F8FAFC' }}>政策與票種標籤</td>
                    <td style={{ padding: '12px 16px' }}>✅ <strong>具備 TPASS 月票、敬老、學生、單程票代碼</strong></td>
                    <td style={{ padding: '12px 16px' }}>❌ <strong>無任何票種或交通政策標籤</strong></td>
                    <td style={{ padding: '12px 16px', color: '#10B981' }}>票證可評估政策 ROI 與補貼效益</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '700', color: '#F8FAFC' }}>入境觀光旅客追蹤</td>
                    <td style={{ padding: '12px 16px' }}>✅ <strong>買 Token/紙票/悠遊卡即 100% 現形</strong></td>
                    <td style={{ padding: '12px 16px' }}>⚠️ 國外 SIM 漫遊卡與未開機存在盲區與延遲</td>
                    <td style={{ padding: '12px 16px', color: '#38BDF8' }}>票證是掌握真實外籍旅客的鐵證</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '700', color: '#F8FAFC' }}>空間垂直高度精度</td>
                    <td style={{ padding: '12px 16px' }}>✅ <strong>公分級閘門定位 (精確到地下三樓月台)</strong></td>
                    <td style={{ padding: '12px 16px' }}>❌ 基地台水平漂移 200~500m，分不清地面與地下</td>
                    <td style={{ padding: '12px 16px', color: '#38BDF8' }}>高架/地下樞紐站點僅票證精確</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '700', color: '#F8FAFC' }}>站外商圈活動覆蓋</td>
                    <td style={{ padding: '12px 16px' }}>❌ 出站後即為盲區 (無法知道在商圈逛哪家店)</td>
                    <td style={{ padding: '12px 16px' }}>✅ <strong>全域覆蓋，可追蹤商圈停留時長與街道逛街</strong></td>
                    <td style={{ padding: '12px 16px', color: '#C084FC' }}>電信擅長商圈與戶外節慶人流</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px 16px', fontWeight: '700', color: '#F8FAFC' }}>私家車與徒步人流</td>
                    <td style={{ padding: '12px 16px' }}>❌ 僅限大眾公共運輸 (高鐵/台鐵/捷運/公車/自行車)</td>
                    <td style={{ padding: '12px 16px' }}>✅ <strong>涵蓋自行開車、騎機車、搭計程車與徒步</strong></td>
                    <td style={{ padding: '12px 16px', color: '#C084FC' }}>電信掌握全社會宏觀移動總體</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: Data Fusion Blueprint */}
      {activeSubTab === 'fusion' && (
        <div>
          {/* Fusion Hero Statement */}
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <Sparkles size={22} color="#10B981" />
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#10B981', margin: 0 }}>
                雙方若深度合作：如何實現「1 + 1 &gt; 2 門到門全域閉環人流（Door-to-Door）」？
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
              如果將<strong>「票證的精準身分契約（起訖點、TPASS、Token）」</strong>與<strong>「電信的站外連續空間軌跡」</strong>透過隱私保護計算（聯邦學習 / 時空碰撞）進行融合，全台灣將誕生有史以來最完整的智慧移動與消費大數據！
            </p>
          </div>

          {/* Fusion Architecture Diagram */}
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', padding: '24px', marginBottom: '24px' }}>
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#F8FAFC', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass size={18} color="#38BDF8" /> 門到門（Door-to-Door）閉環人流軌跡融合範例
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', position: 'relative' }}>
              
              {/* Step 1 */}
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(168, 85, 247, 0.4)', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '10px', color: '#C084FC', fontWeight: '800', marginBottom: '4px' }}>STAGE 1：電信主導</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#F8FAFC' }}>家出發 ➔ 步行出門</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', lineHeight: '1.5' }}>
                  電信信令記錄晨間離開住宅大樓，步行 400 公尺前往頂溪捷運站。
                </div>
              </div>

              {/* Step 2 */}
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '10px', color: '#38BDF8', fontWeight: '800', marginBottom: '4px' }}>STAGE 2：票證主導 (硬錨點)</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#F8FAFC' }}>刷 TPASS 進站</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', lineHeight: '1.5' }}>
                  08:15 刷卡入閘，標定為<strong>「TPASS #NOR-1200 鋼鐵通勤族」</strong>，消除電信基地台漂移。
                </div>
              </div>

              {/* Step 3 */}
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '10px', color: '#38BDF8', fontWeight: '800', marginBottom: '4px' }}>STAGE 3：票證主導 (硬錨點)</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#F8FAFC' }}>捷運運行 ➔ 西湖出站</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', lineHeight: '1.5' }}>
                  08:42 抵達內科西湖站刷卡出站，精確確立此人次為<strong>內科科技園區就業者</strong>。
                </div>
              </div>

              {/* Step 4 */}
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(168, 85, 247, 0.4)', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '10px', color: '#C084FC', fontWeight: '800', marginBottom: '4px' }}>STAGE 4：電信主導</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#F8FAFC' }}>商圈街廓停留消費</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', lineHeight: '1.5' }}>
                  出站後在瑞光路特定咖啡廳停留 15 分鐘，隨後進入辦公大樓駐留 9 小時。
                </div>
              </div>

              {/* Step 5 */}
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '10px', color: '#10B981', fontWeight: '800', marginBottom: '4px' }}>STAGE 5：雙數據融合</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#F8FAFC' }}>租 YouBike 串接返家</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', lineHeight: '1.5' }}>
                  18:10 借騎 YouBike，信令連續記錄沿河濱車道騎乘 25 分鐘，完成全日綠運輸閉環。
                </div>
              </div>

            </div>
          </div>

          {/* 3 Core Collaboration Breakthroughs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
            
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '14px', padding: '18px' }}>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#38BDF8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Target size={16} /> 突破一：以票證作為「地面真值錨點 (Ground-Truth Anchor)」校準電信漂移
              </div>
              <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6' }}>
                電信信令最大的痛點是基地台覆蓋過大與地下室遮蔽，無法知道手機是在地下捷運、高架橋還是巷弄。<strong>以票證刷卡進出站的時間與站點作為「硬性錨點」</strong>，能反向校準電信信令的行進路徑，將電信數據的推估準確率從 70% 提升至 95% 以上！
              </p>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(168, 85, 247, 0.25)', borderRadius: '14px', padding: '18px' }}>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#C084FC', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Globe size={16} /> 突破二：時空碰撞破解外籍旅客「漫遊黑數」
              </div>
              <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6' }}>
                外國旅客入境時購買機場捷運單程票（Token/N-IC）的時間地點是 100% 確定的。利用票證購買事件與電信海外漫遊 IMSI 上線事件進行<strong>時空碰撞（Spatio-Temporal Collision）</strong>，即可精準將漫遊訊號貼上「特定國籍入境旅客」標籤，打通全台觀光旅遊流向！
              </p>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '14px', padding: '18px' }}>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#10B981', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={16} /> 突破三：量化交通政策對實體商圈的「經濟外溢效應 (ROI)」
              </div>
              <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6' }}>
                政府每年補助百億元推行 TPASS，到底為周邊商圈帶來了多少實質人潮？透過融合數據，能清楚看見：<strong>「持 TPASS 的乘客在下車後，平均在周邊商圈停留了 85 分鐘，帶動淡水老街週末人流成長 24%」</strong>，提供政策績效最強大的數據佐證。
              </p>
            </div>

          </div>
        </div>
      )}

      {/* SUBTAB 3: Use Case Selection Matrix */}
      {activeSubTab === 'use_cases' && (
        <div>
          <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '16px' }}>
            💡 企業與政府機關在不同業務場景下，該如何選擇數據來源？以下提供權威選型矩陣：
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            
            {/* Case A: Best for Ticketing */}
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '14px', padding: '20px' }}>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#38BDF8', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Ticket size={18} /> 優先選擇【票證大數據】的情境
              </div>
              <ul style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.8', paddingLeft: '18px', margin: 0 }}>
                <li><strong>捷運站內商場與地下街招商選址</strong>（需公分級精準進出閘動線）</li>
                <li><strong>日常早餐攤、便當店、閘口快銷店</strong>（極度依賴高頻剛需通勤族）</li>
                <li><strong>大眾運輸運量定價與 TPASS 政策補貼審計</strong>（需 100% 物理普查真實交易）</li>
                <li><strong>公車捷運轉乘最後一哩路 (YouBike) 接駁規劃</strong>（需真實轉乘交易鏈）</li>
                <li><strong>境內外單程票購買客群分析</strong>（伴手禮店、外幣機、行李寄放櫃）</li>
              </ul>
            </div>

            {/* Case B: Best for Telecom */}
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '14px', padding: '20px' }}>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#C084FC', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Radio size={18} /> 優先選擇【電信信令大數據】的情境
              </div>
              <ul style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.8', paddingLeft: '18px', margin: 0 }}>
                <li><strong>跨年晚會、大稻埕煙火等大型無閘門節慶疏散監控</strong></li>
                <li><strong>開放型國家風景區人流監測</strong>（如大溪老街、高美濕地、墾丁海灘）</li>
                <li><strong>高速公路國道塞車與全台私家車交通量推估</strong></li>
                <li><strong>全台跨縣市人口移居、日夜常住人口普查</strong></li>
                <li><strong>獨立路邊旗艦店（非車站周邊）開車族客源選址</strong></li>
              </ul>
            </div>

            {/* Case C: Must use Fusion */}
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '14px', padding: '20px' }}>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#10B981', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} /> 強烈建議【雙數據融合 (Fusion)】的情境
              </div>
              <ul style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.8', paddingLeft: '18px', margin: 0 }}>
                <li><strong>城市大眾運輸導向發展 (TOD) 全域規劃</strong>（從樞紐到周邊 1 公里生活圈）</li>
                <li><strong>商圈數位振興與精準行銷</strong>（出站持 TPASS 旅客直接推播商圈優惠券）</li>
                <li><strong>國際觀光客全台路網移動全景</strong>（入境機場買票 ➔ 抵達飯店 ➔ 夜市逛街）</li>
                <li><strong>淨零碳排與綠運輸移轉率研究</strong>（量化開車族因 TPASS 轉為搭捷運之真實行為變化）</li>
              </ul>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
