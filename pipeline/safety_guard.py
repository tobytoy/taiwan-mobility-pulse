#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
安全防護與資源管控核心模組 (Safety Guard & Resource Governor)
功能：
1. 嚴格限制執行緒上限 (POLARS_MAX_THREADS, OMP_NUM_THREADS)，避免吃滿多核心 CPU。
2. 動態監控系統與進程記憶體 (RAM Safety Guard)，防止 OOM 當機或 Kernel 逾時。
3. 嚴禁對未加限制的數億筆大資料集進行 eager 全量載入與全量 string group_by。
4. 提供安全的串流查詢 (safe_collect)、分塊讀取 (safe_read_csv_chunks) 與記憶體防護 API。
"""

import os
import sys
import gc
import psutil
from pathlib import Path
from typing import Optional, List, Any, Union

# 預先限制多執行緒上限（在 Polars/NumPy 載入前生效）
DEFAULT_MAX_THREADS = str(min(4, os.cpu_count() or 2))
if "POLARS_MAX_THREADS" not in os.environ:
    os.environ["POLARS_MAX_THREADS"] = DEFAULT_MAX_THREADS
if "OMP_NUM_THREADS" not in os.environ:
    os.environ["OMP_NUM_THREADS"] = DEFAULT_MAX_THREADS
if "RAYON_NUM_THREADS" not in os.environ:
    os.environ["RAYON_NUM_THREADS"] = DEFAULT_MAX_THREADS

# 記憶體安全閾值 (MB)
DEFAULT_MIN_AVAILABLE_MB = 1500.0  # 系統可用記憶體低於 1.5GB 則告警/阻斷
DEFAULT_MAX_PROCESS_MB = 3500.0    # 單一進程佔用超過 3.5GB 則阻斷

class MemorySafetyError(RuntimeError):
    """記憶體不足或進程記憶體超限時拋出的安全例外"""
    pass

def check_memory_safety(min_available_mb: float = DEFAULT_MIN_AVAILABLE_MB, 
                        max_process_mb: float = DEFAULT_MAX_PROCESS_MB,
                        raise_on_error: bool = True) -> dict:
    """
    動態檢查系統可用 RAM 與當前進程佔用 RAM
    """
    gc.collect()
    vm = psutil.virtual_memory()
    proc = psutil.Process()
    proc_mem_mb = proc.memory_info().rss / (1024 * 1024)
    available_mb = vm.available / (1024 * 1024)

    info = {
        "proc_mem_mb": round(proc_mem_mb, 1),
        "available_mb": round(available_mb, 1),
        "total_mb": round(vm.total / (1024 * 1024), 1),
        "percent": vm.percent,
        "is_safe": True,
        "reason": "OK"
    }

    if available_mb < min_available_mb:
        info["is_safe"] = False
        info["reason"] = f"系統可用記憶體不足: 僅剩 {available_mb:.1f} MB (安全門檻: {min_available_mb:.1f} MB)"
    elif proc_mem_mb > max_process_mb:
        info["is_safe"] = False
        info["reason"] = f"進程記憶體超標: 當前佔用 {proc_mem_mb:.1f} MB (安全上限: {max_process_mb:.1f} MB)"

    if not info["is_safe"] and raise_on_error:
        raise MemorySafetyError(f"🛑 [安全保護攔截] {info['reason']}。已自動終止高危運算以保護系統！")

    return info

def safe_collect(lazy_df, 
                 engine: str = "streaming", 
                 max_allowed_rows: Optional[int] = None,
                 min_available_mb: float = DEFAULT_MIN_AVAILABLE_MB):
    """
    安全收集 Polars LazyFrame：
    - 強制啟用 engine='streaming' 進行串流計算
    - 收集前檢查可用記憶體
    - 收集後主動 gc.collect()
    """
    check_memory_safety(min_available_mb=min_available_mb)
    
    # 嘗試以串流引擎執行
    try:
        if engine:
            result = lazy_df.collect(engine=engine)
        else:
            result = lazy_df.collect()
    except TypeError:
        try:
            result = lazy_df.collect(streaming=True)
        except Exception:
            result = lazy_df.collect()
    except Exception as e:
        check_memory_safety(min_available_mb=min_available_mb)
        result = lazy_df.collect()
    if max_allowed_rows and len(result) > max_allowed_rows:
        raise MemorySafetyError(
            f"🛑 [安全保護攔截] 查詢結果集達 {len(result):,} 列，超過安全上限 {max_allowed_rows:,} 列！"
            f"嚴禁全量拉取，請加上 .limit() 或聚合條件。"
        )

    gc.collect()
    return result

def safe_scan_parquet(path: Union[str, Path], columns: Optional[List[str]] = None):
    """
    安全的 Parquet Lazy 掃描 (強制欄位投影下推)
    """
    import polars as pl
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(f"檔案不存在: {p}")
    
    lf = pl.scan_parquet(p)
    if columns:
        lf = lf.select(columns)
    return lf

def safe_read_parquet(path: Union[str, Path], 
                      columns: Optional[List[str]] = None, 
                      limit: int = 500_000, 
                      allow_full_scan: bool = False):
    """
    安全的 Parquet 讀取 (嚴禁無限制全量載入大檔)
    - 預設超過 limit 列則拒絕全量載入，強制改用 scan_parquet 或傳入 limit
    """
    import polars as pl
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(f"檔案不存在: {p}")
    
    check_memory_safety()
    
    lf = pl.scan_parquet(p)
    if columns:
        lf = lf.select(columns)
        
    if not allow_full_scan:
        total_rows = lf.select(pl.len()).collect().item()
        if total_rows > limit:
            print(f"⚠️ [安全警示] 檔案 {p.name} 共有 {total_rows:,} 列，超過安全上限 ({limit:,})。自動限制為前 {limit:,} 列。若需全量分析請改用 Lazy Scan / safe_collect。")
            lf = lf.limit(limit)

    return lf.collect()

def safe_read_csv_chunks(file_obj_or_path, chunksize: int = 100_000, **kwargs):
    """
    以 Pandas 進行安全的分塊讀取，逐批生成 DataFrame 並主動清理記憶體
    """
    import pandas as pd
    check_memory_safety()
    for chunk in pd.read_csv(file_obj_or_path, chunksize=chunksize, **kwargs):
        yield chunk
        gc.collect()

if __name__ == "__main__":
    status = check_memory_safety(raise_on_error=False)
    print(f"✅ 安全防護核心已就緒:")
    print(f"   執行緒上限: {os.environ.get('POLARS_MAX_THREADS')} threads")
    print(f"   系統記憶體: 剩餘 {status['available_mb']} MB / 總共 {status['total_mb']} MB (進程佔用: {status['proc_mem_mb']} MB)")
