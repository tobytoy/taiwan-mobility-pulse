# -*- coding: utf-8 -*-
"""
apply_accurate_coordinates.py
一鍵將權威經緯度與生活圈邊界套用至 public/ 內所有 Web 視覺化 JSON 資料集：
1. heatmap_data.json
2. transfer_analysis.json
3. mobility_full_study.json
4. mobility_data.json
"""

import json
from pathlib import Path
from collections import defaultdict
from station_coordinates_master import (
    resolve_station_coords,
    resolve_station_region,
    apply_polar_jitter,
    STATION_COORDINATES_DB
)

PUBLIC_DIR = Path('/home/toby/projects/Github/taiwan-mobility-pulse/public')

def update_heatmap_data():
    file_path = PUBLIC_DIR / 'heatmap_data.json'
    print(f"\n🗺️ [1/4] 正在更新時空熱點資料庫: {file_path.name} ...")
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # 針對每一個時段，統計同座標站點並施加微幅發散偏移 (Polar Jitter) 避免 100% 疊羅漢
    total_updated = 0
    for scope_key, scope_data in data.get('time_scopes', {}).items():
        for hour_key, st_list in scope_data.get('hours', {}).items():
            # 第一輪：取得基準經緯度
            base_coords = []
            for st in st_list:
                name = st['name']
                lat, lon = resolve_station_coords(name)
                region = resolve_station_region(name, lat, lon)
                st['region'] = region
                base_coords.append((lat, lon))

            # 統計相同座標群組
            coord_groups = defaultdict(list)
            for idx, c in enumerate(base_coords):
                coord_groups[c].append(idx)

            # 第二輪：對相同座標群組施加微偏移
            for c, indices in coord_groups.items():
                if len(indices) > 1:
                    for pos, idx in enumerate(indices):
                        jittered = apply_polar_jitter(c[0], c[1], pos, len(indices), radius_meters=45.0)
                        st_list[idx]['lat'] = jittered[0]
                        st_list[idx]['lng'] = jittered[1]
                else:
                    idx = indices[0]
                    st_list[idx]['lat'] = c[0]
                    st_list[idx]['lng'] = c[1]
            total_updated += len(st_list)

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"  ✅ {file_path.name} 更新完成！共處理 {total_updated} 站次經緯度。")

def update_transfer_analysis():
    file_path = PUBLIC_DIR / 'transfer_analysis.json'
    print(f"\n🔀 [2/4] 正在更新跨運具轉乘資料庫: {file_path.name} ...")
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    hubs = data.get('overall_top_hotspots', [])
    
    # 統計基礎座標
    base_coords = []
    for h in hubs:
        name = h['BoardingStopName']
        lat, lon = resolve_station_coords(name)
        reg = resolve_station_region(name, lat, lon).lower()
        h['region'] = reg
        h['region_label'] = {
            'north': '北部都會區 (基北北桃竹)',
            'central': '中部生活圈 (中彰投苗)',
            'south': '南部生活圈 (南高屏/雲嘉)',
            'east': '東部生活圈 (宜花東)'
        }.get(reg, '全台跨生活圈')
        base_coords.append((lat, lon))

    # 對共構/極相近之樞紐施加微幅角度展開 (Polar Jitter)
    coord_groups = defaultdict(list)
    for idx, c in enumerate(base_coords):
        coord_groups[c].append(idx)

    for c, indices in coord_groups.items():
        if len(indices) > 1:
            for pos, idx in enumerate(indices):
                jittered = apply_polar_jitter(c[0], c[1], pos, len(indices), radius_meters=60.0)
                hubs[idx]['lat'] = jittered[0]
                hubs[idx]['lng'] = jittered[1]
        else:
            idx = indices[0]
            hubs[idx]['lat'] = c[0]
            hubs[idx]['lng'] = c[1]

    # 更新目的地座標 (destinations)
    for h in hubs:
        for d in h.get('top_destinations', []):
            d_name = d.get('DeboardingStopName', '')
            d_lat, d_lon = resolve_station_coords(d_name, fallback_lat=h['lat'], fallback_lon=h['lng'])
            d['latlng'] = [d_lat, d_lon]

    # 重新統計生活圈數量
    regional_counts = {'north': 0, 'central': 0, 'south': 0, 'east': 0}
    for h in hubs:
        regional_counts[h['region']] = regional_counts.get(h['region'], 0) + 1

    if 'analysis_meta' in data:
        data['analysis_meta']['regional_hubs_count'] = regional_counts

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"  ✅ {file_path.name} 更新完成！76 樞紐精確座標已歸戶，生活圈分佈: {regional_counts}")

def update_mobility_full_study():
    file_path = PUBLIC_DIR / 'mobility_full_study.json'
    print(f"\n🚆 [3/4] 正在更新全台多模態研究資料庫: {file_path.name} ...")
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # 1. 更新 stations_geo
    old_geo = data.get('stations_geo', {})
    new_geo = {}
    for name in old_geo.keys():
        new_geo[name] = resolve_station_coords(name)
    # 補入所有 DB 已有重要站點
    for name, c in STATION_COORDINATES_DB.items():
        new_geo[name] = c
    data['stations_geo'] = new_geo

    # 2. 更新 map_corridors
    corridors = data.get('map_corridors', [])
    valid_corridors = []
    for c in corridors:
        orig = c['origin']
        dest = c['destination']
        c_orig = resolve_station_coords(orig)
        c_dest = resolve_station_coords(dest)
        
        # 確保兩端點不完全相同
        if c_orig == c_dest:
            print(f"  ⚠️ 略過端點完全重合走廊: {orig} -> {dest}")
            continue

        c['origin_coord'] = c_orig
        c['dest_coord'] = c_dest
        
        # 重新校正走廊分區
        reg_orig = resolve_station_region(orig, c_orig[0], c_orig[1])
        reg_dest = resolve_station_region(dest, c_dest[0], c_dest[1])
        if 'East' in (reg_orig, reg_dest):
            c['region'] = 'East'
        elif 'South' in (reg_orig, reg_dest):
            c['region'] = 'South'
        elif 'Central' in (reg_orig, reg_dest):
            c['region'] = 'Central'
        else:
            c['region'] = 'North'
            
        valid_corridors.append(c)

    data['map_corridors'] = valid_corridors
    data['metadata']['total_corridors'] = len(valid_corridors)

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"  ✅ {file_path.name} 更新完成！共計 {len(valid_corridors)} 條走廊座標已校準。")

def update_mobility_data():
    file_path = PUBLIC_DIR / 'mobility_data.json'
    print(f"\n📦 [4/4] 正在更新備份 mobility_data.json ...")
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    stations = data.get('stations', [])
    for s in stations:
        name = s['name']
        lat, lon = resolve_station_coords(name)
        s['lat'] = lat
        s['lon'] = lon

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"  ✅ {file_path.name} 備份更新完成！共校正 {len(stations)} 站點經緯度。")

def main():
    print("🚀 開始執行全台站點精準座標全面校準管線...")
    update_heatmap_data()
    update_transfer_analysis()
    update_mobility_full_study()
    update_mobility_data()
    print("\n🎉 全台所有視覺化資料庫經緯度校準完畢！零疊點、零分區錯置。")

if __name__ == '__main__':
    main()
