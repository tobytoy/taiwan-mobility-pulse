/**
 * taiwan-mobility-pulse - Freight & Tourism Corridors Module
 * -------------------------------------------------------------
 * 整合交通部高公局 eTag 大數據（M03A / M06A 車種 31, 32, 41, 42, 51, 52）
 * 涵蓋：
 *  1. 🚛 全台核心產業物流走廊 (Freight Logistics Arteries)
 *     - 車種 32 (小貨車/電商宅配)、42 (大貨車/乾貨散裝)、51/52 (聯結車/海運貨櫃)
 *     - 上班日全線巔峰奔馳 (145%)，放假日大幅熄火休眠 (22%)
 *  2. 🧳 全台指標性觀光旅遊走廊 (Tourism & Leisure Pulse)
 *     - 車種 41 (包車遊覽車/團體旅遊)、31 (跨城長途自駕休旅車)
 *     - 上班日低溫休止 (28%)，放假日全面噴發爆量 (320%)
 */

export const FREIGHT_AND_TOURISM_STATIONS = {
  // === 產業物流關鍵貨運樞紐與園區節點 ===
  '基隆港貨櫃中心': [25.1385, 121.7410],
  '汐止物流園區': [25.0682, 121.6548],
  '台北港國際物流區': [25.1528, 121.3852],
  '桃園航空城大園物流倉': [25.0712, 121.2052],
  '桃園機場航空貨運站': [25.0797, 121.2342],
  '林口龜山物流園區': [25.0489, 121.3654],
  '新竹科學園區物流樞紐': [24.7785, 121.0142],
  '中科大雅半導體園區': [24.2152, 120.6184],
  '台中港自由貿易港區': [24.2882, 120.5218],
  '台中精密機械園區': [24.1380, 120.5982],
  '台南科學園區 (新市)': [23.1112, 120.2798],
  '高雄港第七貨櫃中心': [22.5488, 120.3285],
  '高雄前鎮臨海產業園區': [22.5842, 120.3210],
  '屏東農業生技園區': [22.7058, 120.5342],

  // === 觀光旅遊核心風景區與名勝節點 ===
  '宜蘭礁溪溫泉區': [24.8296, 121.7712],
  '宜蘭羅東觀光夜市': [24.6768, 121.7682],
  '花蓮太魯閣七星潭': [24.0322, 121.6288],
  '桃園大溪老街風景區': [24.8842, 121.2885],
  '新北瑞芳九份老街': [25.1098, 121.8445],
  '南投日月潭水社碼頭': [23.8654, 120.9168],
  '彰化鹿港文化老街': [24.0568, 120.4354],
  '嘉義阿里山國家風景區': [23.5112, 120.8042],
  '屏東墾丁大街南灣': [21.9432, 120.7985]
};

export const FREIGHT_AND_TOURISM_CORRIDORS = [
  // ==========================================
  // 一、 🚛 產業物流大動脈 (FREIGHT CORRIDORS)
  // 上班日滿載 (1.45x) · 假日休眠 (0.22x)
  // ==========================================
  {
    corridor_id: 'freight_keelung_xizhi',
    name: '基隆港 ➔ 汐止大同物流園區 (國1海運貨櫃幹線)',
    mode_id: 'freight_highway',
    mode_name: '國道產業物流 (eTag)',
    color: '#10B981', // 翡翠貨物綠
    region: 'North',
    origin: '基隆港貨櫃中心',
    destination: '汐止物流園區',
    origin_coord: [25.1385, 121.7410],
    dest_coord: [25.0682, 121.6548],
    pax_type: 'freight',
    volume: 24800,
    total_vol: 24800,
    volume_workday: 32600,
    volume_holiday: 5400,
    day_type_factor: { workday: 1.45, holiday: 0.22 },
    vehicle_mix: '車種 51/52 聯結車 62% · 車種 42 大貨車 26% · 車種 32 小貨車 12%',
    highway_tag: '國道 1 號 (八堵-汐止門架)',
    commercial_desc: '全台海運遠洋貨櫃抵港拆櫃內陸轉運第一動脈，平日日間貨櫃卡車川流不息。',
    hourly_curve: [
      0.15, 0.12, 0.08, 0.15, 0.35, 0.65, 0.88, 0.95,
      1.00, 0.96, 0.92, 0.85, 0.88, 0.92, 0.95, 0.98,
      0.90, 0.72, 0.55, 0.42, 0.35, 0.28, 0.22, 0.18
    ]
  },
  {
    corridor_id: 'freight_taipeiport_dayuan',
    name: '台北港 ➔ 桃園航空城大園物流倉 (台61/國2甲空海聯運)',
    mode_id: 'freight_highway',
    mode_name: '國道產業物流 (eTag)',
    color: '#059669',
    region: 'North',
    origin: '台北港國際物流區',
    destination: '桃園航空城大園物流倉',
    origin_coord: [25.1528, 121.3852],
    dest_coord: [25.0712, 121.2052],
    pax_type: 'freight',
    volume: 21500,
    total_vol: 21500,
    volume_workday: 28900,
    volume_holiday: 4800,
    day_type_factor: { workday: 1.48, holiday: 0.20 },
    vehicle_mix: '車種 51/52 貨櫃聯結車 58% · 車種 42 散裝貨車 28% · 車種 32 宅配 14%',
    highway_tag: '台 61 快速道路 / 國 2 甲',
    commercial_desc: '八里台北港直通大園航空城，國際海空港貨物雙向轉運核心廊帶。',
    hourly_curve: [
      0.12, 0.10, 0.06, 0.12, 0.30, 0.60, 0.82, 0.92,
      0.98, 1.00, 0.95, 0.88, 0.85, 0.90, 0.96, 0.95,
      0.86, 0.68, 0.50, 0.38, 0.30, 0.25, 0.18, 0.14
    ]
  },
  {
    corridor_id: 'freight_taoyuanair_linkou',
    name: '桃園機場貨運站 ➔ 林口龜山物流園區 (國1高科技冷鏈線)',
    mode_id: 'freight_highway',
    mode_name: '國道產業物流 (eTag)',
    color: '#10B981',
    region: 'North',
    origin: '桃園機場航空貨運站',
    destination: '林口龜山物流園區',
    origin_coord: [25.0797, 121.2342],
    dest_coord: [25.0489, 121.3654],
    pax_type: 'freight',
    volume: 29800,
    total_vol: 29800,
    volume_workday: 39500,
    volume_holiday: 6800,
    day_type_factor: { workday: 1.42, holiday: 0.24 },
    vehicle_mix: '車種 42 大貨車 42% · 車種 32 冷鏈物流車 38% · 車種 51 半聯結車 20%',
    highway_tag: '國道 1 號 (機場系統-林口門架)',
    commercial_desc: '跨境空運急件、生鮮醫藥冷鏈及電子關鍵零組件集中在林口龜山大型保稅倉儲。',
    hourly_curve: [
      0.22, 0.18, 0.15, 0.20, 0.38, 0.62, 0.85, 0.96,
      0.98, 0.95, 0.90, 0.88, 0.92, 0.96, 1.00, 0.94,
      0.88, 0.74, 0.58, 0.45, 0.38, 0.32, 0.26, 0.22
    ]
  },
  {
    corridor_id: 'freight_hsinchu_taichung_science',
    name: '新竹科學園區 ➔ 中科大雅園區 (國1/國3半導體晶圓專線)',
    mode_id: 'freight_highway',
    mode_name: '國道產業物流 (eTag)',
    color: '#047857',
    region: 'Central',
    origin: '新竹科學園區物流樞紐',
    destination: '中科大雅半導體園區',
    origin_coord: [24.7785, 121.0142],
    dest_coord: [24.2152, 120.6184],
    pax_type: 'freight',
    volume: 26500,
    total_vol: 26500,
    volume_workday: 35800,
    volume_holiday: 5200,
    day_type_factor: { workday: 1.46, holiday: 0.21 },
    vehicle_mix: '車種 42 恆溫氣墊車 48% · 車種 32 晶圓調度小貨車 32% · 車種 51 原料槽車 20%',
    highway_tag: '國道 1 號 / 國道 3 號 (新竹-大雅門架)',
    commercial_desc: '台積電與晶圓代工供應鏈全台半導體雙星對開，日夜無休高機密防震物流。',
    hourly_curve: [
      0.25, 0.22, 0.18, 0.25, 0.45, 0.70, 0.90, 0.98,
      1.00, 0.96, 0.92, 0.88, 0.92, 0.95, 0.98, 0.92,
      0.85, 0.72, 0.58, 0.48, 0.40, 0.35, 0.30, 0.26
    ]
  },
  {
    corridor_id: 'freight_taichung_port_machinery',
    name: '台中港自由貿易港區 ➔ 台中精密機械園區 (國3特三號重工線)',
    mode_id: 'freight_highway',
    mode_name: '國道產業物流 (eTag)',
    color: '#10B981',
    region: 'Central',
    origin: '台中港自由貿易港區',
    destination: '台中精密機械園區',
    origin_coord: [24.2882, 120.5218],
    dest_coord: [24.1380, 120.5982],
    pax_type: 'freight',
    volume: 18200,
    total_vol: 18200,
    volume_workday: 24600,
    volume_holiday: 3800,
    day_type_factor: { workday: 1.44, holiday: 0.22 },
    vehicle_mix: '車種 51/52 重載聯結車 52% · 車種 42 鋼材機械貨車 36% · 車種 32 零件車 12%',
    highway_tag: '國道 3 號 (沙鹿-龍井門架) / 台 12 線',
    commercial_desc: '大肚山精密機械黃金縱谷的進出口骨幹，運送大型工具機與航太級加工組件。',
    hourly_curve: [
      0.08, 0.05, 0.04, 0.08, 0.25, 0.55, 0.82, 0.95,
      1.00, 0.95, 0.90, 0.85, 0.88, 0.92, 0.96, 0.92,
      0.82, 0.65, 0.45, 0.32, 0.22, 0.16, 0.12, 0.10
    ]
  },
  {
    corridor_id: 'freight_taichung_science_tainan',
    name: '中科大雅園區 ➔ 台南科學園區 (國1南北高科技躍升軸)',
    mode_id: 'freight_highway',
    mode_name: '國道產業物流 (eTag)',
    color: '#059669',
    region: 'South',
    origin: '中科大雅半導體園區',
    destination: '台南科學園區 (新市)',
    origin_coord: [24.2152, 120.6184],
    dest_coord: [23.1112, 120.2798],
    pax_type: 'freight',
    volume: 31200,
    total_vol: 31200,
    volume_workday: 42800,
    volume_holiday: 6400,
    day_type_factor: { workday: 1.47, holiday: 0.21 },
    vehicle_mix: '車種 42 特種氣墊貨車 44% · 車種 51 半聯結車 34% · 車種 32 測試品小貨車 22%',
    highway_tag: '國道 1 號 (大雅-安定門架)',
    commercial_desc: '台灣西部高科技走廊核心調度幹線，串聯中科晶圓製程與南科先進封裝。',
    hourly_curve: [
      0.22, 0.18, 0.15, 0.20, 0.40, 0.68, 0.88, 0.96,
      0.98, 0.95, 0.90, 0.88, 0.92, 0.96, 1.00, 0.95,
      0.86, 0.72, 0.56, 0.44, 0.36, 0.30, 0.26, 0.22
    ]
  },
  {
    corridor_id: 'freight_kaohsiung_port7_qianzhen',
    name: '高雄港第七貨櫃中心 ➔ 前鎮臨海工業區 (新生高架重櫃線)',
    mode_id: 'freight_highway',
    mode_name: '國道產業物流 (eTag)',
    color: '#10B981',
    region: 'South',
    origin: '高雄港第七貨櫃中心',
    destination: '高雄前鎮臨海產業園區',
    origin_coord: [22.5488, 120.3285],
    dest_coord: [22.5842, 120.3210],
    pax_type: 'freight',
    volume: 34500,
    total_vol: 34500,
    volume_workday: 47200,
    volume_holiday: 7200,
    day_type_factor: { workday: 1.46, holiday: 0.22 },
    vehicle_mix: '車種 51/52 全自動化聯結車 72% · 車種 42 大貨車 20% · 車種 32 小貨車 8%',
    highway_tag: '國道 1 號南端港區專用高架',
    commercial_desc: '全台最大智慧自動化貨櫃碼頭，平日重型聯結車密集提領卸櫃至臨海保稅倉。',
    hourly_curve: [
      0.18, 0.14, 0.10, 0.16, 0.38, 0.70, 0.92, 0.98,
      1.00, 0.96, 0.92, 0.85, 0.90, 0.95, 0.98, 0.92,
      0.82, 0.68, 0.50, 0.38, 0.30, 0.25, 0.22, 0.18
    ]
  },
  {
    corridor_id: 'freight_tainan_pingtung_biotech',
    name: '台南科學園區 ➔ 屏東農業生技園區 (台88/國3生醫冷鏈線)',
    mode_id: 'freight_highway',
    mode_name: '國道產業物流 (eTag)',
    color: '#059669',
    region: 'South',
    origin: '台南科學園區 (新市)',
    destination: '屏東農業生技園區',
    origin_coord: [23.1112, 120.2798],
    dest_coord: [22.7058, 120.5342],
    pax_type: 'freight',
    volume: 15400,
    total_vol: 15400,
    volume_workday: 20900,
    volume_holiday: 3200,
    day_type_factor: { workday: 1.45, holiday: 0.23 },
    vehicle_mix: '車種 32 溫控小貨車 46% · 車種 42 冷藏大貨車 38% · 車種 51 槽車 16%',
    highway_tag: '國道 3 號 (新化-長治門架) / 台 88',
    commercial_desc: '南台灣生醫材料、高階農化與水產冷鏈運輸，平日提供點對點快速配送。',
    hourly_curve: [
      0.10, 0.08, 0.06, 0.10, 0.30, 0.62, 0.85, 0.96,
      1.00, 0.94, 0.88, 0.82, 0.88, 0.94, 0.96, 0.90,
      0.78, 0.62, 0.44, 0.32, 0.24, 0.18, 0.14, 0.10
    ]
  },

  // ==========================================
  // 二、 🧳 觀光旅遊大脈衝 (TOURISM CORRIDORS)
  // 上班日低溫 (0.28x) · 假日全面爆發 (3.20x)
  // ==========================================
  {
    corridor_id: 'tourism_taipei_jiaoxi',
    name: '台北市中心 ➔ 宜蘭礁溪溫泉區 (國5雪山隧道觀光脈衝)',
    mode_id: 'tourism_highway',
    mode_name: '觀光旅遊流向 (eTag+客運)',
    color: '#F97316', // 活力珊瑚橘
    region: 'East',
    origin: '台北車站',
    destination: '宜蘭礁溪溫泉區',
    origin_coord: [25.0478, 121.5170],
    dest_coord: [24.8296, 121.7712],
    pax_type: 'tourist',
    volume: 38500,
    total_vol: 38500,
    volume_workday: 10500,
    volume_holiday: 46200,
    day_type_factor: { workday: 0.27, holiday: 3.25 },
    vehicle_mix: '車種 31 跨城自駕休旅車 76% · 車種 41 包車遊覽車/國道客運 24%',
    highway_tag: '國道 5 號 (石碇-頭城雪隧門架)',
    commercial_desc: '全台灣假日時段最強大的觀光潮汐湧浪！週六早尖峰出城、週日傍晚北返造成雪隧回堵。',
    hourly_curve: [
      0.05, 0.03, 0.02, 0.02, 0.06, 0.25, 0.65, 0.92,
      1.00, 0.96, 0.88, 0.75, 0.68, 0.72, 0.85, 0.95,
      0.98, 0.92, 0.82, 0.65, 0.45, 0.28, 0.15, 0.08
    ]
  },
  {
    corridor_id: 'tourism_jiaoxi_luodong',
    name: '宜蘭礁溪 ➔ 羅東觀光夜市 (蘭陽平原週末夜經濟動脈)',
    mode_id: 'tourism_highway',
    mode_name: '觀光旅遊流向 (eTag+客運)',
    color: '#FB7185',
    region: 'East',
    origin: '宜蘭礁溪溫泉區',
    destination: '宜蘭羅東觀光夜市',
    origin_coord: [24.8296, 121.7712],
    dest_coord: [24.6768, 121.7682],
    pax_type: 'tourist',
    volume: 22400,
    total_vol: 22400,
    volume_workday: 5800,
    volume_holiday: 28600,
    day_type_factor: { workday: 0.26, holiday: 3.10 },
    vehicle_mix: '車種 31 觀光小客車 82% · 車種 41 團體遊覽車 18%',
    highway_tag: '國道 5 號 (頭城-羅東門架) / 台 9 線',
    commercial_desc: '入住礁溪溫泉飯店的旅客於週末傍晚集體湧入羅東夜市，引發停車場長時滯滿場。',
    hourly_curve: [
      0.08, 0.04, 0.02, 0.01, 0.02, 0.05, 0.12, 0.22,
      0.35, 0.42, 0.45, 0.50, 0.55, 0.62, 0.75, 0.90,
      0.98, 1.00, 0.96, 0.88, 0.72, 0.52, 0.30, 0.15
    ]
  },
  {
    corridor_id: 'tourism_taipei_hualien',
    name: '台北車站 ➔ 花蓮太魯閣七星潭 (新自強號景觀觀光線)',
    mode_id: 'tra',
    mode_name: '臺鐵新自強號',
    color: '#3B82F6',
    region: 'East',
    origin: '台北車站',
    destination: '花蓮太魯閣七星潭',
    origin_coord: [25.0478, 121.5170],
    dest_coord: [24.0322, 121.6288],
    pax_type: 'tourist',
    volume: 28400,
    total_vol: 28400,
    volume_workday: 7800,
    volume_holiday: 35200,
    day_type_factor: { workday: 0.28, holiday: 3.22 },
    vehicle_mix: 'EMU3000 新自強號 68% · 普悠瑪/太魯閣號 32%',
    highway_tag: '北迴鐵路東部觀光幹線',
    commercial_desc: '東台灣深度文化與大自然景觀旅遊，連假與週末往花蓮車票一票難求。',
    hourly_curve: [
      0.02, 0.01, 0.01, 0.02, 0.05, 0.28, 0.72, 0.95,
      1.00, 0.92, 0.84, 0.75, 0.72, 0.78, 0.86, 0.92,
      0.88, 0.80, 0.68, 0.52, 0.36, 0.22, 0.10, 0.05
    ]
  },
  {
    corridor_id: 'tourism_taipei_daxi',
    name: '雙北都會區 ➔ 桃園大溪老街風景區 (國3觀光自駕走廊)',
    mode_id: 'tourism_highway',
    mode_name: '觀光旅遊流向 (eTag+客運)',
    color: '#F97316',
    region: 'North',
    origin: '板橋',
    destination: '桃園大溪老街風景區',
    origin_coord: [25.0142, 121.4638],
    dest_coord: [24.8842, 121.2885],
    pax_type: 'tourist',
    volume: 19800,
    total_vol: 19800,
    volume_workday: 4900,
    volume_holiday: 25400,
    day_type_factor: { workday: 0.25, holiday: 3.15 },
    vehicle_mix: '車種 31 家庭自駕 SUV 84% · 車種 41 國旅遊覽車 16%',
    highway_tag: '國道 3 號 (三鶯-大溪門架)',
    commercial_desc: '大台北居民週末一日遊首選，大溪交流道周邊月眉停車場假日午前瞬間爆滿。',
    hourly_curve: [
      0.02, 0.01, 0.01, 0.01, 0.03, 0.12, 0.38, 0.75,
      0.95, 1.00, 0.94, 0.82, 0.76, 0.84, 0.92, 0.96,
      0.88, 0.76, 0.58, 0.38, 0.22, 0.12, 0.06, 0.03
    ]
  },
  {
    corridor_id: 'tourism_taipei_jiufen',
    name: '雙北都會區 ➔ 新北瑞芳九份老街 (黃金山城外籍國際觀光)',
    mode_id: 'thb_bus',
    mode_name: '公路客運/包車',
    color: '#F43F5E',
    region: 'North',
    origin: '台北車站',
    destination: '新北瑞芳九份老街',
    origin_coord: [25.0478, 121.5170],
    dest_coord: [25.1098, 121.8445],
    pax_type: 'tourist',
    volume: 24500,
    total_vol: 24500,
    volume_workday: 7500,
    volume_holiday: 31200,
    day_type_factor: { workday: 0.31, holiday: 3.05 },
    vehicle_mix: '車種 41 國際觀光遊覽車 38% · 965/1062 觀光客運 42% · 自駕小客車 20%',
    highway_tag: '台 62 快速道路 / 國道 1 號大華系統',
    commercial_desc: '國際旅客入境台灣必訪山城，包車遊覽車與觀光客運密集穿梭九份芋圓老街。',
    hourly_curve: [
      0.02, 0.01, 0.01, 0.02, 0.04, 0.15, 0.45, 0.80,
      0.98, 1.00, 0.95, 0.88, 0.85, 0.90, 0.96, 0.98,
      0.92, 0.82, 0.65, 0.45, 0.28, 0.15, 0.08, 0.04
    ]
  },
  {
    corridor_id: 'tourism_taichung_sunmoonlake',
    name: '台中市中心 ➔ 南投日月潭水社碼頭 (國6觀光專線/台灣好行)',
    mode_id: 'tourism_highway',
    mode_name: '觀光旅遊流向 (eTag+客運)',
    color: '#F97316',
    region: 'Central',
    origin: '台中',
    destination: '南投日月潭水社碼頭',
    origin_coord: [24.1368, 120.6850],
    dest_coord: [23.8654, 120.9168],
    pax_type: 'tourist',
    volume: 32600,
    total_vol: 32600,
    volume_workday: 8600,
    volume_holiday: 41800,
    day_type_factor: { workday: 0.26, holiday: 3.30 },
    vehicle_mix: '車種 31 跨城自駕車 72% · 車種 41 觀光遊覽車 18% · 台灣好行客運 10%',
    highway_tag: '國道 6 號 (舊正-愛蘭門架) / 台 21 線',
    commercial_desc: '中台灣指標國際景點，國六愛蘭匝道假日早晨湧入大量自駕與包車環湖人潮。',
    hourly_curve: [
      0.02, 0.01, 0.01, 0.02, 0.05, 0.22, 0.62, 0.90,
      1.00, 0.95, 0.86, 0.78, 0.74, 0.80, 0.88, 0.94,
      0.96, 0.88, 0.74, 0.55, 0.35, 0.20, 0.10, 0.05
    ]
  },
  {
    corridor_id: 'tourism_taichung_lukang',
    name: '台中/彰化 ➔ 彰化鹿港文化老街 (台76/國1古蹟文創線)',
    mode_id: 'tourism_highway',
    mode_name: '觀光旅遊流向 (eTag+客運)',
    color: '#FB7185',
    region: 'Central',
    origin: '彰化',
    destination: '彰化鹿港文化老街',
    origin_coord: [24.0815, 120.5385],
    dest_coord: [24.0568, 120.4354],
    pax_type: 'tourist',
    volume: 18500,
    total_vol: 18500,
    volume_workday: 4600,
    volume_holiday: 23800,
    day_type_factor: { workday: 0.25, holiday: 3.12 },
    vehicle_mix: '車種 31 休旅小客車 78% · 車種 41 進香團/國旅大客車 22%',
    highway_tag: '台 76 快速道路 / 國道 1 號彰化交流道',
    commercial_desc: '鹿港天后宮進香與老街文創深度遊，假日遊覽車與中部家庭聚集地。',
    hourly_curve: [
      0.02, 0.01, 0.01, 0.02, 0.04, 0.14, 0.42, 0.78,
      0.96, 1.00, 0.92, 0.85, 0.80, 0.86, 0.92, 0.95,
      0.88, 0.78, 0.60, 0.40, 0.25, 0.14, 0.08, 0.04
    ]
  },
  {
    corridor_id: 'tourism_chiayi_alishan',
    name: '嘉義高鐵/火車站 ➔ 阿里山森林國家風景區 (台18觀光專線)',
    mode_id: 'thb_bus',
    mode_name: '台灣好行/阿里山觀光接駁',
    color: '#F97316',
    region: 'South',
    origin: '嘉義',
    destination: '嘉義阿里山國家風景區',
    origin_coord: [23.4795, 120.4410],
    dest_coord: [23.5112, 120.8042],
    pax_type: 'tourist',
    volume: 17200,
    total_vol: 17200,
    volume_workday: 4500,
    volume_holiday: 22100,
    day_type_factor: { workday: 0.26, holiday: 3.18 },
    vehicle_mix: '台灣好行/高山客運 46% · 車種 41 登山遊覽車 28% · 自駕車 26%',
    highway_tag: '阿里山公路 (台 18 線) / 國 3 中埔交流道',
    commercial_desc: '日出、巨木與高山茶園朝聖路線，假日早晨中埔交流道通往阿里山車潮顯著。',
    hourly_curve: [
      0.15, 0.12, 0.08, 0.15, 0.35, 0.65, 0.90, 1.00,
      0.95, 0.88, 0.82, 0.75, 0.72, 0.78, 0.85, 0.88,
      0.78, 0.65, 0.48, 0.32, 0.20, 0.12, 0.08, 0.05
    ]
  },
  {
    corridor_id: 'tourism_kaohsiung_kenting',
    name: '高雄市中心 ➔ 屏東墾丁大街南灣 (台88/國3轉南迴度假快線)',
    mode_id: 'tourism_highway',
    mode_name: '觀光旅遊流向 (eTag+客運)',
    color: '#FB7185',
    region: 'South',
    origin: '左營',
    destination: '屏東墾丁大街南灣',
    origin_coord: [22.6872, 120.3075],
    dest_coord: [21.9432, 120.7985],
    pax_type: 'tourist',
    volume: 33800,
    total_vol: 33800,
    volume_workday: 8800,
    volume_holiday: 43500,
    day_type_factor: { workday: 0.26, holiday: 3.32 },
    vehicle_mix: '車種 31 長途自駕休旅車 78% · 車種 41 墾丁快線/包車 22%',
    highway_tag: '台 88 線 / 國道 3 號南州交流道 / 台 1 線 / 台 26 線',
    commercial_desc: '南台灣最標誌性海洋度假聖地，連續假期南州交流道與水底寮路段湧現巨大車潮。',
    hourly_curve: [
      0.04, 0.02, 0.01, 0.02, 0.06, 0.24, 0.60, 0.88,
      0.98, 1.00, 0.94, 0.85, 0.78, 0.82, 0.88, 0.94,
      0.98, 0.92, 0.80, 0.62, 0.42, 0.25, 0.12, 0.06
    ]
  }
];

export const FREIGHT_AND_TOURISM_MODES_META = [
  {
    id: 'freight_highway',
    key: '國道產業物流 (eTag 32/42/52)',
    short_name: '🚛 國道物流',
    type: '產業供應鏈高速走廊',
    color: '#10B981',
    color_glow: 'rgba(16, 185, 129, 0.45)',
    speed: '70-90 km/h',
    scope: '全台海空港、工業區與科學園區',
    icon: 'Truck'
  },
  {
    id: 'tourism_highway',
    key: '觀光旅遊流向 (eTag 41/31)',
    short_name: '🧳 觀光旅遊',
    type: '跨城度假風景名勝走廊',
    color: '#F97316',
    color_glow: 'rgba(249, 115, 22, 0.45)',
    speed: '60-100 km/h',
    scope: '全台國家風景區、老街與溫泉度假區',
    icon: 'Compass'
  }
];
