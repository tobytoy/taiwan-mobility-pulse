#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TICP 交通數據匯流平臺 - 票證資料每日定時下載與整理工具
支援限速防封 (Rate Limiting)、斷點續傳 (Resumable)、自動解壓縮整理至 history-datas/YYYY-MM-DD/
"""

import os
import sys
import time
import json
import re
import zipfile
import shutil
import argparse
import subprocess
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional

try:
    from rich.console import Console
    from rich.progress import Progress, SpinnerColumn, BarColumn, TextColumn, TimeRemainingColumn
    from rich.table import Table
    console = Console()
except ImportError:
    console = None

BASE_DIR = Path("/home/toby/projects/work-tools/票證資料")
DEFAULT_HISTORY_DIR = BASE_DIR / "history-datas"
DEFAULT_META_FILE = BASE_DIR / "datasets_meta.json"

TICP_DOWNLOAD_URL = "https://ticp.motc.gov.tw/ConvergeProj/dataService/dataDownload?catId=2"
LOCK_FILE = Path("/tmp/ticp_download_daily.lock")

def acquire_lock():
    try:
        import fcntl
        f = open(LOCK_FILE, "w")
        fcntl.flock(f, fcntl.LOCK_EX | fcntl.LOCK_NB)
        return f
    except Exception:
        return None
    if console:
        console.print(msg, style=style)
    else:
        print(msg)


def run_opencli_eval(session: str, js_code: str) -> Any:
    """Execute JavaScript in opencli browser session and return parsed JSON."""
    try:
        res = subprocess.run(
            ["opencli", "browser", session, "eval", js_code],
            capture_output=True,
            text=True,
            check=True
        )
        return json.loads(res.stdout)
    except subprocess.CalledProcessError as e:
        error_msg = e.stderr or e.stdout
        raise RuntimeError(f"opencli browser eval failed: {error_msg}")
    except json.JSONDecodeError as e:
        raise RuntimeError(f"Failed to parse JSON from opencli output: {e}")


def ensure_page_open(session: str):
    """Ensure the TICP data download page is open in the browser session."""
    log(f"[*] 檢查 opencli 瀏覽器 session [{session}]...", "cyan")
    
    check_code = "(() => ({ url: location.href, title: document.title, hasTable: !!document.querySelector('#table_layout_indata') }))()"
    try:
        info = run_opencli_eval(session, check_code)
        if "dataDownload" in info.get("url", "") and info.get("hasTable"):
            log(f"  ✓ 頁面已就緒: {info['title']}", "green")
            return
    except Exception:
        pass

    log(f"  ➜ 開啟頁面: {TICP_DOWNLOAD_URL}", "yellow")
    subprocess.run(
        ["opencli", "browser", session, "open", TICP_DOWNLOAD_URL],
        check=True
    )
    time.sleep(3)


def fetch_datasets_metadata(session: str) -> List[Dict[str, Any]]:
    """Fetch complete list of datasets from local cache or DataTable in browser."""
    if DEFAULT_META_FILE.exists():
        try:
            with open(DEFAULT_META_FILE, "r", encoding="utf-8") as f:
                cached = json.load(f)
                if isinstance(cached, list) and len(cached) > 0:
                    log(f"  ✓ 從本地詮釋資料庫載入 {len(cached)} 筆票證資料集清單", "green")
                    return cached
        except Exception:
            pass

    log("[*] 從平臺載入所有票證資料集清單...", "cyan")
    code = """(() => {
        const dt = window.jQuery("#table_layout_indata").DataTable();
        const allRows = dt.rows().data().toArray();
        return allRows.map((row, idx) => {
            const id = row[0];
            const divName = document.createElement("div");
            divName.innerHTML = row[1];
            const name = divName.innerText.trim();
            
            const divDownload = document.createElement("div");
            divDownload.innerHTML = row[11] || "";
            const sampleLink = divDownload.querySelector(".sample-download");
            const sampleId = sampleLink ? sampleLink.getAttribute("data-id") : id;
            const sampleName = sampleLink ? sampleLink.getAttribute("data-name") : name;
            
            const divCat = document.createElement("div");
            divCat.innerHTML = row[4] || "";
            const category = divCat.innerText.trim();
            
            const divLevel = document.createElement("div");
            divLevel.innerHTML = row[5] || "";
            const level = divLevel.innerText.trim();
            
            const org = row[2];
            const provider = row[3];
            const updateTime = row[6];
            const dataRange = row[7];
            const freq = row[8];
            
            const divDesc = document.createElement("div");
            divDesc.innerHTML = row[9] || "";
            const descBtn = divDesc.querySelector("button");
            const desc = descBtn ? descBtn.getAttribute("data-desc") : "";

            return {
                index: idx + 1,
                id,
                name,
                sampleId,
                sampleName,
                category,
                level,
                org,
                provider,
                updateTime,
                dataRange,
                freq,
                desc
            };
        });
    })()"""
    
    datasets = run_opencli_eval(session, code)
    log(f"  ✓ 成功獲取 {len(datasets)} 筆資料集定義", "green")
    
    # Cache metadata
    with open(DEFAULT_META_FILE, "w", encoding="utf-8") as f:
        json.dump(datasets, f, ensure_ascii=False, indent=2)
        
    return datasets


def download_batch_via_browser(
    session: str, 
    batch: List[Dict[str, Any]], 
    item_delay: float = 0.5
) -> List[Dict[str, Any]]:
    """Download a batch of samples sequentially inside browser with inter-item delay."""
    
    items_json = json.dumps(batch, ensure_ascii=False)
    
    code = f"""(async () => {{
        const items = {items_json};
        const delayMs = {int(item_delay * 1000)};
        const sleep = ms => new Promise(r => setTimeout(r, ms));
        const results = [];
        
        for (let i = 0; i < items.length; i++) {{
            const item = items[i];
            if (i > 0 && delayMs > 0) {{
                await sleep(delayMs);
            }}
            try {{
                const url = "/ConvergeProj/sampleDownload?setId=" + item.sampleId + "&title=" + encodeURIComponent(item.sampleName) + "&purpose=5";
                const resp = await fetch(url);
                if (!resp.ok) {{
                    results.push({{ id: item.id, sampleName: item.sampleName, ok: false, status: resp.status, statusText: resp.statusText }});
                    continue;
                }}
                const cd = resp.headers.get("content-disposition") || "";
                const blob = await resp.blob();
                
                const base64 = await new Promise((resolve) => {{
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result.split(",")[1]);
                    reader.readAsDataURL(blob);
                }});
                
                let filename = item.id + "_" + item.sampleName + ".zip";
                if (cd) {{
                    const match = cd.match(/filename\\\\*?=(?:UTF-8'')?"?([^";]+)"?/i);
                    if (match && match[1]) {{
                        try {{
                            filename = decodeURIComponent(match[1].trim());
                        }} catch (e) {{
                            filename = match[1].trim();
                        }}
                    }}
                }}
                
                results.push({{
                    id: item.id,
                    sampleId: item.sampleId,
                    sampleName: item.sampleName,
                    ok: true,
                    filename: filename,
                    base64: base64,
                    size: blob.size
                }});
            }} catch (err) {{
                results.push({{ id: item.id, sampleName: item.sampleName, ok: false, error: err.message }});
            }}
        }}
        return results;
    }})()"""
    
    return run_opencli_eval(session, code)


def run_daily_download(
    date_str: Optional[str] = None,
    session: str = "ticp",
    batch_size: int = 5,
    delay: float = 0.8,
    batch_delay: float = 1.5,
    keyword_filter: Optional[str] = None,
    limit: Optional[int] = None,
    extract_csv: bool = True
):
    target_date = date_str or datetime.now().strftime("%Y-%m-%d")
    date_dir = DEFAULT_HISTORY_DIR / target_date
    zips_dir = date_dir / "zips"
    csvs_dir = date_dir / "csvs"
    
    zips_dir.mkdir(parents=True, exist_ok=True)
    if extract_csv:
        csvs_dir.mkdir(parents=True, exist_ok=True)
        
    manifest_path = date_dir / "manifest.json"
    manifest: Dict[str, Any] = {}
    if manifest_path.exists():
        try:
            with open(manifest_path, "r", encoding="utf-8") as f:
                saved = json.load(f)
                if isinstance(saved, dict) and "datasets" in saved:
                    manifest = {d["id"]: d for d in saved["datasets"]}
                elif isinstance(saved, dict):
                    manifest = saved
        except Exception:
            manifest = {}

    log(f"============================================================", "bold blue")
    log(f" 🚀 TICP 票證資料每日定時下載", "bold cyan")
    log(f"   目標日期: [bold]{target_date}[/bold]")
    log(f"   輸出目錄: {date_dir}")
    log(f"   限速設定: 單項延遲 {delay}s, 批次間隔 {batch_delay}s, 批次大小 {batch_size}")
    log(f"============================================================", "bold blue")

    # Ensure browser is ready
    ensure_page_open(session)
    
    # Get metadata
    datasets = fetch_datasets_metadata(session)
    
    # Apply filters
    if keyword_filter:
        datasets = [d for d in datasets if keyword_filter in d["name"] or keyword_filter in d["provider"]]
        log(f"  ➜ 篩選關鍵字 '{keyword_filter}': 共 {len(datasets)} 項", "yellow")
        
    if limit and limit > 0:
        datasets = datasets[:limit]
        log(f"  ➜ 限制下載數量: {len(datasets)} 項", "yellow")

    # Filter already downloaded items
    to_download = []
    for d in datasets:
        ds_id = d["id"]
        if ds_id in manifest and manifest[ds_id].get("ok"):
            zip_name = manifest[ds_id].get("zip_file") or manifest[ds_id].get("filename")
            if zip_name and (zips_dir / zip_name).exists() and (zips_dir / zip_name).stat().st_size > 0:
                continue
        to_download.append(d)
        
    log(f"[*] 待下載: [bold green]{len(to_download)}[/bold green] / {len(datasets)} 筆 (已略過 {len(datasets) - len(to_download)} 筆已完成項目)", "cyan")
    
    if not to_download:
        log("🎉 今日所有資料集已下載完畢，無需額外下載！", "bold green")
        return

    # Download in batches with rate limiting
    total_batches = (len(to_download) + batch_size - 1) // batch_size
    success_count = 0
    fail_count = 0
    
    for b_idx in range(total_batches):
        batch = to_download[b_idx * batch_size : (b_idx + 1) * batch_size]
        curr_progress = f"[{min((b_idx + 1) * batch_size, len(to_download))}/{len(to_download)}]"
        log(f"\n批次 ({b_idx + 1}/{total_batches}) {curr_progress} 下載中...", "cyan")
        
        try:
            results = download_batch_via_browser(session, batch, item_delay=delay)
            
            for res in results:
                ds_id = res["id"]
                meta = next((d for d in datasets if d["id"] == ds_id), {})
                
                if res.get("ok") and res.get("base64"):
                    clean_zip_name = re.sub(r'[/\\?%*:|"<> ]', '_', res["filename"])
                    zip_path = zips_dir / clean_zip_name
                    
                    # Write ZIP
                    import base64
                    zip_bytes = base64.b64decode(res["base64"])
                    with open(zip_path, "wb") as f:
                        f.write(zip_bytes)
                        
                    csv_name = ""
                    csv_size = 0
                    if extract_csv:
                        try:
                            with zipfile.ZipFile(zip_path, "r") as z:
                                for member in z.namelist():
                                    # Zip slip prevention (SEC-006)
                                    if member.endswith(".csv") and not member.startswith('/') and '..' not in member:
                                        clean_csv_name = f"{ds_id}_{meta.get('name', clean_zip_name)}.csv"
                                        clean_csv_name = re.sub(r'[^A-Za-z0-9_\-\u4e00-\u9fff]', '_', clean_csv_name)
                                        csv_dest = (csvs_dir / clean_csv_name).resolve()
                                        if not str(csv_dest).startswith(str(csvs_dir.resolve())):
                                            continue
                                        with z.open(member) as src, open(csv_dest, "wb") as dst:
                                            shutil.copyfileobj(src, dst)
                                        csv_name = clean_csv_name
                                        csv_size = csv_dest.stat().st_size
                                        break
                        except Exception as e:
                            log(f"    解壓縮 CSV 失敗: {e}", "red")

                    manifest[ds_id] = {
                        "id": ds_id,
                        "name": meta.get("name", res["sampleName"]),
                        "provider": meta.get("provider", ""),
                        "level": meta.get("level", ""),
                        "zip_file": clean_zip_name,
                        "csv_file": csv_name,
                        "zip_size": len(zip_bytes),
                        "csv_size": csv_size,
                        "downloaded_at": datetime.now().isoformat(),
                        "ok": True
                    }
                    success_count += 1
                    log(f"  ✓ [{ds_id}] {meta.get('name', res['sampleName'])} ({len(zip_bytes)/1024:.1f} KB)", "green")
                else:
                    err_text = res.get("error") or f"HTTP {res.get('status')}: {res.get('statusText')}"
                    manifest[ds_id] = {
                        "id": ds_id,
                        "name": meta.get("name", res.get("sampleName", "")),
                        "ok": False,
                        "error": err_text,
                        "attempted_at": datetime.now().isoformat()
                    }
                    fail_count += 1
                    log(f"  ✗ [{ds_id}] {meta.get('name', '')} 下載失敗 ({err_text})", "red")
                    
            # Save manifest incrementally
            daily_summary = {
                "date": target_date,
                "total_datasets": len(manifest),
                "successful_downloads": sum(1 for v in manifest.values() if v.get("ok")),
                "failed_downloads": sum(1 for v in manifest.values() if not v.get("ok")),
                "total_zip_bytes": sum(v.get("zip_size", 0) for v in manifest.values() if v.get("ok")),
                "total_csv_bytes": sum(v.get("csv_size", 0) for v in manifest.values() if v.get("ok")),
                "updated_at": datetime.now().isoformat(),
                "datasets": list(manifest.values())
            }
            with open(manifest_path, "w", encoding="utf-8") as f:
                json.dump(daily_summary, f, ensure_ascii=False, indent=2)
                
            # Inter-batch delay to protect server
            if b_idx < total_batches - 1 and batch_delay > 0:
                time.sleep(batch_delay)
                
        except Exception as e:
            log(f"  批次執行異常: {e}", "red")
            time.sleep(3)

    log("\n============================================================", "bold blue")
    log(f" 🎉 下載完成！成功: {success_count} 筆, 失敗: {fail_count} 筆", "bold green" if fail_count == 0 else "bold yellow")
    log(f"    ZIP 目錄: {zips_dir}", "cyan")
    if extract_csv:
        log(f"    CSV 目錄: {csvs_dir}", "cyan")
    log(f"    Manifest: {manifest_path}", "cyan")
    log("============================================================", "bold blue")

    # 自動轉換為 Parquet 與建立 Unified 合併資料集
    if extract_csv:
        try:
            from convert_to_parquet import convert_daily_folder
            log("\n[*] 自動轉換 CSV 檔案為 Parquet 格式...", "cyan")
            convert_daily_folder(target_date)
        except Exception as e:
            log(f"  [Warn] Parquet 轉換失敗: {e}", "yellow")


def main():
    parser = argparse.ArgumentParser(description="TICP 票證資料每日定時下載與整理工具")
    parser.add_argument("--date", type=str, default=None, help="目標日期 (格式: YYYY-MM-DD，預設為今日)")
    parser.add_argument("--session", type=str, default="ticp", help="opencli browser session 名稱 (預設: ticp)")
    parser.add_argument("--batch-size", type=int, default=5, help="每批次下載數量 (預設: 5)")
    parser.add_argument("--delay", type=float, default=0.8, help="單項下載間隔秒數 (預設: 0.8s)")
    parser.add_argument("--batch-delay", type=float, default=1.5, help="批次間隔秒數 (預設: 1.5s)")
    parser.add_argument("--filter", type=str, default=None, help="關鍵字篩選 (如: 捷運、自行車、高鐵)")
    parser.add_argument("--limit", type=int, default=None, help="測試用：限制下載總數")
    parser.add_argument("--no-csv", action="store_true", help="不自動解壓縮 CSV")

    args = parser.parse_args()
    
    lock_handle = acquire_lock()
    if lock_handle is None:
        log("⚠️ 已有另一個下載程序正在執行中 (Lock held)，自動退出避免並發衝突。", "bold yellow")
        sys.exit(0)

    run_daily_download(
        session=args.session,
        batch_size=args.batch_size,
        delay=args.delay,
        batch_delay=args.batch_delay,
        keyword_filter=args.filter,
        limit=args.limit,
        extract_csv=not args.no_csv
    )


if __name__ == "__main__":
    main()
