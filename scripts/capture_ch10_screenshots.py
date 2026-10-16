#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Capture high-res WebP screenshots for Chapter 10: Traffic Safety & Blackspots
"""

import os
import io
import time
from playwright.sync_api import sync_playwright
from PIL import Image

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG_DIR = os.path.join(PROJECT_ROOT, "docs", "images")
os.makedirs(IMG_DIR, exist_ok=True)

BASE_URL = "http://127.0.0.1:5173/taiwan-mobility-pulse"

def save_as_webp(screenshot_bytes: bytes, out_name: str, quality=88):
    im = Image.open(io.BytesIO(screenshot_bytes))
    out_path = os.path.join(IMG_DIR, out_name)
    im.save(out_path, format="WEBP", quality=quality, method=6)
    size_kb = os.path.getsize(out_path) / 1024
    print(f" -> Saved: {out_name} ({im.size[0]}x{im.size[1]}, {size_kb:.1f} KB)")
    return out_path

def capture_ch10():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(
            viewport={"width": 1500, "height": 880},
            device_scale_factor=1.5
        )
        page = context.new_page()

        print("[Ch10-1] Navigating to Flows Map...")
        page.goto(f"{BASE_URL}/#flows")
        page.wait_for_timeout(3500)

        print("[Ch10-2] Toggling 1,339 Traffic Safety Blackspots layer...")
        safety_btn = page.locator("button:has-text('1,339處道安黑點')").first
        safety_btn.click(force=True)
        page.wait_for_timeout(2500)

        # 1. Full blackspots overview map
        save_as_webp(page.screenshot(), "ch10_traffic_safety_blackspots_map.webp")

        # 2. Click a marker to open popup
        print("[Ch10-3] Clicking a marker for popup inspection...")
        try:
            markers = page.locator("path.leaflet-interactive")
            count = markers.count()
            print(f"Found {count} interactive markers")
            if count > 0:
                markers.nth(min(20, count - 1)).click(force=True)
                page.wait_for_timeout(1500)
        except Exception as e:
            print(f"Click marker note: {e}")
        save_as_webp(page.screenshot(), "ch10_traffic_safety_popup_inspection.webp")

        # 3. Filter by Rain accidents
        print("[Ch10-4] Filtering by Rain accidents...")
        try:
            rain_filter = page.locator("button:has-text('雨天')").first
            rain_filter.click(force=True)
            page.wait_for_timeout(1500)
        except Exception as e:
            print(f"Click rain filter note: {e}")
        save_as_webp(page.screenshot(), "ch10_traffic_safety_rain_filter.webp")

        browser.close()
        print("Done capturing Chapter 10 screenshots!")

if __name__ == "__main__":
    capture_ch10()
