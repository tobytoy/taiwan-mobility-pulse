#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Taiwan Mobility Pulse - Automated Visual Screenshot Suite
Captures high-resolution, pixel-perfect WebP images of all complex/hard-to-understand features
for inclusion in the 7-chapter book and PDF publication.
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

def capture_all():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(
            viewport={"width": 1500, "height": 880},
            device_scale_factor=1.5
        )
        page = context.new_page()

        # -------------------------------------------------------------
        # 1. Chapter 1: Master Strategy Matrix (Telecom vs Ticketing vs eTag)
        # -------------------------------------------------------------
        print("\n[1/8] Capturing Ch1: Master Strategy Matrix...")
        page.goto(f"{BASE_URL}/#telecom")
        page.wait_for_timeout(2500)
        try:
            page.locator("button:has-text('第一幕：三大數據本質對決')").first.click(force=True)
            page.wait_for_timeout(1000)
        except Exception as e:
            print(f"Act 1 click note: {e}")
        save_as_webp(page.screenshot(), "ch1_telecom_master_matrix.webp")

        # -------------------------------------------------------------
        # 2. Chapter 2: Three-Layer Fusion Architecture & Data Scale
        # -------------------------------------------------------------
        print("\n[2/8] Capturing Ch2: Data Infrastructure & Fusion Architecture...")
        try:
            page.locator("button:has-text('第二幕：全域閉環融合架構')").first.click(force=True)
            page.wait_for_timeout(1200)
        except Exception as e:
            print(f"Act 2 click note: {e}")
        save_as_webp(page.screenshot(), "ch2_data_infrastructure.webp")

        # -------------------------------------------------------------
        # 3. Chapter 3A: Freight & Logistics Corridors (Hsinchu - Ports)
        # -------------------------------------------------------------
        print("\n[3/8] Capturing Ch3A: Freight Logistics Corridors...")
        page.goto(f"{BASE_URL}/#flows")
        page.wait_for_timeout(2500)
        try:
            page.locator("button:has-text('產業物流')").first.click(force=True)
            page.wait_for_timeout(2000)
        except Exception as e:
            print(f"Freight filter click note: {e}")
        save_as_webp(page.screenshot(), "ch3_corridor_freight_logistics.webp")

        # -------------------------------------------------------------
        # 4. Chapter 3B: Holiday Tourism Surge (Freeway 5 & 6)
        # -------------------------------------------------------------
        print("\n[4/8] Capturing Ch3B: Holiday Tourism Surge...")
        try:
            page.locator("button:has-text('放假日')").first.click(force=True)
            page.wait_for_timeout(800)
            page.locator("button:has-text('觀光旅遊')").first.click(force=True)
            page.wait_for_timeout(2000)
        except Exception as e:
            print(f"Holiday tourism click note: {e}")
        save_as_webp(page.screenshot(), "ch3_corridor_holiday_tourism.webp")

        # -------------------------------------------------------------
        # 5. Chapter 4: eTag Interchange Catchment Halos & Parking Pressure
        # -------------------------------------------------------------
        print("\n[5/8] Capturing Ch4: eTag Interchange Catchment Halos...")
        page.goto(f"{BASE_URL}/#heatmap")
        page.wait_for_timeout(3000)
        # Click an interchange marker if available to pop up the HUD
        try:
            interchange_marker = page.locator(".etag-discharge-halo-pulse, .leaflet-marker-icon").first
            if interchange_marker.count() > 0:
                interchange_marker.click(force=True)
                page.wait_for_timeout(1200)
        except Exception as e:
            print(f"Halo click note: {e}")
        save_as_webp(page.screenshot(), "ch4_offramp_halo_parking.webp")

        # -------------------------------------------------------------
        # 6. Chapter 5: Weather Simulation Lab & Personas Elasticity
        # -------------------------------------------------------------
        print("\n[6/8] Capturing Ch5: Weather Simulation Lab & Elasticity...")
        page.goto(f"{BASE_URL}/#personas")
        page.wait_for_timeout(2500)
        try:
            page.locator("button:has-text('天候衝擊')").first.click(force=True)
            page.wait_for_timeout(1500)
        except Exception as e:
            print(f"Weather tab click note: {e}")
        save_as_webp(page.screenshot(), "ch5_weather_personas_lab.webp")

        # -------------------------------------------------------------
        # 7. Chapter 6A: Commercial Pulse Lab (Retail Gravity & Spending)
        # -------------------------------------------------------------
        print("\n[7/8] Capturing Ch6A: Commercial Retail Gravity & Spending...")
        page.goto(f"{BASE_URL}/#commercial-lab")
        page.wait_for_timeout(3000)
        try:
            page.locator("button:has-text('旗艦零售自駕引力')").first.click(force=True)
            page.wait_for_timeout(1500)
        except Exception as e:
            print(f"Retail gravity tab click note: {e}")
        save_as_webp(page.screenshot(), "ch6_commercial_retail_gravity.webp")

        # -------------------------------------------------------------
        # 8. Chapter 6B: EV Fast Charging Siting ROI Simulator
        # -------------------------------------------------------------
        print("\n[8/8] Capturing Ch6B: EV Fast Charging Siting ROI Simulator...")
        try:
            page.locator("button:has-text('EV 高速超充')").first.click(force=True)
            page.wait_for_timeout(1500)
        except Exception as e:
            print(f"EV charging tab click note: {e}")
        save_as_webp(page.screenshot(), "ch6_ev_charging_roi_simulator.webp")

        # -------------------------------------------------------------
        # 9. Chapter 7: Door-to-Door 5-Stage Closed-Loop Journey
        # -------------------------------------------------------------
        print("\n[9/9] Capturing Ch7: Door-to-Door 5-Stage Closed-Loop...")
        page.goto(f"{BASE_URL}/#telecom")
        page.wait_for_timeout(2000)
        try:
            page.locator("button:has-text('第三幕：實戰落地與選型指南')").first.click(force=True)
            page.wait_for_timeout(1200)
        except Exception as e:
            print(f"Act 3 click note: {e}")
        save_as_webp(page.screenshot(), "ch7_door_to_door_fusion.webp")

        browser.close()
        print("\n All 9 high-resolution WebP screenshots successfully generated in docs/images/!")

if __name__ == "__main__":
    capture_all()
