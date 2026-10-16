<div align="center">

# 🚆 Taiwan Mobility Pulse (臺灣多模態交通脈動)

### 台灣全域多模態公共運輸大數據動態人流與決策平台
**448M+ Records · 843M+ Passenger Trips · 10 Transit Modes · 114 Dynamic Flow Corridors · 3 Core Personas · 77 Transfer Hubs · TPASS Real Impact**

[![GitHub Pages Deployment](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-10B981?style=for-the-badge&logo=github)](https://tobytoy.github.io/taiwan-mobility-pulse/)
[![React](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite%206-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![Polars](https://img.shields.io/badge/Polars%201.4-CD792C?style=for-the-badge&logo=polars&logoColor=white)](https://pola.rs/)
[![PyArrow](https://img.shields.io/badge/PyArrow%20ZSTD-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://arrow.apache.org/)
[![Leaflet](https://img.shields.io/badge/Leaflet%20GIS-19.4-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com/)

[**🌐 線上即時體驗 (Live Interactive Demo) ➔**](https://tobytoy.github.io/taiwan-mobility-pulse/) &nbsp;|&nbsp; [**📚 互動專著全書導讀 (Interactive Book) ➔**](docs/README.md) &nbsp;|&nbsp; [**📥 查閱全書完整專著 (v1.3.1 觀光即時影像融合典藏版) ➔**](docs/README.md)

</div>

---

## 📖 專案簡介 (Overview)

**Taiwan Mobility Pulse (臺灣多模態交通脈動)** 是一個國家級的大眾運輸大數據分析、動態流向視覺化與政策決策平台。

本專案深入挖掘交通部 **TICP (交通數據匯流平臺)** 涵蓋全台灣共 **4.48 億筆真實票證紀錄（8.43 億跨月旅次）**，橫跨 **10 大多模態運具**（高鐵、臺鐵、北捷、新北捷、高捷、雙北市區公車、公路客運、雙北與桃園 YouBike），構建出全台 **114 條雙向動態人流走廊**、**三大身分客群深度解構（通勤 / 敬老愛心 / 學生）**、**全台 77 大跨運具轉乘樞紐**、**全國 TPASS 月票效益全域監測** 與 **AI 非監督學習客群畫像**。

```
                                    ┌───────────────────────┐
                                    │  交通部 TICP 原始數據庫 │
                                    │ (4.48 億筆 / 30GB ZIP)│
                                    └───────────┬───────────┘
                                                │ (PyArrow 16MB 零磁碟串流)
                                                ▼
                                    ┌───────────────────────┐
                                    │  ZSTD Columnar Parquet│
                                    │ (16.5GB / 88% 壓縮率)  │
                                    └───────────┬───────────┘
                                                │ (Polars Lazy Streaming Engine)
                                                ▼
                                    ┌───────────────────────┐
                                    │ 10 大運具多模態分析庫  │
                                    │ (mobility_study.json) │
                                    └───────────┬───────────┘
                                                │ (React 19 + Leaflet Canvas)
                        ┌───────────────────────┴───────────────────────┐
                        ▼                                               ▼
            ┌───────────────────────┐                       ┌───────────────────────┐
            │   全台 24H 動態流向地圖  │                       │ 全台 77 樞紐與 TPASS 監測 │
            │ (114 條多模態雙向光廊) │                       │  (真實票證折抵與轉乘分析)  │
            └───────────────────────┘                       └───────────────────────┘
```

---

## 🌟 核心功能與展示模組 (Key Features)

### 1. 🗺️ 全台流向動態地圖與時空熱點 (Interactive Flow Map & Heatmap)
- **24 小時連續時間軸演繹**：支援播放/暫停與 1x/2x/5x 倍速，重現早尖峰（07-09時）、晚尖峰（17-19時）通勤狂潮與深夜離峰脈動。
- **10 大多模態運具分流切換**：高鐵（橘）、臺鐵（藍）、北捷（綠）、新北捷（青）、高捷（粉）、雙北公車（靛/紫）、YouBike（黃）。
- **四大身分客群標籤**：一鍵過濾「全體人流」、「💼 通勤族走廊（晴空藍）」、「🧳 觀光旅客走廊（暖陽橘）」、「👵 銀髮長者走廊（薔薇紅）」與「🎓 學生通學走廊（翡翠綠）」。
- **四大區域聚焦**：全台全域、北部都會、中部台中、南部高南、東部宜花。

### 2. 📊 10 大運具綜合對比看板 (Comparison Dashboard)
- **橫向比較矩陣**：即時對比 10 大運具之總旅運量、平日日均、週末日均、尖峰集中度與通勤偏向指數。
- **24 小時分時客流折線圖**：重疊呈現平日 (Weekday) vs 週末 (Weekend) vs 連假 (Holiday) 三條曲線。
- **通勤偏向指數 (Commuter Index, 平日/假日)** 排行榜。
- **商業選址身分模擬**：提供早餐便當店、文創咖啡館、共享辦公、伴手禮自販機 4 大情境商業選址決策範例。

### 3. 💳 行政院 TPASS 通勤月票政策效益全域大數據儀表板 (TPASS & ESG Executive Intelligence)
- **融合高公局 TDCS eTag 國道車流基線**：對比雪山隧道 (05F0055S)、國1林口泰山 (01F0320S/01F0413S)、八堵大業隧道 (01F0061S)、新竹竹科 (01F0945S) 與台南永康 (01F3185S) 等各大門架，揭示自駕小客車基線排碳 (0.173 kg CO₂/km) 與尖峰 V/C 飽和度 (LOS F)。
- **全台各生活圈真實月票數據與補貼清分**：從 TICP 原始票證庫精確查核 10 款定期票方案（基北北桃 1200、中彰投苗 999、宜蘭 1800、屏東 299、竹竹 288、嘉義 399、桃竹竹苗 799、彰化 699、台東 299、南高屏 999 等），累計量化 **8,226 萬筆 TPASS 旅次** 與 **NT$ 18.54 億元** 實質補貼。
- **🚚 國道 eTag 產業貨運物流與國家經濟動脈大數據 (Freight Logistics Pulse)**：
  - **跨出客運盲區，納入物流商貿**：解構 ETC 31 (小客車 84.2%)、32 (輕型貨車 6.8%)、41 (客運大客車 2.2%)、42 (重型大貨車 4.2%) 與 51/52 (聯結/貨櫃車 2.6%) 五大車種結構。雖然貨車僅佔車流 13.8%，卻貢獻道路總碳排 38.5%！
  - **四大國家級產業動脈監測**：深入分析「臺灣半導體 S 廊帶（竹科-中科-南科，年產值 12.5 兆）」、「北部國際海運雙港雙動脈（基隆-台北港 480 萬 TEU）」、「南台灣重工業與石化原料動脈（高雄港-林園-仁武）」與「全台民生果菜冷鏈大遷徙（西螺-雙北，供應 650 萬人）」。
  - **24H 分時人流與物流逆向波形演繹**：量化「人行於晝、貨通於宵」空間互補規律，揭示深夜 01:00~04:00 貨運車隊佔比飆升至 34.8%~36.2%，避開市區交管。
  - **TPASS 路權釋放外溢價值**：自駕小客車改搭大眾運輸後，有效緩解國道瓶頸，為高價值產業物流與冷鏈提昇 28.5% 準點率，年釋放高達 **NT$ 126 億元** 貨運經濟產值。
- **🏢 全台 50+ 生活圈與商圈 eTag 減碳盤查速查表**：全面盤點各夜市、老街與科技園區假日自駕碳足跡，評定 ESG 綠色接駁優先度 (A+ 迫切優先 / B 穩健推動 / C 示範商圈) 與 20% 移轉減碳潛力。
- **🌿 ISO 14064 碳盤查規範與企業 Scope 3 員工通勤認購指南**：提供 74.0% 淨減碳強度 (0.128 kg CO₂/km) 方法論，指導企業將 TPASS 作為永續報告書範疇三通勤減量之實質佐證。
- **🧮 個人通勤回本與減負試算器**：依據每月通勤天數與原價車資，即時試算個人月票損益平衡點、投資報酬率 (+ROI%) 與個人年省碳排量。

### 4. 🏬 商圈脈動、跨縣市引力水系與 EV 高速超充選址實驗室 (Commercial Pulse & Highway EV Siting Lab)
- **🏢 方案 A：全台 12 大旗艦零售／Outlet／好市多跨縣市自駕引力水系 (Retail Catchment Gravity)**：
  - **跨縣市車流 OD 飛線光束 (Flow Rays)**：解構三井 Outlet (林口/台中港/台南)、華泰名品城、Costco (中和/北台中/南崁)、新竹巨城 Big City、高雄 SKM Park 等全台 12 大消費地標。
  - **高資產自駕客源腹地與客單價**：量化雙北、桃園、竹科與中南部自駕客吸附半徑 (30~68km)、引力評分與車均客單價 (NT$ 4,200 ~ 8,150 元)，提供 B2B 零售商場與數位廣告投放之精準依據。
- **⚡ 方案 B：全台 10 大國道高速 EV 超充站黃金選址與 CPO 投資 ROI 互動模擬器 (EV Supercharger Siting & ROI Lab)**：
  - **長途補電剛需指數 (EV Fast-Charging Urgency)**：針對國1林口、國1竹科、國1朝馬、國1西螺服務區、國3清水服務區、國5蘇澳等 10 大一級節點，演算下匝道時長 (0~2.8 分鐘)、小客車門架流量與長途佔比 (>50km)。
  - **即時財務試算引擎 (Live ROI Simulator)**：支援自由切換樁數配置（2樁4槍 ~ 8樁16槍 360kW 液冷快充）與零售度電價（NT$ 9.8 ~ 11.8/度），動態產出預估日充電車次、設備稼動率、年化營業淨利與投資回收年限（最快僅需 **1.4 ~ 1.8 年**！）。

### 5. 👥 大眾運輸三大客群畫像深度分析 (Persona Mobility Analytics)
- 💼 **上班通勤族 (Commuters)**：解構 121 萬筆一般成人平日刷卡旅次，揭示典型雙峰駝規律（08:00 與 17:00）、早尖峰 TPASS 定期票滲透率高達 54%~80%、內科專案快線運量霸榜，平均乘車耗時 21.6 分鐘。
- 👵 **銀髮樂齡族 (Seniors)**：解構 61.4 萬筆長者敬老愛心卡，發現其完美避開上下班狂潮，在上午 09:30~11:30 形成全天最高峰（近 10%），下午 16:00 搶退潮；三大移動動脈為大型醫學中心就醫、傳統市集民生採買與信仰休閒綠地，提供直達低地板公車配置依據。
- 🎓 **學生通學族 (Students)**：解構 59.1 萬筆學生票證，揭示晨間 07:00 壓線到校潮（比上班族提早 30~60 分鐘）、下午 16:00~17:00 放學湧浪（全天最高峰，佔 23.1%）、晚間 20:30~22:00 補習街返家潮，以及例假日運量驟減 64%~73% 的行事曆高依賴性。

### 6. 🔀 全台 77 大跨運具轉乘樞紐大數據 (Transfer Hub Analytics)
- 解構通學週 769 萬筆旅次中 676.7 萬筆真實轉乘紀錄，繪製全台四大生活圈 77 大轉乘樞紐星狀人流圖 (Spider Diagram)。
- 揭示跨生活圈「軌道骨幹 ➔ 幹線公車 ➔ 微循環接駁」之每週 5,503 萬元轉乘補貼流向。

### 7. 🤖 AI 非監督學習 6 大客群畫像與軌道廊帶 (Unsupervised Rail Lab)
- 基於 250 萬筆交易與 3.27 萬張活躍卡片，透過 8 維行為特徵進行 K-Means (K=6) 與 PCA 降維聚類。
- 結合全台鐵路、捷運、客運走廊實證數據，產出內科環狀線東環段、台鐵中彰區間捷運化、高鐵北竹直達增班等關鍵軌道走廊評估報告。

### 8. ⚡ 零磁碟暫存串流管線與效能監控 (Pipeline Monitor)
- 展示從 30GB ZIP 直接串流至 16.5GB ZSTD Parquet 的零磁碟佔用機制。
- 即時監控轉換耗時、查詢耗時與進程記憶體安全指標（RAM < 850 MB）。

---

## 📊 10 大運具資料集規模與分析摘要 (Dataset Scale)

| 運具名稱 | 運具代碼 | 資料類型 | 總列數 (Rows) | 總旅次 (Trips) | 通勤偏向指數 | 尖峰集中度 |
|---|---|---|---|---|---|---|
| **台灣高鐵 (THSR)** | `thsr` | `rail_od` | 293,896 | 1,158,103 | `0.62x` (假日觀光) | 37.1% |
| **臺灣鐵路 (TRA)** | `tra` | `rail_od` | 24,446,078 | 118,283,915 | `0.94x` (跨城返鄉) | 38.5% |
| **臺北捷運 (TRTC)** | `trtc` | `rail_od` | 81,873,999 | 380,960,398 | `1.50x` (都會通勤) | 40.9% |
| **高雄捷運 (KRTC)** | `krtc` | `rail_od` | 11,941,640 | 36,343,428 | `0.92x` (商圈觀光) | 37.4% |
| **新北捷運 (NTMC)** | `ntmc` | `rail_od` | 4,814,433 | 16,413,171 | `1.35x` (日常通勤) | 44.4% |
| **臺北市公車 (TPE Bus)** | `tpe_bus` | `bus_to3a` | 158,289,493 | 158,289,493 | `1.48x` (市區通勤) | 36.3% |
| **新北市公車 (NWT Bus)** | `nwt_bus` | `bus_to3a` | 91,993,562 | 91,993,562 | `1.48x` (市區通勤) | 36.8% |
| **公路客運 (THB Bus)** | `thb_bus` | `bus_to3a` | 26,618,799 | 26,618,799 | `1.34x` (城際通勤) | 35.6% |
| **臺北市 YouBike** | `taipei_bike` | `bike_to2a` | 40,470,797 | 40,470,797 | `1.15x` (轉乘接駁) | 33.7% |
| **桃園市 YouBike** | `taoyuan_bike` | `bike_to2a` | 7,946,008 | 7,946,008 | `1.00x` (平假日均衡) | 36.2% |
| **全台總計 (Total)** | **10 Modes** | - | **448,688,705** | **843,269,760** | - | - |

---

## 🛠️ 技術架構 (Technology Stack)

- **前端視覺化 (Frontend UI)**：React 19, Vite 6, Leaflet 1.9, Lucide React, HTML5 Canvas 粒子流動引擎
- **資料處理與串流 ETL (Data Pipeline)**：Python 3, Polars (Lazy Streaming Engine), PyArrow, Zstandard (ZSTD)
- **記憶體與資源防護 (Safety Governor)**：`safety_guard.py`（執行緒限制 `POLARS_MAX_THREADS<=4`、進程記憶體熔斷監控 < 1.5GB）
- **自動部署 (CI/CD)**：GitHub Actions ➔ GitHub Pages 自動編譯發布

---

## 🚀 快速開始 (Quickstart)

### 1. 複製專案庫
```bash
git clone https://github.com/tobytoy/taiwan-mobility-pulse.git
cd taiwan-mobility-pulse
```

### 2. 啟動 Web 視覺化 Demo (Node.js 18+)
```bash
# 安裝相依套件
npm install

# 啟動本機開發伺服器
npm run dev
```
打開瀏覽器訪問 `http://localhost:5173/` 即可體驗完整互動介面！

### 3. 執行後端大數據串流分析 (Python 3.10+)
```bash
# 執行全自動串流分析與 JSON 產製管線 (具備 tqdm 進度條與快取保護)
python pipeline/process_and_analyze.py

# 若需強制重算全部 4.5 億筆資料：
python pipeline/process_and_analyze.py --force
```

---

## 📂 目錄結構 (Project Structure)

```
taiwan-mobility-pulse/
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Actions 自動部署至 GitHub Pages
├── public/
│   ├── mobility_full_study.json  # 全台 114 走廊與 5 大實驗室結構化數據庫 (316 KB)
│   └── mobility_data.json
├── src/
│   ├── components/
│   │   ├── FlowMap.jsx           # 全台 24H 粒子流向與時空地圖
│   │   ├── HeatmapView.jsx       # 多模態時空人流熱點圖
│   │   ├── ComparisonDashboard.jsx # 10 大運具綜合對比與商業選址模擬
│   │   ├── PersonaAnalyticsView.jsx # 通勤/銀髮/學生客群畫像深度分析
│   │   ├── TransferMapView.jsx   # 全台 77 大跨運具轉乘樞紐地圖
│   │   ├── TPASSDashboard.jsx    # 全國 TPASS 效益監測與回本試算
│   │   ├── UnsupervisedRailLab.jsx # AI 6 大非監督客群與軌道走廊推薦
│   │   ├── TelecomComparisonView.jsx # 票證大數據 vs 電信信令對比
│   │   └── ErrorBoundary.jsx
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── pipeline/                     # Python 高效能大數據串流分析模組
│   ├── safety_guard.py           # 記憶體安全熔斷與執行緒控制模組
│   ├── process_and_analyze.py    # 10 大運具全自動分析 Master Pipeline
│   ├── export_web_data.py        # Web 走廊與模擬資料集生成器
│   ├── compute_taiwan_mobility.py # 跨運具分時流向計算腳本
│   └── PROGRESS.md               # 運具數據指標看板
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 📜 資料來源與授權 (Data License & Attribution)

- **資料來源**：中華民國交通部 [交通數據匯流平臺 (TICP)](https://ticp.motc.gov.tw/) 與 [政府資料開放平臺 (data.gov.tw)](https://data.gov.tw/)。
- **資料授權**：依據政府資料開放授權條款 (Open Government Data License, OGDL Taiwan)。
- **程式碼授權**：本專案程式碼採用 [MIT License](LICENSE) 授權釋出。

---

<div align="center">
Made with ❤️ in Taiwan for Next-Generation Multimodal Smart Mobility.
</div>
