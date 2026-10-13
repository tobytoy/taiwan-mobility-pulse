/**
 * taiwan-mobility-pulse - eTag Interchange Off-Ramp Catchment Data
 * -----------------------------------------------------------------
 * 交通部高公局 eTag 電子收費系統大數據實證下匝道（Off-Ramp Discharge）
 * 呈現「車流從國道注入市區商圈、產業園區與風景名勝的第一道輻射門戶」
 */

export const ETAG_INTERCHANGES = [
  // ==========================================
  // 一、 北部關鍵交流道注入熱點
  // ==========================================
  {
    id: 'ic_keelung_xizhi',
    name: '國道 1 號 汐止交流道 (10K)',
    short_name: '汐止交流道',
    gantry_code: '01F-0105S',
    lat: 25.0688,
    lng: 121.6582,
    region: 'North',
    target_area: '汐止大同物流園區 / 遠雄 U-Town 商圈',
    dominant_type: 'freight', // 產業物流主導
    color: '#10B981', // 翡翠貨物綠
    workday_vol: 58500,
    holiday_vol: 14200,
    vehicle_mix: {
      type31_car: 38,
      type32_small_truck: 18,
      type41_tour_bus: 4,
      type42_big_truck: 22,
      type51_52_trailer: 18
    },
    parking_stress_pct: { workday: 84, holiday: 42 },
    commercial_desc: '基隆港海運貨櫃拆櫃與大台北電商轉運核心，平日重型聯結車與大貨車注入密度極高。',
    hourly_curve: [
      0.15, 0.10, 0.08, 0.15, 0.40, 0.72, 0.92, 0.98,
      1.00, 0.95, 0.88, 0.82, 0.86, 0.92, 0.96, 0.98,
      0.88, 0.70, 0.52, 0.40, 0.32, 0.25, 0.20, 0.16
    ]
  },
  {
    id: 'ic_taipei_yuanshan',
    name: '國道 1 號 圓山/台北交流道 (23K/25K)',
    short_name: '圓山交流道',
    gantry_code: '01F-0232S',
    lat: 25.0742,
    lng: 121.5284,
    region: 'North',
    target_area: '台北市區 (建國高架/松江南京/重慶北路)',
    dominant_type: 'commuter', // 都會通勤主導
    color: '#38BDF8', // 青空電光藍
    workday_vol: 82400,
    holiday_vol: 45600,
    vehicle_mix: {
      type31_car: 76,
      type32_small_truck: 12,
      type41_tour_bus: 7,
      type42_big_truck: 4,
      type51_52_trailer: 1
    },
    parking_stress_pct: { workday: 94, holiday: 76 },
    commercial_desc: '台北市核心聯外門戶，早晚尖峰進城車潮直接注入市區高架道路，市區停車位極度飽和。',
    hourly_curve: [
      0.08, 0.04, 0.03, 0.05, 0.20, 0.58, 0.95, 1.00,
      0.88, 0.75, 0.70, 0.68, 0.72, 0.78, 0.85, 0.92,
      0.98, 0.96, 0.82, 0.62, 0.45, 0.30, 0.18, 0.12
    ]
  },
  {
    id: 'ic_wugu',
    name: '國道 1 號 五股交流道 (33K)',
    short_name: '五股交流道',
    gantry_code: '01F-0331S',
    lat: 25.0680,
    lng: 121.4412,
    region: 'North',
    target_area: '新北產業園區 / 台 64、台 65 快速道路交會口',
    dominant_type: 'freight',
    color: '#10B981',
    workday_vol: 74200,
    holiday_vol: 31500,
    vehicle_mix: {
      type31_car: 52,
      type32_small_truck: 20,
      type41_tour_bus: 5,
      type42_big_truck: 15,
      type51_52_trailer: 8
    },
    parking_stress_pct: { workday: 88, holiday: 55 },
    commercial_desc: '新北製造與物流核心交匯樞紐，平日小貨車、大貨車與雙北通勤車流高度交織。',
    hourly_curve: [
      0.12, 0.08, 0.06, 0.12, 0.35, 0.68, 0.92, 0.98,
      0.95, 0.88, 0.82, 0.80, 0.85, 0.90, 0.95, 0.98,
      0.92, 0.78, 0.58, 0.42, 0.32, 0.24, 0.18, 0.14
    ]
  },
  {
    id: 'ic_linkou',
    name: '國道 1 號 林口交流道 (41K)',
    short_name: '林口交流道',
    gantry_code: '01F-0413S',
    lat: 25.0645,
    lng: 121.3638,
    region: 'North',
    target_area: 'MITSUI Outlet Park 林口三井商圈 / 工四工業區',
    dominant_type: 'tourist', // 週末強烈商場觀光
    color: '#F97316', // 珊瑚橘
    workday_vol: 68500,
    holiday_vol: 76800,
    vehicle_mix: {
      type31_car: 72,
      type32_small_truck: 14,
      type41_tour_bus: 6,
      type42_big_truck: 6,
      type51_52_trailer: 2
    },
    parking_stress_pct: { workday: 78, holiday: 96 },
    commercial_desc: '平日承載科技物流與龜山通勤；放假日午前自駕跨區購物車潮暴衝，周邊停車場飽和率破 96%。',
    hourly_curve: [
      0.06, 0.03, 0.02, 0.04, 0.15, 0.45, 0.80, 0.95,
      1.00, 0.92, 0.85, 0.82, 0.88, 0.94, 0.98, 0.95,
      0.90, 0.82, 0.70, 0.55, 0.40, 0.26, 0.15, 0.09
    ]
  },
  {
    id: 'ic_nankan',
    name: '國道 1 號 南崁交流道 (49K)',
    short_name: '南崁交流道',
    gantry_code: '01F-0492S',
    lat: 25.0412,
    lng: 121.2985,
    region: 'North',
    target_area: '台茂購物中心 / 桃園經國特區 / 長榮航運生活圈',
    dominant_type: 'commuter',
    color: '#38BDF8',
    workday_vol: 65200,
    holiday_vol: 48900,
    vehicle_mix: {
      type31_car: 68,
      type32_small_truck: 16,
      type41_tour_bus: 5,
      type42_big_truck: 8,
      type51_52_trailer: 3
    },
    parking_stress_pct: { workday: 82, holiday: 88 },
    commercial_desc: '桃園北界交通心臟，往返台北通勤自駕客群龐大，台茂商圈週末具備穩定跨區消費流。',
    hourly_curve: [
      0.08, 0.04, 0.03, 0.05, 0.22, 0.60, 0.94, 1.00,
      0.88, 0.76, 0.72, 0.70, 0.75, 0.82, 0.90, 0.95,
      0.98, 0.92, 0.78, 0.58, 0.42, 0.28, 0.18, 0.11
    ]
  },
  {
    id: 'ic_hsinchu_science',
    name: '國道 1 號 新竹/竹科交流道 (95K)',
    short_name: '竹科交流道',
    gantry_code: '01F-0951S',
    lat: 24.7892,
    lng: 121.0118,
    region: 'North',
    target_area: '新竹科學園區 (園區一路) / 清交大校園 / 光復路',
    dominant_type: 'freight',
    color: '#10B981',
    workday_vol: 78500,
    holiday_vol: 22800,
    vehicle_mix: {
      type31_car: 64,
      type32_small_truck: 18,
      type41_tour_bus: 3,
      type42_big_truck: 12,
      type51_52_trailer: 3
    },
    parking_stress_pct: { workday: 96, holiday: 35 },
    commercial_desc: '全台灣半導體矽島核心動脈！上班日早晨 07:45~09:15 光復路匝道極度壅塞，精密氣墊車密集。',
    hourly_curve: [
      0.10, 0.06, 0.04, 0.08, 0.30, 0.70, 0.98, 1.00,
      0.85, 0.78, 0.72, 0.70, 0.75, 0.80, 0.88, 0.94,
      0.98, 0.92, 0.75, 0.52, 0.36, 0.25, 0.18, 0.13
    ]
  },
  {
    id: 'ic_daxi',
    name: '國道 3 號 大溪交流道 (62K)',
    short_name: '大溪交流道',
    gantry_code: '03F-0624S',
    lat: 24.8912,
    lng: 121.2642,
    region: 'North',
    target_area: '大溪老街風景區 / 月眉停車場 / 慈湖兩蔣文化園區',
    dominant_type: 'tourist',
    color: '#F97316',
    workday_vol: 28500,
    holiday_vol: 54600,
    vehicle_mix: {
      type31_car: 82,
      type32_small_truck: 8,
      type41_tour_bus: 8,
      type42_big_truck: 2,
      type51_52_trailer: 0
    },
    parking_stress_pct: { workday: 38, holiday: 98 },
    commercial_desc: '放假日北部家庭自駕出遊核心門戶，週六日 10:30 周邊月眉停車場即告飽和排隊回堵。',
    hourly_curve: [
      0.02, 0.01, 0.01, 0.01, 0.03, 0.12, 0.40, 0.78,
      0.96, 1.00, 0.94, 0.85, 0.80, 0.86, 0.92, 0.96,
      0.88, 0.78, 0.60, 0.40, 0.25, 0.14, 0.08, 0.04
    ]
  },

  // ==========================================
  // 二、 中部關鍵交流道注入熱點
  // ==========================================
  {
    id: 'ic_taichung_daya',
    name: '國道 1 號 大雅/中清交流道 (174K)',
    short_name: '大雅交流道',
    gantry_code: '01F-1742S',
    lat: 24.2085,
    lng: 120.6385,
    region: 'Central',
    target_area: '中部科學園區 (台中園區) / 水湳經貿園區',
    dominant_type: 'freight',
    color: '#10B981',
    workday_vol: 72400,
    holiday_vol: 32600,
    vehicle_mix: {
      type31_car: 56,
      type32_small_truck: 20,
      type41_tour_bus: 4,
      type42_big_truck: 14,
      type51_52_trailer: 6
    },
    parking_stress_pct: { workday: 91, holiday: 48 },
    commercial_desc: '中科晶圓廠與大肚山工業縱谷原料運輸動脈，平日物流車隊與水湳商務車流密集。',
    hourly_curve: [
      0.12, 0.08, 0.06, 0.10, 0.32, 0.68, 0.94, 1.00,
      0.92, 0.85, 0.80, 0.78, 0.84, 0.90, 0.95, 0.98,
      0.92, 0.78, 0.58, 0.42, 0.32, 0.24, 0.18, 0.14
    ]
  },
  {
    id: 'ic_taichung_taiwan_blvd',
    name: '國道 1 號 台中/中港交流道 (178K)',
    short_name: '中港交流道',
    gantry_code: '01F-1785S',
    lat: 24.1752,
    lng: 120.6358,
    region: 'Central',
    target_area: '台中七期市政商圈 / 新光三越·大遠百 / 秋紅谷',
    dominant_type: 'tourist',
    color: '#F97316',
    workday_vol: 79800,
    holiday_vol: 88500,
    vehicle_mix: {
      type31_car: 80,
      type32_small_truck: 10,
      type41_tour_bus: 7,
      type42_big_truck: 3,
      type51_52_trailer: 0
    },
    parking_stress_pct: { workday: 86, holiday: 98 },
    commercial_desc: '中台灣最富裕商業心臟，假日時段全台各地開車前來七期百貨消費，下匝道回堵至主線。',
    hourly_curve: [
      0.05, 0.03, 0.02, 0.03, 0.12, 0.40, 0.78, 0.95,
      1.00, 0.95, 0.90, 0.88, 0.92, 0.96, 0.98, 0.96,
      0.92, 0.85, 0.75, 0.60, 0.45, 0.28, 0.16, 0.09
    ]
  },
  {
    id: 'ic_nantou_ailan',
    name: '國道 6 號 愛蘭/日月潭交流道 (29K)',
    short_name: '愛蘭交流道',
    gantry_code: '06F-0294E',
    lat: 23.9682,
    lng: 120.9325,
    region: 'Central',
    target_area: '日月潭國家風景區水社碼頭 / 埔里觀光商圈',
    dominant_type: 'tourist',
    color: '#F97316',
    workday_vol: 16500,
    holiday_vol: 43200,
    vehicle_mix: {
      type31_car: 78,
      type32_small_truck: 6,
      type41_tour_bus: 16,
      type42_big_truck: 0,
      type51_52_trailer: 0
    },
    parking_stress_pct: { workday: 28, holiday: 97 },
    commercial_desc: '放假日自駕休旅車與大型遊覽車爆量湧入，週六上午水社周邊停車場瞬間額滿。',
    hourly_curve: [
      0.02, 0.01, 0.01, 0.02, 0.06, 0.24, 0.65, 0.92,
      1.00, 0.95, 0.88, 0.78, 0.75, 0.82, 0.90, 0.95,
      0.92, 0.85, 0.68, 0.48, 0.30, 0.16, 0.08, 0.04
    ]
  },
  {
    id: 'ic_sanyi',
    name: '國道 1 號 三義交流道 (150K)',
    short_name: '三義交流道',
    gantry_code: '01F-1502S',
    lat: 24.3985,
    lng: 120.7682,
    region: 'Central',
    target_area: '三義木雕藝術村 / 勝興車站舊山線鐵道自行車',
    dominant_type: 'tourist',
    color: '#F97316',
    workday_vol: 19500,
    holiday_vol: 38200,
    vehicle_mix: {
      type31_car: 84,
      type32_small_truck: 8,
      type41_tour_bus: 7,
      type42_big_truck: 1,
      type51_52_trailer: 0
    },
    parking_stress_pct: { workday: 32, holiday: 92 },
    commercial_desc: '苗栗指標山城休閒門戶，週末滿載家庭跨城自駕自遊客群。',
    hourly_curve: [
      0.02, 0.01, 0.01, 0.02, 0.05, 0.18, 0.52, 0.85,
      1.00, 0.96, 0.90, 0.82, 0.80, 0.86, 0.92, 0.95,
      0.88, 0.76, 0.58, 0.38, 0.24, 0.14, 0.08, 0.04
    ]
  },

  // ==========================================
  // 三、 南部關鍵交流道注入熱點
  // ==========================================
  {
    id: 'ic_tainan_dawan',
    name: '國道 1 號 台南大灣交流道 (324K)',
    short_name: '大灣交流道',
    gantry_code: '01F-3245S',
    lat: 23.0042,
    lng: 120.2518,
    region: 'South',
    target_area: '南紡購物中心商圈 / 成大校區 / 東區生活圈',
    dominant_type: 'commuter',
    color: '#38BDF8',
    workday_vol: 61500,
    holiday_vol: 52400,
    vehicle_mix: {
      type31_car: 78,
      type32_small_truck: 14,
      type41_tour_bus: 4,
      type42_big_truck: 3,
      type51_52_trailer: 1
    },
    parking_stress_pct: { workday: 85, holiday: 92 },
    commercial_desc: '台南市東區最繁忙下匝道，連通小東路直達南紡購物中心與成功大學，車流穩定高載。',
    hourly_curve: [
      0.08, 0.04, 0.03, 0.05, 0.22, 0.58, 0.92, 1.00,
      0.88, 0.78, 0.74, 0.72, 0.78, 0.85, 0.92, 0.96,
      0.98, 0.94, 0.80, 0.60, 0.44, 0.30, 0.18, 0.12
    ]
  },
  {
    id: 'ic_kaohsiung_qianzhen',
    name: '國道 1 號 高雄前鎮/新生交流道 (372K)',
    short_name: '前鎮新生交流道',
    gantry_code: '01F-3721S',
    lat: 22.5842,
    lng: 120.3210,
    region: 'South',
    target_area: '高雄港第七貨櫃中心 / 臨海工業區 / 夢時代購物中心',
    dominant_type: 'freight',
    color: '#10B981',
    workday_vol: 68500,
    holiday_vol: 24200,
    vehicle_mix: {
      type31_car: 35,
      type32_small_truck: 12,
      type41_tour_bus: 3,
      type42_big_truck: 22,
      type51_52_trailer: 28
    },
    parking_stress_pct: { workday: 89, holiday: 52 },
    commercial_desc: '全台灣貨櫃聯結車比率最高之國道終點匝道，港區高架專用道全日重櫃吞吐量驚人。',
    hourly_curve: [
      0.18, 0.14, 0.10, 0.15, 0.40, 0.72, 0.95, 1.00,
      0.96, 0.92, 0.86, 0.82, 0.88, 0.94, 0.98, 0.92,
      0.82, 0.68, 0.48, 0.36, 0.28, 0.22, 0.18, 0.14
    ]
  },
  {
    id: 'ic_pingtung_nanzhou',
    name: '國道 3 號 屏東南州交流道 (424K)',
    short_name: '南州交流道',
    gantry_code: '03F-4241S',
    lat: 22.4885,
    lng: 120.5182,
    region: 'South',
    target_area: '水底寮樞紐 / 恆春半島 / 墾丁國家公園度假門戶',
    dominant_type: 'tourist',
    color: '#F97316',
    workday_vol: 18200,
    holiday_vol: 48500,
    vehicle_mix: {
      type31_car: 82,
      type32_small_truck: 6,
      type41_tour_bus: 12,
      type42_big_truck: 0,
      type51_52_trailer: 0
    },
    parking_stress_pct: { workday: 25, holiday: 96 },
    commercial_desc: '南下墾丁避冬戲水第一門戶，連假首日上午此匝道與台 1 線銜接處產生極長等候車隊。',
    hourly_curve: [
      0.03, 0.01, 0.01, 0.02, 0.06, 0.22, 0.60, 0.90,
      1.00, 0.95, 0.88, 0.80, 0.75, 0.82, 0.90, 0.94,
      0.95, 0.88, 0.75, 0.55, 0.36, 0.22, 0.12, 0.06
    ]
  },

  // ==========================================
  // 四、 東部關鍵交流道注入熱點
  // ==========================================
  {
    id: 'ic_yilan_toucheng_jiaoxi',
    name: '國道 5 號 頭城/礁溪交流道 (30K)',
    short_name: '礁溪交流道',
    gantry_code: '05F-0300S',
    lat: 24.8296,
    lng: 121.7892,
    region: 'East',
    target_area: '礁溪溫泉觀光大街 / 五峰旗風景區 / 烏石港海灣',
    dominant_type: 'tourist',
    color: '#F97316',
    workday_vol: 19800,
    holiday_vol: 68500,
    vehicle_mix: {
      type31_car: 76,
      type32_small_truck: 6,
      type41_tour_bus: 18,
      type42_big_truck: 0,
      type51_52_trailer: 0
    },
    parking_stress_pct: { workday: 34, holiday: 99 },
    commercial_desc: '全台灣假日時段最強大且最震撼的觀光下匝道！穿出雪山隧道後直奔礁溪，停車場 100% 滿場。',
    hourly_curve: [
      0.04, 0.02, 0.01, 0.02, 0.06, 0.25, 0.68, 0.94,
      1.00, 0.96, 0.88, 0.78, 0.72, 0.78, 0.88, 0.96,
      0.98, 0.90, 0.78, 0.60, 0.40, 0.24, 0.12, 0.06
    ]
  },
  {
    id: 'ic_yilan_luodong',
    name: '國道 5 號 羅東交流道 (46K)',
    short_name: '羅東交流道',
    gantry_code: '05F-0462S',
    lat: 24.6852,
    lng: 121.7825,
    region: 'East',
    target_area: '羅東觀光夜市 / 冬山河親水公園 / 傳藝中心',
    dominant_type: 'tourist',
    color: '#F97316',
    workday_vol: 22400,
    holiday_vol: 56200,
    vehicle_mix: {
      type31_car: 80,
      type32_small_truck: 7,
      type41_tour_bus: 13,
      type42_big_truck: 0,
      type51_52_trailer: 0
    },
    parking_stress_pct: { workday: 42, holiday: 97 },
    commercial_desc: '宜蘭夜經濟核心注入點，週末傍晚 16:30~19:30 跨區車流大湧入，羅東市區停車場極度緊繃。',
    hourly_curve: [
      0.06, 0.03, 0.02, 0.02, 0.04, 0.10, 0.28, 0.55,
      0.75, 0.85, 0.88, 0.82, 0.80, 0.85, 0.92, 0.98,
      1.00, 0.98, 0.94, 0.82, 0.65, 0.45, 0.25, 0.12
    ]
  }
];
