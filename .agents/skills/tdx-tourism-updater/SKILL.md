---
name: tdx-tourism-updater
description: Instructions and operational workflow for querying, updating, and fusing TDX tourism APIs, scenic CCTV live feeds, CODiS climate data, and eTag holiday mobility patterns in Taiwan Mobility Pulse.
---

# TDX 觀光大數據與景點即時影像 (CCTV) 更新手冊

本 Skill 提供在 **臺灣多模態公共運輸票證大數據分析與模擬平台 (Taiwan Mobility Pulse)** 中，針對交通部 **TDX (運輸資料流通服務平臺)** 之觀光資料庫、景點即時影像串流 (CCTV)、中央氣象署 CODiS 歷史氣候與高公局 eTag 假期交通流向進行更新、融合與維運的操作指南。

---

## 1. 資料源架構與 API 規範

TDX 平臺之觀光資料服務（Tourism Services）主要包含以下模組：

| 服務項目 | API 規格與端點 | 資料特性與說明 |
| :--- | :--- | :--- |
| **觀光署景點即時影像 (CCTV)** | `GET https://tdx.transportdata.tw/api/tourism/V1/Tourism/CCTV` | 全台 74 處國家級風景區的高畫質即時影像。提供 YouTube 直播網址 (`LiveURL`)、iframe 嵌入連結 (`IFrameURL`)、經緯度座標、鏡頭視角類型 (`ViewType`：360°全景、可動型、固定視角)。 |
| **觀光資訊開放資料 (Attraction)** | `GET https://tdx.transportdata.tw/api/tourism/service/odata/V2/Tourism/Attraction` | 全國風景名勝景點屬性、開放時間 (`ServiceTime`)、門票費用 (`AttractionFee`)。 |
| **台灣好行觀光公車 (TaiwanTrip)** | `GET https://tdx.transportdata.tw/api/basic/v2/Tourism/Bus/Route/TaiwanTrip` | 全台 90+ 條台灣好行景點接駁路線、起訖站與行駛路網。 |
| **遊憩運具 (Ship / Ropeway)** | `GET https://tdx.transportdata.tw/api/tourism/V1/Ship/...` | 日月潭遊艇碼頭船班、票價與日月潭纜車即時營運資料。 |

---

## 2. 認證機制與金鑰維護

TDX 採用 OAuth 2.0 Client Credentials 認證模式：
- **認證端點**：`https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token`
- **環境設定**：存放在專案根目錄 `.env`（已被 `.gitignore` 排除，絕不進版本控制）：
  ```ini
  TDX_CLIENT_ID=your_tdx_client_id_here
  TDX_CLIENT_SECRET=your_tdx_client_secret_here
  ```
- **Token 有效期**：24 小時（86,400 秒），發出請求時於 HTTP Header 加入 `Authorization: Bearer {token}`。

---

## 3. 一鍵自動化更新流程

由於觀光署景點 CCTV 頻道與串流網址偶會因 YouTube 直播流重啟或機關攝影機例行保養而更換，平臺提供自動化更新腳本：

### 執行命令
```bash
# 於專案根目錄執行
python3 scripts/fetch_tdx_tourism_data.py
```

### 腳本執行內部流程：
1. **讀取金鑰**：自動解析 `.env` 取得 `TDX_CLIENT_ID` 與 `TDX_CLIENT_SECRET`。
2. **換取 Bearer Token**：向 Keycloak 認證伺服器完成簽章取得授權。
3. **抓取最新 CCTV 與路線**：呼叫 `/V1/Tourism/CCTV` 與 `/v2/Tourism/Bus/Route/TaiwanTrip`。
4. **解析 YouTube Video ID**：提取純淨的 11 碼影片識別碼，支援 `youtube-nocookie.com` 高速內嵌與免追蹤防呆。
5. **關聯 CODiS 與交通特徵**：
   - 鄰近氣象測站、歷史四季均溫、降雨日數、最佳旅遊季節、防汛/土石敏感警示。
   - 關聯交通走廊（國5、國3、台18、台2、台11等）、假日車潮暴增倍率 (+310% ~ +380%)、大眾運輸/台灣好行接駁。
6. **寫出目標檔案**：
   - `src/data/tdxTourismMobilityData.js`（供前端 React 元件直接匯入）
   - `public/data/tdx_tourism_cctv.json`（供靜態外鏈或 API 調用）

---

## 4. 前端資料融合與呈現指引

在平臺介面中，觀光資料需與交通脈動進行深度協同：

1. **GIS 時空地圖 (`FlowMap.jsx`)**：
   - 提供「🏞️ 觀光景點與即時 CCTV」點位圖層切換開關。
   - 地圖點擊彈出視窗提供：即時 CCTV 預覽畫面、所屬國家風景區、對應國道與客運走廊。
2. **觀光與交通全域看板 (`TourismMobilityLab.jsx`)**：
   - **區域與型態篩選**：支援全台分區（北、中、南、東、離島）與鏡頭型態（可動型 PTZ、360°全景、固定視角）。
   - **三柱融合卡片**：
     - **觀光面向**：景點名稱、簡介、主管處所、即時運作狀態。
     - **氣候面向**：CODiS 氣象數據、四季溫差、最佳造訪時節、暴雨災害風險。
     - **交通面向**：eTag 假日暴增比率、尖峰壅塞時段、台灣好行接駁線路、TPASS 適用推薦。
   - **沉浸式即時影像**：點擊「觀看現場 CCTV」彈出模態視窗，即時播放無廣告乾淨串流。

---

## 5. 常見問題與注意事項 (Troubleshooting)

- **401 Unauthorized 錯誤**：檢查 `.env` 中的 `TDX_CLIENT_ID` 或 `TDX_CLIENT_SECRET` 是否過期或輸入錯誤。
- **CCTV 播放出現「影片無法播放」**：部分觀光署 YouTube 直播為 24 小時不斷流，若遇颱風中斷或定期維護，前端已設定 fallback 連結按鈕，可直接引導使用者點擊前往 YouTube 原生觀看網址。
- **OData 參數逸出**：在 shell 執行 curl 或 python request 時，URL 中的 `$top`、`$filter` 務必使用 URL 編碼 `%24top` 或反斜線逸出 `\$top`，避免被 bash 當成環境變數清除。
