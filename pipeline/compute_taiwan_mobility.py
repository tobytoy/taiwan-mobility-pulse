#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
計算全台灣整體人流動態（跨運具、跨縣市、跨時段、多模態轉乘）
"""
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.append(str(BASE_DIR))

from safety_guard import check_memory_safety, safe_scan_parquet
import polars as pl
import json

UNIFIED = BASE_DIR / "history-datas" / "2026-08-19" / "unified"

check_memory_safety(min_available_mb=1200.0)
print("=== 1. 全台灣 24 小時人流脈動 (整體跨運具分時走勢 - 串流安全模式) ===")

def get_hourly(filename, vol_col="Volume", is_bike=False):
    p = UNIFIED / filename
    if not p.exists():
        return pl.DataFrame({"TripHour": list(range(24))}).lazy()
    
    if is_bike:
        return (
            safe_scan_parquet(p, columns=["RentTime"])
            .with_columns(pl.col("RentTime").str.slice(11, 2).cast(pl.Int64, strict=False).alias("TripHour"))
            .filter(pl.col("TripHour").is_not_null())
            .group_by("TripHour")
            .agg(pl.len().alias("自行車人流"))
        )
    else:
        alias_name = "捷運人流" if "metro" in filename else ("高鐵人流" if "thsr" in filename else ("臺鐵人流" if "tra" in filename else "公車人流"))
        return (
            safe_scan_parquet(p, columns=["TripHour", vol_col])
            .group_by("TripHour")
            .agg(pl.col(vol_col).sum().alias(alias_name))
        )

metro_hourly = get_hourly("unified_metro_od_o.parquet")
thsr_hourly = get_hourly("unified_thsr_od.parquet")
tra_hourly = get_hourly("unified_tra_od.parquet")
bus_hourly = get_hourly("unified_bus_od_o.parquet")
bike_hourly = get_hourly("unified_bike_to2a.parquet", is_bike=True)

# Join all into unified 24h mobility table
hourly_all = (
    metro_hourly
    .join(bus_hourly, on="TripHour", how="outer_coalesce")
    .join(tra_hourly, on="TripHour", how="outer_coalesce")
    .join(thsr_hourly, on="TripHour", how="outer_coalesce")
    .join(bike_hourly, on="TripHour", how="outer_coalesce")
    .fill_null(0)
    .sort("TripHour")
    .collect(engine="streaming")
)

print(hourly_all)
print("\n=== 2. 全台灣跨城際走廊 (高鐵 + 臺鐵 Top 10 OD) ===")
thsr_p = UNIFIED / "unified_thsr_od.parquet"
if thsr_p.exists():
    thsr_pairs = (
        safe_scan_parquet(thsr_p, columns=["OriginStationName", "DestinationStationName", "Volume"])
        .group_by(["OriginStationName", "DestinationStationName"])
        .agg(pl.col("Volume").sum().alias("高鐵旅次"))
        .sort("高鐵旅次", descending=True)
        .head(10)
        .collect(engine="streaming")
    )
    print("高鐵熱門走廊:")
    print(thsr_pairs)

tra_p = UNIFIED / "unified_tra_od.parquet"
if tra_p.exists():
    tra_pairs = (
        safe_scan_parquet(tra_p, columns=["OriginStationName", "DestinationStationName", "Volume"])
        .group_by(["OriginStationName", "DestinationStationName"])
        .agg(pl.col("Volume").sum().alias("臺鐵旅次"))
        .sort("臺鐵旅次", descending=True)
        .head(10)
        .collect(engine="streaming")
    )
    print("\n臺鐵熱門走廊:")
    print(tra_pairs)
print("\n=== 3. 全台灣多模態轉乘量統計 (公車 TO3A TransferCode 分析) ===")
bus_to3a_p = UNIFIED / "unified_bus_to3a.parquet"
if bus_to3a_p.exists():
    transfer_counts = (
        safe_scan_parquet(bus_to3a_p, columns=["TransferCode", "Discount"])
        .with_columns(pl.col("TransferCode").str.slice(0, 2).alias("TransferTypePrefix"))
        .group_by("TransferTypePrefix")
        .agg(pl.len().alias("轉乘旅次"), pl.col("Discount").sum().alias("總補助金額"))
        .sort("轉乘旅次", descending=True)
        .collect(engine="streaming")
    )
else:
    transfer_counts = pl.DataFrame()
transfer_map = {
    "01": "臺鐵轉公車 (Train ➔ Bus)",
    "02": "捷運轉公車 (Metro ➔ Bus)",
    "03": "公車轉公車 (Bus ➔ Bus)",
    "04": "自行車/其他 (Bike ➔ Bus)",
    "05": "其他專案優惠",
    "07": "特定運具優惠",
    "08": "轉乘抵扣",
    "99": "一般無優惠/無轉乘"
}
print(transfer_counts)

print("\n=== 4. 捷運大都會區人流流向 (北捷/桃捷/高捷/新北捷) ===")
metro_p = UNIFIED / "unified_metro_od_o.parquet"
if metro_p.exists():
    metro_top_od = (
        safe_scan_parquet(metro_p, columns=["SourceDataset", "OriginStationName", "DestinationStationName", "Volume"])
        .group_by(["SourceDataset", "OriginStationName", "DestinationStationName"])
        .agg(pl.col("Volume").sum().alias("總旅運量"))
        .sort("總旅運量", descending=True)
        .head(15)
        .collect(engine="streaming")
    )
    print(metro_top_od)
print("\nDone!")
