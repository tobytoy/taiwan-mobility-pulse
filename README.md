<div align="center">

# 🚆 Taiwan Mobility Pulse (臺灣多模態交通脈動)

### 台灣全域多模態公共運輸大數據動態人流與 AI 決策平台
**448M+ Records · 843M+ Passenger Trips · 10 Transit Modes · 111 Dynamic Flow Corridors · 5 AI Decision Labs**

[![GitHub Pages Deployment](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-10B981?style=for-the-badge&logo=github)](https://tobytoy.github.io/taiwan-mobility-pulse/)
[![React](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite%206-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![Polars](https://img.shields.io/badge/Polars%201.4-CD792C?style=for-the-badge&logo=polars&logoColor=white)](https://pola.rs/)
[![PyArrow](https://img.shields.io/badge/PyArrow%20ZSTD-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://arrow.apache.org/)
[![Leaflet](https://img.shields.io/badge/Leaflet%20GIS-19.4-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com/)

[**🌐 線上即時體驗 (Live Interactive Demo) ➔**](https://tobytoy.github.io/taiwan-mobility-pulse/)

</div>

---

## 📖 專案簡介 (Overview)

**Taiwan Mobility Pulse (臺灣多模態交通脈動)** 是一個國家級的大眾運輸大數據分析、動態流向視覺化與 AI 政策模擬平台。

本專案深入挖掘交通部 **TICP (交通數據匯流平臺)** 涵蓋全台灣共 **4.48 億筆真實票證紀錄（8.43 億跨月旅次）**，橫跨 **10 大多模態運具**（高鐵、臺鐵、北捷、新北捷、高捷、雙北市區公車、公路客運、雙北與桃園 YouBike），構建出全台 **111 條雙向動態人流走廊** 與 **五大 AI 政策決策實驗室**。

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
            │   全台 24H 動態流向地圖  │                       │   五大 AI 政策模擬實驗室  │
            │ (111 條多模態雙向光廊) │                       │  (GIS 即時空間決策地圖)  │
            └───────────────────────┘                       └───────────────────────┘
```

---

## 🌟 核心功能與展示模組 (Key Features)

### 1. 🗺️ 全台流向動態地圖 (Interactive Flow Map)
- **24 小時連續時間軸演繹**：支援播放/暫停與 1x/2x/5x 倍速，重現早尖峰（07-09時）、晚尖峰（17-19時）通勤狂潮與深夜離峰脈動。
- **10 大多模態運具分流切換**：高鐵（橘）、臺鐵（藍）、北捷（綠）、新北捷（青）、高捷（粉）、雙北公車（靛/紫）、YouBike（黃）。
- **客群屬性標籤**：一鍵過濾「全體人流」、「💼 通勤族走廊（平日高/假日低）」與「🧳 觀光旅客走廊（假日湧浪）」。
- **四大區域聚焦**：全台全域、北部都會、中部台中、南部高南、東部宜花。

### 2. 📊 10 大運具綜合對比看板 (Comparison Dashboard)
- **橫向比較矩陣**：即時對比 10 大運具之總旅運量、平日日均、週末日均、尖峰集中度與通勤偏向指數。
- **24 小時分時客流折線圖**：重疊呈現平日 (Weekday) vs 週末 (Weekend) vs 連假 (Holiday) 三條曲線。
- **通勤偏向指數 (Commuter Index, 平日/假日)** 排行榜。

### 3. 🧭 OD 走廊與站點診斷 (OD & Station View)
- 查詢各運具於平日/週末/連假最繁忙之 **Top 8 起訖站點對 (OD Pairs)**。
- 站點屬性自動分群：**通勤主力站點**（早晚尖峰湧量）vs **休閒觀光站點**（週末人潮）。

### 4. 🔬 五大 AI 研發政策模擬實驗室 (R&D Simulation Labs - 全地圖化)
每個實驗室均配備**專屬 GIS 互動式地圖**與**即時參數求解滑桿**：
- 🚲 **Lab 1: YouBike 潮汐再平衡與智慧調度最佳化 (ST-GNN Rebalancing)**：地圖顯示物流倉點、預警缺車站點（🔴）、溢車站點（🟡）與調度卡車即時移動路徑（🚛）。
- 📍 **Lab 2: 第一哩/最後一哩路網斷點與冷區缺口檢測 (Transit Gap AI)**：以 400m~1500m 空間緩衝區檢測淡海、內科、青埔、新莊、楠梓之接駁盲區，地圖即時繪製推薦接駁公車動線與增設站點。
- 🌿 **Lab 3: TPASS 政策成效模擬與 ESG 減碳量化歸因 (Carbon Engine)**：調整月票定價與汽機車轉移率，地圖即時渲染三大生活圈綠色減碳光廊與等效種樹量。
- 🚨 **Lab 4: 軌道突發中斷事件之動態應變與替代接駁最佳化 (Resilient Evacuation AI)**：模擬北車-西門等中斷事故，地圖呈現滯留人潮擴散半徑與緊急接駁專車（🚌）繞行動線。
- 🎟️ **Lab 5: 觀光廊帶人流挖掘與跨運具動態套票推薦 (Tourism Mobility AI)**：挖掘市府-宜蘭羅東、左營-駁二等純休閒 OD，地圖展示多模態觀光綠動脈與景點優惠圈。

### 5. ⚡ 零磁碟暫存串流管線與效能監控 (Pipeline Monitor)
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
│   ├── mobility_full_study.json  # 全台 111 走廊與 5 大實驗室結構化數據庫 (316 KB)
│   └── mobility_data.json
├── src/
│   ├── components/
│   │   ├── FlowMap.jsx           # 全台 24H 粒子流向地圖
│   │   ├── ComparisonDashboard.jsx # 10 大運具綜合對比
│   │   ├── ODStationView.jsx     # OD 起訖走廊與站點診斷
│   │   ├── RDSimulationLab.jsx   # 五大 AI 政策模擬實驗室
│   │   ├── RebalancingMap.jsx    # Lab 1: YouBike 調度車隊 GIS 地圖
│   │   ├── TransitGapMap.jsx     # Lab 2: 路網冷區斷點檢測 GIS 地圖
│   │   ├── CarbonShiftMap.jsx    # Lab 3: TPASS 綠色減碳光廊 GIS 地圖
│   │   ├── EvacuationMap.jsx     # Lab 4: 軌道事故疏運專車 GIS 地圖
│   │   ├── TourismPassMap.jsx    # Lab 5: 多模態觀光綠動脈 GIS 地圖
│   │   ├── PipelineMonitor.jsx   # 串流管線與記憶體監控
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
