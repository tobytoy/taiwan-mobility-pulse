# 📚 第二章：國家級數據底座與欄位實體解剖——TICP 票證、eTag 門架與 TDX 之時間跨度、欄位字典與真實樣本
### Taiwan Mobility Pulse: Data Infrastructure, Field Dictionaries, and Microscopic Schema Samples

> 「如果不知道每一筆數據在真實世界中代表哪一張實體卡片、哪一座門架的微波反射、哪一格停車場的感應線圈，那麼再炫麗的動態視覺化，都不過是隨機漂浮的數字幻象。」

---

## 2.1 🌐 數據母體宏觀輪廓與時間跨度 (Macro Scope & Temporal Dimensions)

本專案所建構的「台灣動態移動脈搏」，並非建基於局部問卷抽樣或單一電信業者的推估模型，而是直接對碰與融合了國家級交通大數據之三大剛性底座：

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           全台交通動態人流數據底座概覽                             │
├───────────────────┬───────────────────────────────┬─────────────────────────────┤
│   數據庫來源類別   │        量級規模 (Scale)        │      時間維度與採樣顆粒度     │
├───────────────────┼───────────────────────────────┼─────────────────────────────┤
│ 🚆 交通部 TICP     │ 4.48 億筆真實電子票證刷卡紀錄 │ 覆蓋 181~255 天全日連續觀測 │
│    公共運輸票證庫 │ (8.43 億跨月搭乘旅次人次)      │ 交易/折讓秒級判定，離散小時聚合│
├───────────────────┼───────────────────────────────┼─────────────────────────────┤
│ 🛣️ 高公局 eTag     │ 全國國道 325 座門架與交流道   │ 5 分鐘微觀通行記錄          │
│    高速公路電子收費│ 覆蓋全台 5 大公路監理法定車種 │ 24 小時連續無休車流監測     │
├───────────────────┼───────────────────────────────┼─────────────────────────────┤
│ 🅿️ 交通部 TDX     │ 76 大樞紐與 16 大交流道周邊   │ 1~5 分鐘即時動態刷新        │
│    路外/路邊停車API│ 3,000+ 處公民營停車場車位數據 │ 滿位率、週轉率與階梯式費率  │
├───────────────────┼───────────────────────────────┼─────────────────────────────┤
│ 🌧️ CWA 中央氣象署 │ 全台各生活圈代表性氣象自動測站│ 逐時（Hourly）連續觀測      │
│    歷史觀測資料庫 │ 累積降雨量 (mm)、陣風、溫度    │ 晴天、微雨、豪大雨極端天候  │
└───────────────────┴───────────────────────────────┴─────────────────────────────┘
```

### ⏰ 時間範圍與觀測週期設計 (Observation Temporal Baseline)
1. **宏觀歷史時間跨度**：
   * 本研究完整收錄並解析 **2024 年上半年 / 2026 年上半年 (H1)** 跨度，累計達 **181 天至 255 天** 之連續時間序列。
   * 包含春季開學常規通學週（如 3 月初常態學期）、連續工作天、春節疏運大遷徙、清明連假、端午與中秋等代表性時段。
2. **平假日雙重週期劃分**：
   * **平日（Workdays）**：週一至週五（嚴格扣除國定假日與天災停班停課），捕捉「朝九晚五通勤尖峰」與「產業物流尖峰」。
   * **週末（Weekends）**：週六與週日，捕捉「商圈休閒娛樂」、「大都會外流」與「景區短程一日遊」。
   * **連續假期（Long Holidays）**：連續 3 天以上假期，捕捉跨生活圈、跨城際之「國道返鄉長廊」與「觀光爆發潮」。
3. **時間顆粒度（Time Granularity）**：
   * **小時級（Hourly，`00:00:00` ~ `23:00:00`）**：TICP 公共運輸資料依個資去識別化規範，以小時為標準時間戳記聚合單位。
   * **秒級/毫秒級（Transaction Timestamp）**：票卡實體讀寫之進出站驗票、跨運具 60 分鐘轉乘優惠判斷，由車載晶片驗票機以秒級真實時間戳記結算。

---

## 2.2 🚆 TICP 交通票證資料集架構與欄位字典 (TICP Data Dictionary)

交通部 TICP 匯聚全台灣 10 大多模態運具，資料依營運型態分為三大核心 schema：

### 1. 市區公車與公路客運交易資料集 (`bus_to3a`)
這是全台數量最龐大、覆蓋市區街道毛細孔的核心票證來源（涵蓋雙北市區公車 2.5 億筆、公路客運 2,660 萬筆）：

| 欄位名稱 (Field Name) | 資料型態 (Type) | 實體物理意義與業務邏輯 (Definition & Business Logic) |
|:---|:---:|:---|
| `LineID` | `VARCHAR(16)` | **路線唯一代碼**：交通主管機關核定之路線識別碼（如 `0100030700` 代表 307 路公車）。 |
| `SubLineID` | `VARCHAR(8)` | **附屬路線代碼**：識別正線、區間車、直達專車、跳蛙公車（如 `01` 代表正線，`02` 代表區間車）。 |
| `Direction` | `TINYINT` | **行車方向**：`0` 代表去程 (Outbound)，`1` 代表返程 (Inbound)。 |
| `HolderType` | `CHAR(1)` | **乘客身分真理標籤**：`A` 一般成人全票, `S` 學生優待票, `E` 敬老愛心優待票, `K` 兒童票。 |
| `CardType` | `TINYINT` | **電子票證發卡機構**：`1` 悠遊卡 (EasyCard), `2` 一卡通 (iPASS), `3` 愛金卡 (icash 2.0)。 |
| `TicketType` | `VARCHAR(16)` | **票價專案代碼**：`#NOR-1200` 代表 TPASS 基北北桃 1200 定期票；`NORMAL` 為一般自費電子錢包。 |
| `BoardingStopID` | `VARCHAR(16)` | **上車站點編號**：主管機關核定之站牌唯一代碼（具備精確經緯度座標）。 |
| `BoardingStopSequence` | `SMALLINT` | **上車站牌順序號**：該班次行駛路徑之第 N 站（1, 2, 3... N）。 |
| `BoardingTime` | `DATETIME` | **上車刷卡時間**：去識別化後記錄為該交易小時戳記（例如 `2026-03-11 08:00:00`）。 |
| `DeboardingStopID` | `VARCHAR(16)` | **下車站點編號**：旅客下車刷卡之站牌代碼。 |
| `DeboardingStopSequence` | `SMALLINT` | **下車站牌順序號**：旅客下車時之站牌順序號，兩者差值即為**搭乘站數規模**。 |
| `DeboardingTime` | `DATETIME` | **下車刷卡時間**：旅客下車刷卡交易小時戳記（例如 `2026-03-11 08:00:00`）。 |
| `Fare` | `SMALLINT` | **表定應收車資 (NT$)**：未經補貼與優惠前之全額法定車資（如段次票 15/30 元，里程計費原價）。 |
| `Discount` | `SMALLINT` | **實質補貼折讓金額 (NT$)**：政府補貼或轉乘優惠免收金額（如轉乘減免 8 元、TPASS 全額折讓 15 元）。 |
| `Amount` | `SMALLINT` | **乘客實付金額 (NT$)**：從旅客卡片實質扣款金額，滿足數學關係：`Amount = Fare - Discount`。 |
| `TransferCode` | `VARCHAR(8)` | **法定轉乘優惠代碼**：`0` 無轉乘, `102` 捷運轉公車, `9902` 公車轉公車, `202` 臺鐵轉公車。 |

#### 🔬 真實票證樣本紀錄剖析 (Real World Data Sample)
```json
[
  {
    "LineID": "0100030700",
    "SubLineID": "01",
    "Direction": 0,
    "HolderType": "A",
    "CardType": 1,
    "TicketType": "#NOR-1200",
    "BoardingStopID": "TPE100341",
    "BoardingStopSequence": 14,
    "BoardingTime": "2026-03-11 08:00:00",
    "DeboardingStopID": "TPE100362",
    "DeboardingStopSequence": 23,
    "DeboardingTime": "2026-03-11 08:00:00",
    "Fare": 15,
    "Discount": 15,
    "Amount": 0,
    "TransferCode": "102"
  },
  {
    "LineID": "0100026500",
    "SubLineID": "01",
    "Direction": 1,
    "HolderType": "E",
    "CardType": 1,
    "TicketType": "NORMAL",
    "BoardingStopID": "NWT204112",
    "BoardingStopSequence": 6,
    "BoardingTime": "2026-03-11 09:00:00",
    "DeboardingStopID": "TPE101050",
    "DeboardingStopSequence": 18,
    "DeboardingTime": "2026-03-11 09:00:00",
    "Fare": 15,
    "Discount": 7,
    "Amount": 8,
    "TransferCode": "0"
  }
]
```
> **樣本解讀**：
> * **第 1 筆樣本**：一位 **TPASS 1200 通勤族（HolderType='A', TicketType='#NOR-1200'）**，在早尖峰 08 時搭乘 307 公車搭乘 9 站。因上一程為台北捷運出站（`TransferCode='102'`），原表定票價 15 元被 TPASS 基金與轉乘機制全額折抵（`Discount=15`），實質扣款 `Amount=0` 元。
> * **第 2 筆樣本**：一位 **銀髮長者（HolderType='E'）**，於 09 時自新北板橋搭乘 265 公車前往台北萬華，法定優待半價折抵 7 元，實付扣款 8 元（或由長者每月愛心點數扣點）。

---

### 2. 軌道運輸分時 OD 資料集 (`rail_od`)
涵蓋高鐵 (THSR)、臺鐵 (TRA)、臺北捷運 (TRTC)、新北捷運 (NTMC)、高雄捷運 (KRTC) 之車站閘門對碰進出紀錄（總量逾 5.0 億旅次）：

| 欄位名稱 (Field Name) | 資料型態 (Type) | 實體物理意義與業務邏輯 (Definition & Business Logic) |
|:---|:---:|:---|
| `OriginStationID` | `VARCHAR(8)` | **起程車站代碼**：閘門刷卡入站之車站代碼（如北捷 `BL12`、台鐵 `1000` 台北站、高鐵 `02` 台北）。 |
| `OriginStationName` | `VARCHAR(24)` | **起程車站中文名稱**：起點車站全稱。 |
| `DestinationStationID` | `VARCHAR(8)` | **到達車站代碼**：閘門刷卡出站之車站代碼（如北捷 `BR15` 西湖站、高鐵 `04` 新竹站）。 |
| `DestinationStationName` | `VARCHAR(24)` | **到達車站中文名稱**：訖點車站全稱。 |
| `TransactionDate` | `DATE` | **搭乘日期**：格式 `YYYY-MM-DD`。 |
| `TransactionHour` | `TINYINT` | **進出站小時區間**：`0` ~ `23`（如 `8` 代表 08:00 ~ 08:59:59 之間出站人流）。 |
| `PassengerCount` | `INTEGER` | **該起訖對刷卡旅客人數**：該小時內在該 OD 區間完成行程之法定刷卡總人數。 |
| `DayType` | `VARCHAR(12)` | **日期類型標籤**：`Weekday` 平日通勤日, `Weekend` 週末, `Holiday` 國定連假。 |

#### 🔬 真實軌道 OD 樣本紀錄 (Real World Rail OD Sample)
```json
[
  {
    "OriginStationID": "BL12",
    "OriginStationName": "台北車站",
    "DestinationStationID": "BR15",
    "DestinationStationName": "西湖",
    "TransactionDate": "2026-03-12",
    "TransactionHour": 8,
    "PassengerCount": 3842,
    "DayType": "Weekday"
  },
  {
    "OriginStationID": "02",
    "OriginStationName": "高鐵台北站",
    "DestinationStationID": "04",
    "DestinationStationName": "高鐵新竹站",
    "TransactionDate": "2026-03-12",
    "TransactionHour": 7,
    "PassengerCount": 1420,
    "DayType": "Weekday"
  }
]
```

---

### 3. 公共自行車租借資料集 (`bike_to2a`)
記錄第一哩與最後一哩綠運輸微循環（雙北 YouBike 4,047 萬筆、桃園 YouBike 795 萬筆）：

| 欄位名稱 (Field Name) | 資料型態 (Type) | 實體物理意義與業務邏輯 (Definition & Business Logic) |
|:---|:---:|:---|
| `RentStationID` | `VARCHAR(16)` | **借車站點編號**：YouBike 柱位場站唯一編碼。 |
| `RentStationName` | `VARCHAR(48)` | **借車站點中文名稱**：包含所屬場站名稱與出口資訊（如 `YouBike2.0_捷運公館站(2號出口)`）。 |
| `RentTime` | `DATETIME` | **借車牽車時間**：去識別化後記錄為該借車小時（`YYYY-MM-DD HH:00:00`）。 |
| `ReturnStationID` | `VARCHAR(16)` | **還車站點編號**：還車入柱場站唯一編碼。 |
| `ReturnStationName` | `VARCHAR(48)` | **還車站點中文名稱**：還車站牌全稱。 |
| `ReturnTime` | `DATETIME` | **還車刷卡時間**：還車小時戳記。 |
| `DurationSeconds` | `INTEGER` | **實際騎乘租借時長 (秒)**：從取車開鎖至入柱還車之完整秒數。 |

---

## 2.3 🛣️ 高公局 eTag 電子收費資料集架構 (eTag Data Dictionary)

高速公路局 eTag 系統為全台灣唯一具備**法定全量車種識別**與**門架物理樁號**之高速公路巨量資料集：

### 1. 門架通行與下匝道車流資料表 (`etag_gantry_discharge`)

| 欄位名稱 (Field Name) | 資料型態 (Type) | 實體物理意義與業務邏輯 (Definition & Business Logic) |
|:---|:---:|:---|
| `GantryID` | `VARCHAR(16)` | **門架代碼**：高公局官方編號（如 `01F-0232S` 代表國1南向 23.2K 圓山門架）。 |
| `HighwayName` | `VARCHAR(16)` | **國道名稱**：國道 1 號、國道 3 號、國道 5 號。 |
| `MilestoneKM` | `DECIMAL(5,1)` | **國道里程樁號**：公尺級精確物理里程（如 `23.2`）。 |
| `InterchangeName` | `VARCHAR(24)` | **所屬交流道**：下匝道出口交流道名稱（如 `圓山交流道`、`竹科交流道`、`愛蘭交流道`）。 |
| `DischargeTarget` | `VARCHAR(64)` | **下匝道注入腹地**：車流下高速公路後直接注入的都市商圈、科技園區或名勝風景區。 |
| `VehicleType` | `SMALLINT` | **監理法定車種編號**：<br>• `31`: 小客車 (Sedan/SUV)<br>• `32`: 小貨車 (Small Truck / 3.5T)<br>• `41`: 大客車 (Coach / 觀光遊覽車)<br>• `42`: 大貨車 (Heavy Freight Truck)<br>• `51/52`: 聯結車 / 貨櫃拖車 (Semi-trailer) |
| `WorkdayDischargeVol` | `INTEGER` | **平日日均下匝道總車流 (輛)**：正常工作天 24 小時累積車輛數。 |
| `HolidayDischargeVol` | `INTEGER` | **假日日均下匝道總車流 (輛)**：週休與假期 24 小時累積車輛數。 |
| `FreightRatio` | `DECIMAL(4,1)` | **重型產業物流占比 (%)**：車種 32+42+51/52 佔整體車流之比率（產業動脈判斷依據）。 |

#### 🔬 真實 eTag 交流道車流樣本紀錄 (Real World eTag Interchange Sample)
```json
[
  {
    "GantryID": "01F-0955S",
    "HighwayName": "國道 1 號",
    "InterchangeName": "竹科交流道 (95K)",
    "DischargeTarget": "新竹科學園區 (園區二路 / 介壽路)",
    "WorkdayDischargeVol": 78200,
    "HolidayDischargeVol": 22100,
    "VehicleMix": {
      "type31_car": 62,
      "type32_small_truck": 16,
      "type41_tour_bus": 4,
      "type42_big_truck": 12,
      "type51_52_trailer": 6
    },
    "PeakHour": "08:00 - 09:00",
    "PeakHourlyDischarge": 9840
  },
  {
    "GantryID": "06F-0290E",
    "HighwayName": "國道 6 號",
    "InterchangeName": "愛蘭交流道 (29K)",
    "DischargeTarget": "日月潭國家風景區 / 埔里市區 (台14/台21線)",
    "WorkdayDischargeVol": 11200,
    "HolidayDischargeVol": 41800,
    "VehicleMix": {
      "type31_car": 82,
      "type32_small_truck": 6,
      "type41_tour_bus": 10,
      "type42_big_truck": 2,
      "type51_52_trailer": 0
    },
    "PeakHour": "10:00 - 12:00",
    "PeakHourlyDischarge": 5420
  }
]
```

---

## 2.4 🅿️ 空間機能與 TDX 即時停車位 API 字典 (TDX Parking & Amenities)

| 欄位名稱 (Field Name) | 資料型態 (Type) | 實體物理意義與業務邏輯 (Definition & Business Logic) |
|:---|:---:|:---|
| `ParkingLotID` | `VARCHAR(32)` | **停車場唯一代碼**：交通部 TDX 登錄之停車場代碼。 |
| `ParkingLotName` | `VARCHAR(64)` | **停車場名稱**：停車場法定登記名稱。 |
| `TotalSpaces` | `INTEGER` | **總汽車格位數**：該場站具備之合法小型車停車格總數。 |
| `AvailableSpaces` | `INTEGER` | **即時剩餘空車位**：透過感應線圈、車牌辨識系統即時回傳之可用車位。 |
| `OccupancyRate` | `DECIMAL(4,2)` | **即時停車壓力率 (0.00 ~ 1.00)**：`1 - (AvailableSpaces / TotalSpaces)`，大於 0.85 即為高度壅塞。 |
| `HourlyRate` | `SMALLINT` | **常規計時費率 (NT$/hr)**：平日/假日每小時停車收費基準。 |
| `DistanceToDischargeKM` | `DECIMAL(4,2)` | **距交流道下匝道距離 (km)**：測量下匝道車流第一時間受容之緩衝半徑。 |

---

## 2.5 🌦️ 中央氣象署 CODiS 歷史氣候觀測大數據規格 (CWA CODiS Climate Big Data)

除了交通刷卡與國道收費外，氣候是改寫地表人流與車流阻抗的第一外生變數。本專案透過中央氣象署「氣候觀測資料查詢服務（CODiS, Climate Observation Data Inquire Service）」官方 OpenAPI，直連全台灣近 30 年（1998–2024 年）逐時、逐日與逐月微氣候連續歷史實測大數據庫。

### 1. 氣象署站網分級架構 (Station Hierarchy)
氣象署觀測網由三大階層構成，本專案聚焦於指標一級站與高代表性自動測站：
* **有人氣象站（一級指標站，29 站）**：具備百年以上歷史或連續 30 年以上無中斷之嚴格人工校驗測站（如臺北 466920、基隆 466940、鞍部 466910、臺中 467490、臺南 467410、恆春 467590、阿里山 467530、玉山 467550、澎湖 467350 等），具備全維度觀測能力與極高公信力。
* **自動氣象站（C0 系列，全台 1,236 站）**：分布於各鄉鎮市區與高山林道，提供高空間解析度之即時溫濕雨監控。

### 2. CODiS 核心觀測維度字典 (CODiS Field Dictionary)

| 欄位名稱 (Field Name) | 資料型態 (Type) | 實體物理意義與工程計算邏輯 (Definition & Calculation Logic) |
|:---|:---:|:---|
| `StationID` | `VARCHAR(10)` | **測站國際代碼**：如 `466920` 代表臺北站，`467490` 代表臺中站。 |
| `StationName` | `VARCHAR(32)` | **測站法定名稱**：中央氣象署登記之測站中文名稱。 |
| `County` | `VARCHAR(16)` | **所屬行政區**：測站所在直轄市/縣市。 |
| `AltitudeM` | `DECIMAL(6,1)` | **測站海拔高度 (m)**：從平原 6.3m (臺北) 至高山 3,844.8m (玉山)，決定氣溫垂直減率。 |
| `Archetype` | `VARCHAR(32)` | **微氣候人格分類**：如「熱島盆地」、「沉鬱雨港」、「抗颱晴都」、「世界風極」等 22 種微氣候特徵。 |
| `TempDelta30Y` | `DECIMAL(4,2)` | **30 年均溫淨變異 (°C)**：近十年均溫 (2015–2024) 減去基期均溫 (1998–2007)，全台平均升溫 +0.72°C。 |
| `Hot35DaysDelta` | `DECIMAL(5,1)` | **高溫日數淨增量 (天/年)**：日最高溫 $\ge 35^\circ\text{C}$ 之年均天數 30 年增幅（雙北與縱谷暴增逾 18 天）。 |
| `RainDaysDelta` | `DECIMAL(5,1)` | **年降雨日數增減 (天/年)**：年降雨日數之 30 年趨勢，呈現「總雨量不減但日數減縮」之暴雨極端化特徵。 |
| `MoldIndex` | `TINYINT` | **空間發霉指數 (0–100)**：年累積「相對濕度 $> 80\%$ 且氣溫介於 $20\sim 30^\circ\text{C}$」之天數綜合標準化評分。 |
| `TyphoonDefense` | `TINYINT` | **天選抗颱防護評分 (0–100)**：基於中央山脈地形背風遮蔽、歷史平均陣風與氣壓驟降之綜合抗風災評分。 |
| `UmbrellaProbPct` | `DECIMAL(4,1)` | **通勤開傘機率 (%)**：通勤時段（07:00–09:00, 17:00–19:00）遇雨機率，測量民眾日常生活防雨阻抗。 |
| `AnnualSunshineH` | `DECIMAL(6,1)` | **年均日照時數 (hours/year)**：全年中太陽直接輻射照度達標之累計時數，評估太陽能與抗鬱陽光資本。 |
| `AnnualRainMM` | `DECIMAL(6,1)` | **年均降雨量 (mm/year)**：歷史常態年累積降雨量（基隆達 3,828mm，澎湖僅約 980mm）。 |
| `MonthlyClimatology` | `JSON` | **1–12 月常態氣候律動陣列**：包含各月均溫、月雨量、降雨日數、日照、濕度與天氣型態符號代碼。 |

### 3. 品質檢核標籤與缺失值補正 (Data Quality Flags)
CODiS API 針對所有觀測值賦予標準品質碼（Quality Control Flag）：
* `0`：正常觀測值（Valid Record）。
* `1`：儀器故障或校驗期間（Instrument Calibration / Error）。
* `2`：空間插值推定值（Kriging / IDW Interpolated Estimate）。
* `-99.9 / -999`：觀測缺失值，管線內自動透過鄰近測站之海拔減率與反距離權重法（IDW）進行標準化填補。

### 4. CODiS 測站微氣候 JSON 實體資料樣本 (Station Payload Sample)

```json
{
  "id": "466920",
  "name": "臺北",
  "county": "臺北市",
  "lat": 25.0377,
  "lng": 121.5149,
  "alt_m": 6.3,
  "archetype": "熱島盆地",
  "badge": "雙北熱島·夜間升溫之冠",
  "metrics_30y": {
    "baseline_temp": 23.40,
    "recent_temp": 23.94,
    "temp_delta": 0.54,
    "hot35_days_delta": 21.9,
    "rain_days_delta": -10.4
  },
  "livability": {
    "avg_temp": 23.6,
    "annual_rain_mm": 2405.0,
    "annual_rain_days": 158.5,
    "annual_sunshine_h": 1305.2,
    "avg_humidity_pct": 75.8,
    "umbrella_prob_pct": 43.4,
    "mold_index": 58,
    "radar": {
      "rain_defense": 45,
      "thermal_comfort": 62,
      "typhoon_defense": 65,
      "sunshine": 48,
      "anti_mold": 42,
      "night_cool": 38
    }
  },
  "monthly_climatology": [
    { "month": 1, "temp": 16.7, "rain_mm": 88.0, "icon": "☁️", "label": "陰霾天" },
    { "month": 7, "temp": 30.1, "rain_mm": 245.2, "icon": "☀️", "label": "晴朗天" }
  ]
}
```

### 5. 晴雨商圈對流、光電 EV ROI、抗颱回測與水庫旱澇資料模型 (V1.2 Extended Models)

為了支撐第六章深度的商業經濟與極端防災決策，CODiS 管線進一步擴展了四大衍生資料模型：

| 模型分類 | 核心分析實體 (Entity) | 關鍵指標欄位 (Key Fields) | 商業與防災決策應用 |
|:---|:---|:---|:---|
| **晴雨商圈對流** | 7 大指標露天與室內商圈 | `PaxIndex`, `DwellMins`, `RevenueElasticity`, `ConvectionDestination` | 量化晴朗、陰雨 (1-10mm) 與豪大雨 (>50mm) 下，戶外街區人流向地下街/空橋百貨之乾濕對流係數。 |
| **光電與 EV 快充** | 29 指標測站 30 年日射 | `AnnualSunshineHours`, `DailySolarRadiation`, `Rooftop50kWAnnualKWh`, `EVChargingROIYears` | 評估 50kW 商用屋頂發電度數與儲充一體化 EV 快充站之資本回收年限（澎湖/台南 4.5 年 vs 基隆 9.2 年）。 |
| **抗颱屏障大回測** | 6 大歷史強颱 × 29 測站 | `ShieldingRatePct`, `MaxHistoricalWindGust`, `Max24HRainfallMM`, `ResilienceScore` | 回測賀伯、莫拉克、蘇迪勒等致災強颱，計算中央山脈地形衰減率（台中 68% 屏障率榮登 96 分抗颱之冠）。 |
| **水庫旱澇急轉** | 全台 4 大核心水庫集水區 | `MaxCDDDays`, `CDD30YGrowthPct`, `DelugeRapidRefillCount`, `InversionIndex` | 追蹤最長連續無雨日數 (CDD) 與「48 小時內蓄水率跳漲 >40% 洩洪」之極端旱澇急轉脆弱度（曾文水庫 98 分高居全台第一）。 |

### 6. 政府開放資料 (OpenData) 淹水災情與物聯網感測資料模型 (Inundation & IoT Resilience Models)

為了實現氣象、水文災情與地表交通的三向閉環印證，本專案進一步鏈結了政府資料開放平台（data.gov.tw）與民生公共物聯網（IoW）之核心防汛數據集：

| 開放資料代碼 / 名稱 | 提供機關 | 格式與座標系 | 核心實體欄位 | 專案交通印證鏈結 |
|:---|:---|:---|:---|:---|
| **Dataset 25770**<br>歷年颱風淹水範圍 | 經濟部水利署 | `KML` / `GeoJSON`<br>(WGS84 多邊形) | `typhoon_name`, `year`, `total_inundated_km2`, `max_depth_cm`, `polygons` (經緯度點集) | 載入真實淹水面圖資，比對 CODiS 測站極端雨量（如阿里山 1,623mm、高雄 985mm）與國道 eTag 車速急跌率 (-75% ~ -92%)。 |
| **Dataset 130016**<br>近5年淹水災點資料 | 國科會 / NCDR 國家災害防救科技中心 | `CSV` / `JSON API`<br>(TWD97 轉 WGS84) | `FID`, `year`, `lat`, `lng`, `source`, `flood_count_5y`, `threshold_rain_mm_hr` | 整合水利署、消防署 EMIC 與公路局路面災點，量化短延時強降雨門檻（如 45mm/h）與周邊交流道/大眾運輸回堵延誤。 |
| **Dataset 142980 & 142979**<br>IoW 路面淹水深度感測 | 經濟部水利署 / 民生公共物聯網 | `JSON API`<br>(每小時動態更新) | `sensor_id`, `latest_depth_cm`, `warning_threshold_cm`, `closure_threshold_cm`, `speed_drop_pct` | 全台幹道路面超音波/微波感測計，即時連動水深（0~60cm）與道路管制等級（安全通行 / 水漂警戒慢行 / 封閉管制）。 |
| **Dataset 25766 & 5982**<br>淹水潛勢圖與防災警戒 | 經濟部水利署 | `SHP` / `WMS` / `API` | `return_period` (10/50/100年), `rainfall_intensity`, `at_risk_interchanges`, `warning_tier` | 提供暴雨重現期水理數值模擬基準，作為全台 22 處國道易淹交流道與省道抗災韌性壓力測試標準線。 |

```json
{
  "opendata_source": {
    "platform": "政府資料開放平台 (data.gov.tw) & 經濟部水利署",
    "datasets_integrated": ["25770", "130016", "142980", "142979", "25766", "5982"]
  },
  "historical_typhoon_sample": {
    "id": "gaemi_2024",
    "name": "凱米颱風 (2024)",
    "total_inundated_km2": 218.4,
    "max_depth_cm": 140,
    "codis_peak_station": {
      "station_name": "高雄",
      "max_hourly_rain_mm": 108.5,
      "max_24h_rain_mm": 985.0
    },
    "mobility_impact": {
      "highway_disruption": "國道1號仁德交流道下匝道積水 40cm 封閉；台1線岡山段雙向中斷",
      "railway_disruption": "台鐵縱貫線八掌溪橋路基淘空，南部路段中斷停駛 5 天",
      "etag_speed_drop_pct": -78.5
    }
  },
  "iow_sensor_sample": {
    "sensor_id": "IOW-RS-TP01",
    "name": "新北汐止大同路二段涵洞感測器",
    "installation_type": "公路涵洞超音波雷達",
    "warning_threshold_cm": 15,
    "closure_threshold_cm": 30,
    "scenarios": {
      "heavy_rain": { "depth_cm": 18, "status": "⚠️ 水漂警告 (慢行)", "speed_kmh": 22, "drop_pct": -56.0 },
      "deluge_extreme": { "depth_cm": 42, "status": "🚨 封閉管制 (禁止通行)", "speed_kmh": 0, "drop_pct": -100.0 }
    }
  }
}
```

---

## 2.6 🛠️ 數據前處理工程挑戰與安全保護 (Data Pipeline Nuances)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   國家級交通大數據前處理安全防護管線                           │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
┌───────────────────────┐                             ┌───────────────────────┐
│  個人隱私加鹽去識別化  │                             │  記憶體零爆破串流架構  │
│ Independent Salt Hash │                             │ PyArrow Streaming     │
└───────────┬───────────┘                             └───────────┬───────────┘
            │                                                     │
            │ 各運具獨立 Salt，禁止跨商串接個人軌跡                │ 16MB 區塊串流解壓縮，不落磁碟
            │ 轉乘依賴票卡晶片「實體寫入代碼」判定                 │ Polars LazyFrame 欄位下推投影
            ▼                                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                 最終成果：16.5GB 高壓縮 Apache Parquet 剛性母體             │
└─────────────────────────────────────────────────────────────────────────────┘
```

1. **獨立加鹽雜湊機制（Independent Salting Hash）**：
   * 為貫徹個人隱私防護，TICP 規範要求各營運商（公車、捷運、台鐵、微笑單車）對悠遊卡/一卡通卡號採用**獨立加鹽雜湊（Unique Salting Algorithm）**。
   * 因此，工程上**無法**單純利用卡號欄位跨系統直接串聯同一人的所有行蹤；
   * 然而，跨運具之轉乘關係是由實體驗票機晶片直接讀寫寫入公車端的 `TransferCode` 與 `Discount`（記錄 100% 精準法律核銷憑證）；而公共自行車則透過站點空間拓撲與分時潮汐特徵實現宏觀整合。
2. **記憶體零爆破安全串流管線（Memory-Safe Streaming Pipeline）**：
   * 4.48 億筆資料原始解壓後體積超過 30 GB，若直接以傳統 Pandas 讀入，將需要 120 GB 以上之 RAM，隨即導致系統 OOM 崩潰。
   * 本專案以 `pipeline/convert_to_parquet.py` 打造專屬管線：採用 `PyArrow 16MB 零磁碟串流解壓縮` 結合 `Zstandard (Level 5)` 欄式壓縮，將體積縮減 88% 至 16.5 GB，並透過 `Polars LazyFrame` 嚴格限制執行緒與記憶體，確保在 1.5GB RAM 安全水位內瞬時完成分析！

![圖 2.1：國家級大數據全域閉環融合架構 (Data Fusion Blueprint)](images/ch2_data_infrastructure.webp)
*圖 2.1：線上系統【數據戰略】第二幕——全域閉環融合架構實體介面。解析「第 1 層：底層剛性真理骨架（eTag + TICP 票證 4.48 億筆）」、「第 2 層：外層連續空間肌肉（電信信令）」與「第 3 層：錨點反向校準閉環（以硬錨點校正擴推倍率）」之工程落地機制。*

---

## 2.7 🎯 互動傳送門與系統對映 (Interactive Portal)

想要親自查閱由上述 4.48 億筆資料與 325 座 eTag 門架所提煉出之全維度戰略對照矩陣嗎？請透過下方傳送門進入系統：

* **[👉 立即跳轉至線上系統：三大數據戰略矩陣 (Master Matrix)](https://tobytoy.github.io/taiwan-mobility-pulse/#telecom)**

至此，我們完整解剖了數據母體的真實架構與微觀欄位字典。在下一章，我們將正式把這些微觀粒子注入全台灣 111 條代表性動態走廊，觀察大都會與城際間的時空呼吸！

👉 **[進入第三章：全台城際與都會走廊大動脈](chapter3_flow_arteries.md)**
