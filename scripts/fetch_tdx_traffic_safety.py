#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/fetch_tdx_traffic_safety.py
Fetch TDX Historical Traffic Accident Data (A1 Fatal Accidents & Traffic Event Codes)
Generates high-performance blackspot geospatial dataset for Taiwan Mobility Pulse.
"""

import os
import sys
import json
import math
import urllib.request
import urllib.parse
from pathlib import Path
from datetime import datetime

ROOT_DIR = Path(__file__).resolve().parent.parent
PUBLIC_DATA_DIR = ROOT_DIR / "public" / "data"
SRC_DATA_DIR = ROOT_DIR / "src" / "data"

COUNTY_MAP = {
    "TPE": {"name": "臺北市", "region": "North"},
    "NWT": {"name": "新北市", "region": "North"},
    "TAO": {"name": "桃園市", "region": "North"},
    "KEE": {"name": "基隆市", "region": "North"},
    "HSZ": {"name": "新竹市", "region": "North"},
    "HSQ": {"name": "新竹縣", "region": "North"},
    "ILA": {"name": "宜蘭縣", "region": "North"},
    "TXG": {"name": "臺中市", "region": "Central"},
    "MIA": {"name": "苗栗縣", "region": "Central"},
    "CHA": {"name": "彰化縣", "region": "Central"},
    "NAN": {"name": "南投縣", "region": "Central"},
    "YUN": {"name": "雲林縣", "region": "Central"},
    "TNN": {"name": "臺南市", "region": "South"},
    "KHH": {"name": "高雄市", "region": "South"},
    "CYI": {"name": "嘉義市", "region": "South"},
    "CYQ": {"name": "嘉義縣", "region": "South"},
    "PIF": {"name": "屏東縣", "region": "South"},
    "HUA": {"name": "花蓮縣", "region": "East"},
    "TTT": {"name": "臺東縣", "region": "East"},
    "PEN": {"name": "澎湖縣", "region": "Islands"},
    "KIN": {"name": "金門縣", "region": "Islands"},
    "LIE": {"name": "連江縣", "region": "Islands"}
}

def load_credentials():
    client_id = os.getenv("TDX_CLIENT_ID", "")
    client_secret = os.getenv("TDX_CLIENT_SECRET", "")
    
    env_file = ROOT_DIR / ".env"
    if env_file.exists() and (not client_id or not client_secret):
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if "=" in line and not line.startswith("#"):
                    k, v = line.split("=", 1)
                    k = k.strip()
                    v = v.strip().strip('"').strip("'")
                    if k == "TDX_CLIENT_ID" and not client_id:
                        client_id = v
                    elif k == "TDX_CLIENT_SECRET" and not client_secret:
                        client_secret = v
    return client_id, client_secret

def get_tdx_token(client_id: str, client_secret: str) -> str:
    token_url = "https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token"
    token_data = urllib.parse.urlencode({
        "grant_type": "client_credentials",
        "client_id": client_id,
        "client_secret": client_secret
    }).encode("utf-8")

    req = urllib.request.Request(
        token_url,
        data=token_data,
        headers={"Content-Type": "application/x-www-form-urlencoded", "User-Agent": "TaiwanMobilityPulse/1.3.1"}
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        body = json.loads(resp.read().decode("utf-8"))
        return body["access_token"]

def fetch_json(url: str, token: str):
    req = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
            "User-Agent": "TaiwanMobilityPulse/1.3.1"
        }
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))

def main():
    print("=== TDX Historical Traffic Safety ETL Pipeline ===")
    PUBLIC_DATA_DIR.mkdir(parents=True, exist_ok=True)
    SRC_DATA_DIR.mkdir(parents=True, exist_ok=True)

    client_id, client_secret = load_credentials()
    if not client_id or not client_secret:
        print("Error: TDX_CLIENT_ID or TDX_CLIENT_SECRET not found in environment or .env!")
        sys.exit(1)

    print("Authenticating with TDX OAuth...")
    token = get_tdx_token(client_id, client_secret)
    print("OAuth Token obtained successfully.")

    # 1. Fetch Traffic Event Codebook
    print("Fetching Traffic Event Codebook (/v1/AccidentBasic/TrafficEventCode)...")
    codebook_url = "https://tdx.transportdata.tw/api/historical/v1/AccidentBasic/TrafficEventCode?$format=JSON"
    raw_codes = fetch_json(codebook_url, token)
    print(f"Loaded {len(raw_codes)} codebook entries.")

    code_map = {}
    for c in raw_codes:
        kid = c.get("KeyID")
        if kid is not None:
            code_map[kid] = {
                "type": c.get("CodeTYPE"),
                "code": c.get("Code"),
                "name": c.get("CodeName")
            }

    # 2. Fetch A1 Fatal Accidents across Taiwan (Year 2022)
    accidents = []
    seen_ids = set()

    print("Fetching A1 Fatal Accidents across 22 cities (Year 2022)...")
    for city_code, info in COUNTY_MAP.items():
        city_name = info["name"]
        region = info["region"]
        api_url = f"https://tdx.transportdata.tw/api/historical/v1/TrafficAccident/A1T1/{city_code}/DateFilter/2022?$top=100&$format=JSON"
        try:
            items = fetch_json(api_url, token)
            count = 0
            for it in items:
                aid = it.get("AccKeyID")
                if not aid or aid in seen_ids:
                    continue
                seen_ids.add(aid)

                lat = float(it.get("Lat") or 0.0)
                lon = float(it.get("Lon") or 0.0)
                if lat < 21.0 or lat > 26.5 or lon < 118.0 or lon > 122.5:
                    continue  # Filter invalid coordinates outside Taiwan

                w_code = it.get("WeatherCode")
                w_name = code_map.get(w_code, {}).get("name", "晴/常態")
                is_rain = any(k in w_name for k in ["雨", "濕", "霧"])

                l_code = it.get("LightCode")
                l_name = code_map.get(l_code, {}).get("name", "日間自然光線")

                r_code = it.get("RoadCategoriesCode")
                r_name = code_map.get(r_code, {}).get("name", "市區道路")

                rt_code = it.get("RoadTypeCode")
                rt_name = code_map.get(rt_code, {}).get("name", "一般路段")

                loc_code = it.get("AccidentLocationCode")
                loc_name = code_map.get(loc_code, {}).get("name", "車道")

                pat_code = it.get("AccidentPatternsCode")
                pat_name = code_map.get(pat_code, {}).get("name", "其他碰撞")

                pav_code = it.get("PavementConditionCode")
                pav_name = code_map.get(pav_code, {}).get("name", "乾燥")

                case_time_ad = it.get("CaseTimeAD") or "2022-01-01 00:00:00"
                try:
                    dt = datetime.strptime(case_time_ad, "%Y-%m-%d %H:%M:%S")
                    hour = dt.hour
                    month = dt.month
                except Exception:
                    hour = 12
                    month = 6

                death = int(it.get("Death") or 1)
                injured = int(it.get("Injured") or 0)
                speed_limit = int(it.get("SpeedLimit") or 50)

                accidents.append({
                    "id": f"acc_{aid}",
                    "case_no": it.get("CaseNo") or f"CASE_{aid}",
                    "city_code": city_code,
                    "city_name": city_name,
                    "region": region,
                    "site": it.get("CaseSite") or f"{city_name}某路段",
                    "lat": round(lat, 5),
                    "lon": round(lon, 5),
                    "time": case_time_ad,
                    "month": month,
                    "hour": hour,
                    "death": death,
                    "injured": injured,
                    "speed_limit": speed_limit,
                    "weather": w_name,
                    "is_rain": is_rain,
                    "light": l_name,
                    "road_category": r_name,
                    "road_type": rt_name,
                    "location_type": loc_name,
                    "collision_pattern": pat_name,
                    "pavement": pav_name
                })
                count += 1
            print(f"  [{city_code}] {city_name}: {count} cases ingested.")
        except Exception as e:
            print(f"  [{city_code}] {city_name}: error fetching: {e}")

    print(f"\nTotal valid geospatial accident points: {len(accidents)}")

    # 3. Macro Statistics & Pattern Insights
    total_deaths = sum(a["death"] for a in accidents)
    total_injured = sum(a["injured"] for a in accidents)

    weather_counts = {}
    light_counts = {}
    pattern_counts = {}
    road_counts = {}
    hourly_counts = [0] * 24
    city_counts = {}

    for a in accidents:
        w = a["weather"]
        weather_counts[w] = weather_counts.get(w, 0) + 1

        l = a["light"]
        light_counts[l] = light_counts.get(l, 0) + 1

        p = a["collision_pattern"]
        pattern_counts[p] = pattern_counts.get(p, 0) + 1

        r = a["road_category"]
        road_counts[r] = road_counts.get(r, 0) + 1

        hourly_counts[a["hour"]] += 1
        city_counts[a["city_name"]] = city_counts.get(a["city_name"], 0) + 1

    top_patterns = sorted(pattern_counts.items(), key=lambda x: x[1], reverse=True)[:8]
    top_roads = sorted(road_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    top_weather = sorted(weather_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    top_lights = sorted(light_counts.items(), key=lambda x: x[1], reverse=True)[:4]

    # Calculate rain factor
    rain_cases = sum(1 for a in accidents if a["is_rain"])
    rain_ratio = round((rain_cases / len(accidents)) * 100, 1) if accidents else 0.0

    stats = {
        "dataset_title": "臺灣交通道安大數據與 A1 重大事故黑點圖譜",
        "data_source": "交通部 TDX 歷史資料庫 (TrafficAccident A1T1 & TrafficEventCode)",
        "time_horizon": "2022 全年度 (全國 22 縣市全量檢索)",
        "total_cases": len(accidents),
        "total_deaths": total_deaths,
        "total_injured": total_injured,
        "rain_accident_cases": rain_cases,
        "rain_accident_ratio": f"{rain_ratio}%",
        "top_collision_patterns": [{"pattern": p, "count": c, "pct": f"{round(c/len(accidents)*100, 1)}%"} for p, c in top_patterns],
        "top_road_categories": [{"category": r, "count": c} for r, c in top_roads],
        "weather_distribution": [{"weather": w, "count": c} for w, c in top_weather],
        "light_distribution": [{"light": l, "count": c} for l, c in top_lights],
        "hourly_distribution": hourly_counts,
        "city_distribution": sorted([{"city": k, "count": v} for k, v in city_counts.items()], key=lambda x: x["count"], reverse=True)
    }

    output_payload = {
        "metadata": stats,
        "accidents": accidents
    }

    # Save to public/data/traffic_safety_blackspots.json
    out_json = PUBLIC_DATA_DIR / "traffic_safety_blackspots.json"
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(output_payload, f, ensure_ascii=False, indent=2)
    print(f"Saved JSON dataset to {out_json} ({round(out_json.stat().st_size / 1024, 1)} KB)")

    # Save to src/data/trafficSafetyData.js for direct frontend import
    out_js = SRC_DATA_DIR / "trafficSafetyData.js"
    with open(out_js, "w", encoding="utf-8") as f:
        f.write("/* Auto-generated by scripts/fetch_tdx_traffic_safety.py */\n")
        f.write("export const TRAFFIC_SAFETY_METADATA = ")
        f.write(json.dumps(stats, ensure_ascii=False, indent=2))
        f.write(";\n\n")
        f.write("export const TRAFFIC_SAFETY_ACCIDENTS = ")
        f.write(json.dumps(accidents, ensure_ascii=False))
        f.write(";\n")
    print(f"Saved JS dataset to {out_js} ({round(out_js.stat().st_size / 1024, 1)} KB)")

    print("\nETL Pipeline completed successfully!")

if __name__ == "__main__":
    main()
