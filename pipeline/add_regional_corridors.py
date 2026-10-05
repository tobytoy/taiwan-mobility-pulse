#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
補齊全台中部、南部、東部之銀髮醫療就醫與學生通學核心大眾運輸走廊
確保全台四大區域在 FlowMap (流向圖) 與 Heatmap (熱點圖) 在各客群維度下邏輯一致、數據自洽。
"""

import json
from pathlib import Path

STUDY_JSON = Path('/home/toby/projects/Github/taiwan-mobility-pulse/public/mobility_full_study.json')

SENIOR_HOURLY = [
    0.01, 0.0, 0.0, 0.0, 0.01, 0.11, 0.25, 0.39, 0.63, 0.85, 
    1.0, 0.98, 0.8, 0.78, 0.79, 0.77, 0.79, 0.7, 0.49, 0.33, 
    0.24, 0.19, 0.09, 0.02
]

STUDENT_HOURLY = [
    0.02, 0.01, 0.0, 0.0, 0.0, 0.02, 0.27, 0.65, 0.38, 0.33, 
    0.31, 0.35, 0.44, 0.43, 0.41, 0.44, 0.99, 1.0, 0.68, 0.44, 
    0.4, 0.42, 0.26, 0.08
]

NEW_STATIONS_GEO = {
    # Central
    "台中榮總": [24.1852, 120.6015],
    "中國醫藥大學": [24.1542, 120.6823],
    "逢甲大學": [24.1798, 120.6488],
    "中興大學": [24.1205, 120.6738],
    "東海大學": [24.1815, 120.6033],
    "彰化基督教醫院": [24.0683, 120.5471],
    "衛福部苗栗醫院": [24.5615, 120.8228],
    
    # South
    "高雄長庚": [22.6517, 120.3542],
    "高雄榮總": [22.6775, 120.3195],
    "高醫大附醫": [22.6465, 120.3101],
    "成大醫院": [23.0039, 120.2223],
    "成功大學": [22.9997, 120.2185],
    "中山大學": [22.6248, 120.2642],
    "高科大建工": [22.6513, 120.3275],
    "高雄中學": [22.6375, 120.2985],
    "屏東榮民總醫院": [22.6687, 120.4782],
    
    # East
    "花蓮慈濟醫院": [24.0042, 121.5976],
    "東華大學": [23.8943, 121.5435],
    "馬偕台東分院": [22.7635, 121.1442],
    "宜蘭大學": [24.7471, 121.7483]
}

REGIONAL_CORRIDORS_SPECS = [
    # ==================== CENTRAL (中部) ====================
    # --- Senior (銀髮醫療) ---
    {
        "region": "Central", "pax_type": "senior", "color": "#F43F5E",
        "mode_id": "senior_bus", "mode_name": "公車 300 (台灣大道幹線)", "category": "醫療就醫動脈",
        "pairs": [("台中", "台中榮總", 32500), ("台中榮總", "台中", 31800)]
    },
    {
        "region": "Central", "pax_type": "senior", "color": "#F43F5E",
        "mode_id": "senior_bus", "mode_name": "公車 35 (崇德幹線)", "category": "醫療就醫動脈",
        "pairs": [("台中", "中國醫藥大學", 28400), ("中國醫藥大學", "台中", 27900)]
    },
    {
        "region": "Central", "pax_type": "senior", "color": "#F43F5E",
        "mode_id": "senior_bus", "mode_name": "彰化市區公車 1路", "category": "醫療就醫動脈",
        "pairs": [("彰化", "彰化基督教醫院", 24500), ("彰化基督教醫院", "彰化", 24100)]
    },
    # --- Student (學生通學) ---
    {
        "region": "Central", "pax_type": "student", "color": "#10B981",
        "mode_id": "student_bus", "mode_name": "公車 25/35 (逢甲大學通學專車)", "category": "大專院校通學專線",
        "pairs": [("台中", "逢甲大學", 42000), ("逢甲大學", "台中", 41200)]
    },
    {
        "region": "Central", "pax_type": "student", "color": "#10B981",
        "mode_id": "student_bus", "mode_name": "公車 73 (興大校園幹線)", "category": "大專院校通學專線",
        "pairs": [("台中", "中興大學", 36500), ("中興大學", "台中", 35900)]
    },
    {
        "region": "Central", "pax_type": "student", "color": "#10B981",
        "mode_id": "student_bus", "mode_name": "公車 300 (東海大學專線)", "category": "大專院校通學專線",
        "pairs": [("台中", "東海大學", 34200), ("東海大學", "台中", 33800)]
    },
    {
        "region": "Central", "pax_type": "student", "color": "#10B981",
        "mode_id": "tra", "mode_name": "臺鐵通學區間車", "category": "跨縣市高中職通學",
        "pairs": [("臺中", "彰化", 48500), ("彰化", "臺中", 47800)]
    },

    # ==================== SOUTH (南部) ====================
    # --- Senior (銀髮醫療) ---
    {
        "region": "South", "pax_type": "senior", "color": "#F43F5E",
        "mode_id": "senior_bus", "mode_name": "公車 60覺民幹線 (長庚就醫號)", "category": "醫療就醫動脈",
        "pairs": [("高雄車站", "高雄長庚", 36200), ("高雄長庚", "高雄車站", 35800)]
    },
    {
        "region": "South", "pax_type": "senior", "color": "#F43F5E",
        "mode_id": "senior_bus", "mode_name": "公車 紅35 (高榮接駁線)", "category": "醫療就醫動脈",
        "pairs": [("左營", "高雄榮總", 33400), ("高雄榮總", "左營", 32900)]
    },
    {
        "region": "South", "pax_type": "senior", "color": "#F43F5E",
        "mode_id": "senior_bus", "mode_name": "公車 紅28 (高醫就醫號)", "category": "醫療就醫動脈",
        "pairs": [("美麗島", "高醫大附醫", 29800), ("高醫大附醫", "美麗島", 29400)]
    },
    {
        "region": "South", "pax_type": "senior", "color": "#F43F5E",
        "mode_id": "senior_bus", "mode_name": "大台南公車 綠幹線 (成醫就醫專車)", "category": "醫療就醫動脈",
        "pairs": [("台南", "成大醫院", 31200), ("成大醫院", "台南", 30700)]
    },
    # --- Student (學生通學) ---
    {
        "region": "South", "pax_type": "student", "color": "#10B981",
        "mode_id": "student_bus", "mode_name": "公車 橘1 (中山大學校園專車)", "category": "大專院校通學專線",
        "pairs": [("哈瑪星", "中山大學", 39500), ("中山大學", "哈瑪星", 38900)]
    },
    {
        "region": "South", "pax_type": "student", "color": "#10B981",
        "mode_id": "student_bus", "mode_name": "大台南公車 2路 (成功大學通學核心)", "category": "大專院校通學專線",
        "pairs": [("台南", "成功大學", 46800), ("成功大學", "台南", 46100)]
    },
    {
        "region": "South", "pax_type": "student", "color": "#10B981",
        "mode_id": "student_bus", "mode_name": "公車 16路 (高科大建工專車)", "category": "大專院校通學專線",
        "pairs": [("巨蛋", "高科大建工", 35200), ("高科大建工", "巨蛋", 34700)]
    },
    {
        "region": "South", "pax_type": "student", "color": "#10B981",
        "mode_id": "student_bus", "mode_name": "市區通學步行/公車專線", "category": "明星高中通學圈",
        "pairs": [("高雄車站", "高雄中學", 31500), ("高雄中學", "高雄車站", 31000)]
    },
    {
        "region": "South", "pax_type": "student", "color": "#10B981",
        "mode_id": "tra", "mode_name": "臺鐵南高通學通勤列車", "category": "跨縣市大專通學",
        "pairs": [("臺南", "高雄", 52000), ("高雄", "臺南", 51200)]
    },

    # ==================== EAST (東部) ====================
    # --- Senior (銀髮醫療) ---
    {
        "region": "East", "pax_type": "senior", "color": "#F43F5E",
        "mode_id": "senior_bus", "mode_name": "花蓮客運 301 (慈濟就醫專車)", "category": "醫療就醫動脈",
        "pairs": [("花蓮", "花蓮慈濟醫院", 26400), ("花蓮慈濟醫院", "花蓮", 25900)]
    },
    {
        "region": "East", "pax_type": "senior", "color": "#F43F5E",
        "mode_id": "senior_bus", "mode_name": "台東市區循環線 (馬偕就醫專車)", "category": "醫療就醫動脈",
        "pairs": [("台東", "馬偕台東分院", 19500), ("馬偕台東分院", "台東", 19100)]
    },
    # --- Student (學生通學) ---
    {
        "region": "East", "pax_type": "student", "color": "#10B981",
        "mode_id": "student_bus", "mode_name": "花蓮公車 301 (東華大學校園專車)", "category": "大專院校通學專線",
        "pairs": [("花蓮", "東華大學", 38200), ("東華大學", "花蓮", 37600)]
    },
    {
        "region": "East", "pax_type": "student", "color": "#10B981",
        "mode_id": "student_bus", "mode_name": "宜蘭公車 771 (宜大通學線)", "category": "大專院校通學專線",
        "pairs": [("宜蘭", "宜蘭大學", 27800), ("宜蘭大學", "宜蘭", 27400)]
    }
]

def main():
    print("📖 讀取 mobility_full_study.json...")
    with open(STUDY_JSON, 'r', encoding='utf-8') as f:
        data = json.load(f)

    stations_geo = data.get('stations_geo', {})
    # 更新新車站經緯度
    for st, coord in NEW_STATIONS_GEO.items():
        stations_geo[st] = coord

    corridors = data.get('map_corridors', [])
    initial_count = len(corridors)

    added_count = 0
    for spec in REGIONAL_CORRIDORS_SPECS:
        reg = spec["region"]
        pax = spec["pax_type"]
        color = spec["color"]
        m_id = spec["mode_id"]
        m_name = spec["mode_name"]
        cat = spec["category"]
        curve = SENIOR_HOURLY if pax == "senior" else STUDENT_HOURLY
        c_idx = 0.35 if pax == "senior" else 1.65

        for orig, dest, vol in spec["pairs"]:
            if orig not in stations_geo:
                print(f"⚠️ 找不到起點經緯度: {orig}")
                continue
            if dest not in stations_geo:
                print(f"⚠️ 找不到迄點經緯度: {dest}")
                continue

            corridor_obj = {
                "mode_id": m_id,
                "mode_name": m_name,
                "color": color,
                "region": reg,
                "origin": orig,
                "destination": dest,
                "origin_coord": stations_geo[orig],
                "dest_coord": stations_geo[dest],
                "volume": float(vol),
                "total_vol": float(vol),
                "day_type": "Weekday",
                "pax_type": pax,
                "commuter_idx": c_idx,
                "hourly_curve": curve,
                "category": cat
            }
            corridors.append(corridor_obj)
            added_count += 1

    data['stations_geo'] = stations_geo
    data['map_corridors'] = corridors

    print(f"✅ 成功補齊全台走廊！原走廊數: {initial_count} ➜ 新走廊數: {len(corridors)} (新增 {added_count} 條跨區長者與學生走廊)")

    with open(STUDY_JSON, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("💾 已寫入 public/mobility_full_study.json！")

if __name__ == '__main__':
    main()
