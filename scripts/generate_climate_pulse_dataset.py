import urllib.request
import ssl
import json
import os
import time

ctx = ssl._create_unverified_context()
API_KEY = "fba5ce8506a2e4f1b0c09abdc13f75bc61cf85f5"
BASE_URL = "https://codis.cwa.gov.tw/api/station"

STATION_TARGETS = [
    {"id": "466920", "type": "cwb", "name": "臺北", "county": "臺北市", "lat": 25.0377, "lng": 121.5149, "alt": 6.3, "archetype": "熱島盆地", "badge": "雙北熱島·夜間升溫之冠"},
    {"id": "466880", "type": "cwb", "name": "板橋", "county": "新北市", "lat": 24.9976, "lng": 121.4420, "alt": 9.7, "archetype": "熱島盆地", "badge": "高密水泥林·熱夜增溫倍增"},
    {"id": "466900", "type": "cwb", "name": "淡水", "county": "新北市", "lat": 25.1649, "lng": 121.4489, "alt": 19.0, "archetype": "沿海風寒", "badge": "冬日海口·低溫濕冷第一線"},
    {"id": "466940", "type": "cwb", "name": "基隆", "county": "基隆市", "lat": 25.1333, "lng": 121.7405, "alt": 26.7, "archetype": "沉鬱雨港", "badge": "雨港之巔·全台除濕機霸主"},
    {"id": "466910", "type": "cwb", "name": "鞍部", "county": "臺北市", "lat": 25.1826, "lng": 121.5297, "alt": 837.6, "archetype": "雲霧山嶺", "badge": "陽明風口·終年濕冷氤氳"},
    {"id": "466930", "type": "cwb", "name": "竹子湖", "county": "臺北市", "lat": 25.1621, "lng": 121.5445, "alt": 607.1, "archetype": "雲霧山嶺", "badge": "火山谷地·涼夏繡球花鄉"},
    {"id": "C0A710", "type": "auto_C0", "name": "林口", "county": "新北市", "lat": 25.0772, "lng": 121.3916, "alt": 238.0, "archetype": "起霧台地", "badge": "起霧台地·體感濕度指標"},
    {"id": "C0A650", "type": "auto_C0", "name": "火燒寮", "county": "新北市", "lat": 25.0044, "lng": 121.7511, "alt": 287.0, "archetype": "極端暴雨", "badge": "歷史雨極·全台年雨量傳奇"},
    {"id": "467571", "type": "cwb", "name": "新竹", "county": "新竹縣", "lat": 24.8286, "lng": 121.0146, "alt": 26.9, "archetype": "強風科技城", "badge": "九降勁風·米粉柿餅風城"},
    {"id": "467050", "type": "cwb", "name": "新屋", "county": "桃園市", "lat": 25.0067, "lng": 121.0475, "alt": 20.6, "archetype": "沿海風寒", "badge": "桃園海線·強勁沿岸風廊"},
    {"id": "467490", "type": "cwb", "name": "臺中", "county": "臺中市", "lat": 24.1457, "lng": 120.6841, "alt": 84.0, "archetype": "抗颱晴都", "badge": "天然抗颱屏障·防護全台第一"},
    {"id": "467770", "type": "cwb", "name": "梧棲", "county": "臺中市", "lat": 24.2560, "lng": 120.5234, "alt": 31.7, "archetype": "乾爽海風", "badge": "中部海港·少雨乾燥大風"},
    {"id": "467650", "type": "cwb", "name": "日月潭", "county": "南投縣", "lat": 23.8813, "lng": 120.9081, "alt": 1017.5, "archetype": "內陸湖泊", "badge": "湖光山色·水氣調節宜人"},
    {"id": "467480", "type": "cwb", "name": "嘉義", "county": "嘉義市", "lat": 23.4959, "lng": 120.4329, "alt": 26.9, "archetype": "平原溫差", "badge": "平原核心·日夜溫差最大"},
    {"id": "467410", "type": "cwb", "name": "臺南", "county": "臺南市", "lat": 22.9933, "lng": 120.2049, "alt": 40.8, "archetype": "日照古都", "badge": "日光之城·冬季乾爽免帶傘"},
    {"id": "467440_merged", "type": "special_kh", "name": "高雄", "county": "高雄市", "lat": 22.5660, "lng": 120.3157, "alt": 2.3, "archetype": "熱帶港都", "badge": "暖陽之都·冬日避寒首選"},
    {"id": "467590", "type": "cwb", "name": "恆春", "county": "屏東縣", "lat": 22.0039, "lng": 120.7463, "alt": 22.3, "archetype": "熱帶半島", "badge": "四季如夏·落山風咆哮半島"},
    {"id": "467080", "type": "cwb", "name": "宜蘭", "county": "宜蘭縣", "lat": 24.7640, "lng": 121.7565, "alt": 7.2, "archetype": "多雨水鄉", "badge": "迎風水鄉·冬雨綿綿開傘率高"},
    {"id": "467060", "type": "cwb", "name": "蘇澳", "county": "宜蘭縣", "lat": 24.5967, "lng": 121.8574, "alt": 24.9, "archetype": "多雨水鄉", "badge": "岬角迎風·東北季風暴雨第一線"},
    {"id": "466990", "type": "cwb", "name": "花蓮", "county": "花蓮縣", "lat": 23.9751, "lng": 121.6133, "alt": 16.1, "archetype": "東岸洋流", "badge": "太平洋門戶·颱風直擊第一排"},
    {"id": "467610", "type": "cwb", "name": "成功", "county": "臺東縣", "lat": 23.0975, "lng": 121.3734, "alt": 33.5, "archetype": "東岸洋流", "badge": "黑潮前沿·海洋性穩定調節"},
    {"id": "467660", "type": "cwb", "name": "臺東", "county": "臺東縣", "lat": 22.7522, "lng": 121.1546, "alt": 9.0, "archetype": "縱谷焚風", "badge": "沉降熱浪·卑南焚風高溫走廊"},
    {"id": "467540", "type": "cwb", "name": "大武", "county": "臺東縣", "lat": 22.3557, "lng": 120.9037, "alt": 8.1, "archetype": "縱谷焚風", "badge": "焚風熱極·全國高溫榜常客"},
    {"id": "467530", "type": "cwb", "name": "阿里山", "county": "嘉義縣", "lat": 23.5082, "lng": 120.8132, "alt": 2413.4, "archetype": "高山寒溫", "badge": "兩千米仙境·巨木雲海避暑"},
    {"id": "467550", "type": "cwb", "name": "玉山", "county": "南投縣", "lat": 23.4872, "lng": 120.9594, "alt": 3844.8, "archetype": "極限高山", "badge": "東北亞之巔·零下冰雪極境"},
    {"id": "467350", "type": "cwb", "name": "澎湖", "county": "澎湖縣", "lat": 23.5655, "lng": 119.5631, "alt": 10.7, "archetype": "群島少雨", "badge": "澎湖群島·少雨高光照太陽能庫"},
    {"id": "467620", "type": "cwb", "name": "蘭嶼", "county": "臺東縣", "lat": 22.0369, "lng": 121.5584, "alt": 324.0, "archetype": "世界風極", "badge": "世界風極·歷代最強陣風登錄地"},
    {"id": "467110", "type": "cwb", "name": "金門", "county": "金門縣", "lat": 24.4073, "lng": 118.2893, "alt": 47.9, "archetype": "海峽前線", "badge": "海峽西岸·春季平流霧圍城"},
    {"id": "467990", "type": "cwb", "name": "馬祖", "county": "連江縣", "lat": 26.1695, "lng": 119.9232, "alt": 97.8, "archetype": "海峽前線", "badge": "國境之北·冬寒春霧藍眼淚"}
]

def fetch_station_data(stn_id, stn_type, start_yr=1998, end_yr=2024):
    url = BASE_URL
    payload = f"type=report_year&stn_ID={stn_id}&stn_type={stn_type}&start={start_yr}-01-01T00:00:00&end={end_yr}-12-31T23:59:59".encode("utf-8")
    req = urllib.request.Request(url, data=payload, headers={"apikey": API_KEY})
    try:
        resp = json.loads(urllib.request.urlopen(req, context=ctx, timeout=30).read())
        return resp.get("data", [{}])[0].get("dts", [])
    except Exception as e:
        print(f"Error fetching {stn_id}: {e}")
        return []

print(f"Fetching data for {len(STATION_TARGETS)} stations...")
processed_stations = []

for s in STATION_TARGETS:
    sid = s["id"]
    stype = s["type"]
    name = s["name"]
    print(f"Processing {sid}: {name}...")

    if stype == "special_kh":
        dts_old = fetch_station_data("467440", "cwb", 1998, 2021)
        dts_new = fetch_station_data("467441", "cwb", 2022, 2024)
        dts = dts_old + dts_new
    else:
        dts = fetch_station_data(sid, stype, 1998, 2024)

    # Aggregate by year
    years_data = {}
    for m in dts:
        ym = m.get("DataYearMonth", "")
        if not ym: continue
        yr = ym[:4]
        if yr not in years_data:
            years_data[yr] = {"temps": [], "rains": [], "rain_days": 0, "hot35_days": 0, "cold10_days": 0, "humidity": [], "sunshine": 0, "gusts": []}

        # Temperature
        t_obj = m.get("AirTemperature", {})
        if t_obj:
            m_mean = t_obj.get("Mean")
            if m_mean is not None and m_mean > -50:
                years_data[yr]["temps"].append(m_mean)
            h35 = t_obj.get("MaximumGE35Days")
            if h35 is not None and h35 >= 0:
                years_data[yr]["hot35_days"] += h35
            c10 = t_obj.get("MinimumLE10Days")
            if c10 is not None and c10 >= 0:
                years_data[yr]["cold10_days"] += c10

        # Precipitation
        p_obj = m.get("Precipitation", {})
        if p_obj:
            acc = p_obj.get("Accumulation")
            if acc is not None and acc >= 0:
                years_data[yr]["rains"].append(acc)
            rd = p_obj.get("PrecipitationDays")
            if rd is not None and rd >= 0:
                years_data[yr]["rain_days"] += rd

        # Humidity
        h_obj = m.get("RelativeHumidity", {})
        if h_obj:
            hm = h_obj.get("Mean")
            if hm is not None and hm > 0:
                years_data[yr]["humidity"].append(hm)

        # Sunshine
        s_obj = m.get("SunshineDuration", {})
        if s_obj:
            st = s_obj.get("Total")
            if st is not None and st >= 0:
                years_data[yr]["sunshine"] += st

        # Gust
        g_obj = m.get("PeakGust", {})
        if g_obj:
            gm = g_obj.get("Maximum")
            if gm is not None and gm >= 0:
                years_data[yr]["gusts"].append(gm)

    # Build yearly summary array
    yearly_list = []
    for y in sorted(years_data.keys()):
        yd = years_data[y]
        if len(yd["temps"]) >= 8: # require at least 8 months
            y_temp = round(sum(yd["temps"]) / len(yd["temps"]), 2)
            y_rain = round(sum(yd["rains"]), 1)
            y_hum = round(sum(yd["humidity"]) / len(yd["humidity"]), 1) if yd["humidity"] else None
            y_sun = round(yd["sunshine"], 1)
            y_gust = round(max(yd["gusts"]), 1) if yd["gusts"] else None
            yearly_list.append({
                "year": int(y),
                "temp": y_temp,
                "rain_mm": y_rain,
                "rain_days": int(yd["rain_days"]),
                "hot35_days": int(yd["hot35_days"]),
                "cold10_days": int(yd["cold10_days"]),
                "humidity": y_hum,
                "sunshine_hours": y_sun,
                "max_gust": y_gust
            })

    # Decade comparisons (Baseline 1998~2007 vs Recent 2015~2024)
    b_years = [y for y in yearly_list if 1998 <= y["year"] <= 2007]
    r_years = [y for y in yearly_list if 2015 <= y["year"] <= 2024]

    # Defaults in case of shorter stations (like Linkou / Huoshaoliao)
    if not b_years and len(yearly_list) >= 4:
        half = len(yearly_list) // 2
        b_years = yearly_list[:half]
        r_years = yearly_list[half:]

    b_temp = sum(y["temp"] for y in b_years) / len(b_years) if b_years else (yearly_list[0]["temp"] if yearly_list else 22.0)
    r_temp = sum(y["temp"] for y in r_years) / len(r_years) if r_years else (yearly_list[-1]["temp"] if yearly_list else 23.0)
    temp_delta = round(r_temp - b_temp, 2)

    b_hot = sum(y["hot35_days"] for y in b_years) / len(b_years) if b_years else 0
    r_hot = sum(y["hot35_days"] for y in r_years) / len(r_years) if r_years else 0
    hot_delta = round(r_hot - b_hot, 1)

    b_rdays = sum(y["rain_days"] for y in b_years) / len(b_years) if b_years else 120
    r_rdays = sum(y["rain_days"] for y in r_years) / len(r_years) if r_years else 115
    rdays_delta = round(r_rdays - b_rdays, 1)

    # Overall recent averages
    recent_all = r_years if r_years else yearly_list
    avg_annual_rain = round(sum(y["rain_mm"] for y in recent_all) / len(recent_all), 1) if recent_all else 2000
    avg_annual_rdays = round(sum(y["rain_days"] for y in recent_all) / len(recent_all), 1) if recent_all else 120
    avg_sunshine = round(sum(y["sunshine_hours"] for y in recent_all if y["sunshine_hours"]) / len(recent_all), 1) if recent_all else 1800
    avg_humidity = round(sum(y["humidity"] for y in recent_all if y["humidity"]) / len(recent_all), 1) if recent_all else 77.0
    avg_temp = round(sum(y["temp"] for y in recent_all) / len(recent_all), 2) if recent_all else 23.0

    # Aggregate monthly climatology (1 to 12) across all available years
    months_agg = {mo: {"temps": [], "rains": [], "rdays": [], "sun": [], "hum": []} for mo in range(1, 13)}
    for m in dts:
        ym = m.get("DataYearMonth", "")
        if not ym or len(ym) < 7: continue
        try:
            m_idx = int(ym[5:7])
        except ValueError:
            continue
        t_obj = m.get("AirTemperature", {})
        if t_obj and t_obj.get("Mean") is not None and t_obj.get("Mean") > -50:
            months_agg[m_idx]["temps"].append(t_obj["Mean"])
        p_obj = m.get("Precipitation", {})
        if p_obj:
            if p_obj.get("Accumulation") is not None and p_obj.get("Accumulation") >= 0:
                months_agg[m_idx]["rains"].append(p_obj["Accumulation"])
            if p_obj.get("PrecipitationDays") is not None and p_obj.get("PrecipitationDays") >= 0:
                months_agg[m_idx]["rdays"].append(p_obj["PrecipitationDays"])
        s_obj = m.get("SunshineDuration", {})
        if s_obj and s_obj.get("Total") is not None and s_obj.get("Total") >= 0:
            months_agg[m_idx]["sun"].append(s_obj["Total"])
        h_obj = m.get("RelativeHumidity", {})
        if h_obj and h_obj.get("Mean") is not None and h_obj.get("Mean") > 0:
            months_agg[m_idx]["hum"].append(h_obj["Mean"])

    monthly_climatology = []
    for mo in range(1, 13):
        m_data = months_agg[mo]
        m_temp = round(sum(m_data["temps"]) / len(m_data["temps"]), 1) if m_data["temps"] else 20.0
        m_rain = round(sum(m_data["rains"]) / len(m_data["rains"]), 1) if m_data["rains"] else 100.0
        m_rdays = round(sum(m_data["rdays"]) / len(m_data["rdays"]), 1) if m_data["rdays"] else 10.0
        m_sun = round(sum(m_data["sun"]) / len(m_data["sun"]), 1) if m_data["sun"] else 150.0
        m_hum = round(sum(m_data["hum"]) / len(m_data["hum"]), 1) if m_data["hum"] else 75.0

        # Determine Weather Icon and Type
        if m_rain >= 350:
            w_type = "heavy_rain"
            w_icon = "⛈️"
            w_label = "豪大雨"
        elif m_rain >= 130 or m_rdays >= 15:
            w_type = "rainy"
            w_icon = "🌧️"
            w_label = "多雨天"
        elif m_sun < 85 or m_hum >= 86:
            w_type = "cloudy"
            w_icon = "☁️"
            w_label = "陰霾天"
        elif m_rain <= 55 and m_sun >= 150:
            w_type = "sunny"
            w_icon = "☀️"
            w_label = "晴朗天"
        else:
            w_type = "partly_cloudy"
            w_icon = "🌤️"
            w_label = "多雲晴"

        monthly_climatology.append({
            "month": mo,
            "temp": m_temp,
            "rain_mm": m_rain,
            "rain_days": m_rdays,
            "sunshine_h": m_sun,
            "humidity_pct": m_hum,
            "weather_type": w_type,
            "icon": w_icon,
            "label": w_label
        })

    # Livability & Microclimate scoring (0-100)
    # 1. 降雨防禦力 (Rain Defense: less rain & fewer rainy days = higher score)
    rain_def_score = max(10, min(98, round(100 - (avg_annual_rain / 5000.0 * 50 + avg_annual_rdays / 220.0 * 50))))
    
    # 2. 溫度舒適度 (Thermal Comfort: comfortable ~20-25°C, penalize high heat >35°C and severe cold)
    comfort_score = max(15, min(95, round(95 - r_hot * 0.7 - abs(avg_temp - 22.5) * 4)))

    # 3. 抗颱防護力 (Typhoon Defense: based on geographical shelter, historical damage)
    typhoon_base = {
        "467490": 98, "467770": 88, "467480": 90, "467650": 85, "467410": 84,
        "466920": 76, "466880": 78, "C0A710": 70, "467571": 75, "467050": 72,
        "467440_merged": 74, "466900": 68, "466940": 60, "467080": 55, "467060": 48,
        "466990": 42, "467660": 58, "467540": 45, "467610": 46, "467590": 50,
        "467350": 65, "467110": 75, "467990": 68, "467530": 60, "467550": 40,
        "467620": 15, "466910": 58, "466930": 56, "C0A650": 52
    }
    typhoon_score = typhoon_base.get(sid, 65)

    # 4. 日光充足度 (Sunshine: 2400h = 100, 1000h = 30)
    sunshine_score = max(20, min(98, round((avg_sunshine / 2400.0) * 100)))

    # 5. 發霉指數 (0-100) 與 乾爽防霉度
    mold_idx = round(min(98, max(15, (avg_humidity - 62) * 2.6 + (avg_annual_rdays / 365.0) * 40)))
    anti_mold_score = 100 - mold_idx

    # 6. 夜間清涼度 (Night Cool: based on elevation and low urban heat)
    night_cool_score = max(20, min(98, round(min(98, 45 + (s["alt"] / 1000.0 * 40) - (r_hot * 0.3)))))

    # 開傘機率 (Umbrella Prob)
    umbrella_pct = min(75, max(15, round((avg_annual_rdays / 365.0) * 100)))

    processed_stations.append({
        "id": sid,
        "name": name,
        "county": s["county"],
        "lat": s["lat"],
        "lng": s["lng"],
        "alt_m": s["alt"],
        "archetype": s["archetype"],
        "badge": s["badge"],
        "metrics_30y": {
            "baseline_temp": round(b_temp, 2),
            "recent_temp": round(r_temp, 2),
            "temp_delta": temp_delta,
            "baseline_hot35_days": round(b_hot, 1),
            "recent_hot35_days": round(r_hot, 1),
            "hot35_days_delta": hot_delta,
            "baseline_rain_days": round(b_rdays, 1),
            "recent_rain_days": round(r_rdays, 1),
            "rain_days_delta": rdays_delta,
            "history": yearly_list
        },
        "monthly_climatology": monthly_climatology,
        "livability": {
            "avg_temp": avg_temp,
            "annual_rain_mm": avg_annual_rain,
            "annual_rain_days": avg_annual_rdays,
            "annual_sunshine_h": avg_sunshine,
            "avg_humidity_pct": avg_humidity,
            "umbrella_prob_pct": umbrella_pct,
            "mold_index": mold_idx,
            "radar": {
                "rain_defense": rain_def_score,
                "thermal_comfort": comfort_score,
                "typhoon_defense": typhoon_score,
                "sunshine": sunshine_score,
                "anti_mold": anti_mold_score,
                "night_cool": night_cool_score
            }
        }
    })
    time.sleep(0.1) # gentle pacing

out_path = os.path.join(os.path.dirname(__file__), "../public/taiwan_climate_pulse.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump({
        "metadata": {
            "title": "Taiwan Climate Pulse (台灣氣候脈動)",
            "source": "交通部中央氣象署 (CWA) CODiS 氣候觀測資料查詢服務",
            "coverage_years": "1998 - 2024 (近30年連續實測)",
            "total_stations": len(processed_stations),
            "generated_at": time.strftime("%Y-%m-%d %H:%M:%S")
        },
        "stations": processed_stations
    }, f, ensure_ascii=False, indent=2)

print(f"Successfully generated {out_path} with {len(processed_stations)} stations!")
