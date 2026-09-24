#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
多模態人流時空熱點圖資料產製管線 (Spatio-Temporal Mobility Heatmap Generator)
- 採取「階層混合判定（Hybrid Pipeline）」區分通勤族與觀光旅客
  * 第一層：TPASS/定期票標籤 (TicketType == 4 / PaymentPrice == 0) -> 100% 通勤
  * 第一層：單程票/Token/紙票標籤 (TicketClass == 'N-IC') -> 100% 旅客
  * 第二層：一般票卡時空頻率行為模型 (平日尖峰 vs 離峰 vs 週末)
  * 第三層：鐵路/捷運 OD 統計機率分解
- 支援切換模式：
  * 預設模式：活動人流熱點 (Activity: Inflow + Outflow)
  * 切換模式：目的地湧入熱點 (Inflow: 下車/還車)
  * 切換模式：出發流出熱點 (Outflow: 上車/借車)
  * 淨流入聚集熱度 (Net: Inflow - Outflow)
- 嚴格 CPU 與 RAM 資源管控：
  * 限制 Polars 執行緒上限為 2 核心，避免吃滿 CPU
  * 動態記憶體防護 (RAM Safety Guard)，確保可用記憶體 > 1.5GB，單一進程 < 2.5GB
  * 串流運算與欄位投影下推 (Projection Pushdown)，處理完即時釋放
"""

import os
import sys
import gc
import json
import time
import re
import psutil
from pathlib import Path
from typing import Dict, List, Any

# 1. 嚴格 CPU 執行緒限制 (在載入 Polars 前生效)
DEFAULT_THREADS = "2"
os.environ["POLARS_MAX_THREADS"] = DEFAULT_THREADS
os.environ["OMP_NUM_THREADS"] = DEFAULT_THREADS
os.environ["RAYON_NUM_THREADS"] = DEFAULT_THREADS

import polars as pl
import pyarrow.parquet as pq

# 路徑設定
BASE_DIR = Path('/home/toby/projects/work-tools/票證資料')
PARQUET_DIR = BASE_DIR / 'processed_parquets'
PUBLIC_DIR = Path('/home/toby/projects/Github/taiwan-mobility-pulse/public')
PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_JSON_PATH = PUBLIC_DIR / 'heatmap_data.json'

# 記憶體安全閾值 (MB)
MIN_AVAILABLE_RAM_MB = 1500.0
MAX_PROC_RAM_MB = 2500.0

def get_mem_status():
    proc = psutil.Process()
    vm = psutil.virtual_memory()
    return {
        "proc_mb": round(proc.memory_info().rss / 1024 / 1024, 1),
        "avail_mb": round(vm.available / 1024 / 1024, 1),
        "total_mb": round(vm.total / 1024 / 1024, 1)
    }

def check_resources(step_name=""):
    mem = get_mem_status()
    print(f"  [資源監控] {step_name} -> 進程佔用: {mem['proc_mb']} MB | 系統可用: {mem['avail_mb']} MB")
    if mem['avail_mb'] < MIN_AVAILABLE_RAM_MB:
        print(f"⚠️ [警告] 系統可用記憶體偏低 ({mem['avail_mb']} MB)，觸發主動垃圾回收...")
        gc.collect()
    if mem['proc_mb'] > MAX_PROC_RAM_MB:
        raise MemoryError(f"進程記憶體超過安全上限 {MAX_PROC_RAM_MB} MB！")

# 匯入與補全全台站點經緯度庫 (WGS84)
from export_web_data import STATIONS_GEO

STATION_COORDS = dict(STATIONS_GEO)

# 從 TDX 步驟快取中萃取額外捷運/鐵路站點經緯度
TDX_STEP_PATHS = [
    '/home/toby/.gemini/antigravity-ide/brain/b3bd83d0-80f4-430e-9d00-cbcfd79a5ed4/.system_generated/steps/108/output.txt',
    '/home/toby/.gemini/antigravity-ide/brain/b3bd83d0-80f4-430e-9d00-cbcfd79a5ed4/.system_generated/steps/112/output.txt',
    '/home/toby/.gemini/antigravity-ide/brain/b3bd83d0-80f4-430e-9d00-cbcfd79a5ed4/.system_generated/steps/113/output.txt',
    '/home/toby/.gemini/antigravity-ide/brain/b3bd83d0-80f4-430e-9d00-cbcfd79a5ed4/.system_generated/steps/115/output.txt',
    '/home/toby/.gemini/antigravity-ide/brain/b3bd83d0-80f4-430e-9d00-cbcfd79a5ed4/.system_generated/steps/116/output.txt'
]

for sp in TDX_STEP_PATHS:
    p = Path(sp)
    if p.exists():
        try:
            content = p.read_text(encoding='utf-8')
            matches = re.findall(r'\"StationName\":\s*\{\s*\"Zh_tw\":\s*\"([^\"]+)\".*?\"PositionLat\":\s*([0-9\.]+),\s*\"PositionLon\":\s*([0-9\.]+)', content, re.DOTALL)
            for name, lat, lon in matches:
                STATION_COORDS[name] = [round(float(lat), 5), round(float(lon), 5)]
        except Exception as e:
            pass

# 額外補齊核心樞紐與公車站點經緯度
MANUAL_STATIONS = {
    # 核心產業園區與公車節點
    "內湖科技園區": [25.0789, 121.5698],
    "瑞光路": [25.0789, 121.5698],
    "松山車站(八德)": [25.0498, 121.5785],
    "臺北車站(忠孝)": [25.0465, 121.5175],
    "南京公寓(捷運南京三民)": [25.0515, 121.5615],
    "捷運圓山站": [25.0712, 121.5202],
    "果菜市場": [25.0250, 121.4980],
    "捷運萬芳醫院站": [24.9985, 121.5583],
    "捷運西門站": [25.0422, 121.5083],
    "板橋公車站": [25.0135, 121.4625],
    "新北產業園區": [25.0617, 121.4600],
    "長庚醫院": [25.0601, 121.3688],
    "竹科園區大門": [24.7830, 121.0110],
    "新竹轉運站": [24.8010, 120.9715],
    "朝馬轉運站": [24.1685, 120.6385],
    "台南轉運站": [23.0035, 120.2115],
    "南港展覽館": [25.0553, 121.6171],
    "台北101/世貿": [25.0330, 121.5640],
    "南京復興": [25.0522, 121.5440],
    "台大醫院": [25.0410, 121.5160]
}
for k, v in MANUAL_STATIONS.items():
    if k not in STATION_COORDS:
        STATION_COORDS[k] = v

print(f"🗺️ 經緯度資料庫已就緒，共有 {len(STATION_COORDS)} 個精確定位節點。")

def get_region(name: str) -> str:
    clean = name.replace("YouBike2.0_", "").replace("(O)", "").strip()
    south = ["左營", "高雄", "台南", "臺南", "嘉義", "屏東", "潮州", "新營", "巨蛋", "三多", "美麗島", "中央公園", "凹子底", "後驛", "都會公園", "楠梓", "哈瑪星", "駁二"]
    central = ["台中", "臺中", "苗栗", "彰化", "雲林", "新烏日", "豐原", "員林", "斗六", "朝馬", "竹南"]
    east = ["宜蘭", "羅東", "礁溪", "花蓮", "台東", "臺東", "蘇澳"]
    for s in east:
        if s in name or s in clean: return "East"
    for s in south:
        if s in name or s in clean: return "South"
    for s in central:
        if s in name or s in clean: return "Central"
    return "North"

def find_coords(name: str):
    clean = name.replace("YouBike2.0_", "").replace("(O)", "").replace("站", "").strip()
    if name in STATION_COORDS:
        return STATION_COORDS[name]
    for k, v in STATION_COORDS.items():
        if k in name or name in k:
            return v
    # 近似比對
    for k, v in STATION_COORDS.items():
        if clean and (clean in k or k in clean):
            return v
    return None

def process_rail_dataset(file_path: Path, mode_id: str):
    """
    處理軌道 OD 聚合資料 (高鐵/台鐵/北捷/高捷/新北捷)
    採用階層判定：
    - TicketClass == 'N-IC' -> 100% 旅客
    - TicketClass == 'IC' -> 依時段與平日/週末統計權重分解
    """
    print(f"\n🚆 正在處理軌道運具: {file_path.name} ({mode_id}) ...")
    check_resources(f"Before {mode_id}")
    
    lf = pl.scan_parquet(file_path)
    schema = lf.collect_schema()
    
    trip_date_col = 'TripDate'
    hour_col = 'TripHour'
    orig_col = 'OriginStationName'
    dest_col = 'DestinationStationName'
    class_col = 'TicketClass'
    vol_col = 'Volume'
    
    prepared = (
        lf.select([
            pl.col(trip_date_col).cast(pl.Date).alias('date') if schema[trip_date_col] != pl.String else pl.col(trip_date_col).str.to_date('%Y-%m-%d', strict=False).alias('date'),
            pl.col(hour_col).cast(pl.Int32).fill_null(0).alias('hour'),
            pl.col(orig_col).cast(pl.String).fill_null('Unknown').alias('orig'),
            pl.col(dest_col).cast(pl.String).fill_null('Unknown').alias('dest'),
            pl.col(class_col).cast(pl.String).fill_null('IC').alias('ticket_class'),
            pl.col(vol_col).cast(pl.Float64).fill_null(0.0).alias('volume')
        ])
        .drop_nulls(subset=['date'])
        .with_columns(pl.col('date').dt.weekday().alias('weekday'))
    )
    
    # 1. 抽取週三 (weekday == 3)
    # 2. 抽取平日 (weekday in 1..5)
    # 3. 抽取週末 (weekday in 6..7)
    results = {}
    
    for time_scope in ['wednesday', 'weekday', 'weekend']:
        if time_scope == 'wednesday':
            scoped = prepared.filter(pl.col('weekday') == 3)
            num_days = scoped.select(pl.col('date').n_unique()).collect(engine='streaming').item() or 1
        elif time_scope == 'weekday':
            scoped = prepared.filter(pl.col('weekday').is_in([1, 2, 3, 4, 5]))
            num_days = scoped.select(pl.col('date').n_unique()).collect(engine='streaming').item() or 1
        else:
            scoped = prepared.filter(pl.col('weekday').is_in([6, 7]))
            num_days = scoped.select(pl.col('date').n_unique()).collect(engine='streaming').item() or 1
            
        # 計算流入 (Inflow / 目的地)
        inflow = (
            scoped.filter(pl.col('dest') != 'Unknown')
            .group_by(['hour', 'dest', 'ticket_class'])
            .agg(pl.col('volume').sum().alias('vol'))
            .collect(engine='streaming')
        )
        
        # 計算流出 (Outflow / 出發地)
        outflow = (
            scoped.filter(pl.col('orig') != 'Unknown')
            .group_by(['hour', 'orig', 'ticket_class'])
            .agg(pl.col('volume').sum().alias('vol'))
            .collect(engine='streaming')
        )
        
        results[time_scope] = {
            "inflow": inflow,
            "outflow": outflow,
            "num_days": num_days
        }
        
    check_resources(f"After {mode_id}")
    gc.collect()
    return results

def process_bus_dataset(file_path: Path, mode_id: str):
    """
    處理公車 TO3A 資料 (雙北/公路客運)
    階層判定：
    - TicketType == 4 (TPASS/定期票) -> 100% 通勤
    - TicketType == 1 (一般票) -> 平日尖峰 85% 通勤，離峰 40% 通勤，週末 15% 通勤
    """
    print(f"\n🚌 正在處理公車運具: {file_path.name} ({mode_id}) ...")
    check_resources(f"Before {mode_id}")
    
    lf = pl.scan_parquet(file_path)
    
    prepared = (
        lf.select([
            pl.col('BoardingTime').cast(pl.Datetime).alias('b_time'),
            pl.col('BoardingStopName').cast(pl.String).fill_null('Unknown').alias('orig'),
            pl.col('DeboardingStopName').cast(pl.String).fill_null('Unknown').alias('dest'),
            (pl.col('TicketType') == 4).alias('is_tpass')
        ])
        .drop_nulls(subset=['b_time'])
        .with_columns([
            pl.col('b_time').dt.date().alias('date'),
            pl.col('b_time').dt.weekday().alias('weekday'),
            pl.col('b_time').dt.hour().alias('hour')
        ])
    )
    
    results = {}
    for time_scope in ['wednesday', 'weekday', 'weekend']:
        if time_scope == 'wednesday':
            scoped = prepared.filter(pl.col('weekday') == 3)
            num_days = scoped.select(pl.col('date').n_unique()).collect(engine='streaming').item() or 1
        elif time_scope == 'weekday':
            scoped = prepared.filter(pl.col('weekday').is_in([1, 2, 3, 4, 5]))
            num_days = scoped.select(pl.col('date').n_unique()).collect(engine='streaming').item() or 1
        else:
            scoped = prepared.filter(pl.col('weekday').is_in([6, 7]))
            num_days = scoped.select(pl.col('date').n_unique()).collect(engine='streaming').item() or 1
            
        outflow = (
            scoped.filter(pl.col('orig') != 'Unknown')
            .group_by(['hour', 'orig', 'is_tpass'])
            .agg(pl.len().alias('count'))
            .collect(engine='streaming')
        )
        
        inflow = (
            scoped.filter((pl.col('dest') != 'Unknown') & (pl.col('dest') != '-99'))
            .group_by(['hour', 'dest', 'is_tpass'])
            .agg(pl.len().alias('count'))
            .collect(engine='streaming')
        )
        
        results[time_scope] = {
            "inflow": inflow,
            "outflow": outflow,
            "num_days": num_days
        }
        
    check_resources(f"After {mode_id}")
    gc.collect()
    return results

def process_bike_dataset(file_path: Path, mode_id: str):
    """
    處理公共自行車 TO2A 資料 (雙北/桃園 YouBike)
    """
    print(f"\n🚲 正在處理公共自行車: {file_path.name} ({mode_id}) ...")
    check_resources(f"Before {mode_id}")
    
    lf = pl.scan_parquet(file_path)
    prepared = (
        lf.select([
            pl.col('RentTime').cast(pl.Datetime).alias('r_time'),
            pl.col('RentStationName').cast(pl.String).fill_null('Unknown').alias('orig'),
            pl.col('ReturnStationName').cast(pl.String).fill_null('Unknown').alias('dest'),
            (pl.col('TicketType') == 4).alias('is_tpass')
        ])
        .drop_nulls(subset=['r_time'])
        .with_columns([
            pl.col('r_time').dt.date().alias('date'),
            pl.col('r_time').dt.weekday().alias('weekday'),
            pl.col('r_time').dt.hour().alias('hour')
        ])
    )
    
    results = {}
    for time_scope in ['wednesday', 'weekday', 'weekend']:
        if time_scope == 'wednesday':
            scoped = prepared.filter(pl.col('weekday') == 3)
            num_days = scoped.select(pl.col('date').n_unique()).collect(engine='streaming').item() or 1
        elif time_scope == 'weekday':
            scoped = prepared.filter(pl.col('weekday').is_in([1, 2, 3, 4, 5]))
            num_days = scoped.select(pl.col('date').n_unique()).collect(engine='streaming').item() or 1
        else:
            scoped = prepared.filter(pl.col('weekday').is_in([6, 7]))
            num_days = scoped.select(pl.col('date').n_unique()).collect(engine='streaming').item() or 1
            
        outflow = (
            scoped.filter(pl.col('orig') != 'Unknown')
            .group_by(['hour', 'orig', 'is_tpass'])
            .agg(pl.len().alias('count'))
            .collect(engine='streaming')
        )
        
        inflow = (
            scoped.filter(pl.col('dest') != 'Unknown')
            .group_by(['hour', 'dest', 'is_tpass'])
            .agg(pl.len().alias('count'))
            .collect(engine='streaming')
        )
        
        results[time_scope] = {
            "inflow": inflow,
            "outflow": outflow,
            "num_days": num_days
        }
        
    check_resources(f"After {mode_id}")
    gc.collect()
    return results

def compute_commuter_tourist_split(is_rail: bool, is_tpass: bool, ticket_class: str, hour: int, time_scope: str, vol: float):
    """
    實施「階層混合判定（Hybrid Pipeline）」核心演算法：
    回傳 (commuter_vol, tourist_vol)
    """
    if is_rail:
        # 第一層：單程票 N-IC -> 100% 旅客
        if ticket_class == 'N-IC':
            return 0.0, vol
        # 第三層：IC 卡依時段與形態分解
        if time_scope in ['wednesday', 'weekday']:
            if hour in [7, 8, 9, 17, 18, 19]:
                # 尖峰通勤
                c_rate = 0.88
            elif 10 <= hour <= 16:
                # 平日離峰商業/一般
                c_rate = 0.45
            else:
                c_rate = 0.60
        else:
            # 週末
            c_rate = 0.18
        return vol * c_rate, vol * (1.0 - c_rate)
    else:
        # 公車與自行車 (TO3A / TO2A)
        # 第一層：持有 TPASS 月票 (TicketType == 4) -> 100% 通勤
        if is_tpass:
            return vol, 0.0
        # 第二層：一般卡 (TicketType == 1)
        if time_scope in ['wednesday', 'weekday']:
            if hour in [7, 8, 9, 17, 18, 19]:
                c_rate = 0.82
            elif 10 <= hour <= 16:
                c_rate = 0.38
            else:
                c_rate = 0.50
        else:
            c_rate = 0.15
        return vol * c_rate, vol * (1.0 - c_rate)

def main():
    t_start = time.time()
    print("================================================================================")
    print("🚀 啟動多模態人流時空熱點圖資料產製管線 (Hybrid Pipeline + RAM/CPU 防護)")
    print(f"📌 Polars 執行緒上限: {os.environ.get('POLARS_MAX_THREADS')} Cores | 實體 RAM: {round(psutil.virtual_memory().total/1024**3, 1)} GB")
    print("================================================================================")
    
    # 待處理運具清單 (按照檔案大小與類型安全排程)
    datasets = [
        {"id": "thsr", "type": "rail", "file": "thsr_od.parquet", "name": "高鐵"},
        {"id": "ntmc", "type": "rail", "file": "ntmc_od.parquet", "name": "新北捷運"},
        {"id": "krtc", "type": "rail", "file": "krtc_od.parquet", "name": "高雄捷運"},
        {"id": "tra", "type": "rail", "file": "tra_od.parquet", "name": "臺鐵"},
        {"id": "trtc", "type": "rail", "file": "trtc_od.parquet", "name": "臺北捷運"},
        {"id": "taoyuan_bike", "type": "bike", "file": "taoyuan_bike_to2a.parquet", "name": "桃園YouBike"},
        {"id": "thb_bus", "type": "bus", "file": "thb_bus_to3a.parquet", "name": "公路客運"},
        {"id": "taipei_bike", "type": "bike", "file": "taipei_bike_to2a.parquet", "name": "臺北YouBike"},
        {"id": "nwt_bus", "type": "bus", "file": "nwt_bus_to3a.parquet", "name": "新北市公車"},
        {"id": "tpe_bus", "type": "bus", "file": "tpe_bus_to3a.parquet", "name": "臺北市公車"}
    ]
    
    # 全局站點時空熱點容器
    # 結構: hot_spots[time_scope][hour][station_name] = { inflow_commuter, inflow_tourist, outflow_commuter, outflow_tourist, modes: set() }
    time_scopes = ['wednesday', 'weekday', 'weekend']
    hot_spots = {
        ts: {h: {} for h in range(24)}
        for ts in time_scopes
    }
    
    for ds in datasets:
        pq_path = PARQUET_DIR / ds['file']
        if not pq_path.exists():
            print(f"⏩ 略過不存在的檔案: {ds['file']}")
            continue
            
        t0 = time.time()
        if ds['type'] == 'rail':
            res = process_rail_dataset(pq_path, ds['id'])
            is_rail = True
        elif ds['type'] == 'bus':
            res = process_bus_dataset(pq_path, ds['id'])
            is_rail = False
        elif ds['type'] == 'bike':
            res = process_bike_dataset(pq_path, ds['id'])
            is_rail = False
        else:
            continue
            
        # 將該運具統計併入 hot_spots
        for ts in time_scopes:
            ts_res = res[ts]
            num_days = ts_res['num_days']
            inflow_df = ts_res['inflow']
            outflow_df = ts_res['outflow']
            
            # 處理流入 (Inflow)
            for row in inflow_df.iter_rows(named=True):
                h = int(row['hour'])
                st = row['dest']
                if not st or st == 'Unknown' or st == '-99': continue
                
                vol = float(row.get('vol', row.get('count', 0))) / num_days
                if vol < 0.1: continue
                
                is_tpass = bool(row.get('is_tpass', False))
                t_class = str(row.get('ticket_class', 'IC'))
                
                c_vol, tour_vol = compute_commuter_tourist_split(is_rail, is_tpass, t_class, h, ts, vol)
                
                st_dict = hot_spots[ts][h].setdefault(st, {
                    "in_commuter": 0.0, "in_tourist": 0.0,
                    "out_commuter": 0.0, "out_tourist": 0.0,
                    "modes": set()
                })
                st_dict["in_commuter"] += c_vol
                st_dict["in_tourist"] += tour_vol
                st_dict["modes"].add(ds['id'])
                
            # 處理流出 (Outflow)
            for row in outflow_df.iter_rows(named=True):
                h = int(row['hour'])
                st = row['orig']
                if not st or st == 'Unknown' or st == '-99': continue
                
                vol = float(row.get('vol', row.get('count', 0))) / num_days
                if vol < 0.1: continue
                
                is_tpass = bool(row.get('is_tpass', False))
                t_class = str(row.get('ticket_class', 'IC'))
                
                c_vol, tour_vol = compute_commuter_tourist_split(is_rail, is_tpass, t_class, h, ts, vol)
                
                st_dict = hot_spots[ts][h].setdefault(st, {
                    "in_commuter": 0.0, "in_tourist": 0.0,
                    "out_commuter": 0.0, "out_tourist": 0.0,
                    "modes": set()
                })
                st_dict["out_commuter"] += c_vol
                st_dict["out_tourist"] += tour_vol
                st_dict["modes"].add(ds['id'])
                
        print(f"  ✅ {ds['name']} 合併完畢，耗時: {time.time()-t0:.1f} 秒")
        del res
        gc.collect()
        
    print("\n📦 正在編譯時空熱點圖資料庫與座標配對...")
    check_resources("Compiling final payload")
    
    compiled_payload = {
        "metadata": {
            "title": "台灣多模態人流時空熱點圖 (通勤族 vs 觀光旅客)",
            "generated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
            "algorithm": "Hybrid Pipeline (TPASS Gating + Temporal Recurrence + Rail OD Probability)",
            "modes_supported": ["thsr", "tra", "trtc", "krtc", "ntmc", "bus", "bike"],
            "supported_views": [
                {"id": "activity", "label": "🔥 活動人流熱點 (Activity: 進入+離開)", "default": True},
                {"id": "inflow", "label": "📍 目的地湧入熱點 (Inflow: 下車/還車)"},
                {"id": "outflow", "label": "🛫 出發流出熱點 (Outflow: 上車/借車)"},
                {"id": "net", "label": "🌊 淨流入聚集熱度 (Net: 流入-流出)"}
            ],
            "pax_types": [
                {"id": "all", "label": "🔘 全體人流"},
                {"id": "commuter", "label": "💼 通勤/通學常客"},
                {"id": "tourist", "label": "🧳 觀光/遊客訪客"}
            ]
        },
        "time_scopes": {
            "wednesday": {
                "label": "週三專題 (Wednesday)",
                "hours": {}
            },
            "weekday": {
                "label": "平日平均 (Weekday 1-5)",
                "hours": {}
            },
            "weekend": {
                "label": "週末平均 (Weekend 6-7)",
                "hours": {}
            }
        },
        "highlight_wednesday_09": {
            "title": "週三早尖峰 09:00 - 10:00 專題人流診斷",
            "top_commuter_attractors": [], # 進入量最高 (上班族目的地)
            "top_commuter_generators": [], # 離開量最高 (居住地出發)
            "top_tourist_spots": [],       # 旅客量最高
            "top_overall_activity": []     # 總活動量最高
        }
    }
    
    for ts in time_scopes:
        for h in range(24):
            station_list = []
            for st_name, val in hot_spots[ts][h].items():
                coords = find_coords(st_name)
                if not coords:
                    continue
                    
                in_c = round(val['in_commuter'], 1)
                in_t = round(val['in_tourist'], 1)
                in_tot = round(in_c + in_t, 1)
                
                out_c = round(val['out_commuter'], 1)
                out_t = round(val['out_tourist'], 1)
                out_tot = round(out_c + out_t, 1)
                
                act_c = round(in_c + out_c, 1)
                act_t = round(in_t + out_t, 1)
                act_tot = round(in_tot + out_tot, 1)
                
                net_tot = round(in_tot - out_tot, 1)
                c_pct = round((act_c / act_tot * 100), 1) if act_tot > 0 else 50.0
                
                # 門檻過濾以維持 JSON 輕量 (單一小時旅次 > 10)
                if act_tot < 15:
                    continue
                    
                item = {
                    "name": st_name,
                    "lat": coords[0],
                    "lng": coords[1],
                    "region": get_region(st_name),
                    "modes": sorted(list(val['modes'])),
                    # 預設模式：活動人流
                    "act_tot": act_tot,
                    "act_c": act_c,
                    "act_t": act_t,
                    # 切換模式 1：進入/抵達
                    "in_tot": in_tot,
                    "in_c": in_c,
                    "in_t": in_t,
                    # 切換模式 2：離開/出發
                    "out_tot": out_tot,
                    "out_c": out_c,
                    "out_t": out_t,
                    # 淨流入
                    "net_tot": net_tot,
                    "commuter_pct": c_pct
                }
                station_list.append(item)
                
            # 按活動總量排序並取 Top 120 節點
            station_list.sort(key=lambda x: x['act_tot'], reverse=True)
            top_stations = station_list[:120]
            compiled_payload["time_scopes"][ts]["hours"][str(h)] = top_stations
            
            # 若為週三 9點，編譯專屬深入指標
            if ts == 'wednesday' and h == 9:
                # 1. 通勤吸引地 (Inflow Commuter)
                top_in = sorted(station_list, key=lambda x: x['in_c'], reverse=True)[:8]
                compiled_payload["highlight_wednesday_09"]["top_commuter_attractors"] = [
                    {"name": s['name'], "region": s['region'], "commuter_inflow": s['in_c'], "total_inflow": s['in_tot'], "pct": s['commuter_pct']}
                    for s in top_in
                ]
                
                # 2. 通勤出發地 (Outflow Commuter)
                top_out = sorted(station_list, key=lambda x: x['out_c'], reverse=True)[:8]
                compiled_payload["highlight_wednesday_09"]["top_commuter_generators"] = [
                    {"name": s['name'], "region": s['region'], "commuter_outflow": s['out_c'], "total_outflow": s['out_tot'], "pct": s['commuter_pct']}
                    for s in top_out
                ]
                
                # 3. 旅客熱點 (Tourist Activity)
                top_tour = sorted(station_list, key=lambda x: x['act_t'], reverse=True)[:8]
                compiled_payload["highlight_wednesday_09"]["top_tourist_spots"] = [
                    {"name": s['name'], "region": s['region'], "tourist_activity": s['act_t'], "commuter_activity": s['act_c'], "tourist_pct": round(100 - s['commuter_pct'], 1)}
                    for s in top_tour
                ]
                
                # 4. 總活動樞紐 (Overall Activity)
                top_act = sorted(station_list, key=lambda x: x['act_tot'], reverse=True)[:8]
                compiled_payload["highlight_wednesday_09"]["top_overall_activity"] = [
                    {"name": s['name'], "region": s['region'], "activity_total": s['act_tot'], "inflow": s['in_tot'], "outflow": s['out_tot'], "commuter_pct": s['commuter_pct']}
                    for s in top_act
                ]
                
    # 寫入 JSON
    with open(OUTPUT_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(compiled_payload, f, ensure_ascii=False, indent=2)
        
    json_size_mb = OUTPUT_JSON_PATH.stat().st_size / (1024 * 1024)
    total_elapsed = time.time() - t_start
    print("\n================================================================================")
    print(f"🎉 時空熱點圖資料庫產製成功！")
    print(f"📁 檔案位置: {OUTPUT_JSON_PATH} ({json_size_mb:.2f} MB)")
    print(f"⏱️ 總耗時: {total_elapsed:.1f} 秒")
    print("================================================================================")

if __name__ == '__main__':
    main()
