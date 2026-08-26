#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
將 TICP 下載的資料批次轉換為高效能 Apache Parquet 格式
支援直接從 zips/ 記憶體讀取或從 csvs/ 讀取，並自動建立全台合併資料集 (Unified Datasets)
"""

import os
import sys
import gc
import time
import json
import zipfile
import io
from pathlib import Path
import pyarrow as pa
import pyarrow.csv as pc
import pyarrow.parquet as pq

BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.append(str(BASE_DIR))

from safety_guard import check_memory_safety
import polars as pl
import pandas as pd
from concurrent.futures import ThreadPoolExecutor

HISTORY_DIR = BASE_DIR / "history-datas"
NUMERIC_COLS = {
    "Volume", "Price", "Discount", "PaymentPrice", "TicketCount", 
    "InVolume", "OutVolume", "ErrorCode", "Result", "IsAbnormal",
    "BoardingStopSequence", "DeboardingStopSequence", "TripHour",
    "Direction", "FarePricingType", "BikeType"
}

def clean_and_type_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """標準化欄位型態，避免 object 混合型態錯誤"""
    for col in df.columns:
        if col in NUMERIC_COLS:
            df[col] = pd.to_numeric(df[col], errors="coerce")
        else:
            df[col] = df[col].astype(str).replace({"nan": None, "None": None, "<NA>": None})
    return df

def convert_single_zip(zip_path: Path, output_dir: Path) -> dict:
    """採用 PyArrow 串流區塊讀取 ZIP 內 CSV 並轉換為 Parquet，記憶體恆定受控 (< 100MB)"""
    pq_path = output_dir / (zip_path.stem + ".parquet")
    check_memory_safety(min_available_mb=1200.0)
    
    try:
        with zipfile.ZipFile(zip_path, "r") as z:
            csv_names = [m for m in z.namelist() if m.endswith(".csv") and not m.startswith('/') and '..' not in m]
            if not csv_names:
                return {"name": zip_path.name, "status": "error", "error": "No CSV in zip"}
            csv_name = csv_names[0]
            with z.open(csv_name) as f:
                read_options = pc.ReadOptions(
                    skip_rows=1,  # 跳過第一行中文標題
                    block_size=16 * 1024 * 1024
                )
                parse_options = pc.ParseOptions(delimiter=',')
                convert_options = pc.ConvertOptions(strings_can_be_null=True)
                
                reader = pc.open_csv(
                    f,
                    read_options=read_options,
                    parse_options=parse_options,
                    convert_options=convert_options
                )
                
                writer = None
                total_rows = 0
                
                for batch in reader:
                    table = pa.Table.from_batches([batch])
                    if writer is None:
                        writer = pq.ParquetWriter(pq_path, table.schema, compression='zstd', compression_level=5)
                    writer.write_table(table)
                    total_rows += len(table)
                    del table
                    del batch
                    
                if writer:
                    writer.close()
        
        gc.collect()
        zip_size = zip_path.stat().st_size
        pq_size = pq_path.stat().st_size if pq_path.exists() else 0
        
        return {
            "name": zip_path.name,
            "rows": total_rows,
            "zip_bytes": zip_size,
            "pq_bytes": pq_size,
            "status": "success"
        }
    except Exception as e:
        return {
            "name": zip_path.name,
            "status": "error",
            "error": str(e)
        }
def build_unified_datasets(date_dir: Path):
    """將同類型 Parquet 資料集彙整合併為單一檔案，方便全台跨縣市統計分析"""
    pq_dir = date_dir / "parquets"
    unified_dir = date_dir / "unified"
    unified_dir.mkdir(parents=True, exist_ok=True)
    
    categories = {
        "unified_bike_to3a.parquet": lambda f: "自行車" in f.name and "TO3A" in f.name,
        "unified_bike_to2a.parquet": lambda f: "自行車" in f.name and "TO2A" in f.name,
        "unified_bus_to3a.parquet": lambda f: "公車" in f.name and "TO3A" in f.name,
        "unified_bus_to2a.parquet": lambda f: "公車" in f.name and "TO2A" in f.name,
        "unified_bus_od_o.parquet": lambda f: "公車" in f.name and "OD" in f.name and "(O)" in f.name,
        "unified_bus_od_d.parquet": lambda f: "公車" in f.name and "OD" in f.name and "(D)" in f.name,
        "unified_metro_od_o.parquet": lambda f: "捷運" in f.name and "OD" in f.name and "(O)" in f.name,
        "unified_metro_od_d.parquet": lambda f: "捷運" in f.name and "OD" in f.name and "(D)" in f.name,
        "unified_metro_hourly.parquet": lambda f: "捷運" in f.name and "分時進出量" in f.name,
        "unified_thsr_od.parquet": lambda f: "高鐵" in f.name and "OD" in f.name,
        "unified_tra_od.parquet": lambda f: "臺鐵" in f.name and "OD" in f.name,
    }
    
    pq_files = list(pq_dir.glob("*.parquet"))
    print("\n--- 正在建立全台彙整資料集 (Unified Datasets) ---")
    
    for out_name, match_fn in categories.items():
        matched_files = sorted([f for f in pq_files if match_fn(f)])
        if not matched_files:
            continue
        
        out_path = unified_dir / out_name
        try:
            # 使用 Polars Lazy Scan 與 sink_parquet 實現串流整合，避免載入所有 DataFrame
            lfs = []
            for mf in matched_files:
                lf = pl.scan_parquet(mf).with_columns(pl.lit(mf.stem).alias("SourceDataset"))
                lfs.append(lf)
            
            if lfs:
                combined_lf = pl.concat(lfs, how="diagonal")
                combined_lf.sink_parquet(out_path, compression="zstd")
                
                # 取 row count
                row_count = pl.scan_parquet(out_path).select(pl.len()).collect().item()
                size_mb = out_path.stat().st_size / (1024 * 1024)
                print(f"  ✅ {out_name:<30} ({len(matched_files):>2} 檔合併, {row_count:>7,} 列, {size_mb:.2f} MB)")
        except Exception as e:
            print(f"  [Warn] 串流合併 {out_name} 異常，回退安全分塊寫入: {e}")
            # 安全分塊寫入
            writer = None
            total_rows = 0
            for mf in matched_files:
                try:
                    t = pq.read_table(mf)
                    # add column SourceDataset
                    src_arr = pa.array([mf.stem] * len(t))
                    t = t.append_column("SourceDataset", src_arr)
                    if writer is None:
                        writer = pq.ParquetWriter(out_path, t.schema, compression="zstd")
                    writer.write_table(t)
                    total_rows += len(t)
                    del t
                except Exception as ex:
                    print(f"    Failed appending {mf.name}: {ex}")
            if writer:
                writer.close()
            gc.collect()

def convert_daily_folder(date_str: str = None, clean_csvs: bool = True):
    """轉換指定日期資料夾的所有資料"""
    if date_str:
        target_dates = [HISTORY_DIR / date_str]
    else:
        target_dates = sorted([d for d in HISTORY_DIR.iterdir() if d.is_dir()])
    
    for date_dir in target_dates:
        zips_dir = date_dir / "zips"
        pq_dir = date_dir / "parquets"
        pq_dir.mkdir(parents=True, exist_ok=True)
        
        zip_files = sorted(list(zips_dir.glob("*.zip")))
        if not zip_files:
            continue
            
        print(f"\n=======================================================")
        print(f"開始轉換: {date_dir.name} ({len(zip_files)} 個 ZIP 檔案)")
        print(f"輸出目錄: {pq_dir}")
        print(f"=======================================================")
        
        t0 = time.time()
        results = []
        with ThreadPoolExecutor(max_workers=8) as executor:
            futures = [executor.submit(convert_single_zip, f, pq_dir) for f in zip_files]
            for f in futures:
                results.append(f.result())
        
        elapsed = time.time() - t0
        
        success = [r for r in results if r.get("status") == "success"]
        errors = [r for r in results if r.get("status") == "error"]
        
        total_pq_mb = sum(r["pq_bytes"] for r in success) / (1024 * 1024)
        total_rows = sum(r["rows"] for r in success)
        
        print(f"\n轉換完成！耗時: {elapsed:.2f} 秒")
        print(f"成功: {len(success)} 檔, 失敗: {len(errors)} 檔")
        print(f"總資料列數: {total_rows:,} 列")
        print(f"轉換後 Parquet 總容量: {total_pq_mb:.2f} MB")
        
        # 建立彙整檔案
        build_unified_datasets(date_dir)
        
        # 若存在 csvs 目錄且設定清理，則清理 csvs
        csv_dir = date_dir / "csvs"
        if clean_csvs and csv_dir.exists():
            import shutil
            shutil.rmtree(csv_dir, ignore_errors=True)
            print("  ✓ 已自動清理中介 CSV 檔案以節省磁碟空間")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Convert TICP data to Parquet")
    parser.add_argument("date", nargs="?", default=None, help="Date folder name (e.g. 2026-08-20)")
    parser.add_argument("--date", dest="date_opt", default=None, help="Date folder name")
    parser.add_argument("--no-clean", dest="no_clean", action="store_true", help="Do not clean csvs")
    args = parser.parse_args()
    
    target_d = args.date_opt or args.date
    convert_daily_folder(target_d, clean_csvs=not args.no_clean)
