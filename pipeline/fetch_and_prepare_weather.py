#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fetch and Prepare Taiwan Weather Dataset (2026 H1)
從 Raingel/historical_weather (CWA/CODIS 官方鏡像) 抓取 2026 年 1~6 月全台核心測站逐時氣象資料，
結合 taiwan_calendar_2026 國定假日與補班日嚴謹校準，
輸出標準化 Parquet 資料庫與前端彙總 JSON。
"""

import io
import json
import os
import urllib.request
from datetime import datetime
from pathlib import Path
from typing import Dict, List
import pandas as pd
from tqdm import tqdm

from taiwan_calendar_2026 import get_day_type, is_workday, is_holiday, get_holiday_name

REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = REPO_ROOT / 'data'
PUBLIC_DIR = REPO_ROOT / 'public'
DATA_DIR.mkdir(parents=True, exist_ok=True)
PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_PARQUET = DATA_DIR / 'weather_hourly_2026_h1.parquet'
OUTPUT_SUMMARY_JSON = PUBLIC_DIR / 'weather_summary_2026_h1.json'

# 全台涵蓋 10 大運具全域之 17 大核心氣象測站
TARGET_STATIONS: Dict[str, Dict[str, str]] = {
    '466920': {'name': '臺北', 'county': '臺北市', 'region': 'North', 'lat': 25.0377, 'lon': 121.5149},
    '466881': {'name': '新北', 'county': '新北市', 'region': 'North', 'lat': 24.9976, 'lon': 121.4420},
    '466900': {'name': '淡水', 'county': '新北市', 'region': 'North', 'lat': 25.1649, 'lon': 121.4489},
    '466940': {'name': '基隆', 'county': '基隆市', 'region': 'North', 'lat': 25.1333, 'lon': 121.7405},
    '467050': {'name': '桃園', 'county': '桃園市', 'region': 'North', 'lat': 25.0067, 'lon': 121.0475},
    '467571': {'name': '新竹', 'county': '新竹市', 'region': 'Central', 'lat': 24.8279, 'lon': 121.0142},
    '467270': {'name': '苗栗', 'county': '苗栗縣', 'region': 'Central', 'lat': 24.5650, 'lon': 120.8258},
    '467490': {'name': '臺中', 'county': '臺中市', 'region': 'Central', 'lat': 24.1458, 'lon': 120.6842},
    '467280': {'name': '彰化', 'county': '彰化縣', 'region': 'Central', 'lat': 23.8814, 'lon': 120.5828},
    '467650': {'name': '日月潭', 'county': '南投縣', 'region': 'Central', 'lat': 23.8814, 'lon': 120.9081},
    '467480': {'name': '嘉義', 'county': '嘉義市', 'region': 'South', 'lat': 23.4958, 'lon': 120.4328},
    '467410': {'name': '臺南', 'county': '臺南市', 'region': 'South', 'lat': 22.9933, 'lon': 120.2033},
    '467441': {'name': '高雄', 'county': '高雄市', 'region': 'South', 'lat': 22.5660, 'lon': 120.3158},
    '467590': {'name': '恆春', 'county': '屏東縣', 'region': 'South', 'lat': 22.0039, 'lon': 120.7464},
    '467080': {'name': '宜蘭', 'county': '宜蘭縣', 'region': 'East', 'lat': 24.7639, 'lon': 121.7564},
    '466990': {'name': '花蓮', 'county': '花蓮縣', 'region': 'East', 'lat': 23.9753, 'lon': 121.6133},
    '467660': {'name': '臺東', 'county': '臺東縣', 'region': 'East', 'lat': 22.7556, 'lon': 121.1547},
}

START_DATE = '2026-01-01'
END_DATE = '2026-06-30'


def clean_num(val, default=0.0, is_precipitation=False):
    if pd.isna(val):
        return default
    if isinstance(val, (int, float)):
        if val <= -9.0 or (is_precipitation and val < 0):
            return default
        return float(val)
    s = str(val).strip()
    if s in ('T', 't'):
        return 0.05 # 微量降雨記為 0.05 mm
    if s in ('', 'None', 'null', '-99.0', '-99.5', '-99.8', '-99.9', '-9.8', '-9.9', 'X', 'V'):
        return default
    try:
        v = float(s)
        if v <= -9.0 or (is_precipitation and v < 0):
            return default
        return v
    except:
        return default



def fetch_station_data(station_id: str, meta: dict) -> pd.DataFrame:
    url = f'https://raw.githubusercontent.com/Raingel/historical_weather/main/data/{station_id}/{station_id}_2026.csv'
    req = urllib.request.Request(url, headers={'User-Agent': 'TaiwanMobilityPulse/1.0'})
    
    with urllib.request.urlopen(req, timeout=15) as resp:
        content = resp.read().decode('utf-8', errors='ignore')
        
    df = pd.read_csv(io.StringIO(content))
    
    # 識別時間欄位
    time_col = df.columns[0]
    df['datetime'] = pd.to_datetime(df[time_col], errors='coerce')
    df = df.dropna(subset=['datetime'])
    
    # 篩選 2026-01-01 至 2026-06-30 (完整上半年)
    mask = (df['datetime'] >= f'{START_DATE} 00:00:00') & (df['datetime'] <= f'{END_DATE} 23:59:59')
    df_h1 = df[mask].copy()
    
    # 提取關鍵要素
    df_clean = pd.DataFrame(index=df_h1.index)
    df_clean['station_id'] = station_id
    df_clean['station_name'] = meta['name']
    df_clean['county'] = meta['county']
    df_clean['region'] = meta['region']
    df_clean['lat'] = meta['lat']
    df_clean['lon'] = meta['lon']
    df_clean['datetime'] = df_h1['datetime']
    df_clean['date'] = df_clean['datetime'].dt.strftime('%Y-%m-%d')
    df_clean['hour'] = df_clean['datetime'].dt.hour
    
    # 氣溫 (Tx)
    tx_col = 'Tx' if 'Tx' in df_h1.columns else 'AirTemperature.Instantaneousf'
    df_clean['temperature'] = df_h1[tx_col].apply(lambda x: clean_num(x, default=22.0))
    
    # 降水 (Precp)
    precp_col = 'Precp' if 'Precp' in df_h1.columns else 'Precipitation.Accumulationf'
    df_clean['precipitation'] = df_h1[precp_col].apply(lambda x: clean_num(x, default=0.0, is_precipitation=True))
    
    # 濕度 (RH)
    rh_col = 'RH' if 'RH' in df_h1.columns else 'RelativeHumidity.Instantaneousf'
    df_clean['relative_humidity'] = df_h1[rh_col].apply(lambda x: clean_num(x, default=75.0))
    
    # 風速 (WS) 與陣風 (WSGust)
    ws_col = 'WS' if 'WS' in df_h1.columns else 'WindSpeed.Meanf'
    wsg_col = 'WSGust' if 'WSGust' in df_h1.columns else 'PeakGust.Maximumf'
    df_clean['wind_speed'] = df_h1[ws_col].apply(lambda x: clean_num(x, default=2.0)) if ws_col in df_h1.columns else 2.0
    df_clean['wind_gust'] = df_h1[wsg_col].apply(lambda x: clean_num(x, default=4.0)) if wsg_col in df_h1.columns else 4.0
    
    # 標記降雨
    df_clean['is_rain'] = df_clean['precipitation'] >= 0.1
    
    def assign_rain_level(p):
        if p < 0.1:
            return 'None'
        elif p < 2.5:
            return 'Light'
        elif p < 15.0:
            return 'Moderate'
        else:
            return 'Heavy'
            
    df_clean['rain_level'] = df_clean['precipitation'].apply(assign_rain_level)
    
    # 嚴謹結合 2026 國定假日與補班日校準
    df_clean['day_type'] = df_clean['date'].apply(get_day_type)
    df_clean['is_workday'] = df_clean['date'].apply(is_workday)
    df_clean['is_holiday'] = df_clean['date'].apply(is_holiday)
    df_clean['holiday_name'] = df_clean['date'].apply(get_holiday_name)
    
    return df_clean


def main():
    print("🚀 開始抓取並構建 2026 上半年 (01/01 ~ 06/30) 全台 17 大核心測站逐時氣象資料庫 (多執行緒並行)...")
    dfs = []
    from concurrent.futures import ThreadPoolExecutor, as_completed
    
    with ThreadPoolExecutor(max_workers=8) as executor:
        future_to_sid = {executor.submit(fetch_station_data, sid, meta): (sid, meta) for sid, meta in TARGET_STATIONS.items()}
        for future in tqdm(as_completed(future_to_sid), total=len(TARGET_STATIONS), desc="  🌤️ 並行下載與清洗測站"):
            sid, meta = future_to_sid[future]
            try:
                df_st = future.result()
                dfs.append(df_st)
            except Exception as e:
                print(f"⚠️ 測站 {sid} ({meta['name']}) 抓取失敗: {e}")
            
    if not dfs:
        raise RuntimeError("❌ 未能成功獲取任何氣象測站資料！")
        
    full_df = pd.concat(dfs, ignore_index=True)
    full_df.sort_values(by=['station_id', 'datetime'], inplace=True)
    
    # 儲存為高效 Parquet
    full_df.to_parquet(OUTPUT_PARQUET, index=False, compression='snappy')
    print(f"✅ 成功寫入標準化 Parquet 資料庫: {OUTPUT_PARQUET}")
    print(f"   總筆數: {len(full_df):,} 筆 | 涵蓋測站: {full_df['station_id'].nunique()} 站")
    print(f"   檔案大小: {OUTPUT_PARQUET.stat().st_size / (1024*1024):.2f} MB")
    
    # 產出前端視覺化與分析摘要 JSON
    summary = {
        "metadata": {
            "title": "台灣 2026 上半年全台核心氣象與日曆校準資料庫",
            "time_range": f"{START_DATE} ~ {END_DATE}",
            "total_records": len(full_df),
            "stations_count": full_df['station_id'].nunique(),
            "updated_at": datetime.now().isoformat()
        },
        "calendar_breakdown": {
            "total_days": full_df['date'].nunique(),
            "workday_regular_days": full_df[full_df['day_type'] == 'WORKDAY_REG']['date'].nunique(),
            "workday_makeup_days": full_df[full_df['day_type'] == 'WORKDAY_MKP']['date'].nunique(),
            "holiday_national_days": full_df[full_df['day_type'] == 'HOLIDAY_NAT']['date'].nunique(),
            "holiday_weekend_days": full_df[full_df['day_type'] == 'HOLIDAY_WKD']['date'].nunique()
        },
        "station_weather_stats": {}
    }
    
    for sid, grp in full_df.groupby('station_id'):
        sname = grp['station_name'].iloc[0]
        county = grp['county'].iloc[0]
        region = grp['region'].iloc[0]
        rain_hours = int((grp['precipitation'] >= 0.1).sum())
        heavy_rain_hours = int((grp['precipitation'] >= 15.0).sum())
        total_precip = round(float(grp['precipitation'].sum()), 1)
        avg_temp = round(float(grp['temperature'].mean()), 1)
        max_temp = round(float(grp['temperature'].max()), 1)
        min_temp = round(float(grp['temperature'].min()), 1)
        
        # 工作日 vs 假日 降雨時數
        work_rain = int(grp[grp['is_workday'] & grp['is_rain']]['datetime'].count())
        hol_rain = int(grp[grp['is_holiday'] & grp['is_rain']]['datetime'].count())
        
        summary["station_weather_stats"][sid] = {
            "name": sname,
            "county": county,
            "region": region,
            "total_precip_mm": total_precip,
            "avg_temp_c": avg_temp,
            "max_temp_c": max_temp,
            "min_temp_c": min_temp,
            "rain_hours_total": rain_hours,
            "rain_hours_pct": round(rain_hours / len(grp) * 100, 1),
            "heavy_rain_hours": heavy_rain_hours,
            "workday_rain_hours": work_rain,
            "holiday_rain_hours": hol_rain
        }
        
    with open(OUTPUT_SUMMARY_JSON, 'w', encoding='utf-8') as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)
        
    print(f"✅ 成功產出氣候摘要 JSON: {OUTPUT_SUMMARY_JSON}")
    print(f"   常規工作日天數: {summary['calendar_breakdown']['workday_regular_days']} 天")
    print(f"   週一至五國定假日: {summary['calendar_breakdown']['holiday_national_days']} 天 (已嚴謹分離！)")
    print(f"   常規週末放假天數: {summary['calendar_breakdown']['holiday_weekend_days']} 天")


if __name__ == '__main__':
    main()
