import React, { useState } from 'react';
import { 
  Radio, Ticket, ShieldCheck, Layers, 
  Sparkles, Target, Compass, 
  TrendingUp, Users, Database,
  Car, Truck, GitMerge, ShieldAlert, Cpu,
  MapPin, CheckCircle2, ArrowRight, Zap
} from 'lucide-react';

export default function TelecomComparisonView() {
  // 黃金三幕式子頁籤：'matrix' (三大本質對決), 'fusion' (全域閉環融合), 'use_cases' (實戰選型指南)
  const [activeSubTab, setActiveSubTab] = useState('matrix');

  return (
    <div style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto', color: '#f8fafc' }}>
      
      {/* 頂部戰略總覽 Banner */}
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
            國家級數據戰略專題
          </span>
          <span style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#C084FC', border: '1px solid rgba(168, 85, 247, 0.4)', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '800' }}>
            三源融合架構 (Triad Fusion)
          </span>
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 8px 0' }}>
          <Radio size={26} color="#38BDF8" /> eTag + 交通票證 vs. 電信信令：大數據戰略對決與全域閉環融合
        </h2>
        <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.6', maxWidth: '1150px', margin: 0 }}>
          深入解析「高速公路 eTag 車流」、「大眾運輸票證 (TICP)」與「手機電信信令」在空間精度、身分真理、運具互斥性與重複計算上的工程本質差異。確立<strong>「剛性物理骨架（eTag + 票證）」</strong>與<strong>「連續空間肌肉（電信信令）」</strong>之 1 + 1 + 1 &gt; 3 國家級全域閉環融合藍圖。
        </p>

        {/* 4 大核心定位 Quick Impact Badges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginTop: '20px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>🚆 票證獨家優勢</div>
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#38BDF8', marginTop: '2px' }}>
              🎯 100% 物理普查與政策身分
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
              公分級閘門無漂移，自帶 TPASS 月票、敬老愛心與外籍單程票之法律契約。
            </div>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>🛣️ eTag 獨家優勢</div>
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#F59E0B', marginTop: '2px' }}>
              ⚡ 0m 門架客貨分類與天然互斥
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
              監理車籍客貨分明，與大眾運輸物理上天然嚴格互斥，零重複計算。
            </div>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>📡 電信獨家優勢</div>
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#C084FC', marginTop: '2px' }}>
              🌐 全域連續移動與商圈滯留
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
              無收費設施景點覆蓋，持續掌握西門町或跨年現場停留時長與徒步軌跡。
            </div>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>🚀 跨源融合藍圖</div>
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#10B981', marginTop: '2px' }}>
              🧬 剛性骨架 ＋ 彈性肌肉閉環
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
              以票證/eTag 為硬錨點反向校正信令擴推倍率，還原門到門全日旅程。
            </div>
          </div>
        </div>
      </div>

      {/* 黃金三幕式導覽選單 (Consolidated Nav Sub-tabs) */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: 'rgba(30, 41, 59, 0.6)', padding: '5px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', width: 'fit-content' }}>
        {[
          { id: 'matrix', label: '🛡️ 第一幕：三大數據本質對決與戰略矩陣 (Master Matrix)', icon: Layers },
          { id: 'fusion', label: '🧬 第二幕：全域閉環融合架構 (Data Fusion Blueprint)', icon: Sparkles },
          { id: 'use_cases', label: '💼 第三幕：實戰落地與選型指南 (Use Cases & Decision Guide)', icon: Target }
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
                padding: '9px 18px',
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

      {/* ========================================================================= */}
      {/* 第一幕：三大數據本質對決與戰略矩陣 (Master Matrix)                         */}
      {/* ========================================================================= */}
      {activeSubTab === 'matrix' && (
        <div>
          {/* 戰略核心定調 Banner */}
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(56, 189, 248, 0.15))', 
            border: '1px solid rgba(16, 185, 129, 0.3)', 
            borderRadius: '14px', 
            padding: '20px 24px', 
            marginBottom: '20px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <ShieldCheck size={22} color="#10B981" />
              <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#F8FAFC', margin: 0 }}>
                戰略核心定調：「eTag + 票證」是不可撼動的地面物理剛性骨架，而「信令數據」是空間彈性肌肉
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.7', margin: 0 }}>
              在現代交通運輸與都市決策中，最稀缺的資產從來不是「粗放推估的龐大海量訊號」，而是<strong>「零空間漂移（Zero Spatial Drift）」</strong>、<strong>「無爭議的物理身分契約（Ground Truth Persona）」</strong>與<strong>「天然嚴格互斥性（Mutual Exclusivity）」</strong>。
              以下從資料工程、去識別化約束與重複計算三維度進行本質剖析：
            </p>
          </div>

          {/* 四大核心深度對決模組 (2x2 Grid) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            
            {/* 對決 1: 空間物理穩定性與前處理工程負擔 */}
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={17} color="#38BDF8" /> 1. 空間物理穩定性與前處理工程 (ETL)
                </span>
                <span style={{ fontSize: '11px', background: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                  eTag + 票證 徹底勝出
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '10px' }}>
                <strong style={{ color: '#38BDF8' }}>🚆 票證 & 🛣️ eTag：絕對零漂移 (0m Drift)</strong><br />
                門架架設於國道精確公里樁號、閘門固定於月台端點。感應即刻入庫，資料結構為標準純淨的交易日誌 (Transaction Log)。前處理僅需時間戳記對齊與格式檢核，<strong>ETL 成本極低、100% 可重複驗證，地下/高架分明</strong>。
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.6', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
                <strong style={{ color: '#C084FC' }}>📡 電信信令：基地台水平漂移 200~500m，高程混淆</strong><br />
                信令僅記錄基地台 Cell ID，人在靜止時因信號跳躍產生「乒乓交遞 (Ping-pong Handover)」，易被誤判為高速奔馳。經高架橋、平面與地下捷運時發生嚴重投影混淆，需消耗 80% 算力執行卡爾曼濾波與地圖匹配 (Map Matching)，<strong>極度依賴演算法假設，易產生路徑幻覺</strong>。
              </div>
            </div>

            {/* 對決 2: 身分真實契約 vs 角色推估與洗亂困境 */}
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={17} color="#10B981" /> 2. 身分真實契約 vs. 角色推估與洗亂困境
                </span>
                <span style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                  票證直接真理 / 信令黑箱
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '8px' }}>
                <strong style={{ color: '#10B981' }}>🎫 票證票種：100% 法律事實身分標籤</strong><br />
                每筆刷卡自帶法定票種代碼：<strong>TPASS 月票、學生票、65+ 敬老愛心卡、單程 Token/QR (觀光客)</strong>。無需推估，直接作為政策受惠族群與財務補貼審計憑證。
              </div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '10px' }}>
                <strong style={{ color: '#38BDF8' }}>🚛 eTag 車種：100% 監理認證客貨分類</strong><br />
                依車籍精確拆解小客車 (31)、小貨車 (32)、客運 (41)、大貨車 (42)、聯結車 (51/52)，<strong>產業物流 vs. 觀光自駕客貨分流明確</strong>。
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.6', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
                <strong style={{ color: '#C084FC' }}>📡 信令角色：去識別化 (UID 定期洗亂) 導致追蹤困難</strong><br />
                信令無票種，僅能以「夜間停留猜家、白天停留 &gt;4h 猜公司」。個資法要求電信 UID 定期 Hash 洗亂或加入差分隱私微擾，<strong>無法跨週跨月追蹤個人旅次鏈</strong>，更分不清學生、長者或外籍客。
              </div>
            </div>

            {/* 對決 3: 天然精準互斥性與運具分擔率 */}
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <GitMerge size={17} color="#F59E0B" /> 3. 天然精準互斥性與運具分擔率 (Modal Split)
                </span>
                <span style={{ fontSize: '11px', background: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                  零重複相加 (Q_Total = Q_1 + Q_2)
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '10px' }}>
                <strong style={{ color: '#F59E0B' }}>⚖️ eTag 與 票證是「天然嚴格互斥集合」</strong><br />
                一個人在同一個時間戳記下，<strong>絕不可能既在國道一號開車自駕，又在台北捷運車廂刷卡進站</strong>！兩者在物理空間與行為上 100% 互斥。
              </div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6' }}>
                <strong style={{ color: '#10B981' }}>📊 運具分擔率具備黃金可加性 (Additivity)</strong><br />
                總城際旅次 Q_Total = Q_eTag (公路汽客貨) + Q_Ticket (高鐵/台鐵/捷運/客運)。兩者直接相加零重複，能精準量化油價波動、連假高乘載管制或 TPASS 政策促成的<strong>「公路自駕轉軌道移轉率」</strong>！
              </div>
            </div>

            {/* 對決 4: 活動覆蓋與重複計算風險 */}
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldAlert size={17} color="#F43F5E" /> 4. 活動覆蓋優勢 vs. 重複計算 (Double-Counting)
                </span>
                <span style={{ fontSize: '11px', background: 'rgba(244, 63, 94, 0.2)', color: '#F43F5E', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                  信令商圈優勢 / 車廂雙重計數
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '10px' }}>
                <strong style={{ color: '#C084FC' }}>🛍️ 站外商圈活動覆蓋：電信信令獨家勝出</strong><br />
                旅客出站後在西門町徒步區停留多久、逛哪條街，票證出閘即進入盲區；電信信令具備全天候連續停留追蹤優勢，擅長大型戶外節慶與商圈滯留分析。
              </div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
                <strong style={{ color: '#F43F5E' }}>⚠️ 票證＋信令的車廂重複計數噩夢</strong><br />
                乘客拿手機搭捷運時：信令基地台偵測手機位移並擴推 2.6 倍，捷運閘門又記錄 1 人次。直接相加會造成<strong>大眾運輸人潮被嚴重虛胖計算</strong>！雙方因個資遮蔽無法明文 Join，需時空機率模型模糊去重，引入二次統計誤差。
              </div>
            </div>

          </div>

          {/* 三大數據源全戰略維度三向對照總表 (Master Table) */}
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', overflow: 'hidden', marginBottom: '24px' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(30, 41, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database size={18} color="#38BDF8" />
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#F8FAFC' }}>
                  三大數據源（eTag vs. 票證 vs. 信令）全戰略維度三向對照總表 (Master Matrix)
                </span>
              </div>
              <span style={{ fontSize: '11px', color: '#10B981', fontWeight: '700', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                決策者推薦對照框架
              </span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(30, 41, 59, 0.7)', color: '#94a3b8', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <th style={{ padding: '12px 16px', width: '150px' }}>評估維度</th>
                    <th style={{ padding: '12px 16px', color: '#F59E0B' }}>🛣️ eTag 高速公路車流</th>
                    <th style={{ padding: '12px 16px', color: '#38BDF8' }}>🚆 TICP 交通票證大數據</th>
                    <th style={{ padding: '12px 16px', color: '#C084FC' }}>📡 電信公司信令大數據</th>
                    <th style={{ padding: '12px 16px', width: '180px' }}>工程與戰略結論</th>
                  </tr>
                </thead>
                <tbody style={{ color: '#cbd5e1' }}>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '700', color: '#F8FAFC' }}>空間定位精度</td>
                    <td style={{ padding: '12px 16px' }}><strong>0m 門架樁號固定</strong></td>
                    <td style={{ padding: '12px 16px' }}><strong>公分級閘門/驗票機</strong></td>
                    <td style={{ padding: '12px 16px' }}>200~500m 基地台半徑</td>
                    <td style={{ padding: '12px 16px', color: '#38BDF8' }}>前兩者為絕對物理座標</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '700', color: '#F8FAFC' }}>空間漂移 (Drift)</td>
                    <td style={{ padding: '12px 16px' }}>✅ <strong>完全無漂移</strong></td>
                    <td style={{ padding: '12px 16px' }}>✅ <strong>完全無漂移</strong></td>
                    <td style={{ padding: '12px 16px' }}>❌ 頻繁乒乓跳躍與高程混淆</td>
                    <td style={{ padding: '12px 16px', color: '#10B981' }}>eTag+票證前處理極簡可靠</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '700', color: '#F8FAFC' }}>身分標籤來源</td>
                    <td style={{ padding: '12px 16px' }}>✅ <strong>監理車種 (31/32/41/42/51)</strong></td>
                    <td style={{ padding: '12px 16px' }}>✅ <strong>法定票種/TPASS/敬老/單程</strong></td>
                    <td style={{ padding: '12px 16px' }}>❌ 無票種，滯留時長黑箱推估</td>
                    <td style={{ padding: '12px 16px', color: '#38BDF8' }}>前兩者為 100% 契約真理</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '700', color: '#F8FAFC' }}>去識別化洗亂影響</td>
                    <td style={{ padding: '12px 16px' }}>低 (車流匯總量無個資)</td>
                    <td style={{ padding: '12px 16px' }}>低 (卡號 Hash 固定，可長週期追蹤)</td>
                    <td style={{ padding: '12px 16px' }}>❌ <strong>高 (UID 定期重洗，長週期失真)</strong></td>
                    <td style={{ padding: '12px 16px', color: '#F43F5E' }}>信令難以追蹤常客旅次鏈</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '700', color: '#F8FAFC' }}>運具集合互斥性</td>
                    <td style={{ padding: '12px 16px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', fontWeight: '700' }}>
                      ⚡ 兩者天然嚴格互斥
                    </td>
                    <td style={{ padding: '12px 16px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', fontWeight: '700' }}>
                      ⚡ 兩者天然嚴格互斥
                    </td>
                    <td style={{ padding: '12px 16px' }}>與公共運輸全域重疊</td>
                    <td style={{ padding: '12px 16px', color: '#10B981' }}>eTag+票證可直接無痛相加</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '700', color: '#F8FAFC' }}>重複計算風險</td>
                    <td style={{ padding: '12px 16px' }}><strong>0 重複計算</strong></td>
                    <td style={{ padding: '12px 16px' }}><strong>0 重複計算</strong></td>
                    <td style={{ padding: '12px 16px' }}>❌ <strong>嚴重 (搭捷運被雙重計數)</strong></td>
                    <td style={{ padding: '12px 16px', color: '#F43F5E' }}>信令+票證需複雜模糊去重</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px 16px', fontWeight: '700', color: '#F8FAFC' }}>戰略定位</td>
                    <td style={{ padding: '12px 16px' }}>城際幹線與產業物流脈搏</td>
                    <td style={{ padding: '12px 16px' }}>公共運輸與政策補貼基石</td>
                    <td style={{ padding: '12px 16px' }}>無收費設施之商圈與露天景點</td>
                    <td style={{ padding: '12px 16px', color: '#10B981' }}><strong>剛性骨架 ＋ 彈性肌肉</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 第二幕：全域閉環融合架構 (Data Fusion Blueprint)                           */}
      {/* ========================================================================= */}
      {activeSubTab === 'fusion' && (
        <div>
          {/* Fusion Hero Statement */}
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <Sparkles size={22} color="#10B981" />
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#10B981', margin: 0 }}>
                雙劍合璧：如何實現「1 + 1 + 1 &gt; 3 門到門全域閉環人流（Door-to-Door）」？
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
              如果將<strong>「票證的精準身分契約（TPASS、敬老、學生）」</strong>、<strong>「eTag 的客貨分流與交流道注入」</strong>與<strong>「電信的站外連續空間軌跡」</strong>透過隱私保護計算（聯邦學習 / 時空碰撞）進行融合，全台灣將誕生有史以來最完整的智慧移動與產業消費大數據！
            </p>
          </div>

          {/* 雙環架構 Blueprint */}
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '14px', padding: '22px', marginBottom: '24px' }}>
            <div style={{ fontSize: '15px', fontWeight: '800', color: '#10B981', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={19} /> 最優國家級大數據融合架構：「剛性骨架＋彈性外殼 (Rigid Backbone & Flexible Shell)」
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '10px', padding: '16px' }}>
                <div style={{ fontSize: '12px', color: '#38BDF8', fontWeight: '800', marginBottom: '6px' }}>第 1 層：底層剛性真理骨架</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#F8FAFC' }}>eTag 車流 ＋ TICP 票證大數據</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', lineHeight: '1.6' }}>
                  作為全台城際移動與公共走廊的「物理真理基準點（Census Baseline）」，鎖定 100% 精準運具分擔率、真實 TPASS 人數與客貨車種比例，徹底免除空間漂移與重複計算。
                </div>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '10px', padding: '16px' }}>
                <div style={{ fontSize: '12px', color: '#C084FC', fontWeight: '800', marginBottom: '6px' }}>第 2 層：外層連續空間肌肉</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#F8FAFC' }}>電信信令 (Cellular Signaling)</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', lineHeight: '1.6' }}>
                  專注描繪「出站後周邊商圈 1km 滯留時間」、「無收費閘門之自然風景區密度」與「最後一哩路步行」。
                </div>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '16px' }}>
                <div style={{ fontSize: '12px', color: '#10B981', fontWeight: '800', marginBottom: '6px' }}>第 3 層：錨點反向校準閉環</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#F8FAFC' }}>以 eTag/票證作為硬錨點 (Anchoring)</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', lineHeight: '1.6' }}>
                  用票證刷卡人數與國道門架量，反向校正電信信令的擴推係數（Expansion Factor），自動消除電信漫遊黑數與路網吸附偏誤，達成 1 + 1 &gt; 2。
                </div>
              </div>
            </div>
          </div>

          {/* 門到門（Door-to-Door）閉環旅程案例 */}
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', padding: '24px', marginBottom: '24px' }}>
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#F8FAFC', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass size={18} color="#38BDF8" /> 門到門（Door-to-Door）閉環人流軌跡融合示範（以永和 ➔ 內科西湖通勤為例）
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
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
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#F8FAFC' }}>夜間 YouBike 接駁 ➔ 返家</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', lineHeight: '1.5' }}>
                  18:10 借騎 YouBike，信令連續記錄沿河濱車道騎乘 25 分鐘，完成全日綠運輸閉環。
                </div>
              </div>
            </div>
          </div>

          {/* 3 大核心技術突破 Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '14px', padding: '18px' }}>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#38BDF8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={16} /> 突破一：以票證/eTag 作為「硬錨點」反向校準電信信令
              </div>
              <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
                電信信令最大痛點是基地台覆蓋過大與地下室遮蔽，無法知道手機是在地下捷運、高架橋還是巷弄。<strong>以票證刷卡進出站的時間與站點作為「硬性錨點」</strong>，能反向校準電信信令的路徑，將推估準確率提升至 95% 以上！
              </p>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(168, 85, 247, 0.25)', borderRadius: '14px', padding: '18px' }}>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#C084FC', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={16} /> 突破二：時空碰撞與隱私保護計算 (Privacy-Preserving Fusion)
              </div>
              <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
                不需要交換姓名、身分證字號等機敏個資。利用<strong>「時空微碰撞技術 (Spatio-Temporal Co-occurrence)」</strong>與聯邦學習架構，在特徵層進行匿蹤聚合，在完全符合個資法規範下合成全台灣最具價值的門到門行為大數據。
              </p>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '14px', padding: '18px' }}>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#10B981', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={16} /> 突破三：量化交通政策對實體商圈的「經濟外溢效應 (ROI)」
              </div>
              <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
                政府每年補助百億元推行 TPASS，到底為周邊商圈帶來了多少實質人潮？透過融合數據，能清楚看見：<strong>「持 TPASS 的乘客在下車後，平均在周邊商圈停留了 85 分鐘，帶動老街週末人流成長 24%」</strong>，提供政策績效最強大的數據佐證。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 第三幕：實戰落地與選型指南 (Use Cases & Decision Guide)                   */}
      {/* ========================================================================= */}
      {activeSubTab === 'use_cases' && (
        <div>
          <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '16px' }}>
            💡 企業與政府機關在不同業務場景下，該如何選擇三大數據來源？以下提供權威選型矩陣：
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '16px' }}>
            
            {/* Case 1: Best for Ticketing */}
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '14px', padding: '20px' }}>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#38BDF8', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Ticket size={18} /> 優先選擇【交通票證大數據】的情境
              </div>
              <ul style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.8', paddingLeft: '18px', margin: 0 }}>
                <li><strong>捷運站內商場與地下街招商選址</strong>（需公分級精準進出閘動線）</li>
                <li><strong>大眾運輸運量定價與 TPASS 政策補貼審計</strong>（需 100% 物理普查真實交易）</li>
                <li><strong>跨運具轉乘優惠與法定核銷代碼 (TransferCode)</strong>（轉乘補貼審計憑證）</li>
                <li><strong>公車捷運轉乘最後一哩路 (YouBike) 接駁規劃</strong>（需真實轉乘交易鏈）</li>
                <li><strong>境內外單程票購買客群分析</strong>（伴手禮店、外幣機、行李寄放櫃）</li>
              </ul>
            </div>

            {/* Case 2: Best for eTag */}
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '14px', padding: '20px' }}>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#F59E0B', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Car size={18} /> 優先選擇【eTag 高速公路車流】的情境
              </div>
              <ul style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.8', paddingLeft: '18px', margin: 0 }}>
                <li><strong>連假國道高乘載與替代道路疏運調度</strong>（精準路段分時通行量）</li>
                <li><strong>跨縣市城際幹線產業物流動線分析</strong>（32/42/51 重型貨車走廊）</li>
                <li><strong>交流道下匝道「車流注入輻射光暈」與平面路網承載力</strong></li>
                <li><strong>國際商港（基隆/台中/高雄）貨櫃聯外運輸追蹤</strong></li>
                <li><strong>觀光自駕（車種 31）假日跨區遷徙熱點分析</strong></li>
              </ul>
            </div>

            {/* Case 3: Best for Telecom */}
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '14px', padding: '20px' }}>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#C084FC', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Radio size={18} /> 優先選擇【電信信令大數據】的情境
              </div>
              <ul style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.8', paddingLeft: '18px', margin: 0 }}>
                <li><strong>跨年晚會、大稻埕煙火等大型無閘門節慶即時疏散監控</strong></li>
                <li><strong>開放型國家風景區人流監測</strong>（如大溪老街、高美濕地、墾丁海灘）</li>
                <li><strong>全台跨縣市人口移居、日夜常住人口普查</strong></li>
                <li><strong>獨立路邊旗艦店（非車站周邊）開車族與過路客選址</strong></li>
                <li><strong>夜市街廓徒步逛街停留時間分析</strong></li>
              </ul>
            </div>

            {/* Case 4: Must use Fusion */}
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '14px', padding: '20px' }}>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#10B981', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} /> 強烈建議【三源數據融合 (Fusion)】的情境
              </div>
              <ul style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.8', paddingLeft: '18px', margin: 0 }}>
                <li><strong>城市大眾運輸導向發展 (TOD) 全域規劃</strong>（從高鐵/捷運樞紐到周邊 1 公里生活圈）</li>
                <li><strong>商圈數位振興與精準行銷</strong>（出站持 TPASS 旅客直接推播商圈數位引流券）</li>
                <li><strong>國際觀光客全台路網移動全景</strong>（入境機場買票 ➔ 抵達飯店 ➔ 夜市逛街停留）</li>
                <li><strong>淨零碳排與綠運輸移轉率研究</strong>（量化自駕車流因政策補貼轉為搭捷運之真實行為變化）</li>
              </ul>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
