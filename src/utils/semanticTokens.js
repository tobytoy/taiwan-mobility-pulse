/**
 * 臺灣多模態公共運輸票證大數據分析平台 (Taiwan Mobility Pulse)
 * 三層語義色彩系統 (3-Tier Semantic Token System)
 * 
 * 核心架構規範：
 * 1. Tier 1: 客群語義色 (Persona Semantic Tokens) - 全站客群人像身分唯一依據
 * 2. Tier 2: 運具模態官方色 (Transit Mode Tokens) - 交通部與各捷運局標準運具代表色
 * 3. Tier 3: 狀態與天候示警色 (State & Weather Alert Tokens) - 動態晴雨衝擊、生活圈評級與沙漠缺口
 */

// ============================================================================
// Tier 1: 客群語義色 (Persona Semantic Tokens)
// ============================================================================
export const PERSONA_TOKENS = {
  commuter: {
    id: 'commuter',
    name: '通勤剛需',
    label: '💼 通勤剛需族',
    color: '#38BDF8', // 晴空藍 (Sky Blue)
    fillColor: '#0284C7',
    glow: 'rgba(56, 189, 248, 0.4)',
    desc: '全票自費成人、平日早晚尖峰潮汐通勤族',
    benchmarkRate: 75
  },
  tpass: {
    id: 'tpass',
    name: 'TPASS月票',
    label: '💳 TPASS月票族',
    color: '#A855F7', // 賽博紫 (Cyber Purple)
    fillColor: '#7E22CE',
    glow: 'rgba(168, 85, 247, 0.4)',
    desc: '都會定期票持有者、常態高頻通勤探索者',
    benchmarkRate: 25
  },
  tourist: {
    id: 'tourist',
    name: '觀光休閒',
    label: '🧳 觀光休閒族',
    color: '#F97316', // 暖陽橘 (Warm Orange)
    fillColor: '#EA580C',
    glow: 'rgba(249, 115, 22, 0.4)',
    desc: '單程票、外地遊客、週末假日景區休閒人潮',
    benchmarkRate: 20
  },
  senior: {
    id: 'senior',
    name: '銀髮長者',
    label: '👵 銀髮長者族',
    color: '#F43F5E', // 薔薇粉紅 (Rose Pink - 嚴格區別於天候大紅)
    fillColor: '#E11D48',
    glow: 'rgba(244, 63, 94, 0.4)',
    desc: '敬老愛心卡、日間就醫慢箋與傳統市集生活圈',
    benchmarkRate: 28
  },
  student: {
    id: 'student',
    name: '學生通學',
    label: '🎓 學生通學族',
    color: '#10B981', // 翡翠綠 (Emerald Green)
    fillColor: '#059669',
    glow: 'rgba(16, 185, 129, 0.4)',
    desc: '學生優惠卡、大專與高中校園、課後補習接駁',
    benchmarkRate: 15
  },
  business: {
    id: 'business',
    name: '彈性商務',
    label: '👔 彈性商務族',
    color: '#EAB308', // 琥珀金 (Amber Gold)
    fillColor: '#CA8A04',
    glow: 'rgba(234, 179, 8, 0.4)',
    desc: '跨區洽公、日間會議與商辦離峰移動',
    benchmarkRate: 12
  }
};

// ============================================================================
// Tier 2: 運具模態官方色 (Transit Mode Tokens)
// ============================================================================
export const TRANSIT_MODE_TOKENS = {
  thsr: {
    id: 'thsr',
    name: '台灣高鐵',
    shortName: '高鐵',
    color: '#F97316', // 高鐵橘
    glow: 'rgba(249, 115, 22, 0.5)',
    type: '城際高鐵',
    speed: '250~300 km/h'
  },
  tra: {
    id: 'tra',
    name: '台灣鐵路',
    shortName: '臺鐵',
    color: '#3B82F6', // 臺鐵藍
    glow: 'rgba(59, 130, 246, 0.5)',
    type: '傳統鐵路',
    speed: '80~130 km/h'
  },
  trtc: {
    id: 'trtc',
    name: '台北捷運',
    shortName: '北捷',
    color: '#10B981', // 北捷翡翠綠
    glow: 'rgba(16, 185, 129, 0.5)',
    type: '都會高運量',
    speed: '35~80 km/h'
  },
  krtc: {
    id: 'krtc',
    name: '高雄捷運',
    shortName: '高捷',
    color: '#EF4444', // 高捷紅
    glow: 'rgba(239, 68, 68, 0.5)',
    type: '都會捷運',
    speed: '35~80 km/h'
  },
  tymc: {
    id: 'tymc',
    name: '桃園捷運',
    shortName: '桃捷',
    color: '#8B5CF6', // 桃捷紫
    glow: 'rgba(139, 92, 246, 0.5)',
    type: '機場聯外',
    speed: '45~90 km/h'
  },
  tmrt: {
    id: 'tmrt',
    name: '台中捷運',
    shortName: '中捷',
    color: '#14B8A6', // 中捷青綠
    glow: 'rgba(20, 184, 166, 0.5)',
    type: '都會中運量',
    speed: '35~75 km/h'
  },
  ntmc: {
    id: 'ntmc',
    name: '新北捷運',
    shortName: '新北捷',
    color: '#EC4899', // 輕軌粉桃
    glow: 'rgba(236, 72, 153, 0.5)',
    type: '區域輕軌',
    speed: '25~60 km/h'
  },
  tpe_bus: {
    id: 'tpe_bus',
    name: '台北市公車',
    shortName: '市區公車',
    color: '#0284C7', // 公車天藍
    glow: 'rgba(2, 132, 199, 0.5)',
    type: '市區公車',
    speed: '15~40 km/h'
  },
  nwt_bus: {
    id: 'nwt_bus',
    name: '新北市公車',
    shortName: '新北公車',
    color: '#06B6D4', // 青天藍
    glow: 'rgba(6, 182, 212, 0.5)',
    type: '都會公車',
    speed: '15~40 km/h'
  },
  thb_bus: {
    id: 'thb_bus',
    name: '公路客運',
    shortName: '公路客運',
    color: '#6366F1', // 國道靛藍
    glow: 'rgba(99, 102, 241, 0.5)',
    type: '城際國道',
    speed: '60~100 km/h'
  },
  taipei_bike: {
    id: 'taipei_bike',
    name: 'YouBike公共自行車',
    shortName: 'YouBike',
    color: '#EAB308', // 微笑亮黃
    glow: 'rgba(234, 179, 8, 0.5)',
    type: '第一與最後一哩',
    speed: '10~20 km/h'
  }
};

// ============================================================================
// Tier 3: 狀態與天候示警色 (State & Weather Alert Tokens)
// ============================================================================
export const ALERT_STATE_TOKENS = {
  // 天候動態示警 (晴雨衝擊實測)
  weather_surge: {
    id: 'weather_surge',
    label: '避雨湧浪樞紐',
    color: '#DC2626', // 烈焰紅 (Crimson Fire Red - 與長者薔薇粉紅明確區隔)
    border: '#EF4444',
    fillColor: '#B91C1C',
    glow: 'rgba(220, 38, 38, 0.75)',
    badge: '🔥 避雨湧浪 (+10%以上湧入)',
    desc: '雨天時自駕回堵、摩托轉乘文湖/板南或地下道連通大避雨'
  },
  weather_freeze: {
    id: 'weather_freeze',
    label: '戶外急凍降溫',
    color: '#0284C7', // 冰河冷藍 (Glacier Frost Blue)
    border: '#38BDF8',
    fillColor: '#0369A1',
    glow: 'rgba(2, 132, 199, 0.45)',
    badge: '❄️ 戶外急凍 (-25%以上蒸發)',
    desc: '戶外觀光水岸急凍、長者防跌大幅延期門診與取消出行'
  },
  weather_normal: {
    id: 'weather_normal',
    label: '剛性維繫穩定',
    color: '#64748B',
    desc: '剛性通勤通學基本盤維繫正常波動 (-8% ~ +8%)'
  },

  // 15分鐘微生活圈機能評級 (TOD Living Amenities)
  amenity_a_plus: {
    id: 'amenity_a_plus',
    label: 'A+ 卓越生活圈 (80+分)',
    color: '#10B981',
    desc: '全方位生活機能極度豐沛、醫療商業文教均衡'
  },
  amenity_a: {
    id: 'amenity_a',
    label: 'A 活力生活圈 (60~79分)',
    color: '#38BDF8',
    desc: '主要機能健全、商業活躍'
  },
  amenity_b: {
    id: 'amenity_b',
    label: 'B 偏斜機能圈 (40~59分)',
    color: '#F59E0B',
    desc: '機能偏向純住宅或純辦公，缺乏特定生活支援'
  },
  amenity_c: {
    id: 'amenity_c',
    label: 'C 匱乏待補區 (<40分)',
    color: '#991B1B',
    desc: '生活機能顯著匱乏，亟需市政公車與醫療巡迴'
  },
  amenity_desert: {
    id: 'amenity_desert',
    label: '🚨 複合機能沙漠缺口',
    color: '#DC2626',
    desc: '周邊 500m 缺乏家醫診所或生鮮超商之關鍵缺口'
  }
};

// ============================================================================
// 輔助函式：快速安全查詢
// ============================================================================
export function getPersonaColor(personaId, fallback = '#38BDF8') {
  return PERSONA_TOKENS[personaId]?.color || fallback;
}

export function getTransitModeColor(modeId, fallback = '#38BDF8') {
  return TRANSIT_MODE_TOKENS[modeId]?.color || fallback;
}

export function getAlertColor(alertId, fallback = '#DC2626') {
  return ALERT_STATE_TOKENS[alertId]?.color || fallback;
}
