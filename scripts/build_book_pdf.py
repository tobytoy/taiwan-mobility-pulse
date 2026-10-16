#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Taiwan Mobility Pulse - Master Book PDF Generator
Converts markdown chapters in docs/ into a beautifully styled single-volume PDF with:
1. Active clickable external hyperlinks to live web app (https://tobytoy.github.io/taiwan-mobility-pulse/#...)
2. Active internal clickable anchor jumps between chapters and Table of Contents
3. Automatic PDF outline/bookmarks from chapter headings
4. Gorgeous publication-grade typography, CSS diagrams, and portal teleportation cards
5. Native A4 page layout with headers, footers, and page numbers via WeasyPrint
"""

import os
import re
import sys
import shutil
import markdown
import weasyprint
import pdfplumber
import pypdfium2

SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPTS_DIR not in sys.path:
    sys.path.insert(0, SCRIPTS_DIR)
from book_css import get_book_css

PROJECT_ROOT = os.path.dirname(SCRIPTS_DIR)
DOCS_DIR = os.path.join(PROJECT_ROOT, "docs")
PUBLIC_DOCS_DIR = os.path.join(PROJECT_ROOT, "public", "docs")
PUBLIC_IMAGES_DIR = os.path.join(PUBLIC_DOCS_DIR, "images")
OUTPUT_HTML = os.path.join(PUBLIC_DOCS_DIR, "taiwan_mobility_pulse_guidebook.html")
OUTPUT_PDF = os.path.join(PUBLIC_DOCS_DIR, "taiwan_mobility_pulse_guidebook.pdf")

def sync_images():
    """Ensure images are copied from docs/images to public/docs/images."""
    os.makedirs(PUBLIC_IMAGES_DIR, exist_ok=True)
    src_images_dir = os.path.join(DOCS_DIR, "images")
    if os.path.exists(src_images_dir):
        for fname in os.listdir(src_images_dir):
            src_f = os.path.join(src_images_dir, fname)
            dst_f = os.path.join(PUBLIC_IMAGES_DIR, fname)
            if os.path.isfile(src_f):
                shutil.copy2(src_f, dst_f)
        print(f"Synced {len(os.listdir(src_images_dir))} images to {PUBLIC_IMAGES_DIR}")

CHAPTERS = [
    ("README.md", "序言與全書導讀", "README"),
    ("chapter1_data_philosophy.md", "第一章：數據哲學與選型抉擇", "chapter1_data_philosophy"),
    ("chapter2_data_dictionary_and_samples.md", "第二章：國家級數據底座與欄位實體解剖", "chapter2_data_dictionary_and_samples"),
    ("chapter3_flow_arteries.md", "第三章：全台城際與都會走廊大動脈", "chapter3_flow_arteries"),
    ("chapter4_etag_halos_heatmap.md", "第四章：熱點輻射與下匝道光暈", "chapter4_etag_halos_heatmap"),
    ("chapter5_personas_weather.md", "第五章：四大微觀人群像與天候彈性", "chapter5_personas_weather"),
    ("chapter6_climate_pulse.md", "第六章：全島氣候脈動與微氣候宜居圖譜", "chapter6_climate_pulse"),
    ("chapter7_commercial_pulse.md", "第七章：商業脈搏與站點商機評估", "chapter7_commercial_pulse"),
    ("chapter8_data_fusion_strategy.md", "第八章：國家級大數據融合戰略", "chapter8_data_fusion_strategy"),
    ("chapter9_tourism_mobility_cctv.md", "第九章：全台觀光名勝、景點即時影像 (CCTV) 與假日疏運大數據", "chapter9_tourism_mobility_cctv"),
]

def render_mermaid_replacement(code: str) -> str:
    """Renders Mermaid code into clean, publication-grade CSS flowcharts."""
    if "C1" in code and ("C6" in code or "C7" in code or "C8" in code or "C9" in code):
        # Chapter overview flowchart
        steps = [
            ("第一章：數據哲學與選型抉擇", "剛性骨架 vs. 彈性肌肉", "chapter1_data_philosophy"),
            ("第二章：國家級數據底座與欄位實體解剖", "時間跨度、欄位字典與 CODiS 氣象規格", "chapter2_data_dictionary_and_samples"),
            ("第三章：全台城際與都會走廊大動脈", "114 條動態走廊與客貨潮汐", "chapter3_flow_arteries"),
            ("第四章：熱點輻射與下匝道光暈", "eTag 車流注入與停車壓力連動", "chapter4_etag_halos_heatmap"),
            ("第五章：四大微觀人群像與天候彈性", "誰在移動？風雨如何改寫動線？", "chapter5_personas_weather"),
            ("第六章：全島氣候脈動與微氣候宜居圖譜", "30 年變異、極端排行與四季潮汐", "chapter6_climate_pulse"),
            ("第七章：商業脈搏與站點商機評估", "樞紐生活圈、EV 充電與零售快銷", "chapter7_commercial_pulse"),
            ("第八章：國家級大數據融合戰略", "門到門閉環與政策落地選型", "chapter8_data_fusion_strategy"),
            ("第九章：全台觀光名勝、景點即時影像 (CCTV) 與假日疏運大數據", "74 處 4K/360° 串流、山海脈動與即時旅運決策", "chapter9_tourism_mobility_cctv"),
        ]
        html = ['<div class="flowchart-container">']
        for i, (title, sub, cid) in enumerate(steps, 1):
            html.append(f'''<a class="flow-step" href="#{cid}">
    <div class="flow-badge">Chapter {i}</div>
    <div class="flow-title">{title}</div>
    <div class="flow-sub">{sub}</div>
</a>''')
            if i < len(steps):
                html.append('<div class="flow-arrow">▼</div>')
        html.append('</div>')
        return "\n".join(html)

    elif "Backbone" in code and "Anchor" in code:
        # Three-layer fusion architecture (Clean HTML with 0 leading indentation)
        return '''<div class="architecture-diagram">
<div class="arch-layer arch-layer-1">
    <div class="arch-layer-title">第 1 層：底層剛性真理骨架 (Census Baseline)</div>
    <div class="arch-boxes">
        <div class="arch-box">
            <div class="arch-box-title">🛣️ eTag 高速公路門架車流</div>
            <div class="arch-box-desc">0m 門架樁號絕對真實物理量 / 5大監理車種 / 產業客貨分流</div>
        </div>
        <div class="arch-box">
            <div class="arch-box-title">🚆 TICP 交通票證大數據</div>
            <div class="arch-box-desc">公分級月台閘門刷卡紀錄 / TPASS 月票 / 敬老愛心法律契約交易</div>
        </div>
    </div>
</div>
<div class="arch-connector">⚡ 天然嚴格互斥集合：100% 精準運具分擔率 (Modal Split) 零重複疊加</div>
<div class="arch-layer arch-layer-2">
    <div class="arch-layer-title">第 2 層：外層連續空間肌肉 (Flexible Shell)</div>
    <div class="arch-boxes">
        <div class="arch-box" style="flex:1;">
            <div class="arch-box-title">📡 手機電信信令 (Cellular Signaling)</div>
            <div class="arch-box-desc">無收費露天風景區人流 / 商圈街道滯留時長 / 步行最後一哩路空間連續軌跡</div>
        </div>
    </div>
</div>
<div class="arch-connector arch-connector-bottom">⚓ 硬性錨點反向閉環校準：以 eTag 門架與票證刷卡量反向校正信令空間擴推倍率</div>
</div>'''

    elif "STAGE 1" in code and "STAGE 5" in code:
        # Door-to-Door 5 stages
        stages = [
            ("STAGE 1：電信主導", "家出發 ➔ 步行出門", "電信信令記錄晨間離開永和大樓住宅，步行 400 公尺前往頂溪捷運站。"),
            ("STAGE 2：票證硬錨點", "刷 TPASS 進站", "08:15 刷卡入閘，標定為 TPASS 通勤族，毫秒級消除基站漂移。"),
            ("STAGE 3：票證硬錨點", "捷運運行 ➔ 西湖出站", "08:42 抵達內科西湖站出閘，精確確立為內科科技園區就業者。"),
            ("STAGE 4：電信主導", "商圈街廓停留消費", "出站後在瑞光路咖啡廳停留 15 分鐘，隨後進入辦公大樓駐留 9 小時。"),
            ("STAGE 5：雙數據融合", "夜間 YouBike 接駁返家", "18:10 借騎 YouBike，信令連續記錄騎乘 25 分鐘，完成全日綠運輸閉環。"),
        ]
        html = ['<div class="timeline-container">']
        for badge, title, desc in stages:
            html.append(f'''<div class="timeline-item">
    <div class="timeline-badge">{badge}</div>
    <div class="timeline-title">{title}</div>
    <div class="timeline-desc">{desc}</div>
</div>''')
        html.append('</div>')
        return "\n".join(html)

    return f'<pre class="code-block"><code>{code}</code></pre>'

def render_personas_matrix() -> str:
    svg_commuter = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>'
    svg_senior = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>'
    svg_student = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>'
    svg_tourist = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>'

    return f'''<div class="personas-grid">
    <div class="persona-card card-commuter">
        <div class="persona-header">{svg_commuter}<div><div class="persona-title">鋼鐵通勤族</div><div class="persona-sub">Iron Commuters</div></div></div>
        <div class="persona-detail">
            <div><span class="persona-badge b-commuter">票種</span>TPASS 通勤月票 (TicketType=4)</div>
            <div><span class="persona-badge b-commuter">特徵</span>早晚尖峰極端雙峰、跨生活圈剛性走廊</div>
        </div>
    </div>
    <div class="persona-card card-senior">
        <div class="persona-header">{svg_senior}<div><div class="persona-title">悠遊銀髮族</div><div class="persona-sub">Active Seniors</div></div></div>
        <div class="persona-detail">
            <div><span class="persona-badge b-senior">票種</span>敬老愛心卡 (03/04)</div>
            <div><span class="persona-badge b-senior">特徵</span>完全避開尖峰、離峰買菜/看診、極端天候敏感</div>
        </div>
    </div>
    <div class="persona-card card-student">
        <div class="persona-header">{svg_student}<div><div class="persona-title">求學青年族</div><div class="persona-sub">Gen-Z Students</div></div></div>
        <div class="persona-detail">
            <div><span class="persona-badge b-student">票種</span>高中大專學生卡 (02)</div>
            <div><span class="persona-badge b-student">特徵</span>07:00 晨間提早、補習商圈夜間散場潮</div>
        </div>
    </div>
    <div class="persona-card card-tourist">
        <div class="persona-header">{svg_tourist}<div><div class="persona-title">假日觀光客</div><div class="persona-sub">Weekend Tourists</div></div></div>
        <div class="persona-detail">
            <div><span class="persona-badge b-tourist">票種</span>單程票 Token / 行動 QR Code</div>
            <div><span class="persona-badge b-tourist">特徵</span>風景名勝聚集、週六日上午 10:00 爆發</div>
        </div>
    </div>
</div>'''

def render_data_foundation_overview() -> str:
    svg_train = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><rect x="4" y="3" width="16" height="16" rx="2"/><line x1="4" y1="11" x2="20" y2="11"/><line x1="12" y1="3" x2="12" y2="11"/><path d="m8 19-3 3"/><path d="m16 19 3 3"/></svg>'
    svg_road = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><line x1="4" y1="21" x2="8" y2="3"/><line x1="20" y1="21" x2="16" y2="3"/><line x1="12" y1="5" x2="12" y2="8"/><line x1="12" y1="13" x2="12" y2="16"/></svg>'
    svg_park = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>'
    svg_rain = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/><line x1="8" y1="19" x2="8" y2="21"/><line x1="8" y1="13" x2="8" y2="15"/><line x1="16" y1="19" x2="16" y2="21"/></svg>'

    return f'''<div class="data-matrix-card">
    <div class="data-matrix-head">全台交通動態人流數據底座概覽 (National Data Infrastructure Overview)</div>
    <table class="data-matrix-tbl">
        <thead>
            <tr>
                <th style="width: 28%;">數據庫來源類別</th>
                <th style="width: 36%;">量級規模 (Scale)</th>
                <th style="width: 36%;">時間維度與採樣顆粒度</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <div class="dm-source-title">{svg_train}交通部 TICP</div>
                    <div class="dm-source-sub">公共運輸票證庫</div>
                </td>
                <td>
                    <div class="dm-stat-highlight">4.48 億筆真實電子票證刷卡紀錄</div>
                    <div class="dm-stat-sub">(8.43 億跨月搭乘旅次人次)</div>
                </td>
                <td>
                    <div class="dm-time-badge">覆蓋 181~255 天全日連續觀測</div>
                    <div class="dm-stat-sub">交易/折讓秒級判定，離散小時聚合</div>
                </td>
            </tr>
            <tr>
                <td>
                    <div class="dm-source-title">{svg_road}高公局 eTag</div>
                    <div class="dm-source-sub">高速公路電子收費</div>
                </td>
                <td>
                    <div class="dm-stat-highlight">全國國道 325 座門架與交流道</div>
                    <div class="dm-stat-sub">覆蓋全台 5 大公路監理法定車種</div>
                </td>
                <td>
                    <div class="dm-time-badge">5 分鐘微觀通行記錄</div>
                    <div class="dm-stat-sub">24 小時連續無休車流監測</div>
                </td>
            </tr>
            <tr>
                <td>
                    <div class="dm-source-title">{svg_park}交通部 TDX</div>
                    <div class="dm-source-sub">路外/路邊停車 API</div>
                </td>
                <td>
                    <div class="dm-stat-highlight">76 大樞紐與 16 大交流道周邊</div>
                    <div class="dm-stat-sub">3,000+ 處公民營停車場車位數據</div>
                </td>
                <td>
                    <div class="dm-time-badge">1~5 分鐘即時動態刷新</div>
                    <div class="dm-stat-sub">滿位率、週轉率與階梯式費率</div>
                </td>
            </tr>
            <tr>
                <td>
                    <div class="dm-source-title">{svg_rain}CWA 中央氣象署</div>
                    <div class="dm-source-sub">歷史觀測資料庫</div>
                </td>
                <td>
                    <div class="dm-stat-highlight">全台各生活圈代表性氣象自動測站</div>
                    <div class="dm-stat-sub">累積降雨量 (mm)、陣風、溫度</div>
                </td>
                <td>
                    <div class="dm-time-badge">逐時（Hourly）連續觀測</div>
                    <div class="dm-stat-sub">晴天、微雨、豪大雨極端天候</div>
                </td>
            </tr>
        </tbody>
    </table>
</div>'''

def render_pipeline_safety_diagram() -> str:
    return '''<div class="pipeline-diagram">
    <div class="pipeline-head">
        <div class="pipeline-head-title">🛡️ 國家級交通大數據前處理安全防護管線</div>
    </div>
    <div class="pipeline-connector">▼ 雙軌平行架構 ▼</div>
    <div class="pipeline-columns">
        <div class="pipeline-col col-privacy">
            <div class="pipeline-col-title">🔒 個人隱私加鹽去識別化</div>
            <div class="pipeline-col-sub">Independent Salt Hash Architecture</div>
            <ul class="pipeline-list">
                <li>各營運商採用獨立 Salt，禁止跨商串接個人私密行蹤軌跡</li>
                <li>跨運具轉乘完全依賴票卡晶片「實體寫入代碼」嚴格判定</li>
            </ul>
        </div>
        <div class="pipeline-col col-stream">
            <div class="pipeline-col-title">⚡ 記憶體零爆破串流架構</div>
            <div class="pipeline-col-sub">PyArrow Streaming Pipeline</div>
            <ul class="pipeline-list">
                <li>16MB 區塊串流解壓縮，全管線不落磁碟避免 I/O 瓶頸</li>
                <li>Polars LazyFrame 欄位下推投影，安全控制在 1.5GB RAM 水位</li>
            </ul>
        </div>
    </div>
    <div class="pipeline-connector">▼ 終端產物 ▼</div>
    <div class="pipeline-foot">
        <div class="pipeline-foot-title">📦 最終成果：16.5GB 高壓縮 Apache Parquet 剛性母體 (體積精簡 88%)</div>
    </div>
</div>'''

def render_dual_mode_architecture() -> str:
    svg_chart = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>'
    svg_hub = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="9" y1="22" x2="9" y2="18"/><line x1="15" y1="22" x2="15" y2="18"/><line x1="8" y1="6" x2="10" y2="6"/><line x1="14" y1="6" x2="16" y2="6"/></svg>'
    svg_zap = '<svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" style="vertical-align:middle;margin-right:3px;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>'
    svg_food = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" style="vertical-align:middle;margin-right:3px;"><path d="M3 11c0-3.87 4.03-7 9-7s9 3.13 9 7H3z"/><rect x="2" y="15" width="20" height="4" rx="2"/></svg>'

    return f'''<div class="dual-mode-container">
    <div class="dual-mode-card mode-macro">
        <div class="dm-card-head">
            <div class="dm-card-icon">{svg_chart}</div>
            <div>
                <div class="dm-card-title">模式 A：都會行政區動態指數</div>
                <div class="dm-card-sub">District Scale (Macro Spatial)</div>
            </div>
        </div>
        <ul class="dm-card-list">
            <li><span class="dm-bullet">●</span><strong>人流活力值</strong> (Footfall Activity Index)</li>
            <li><span class="dm-bullet">●</span><strong>商圈消費力指數</strong> (Retail Spending Propensity)</li>
            <li><span class="dm-bullet">●</span><strong>綠運輸普及率</strong> (Green Transit Share)</li>
        </ul>
    </div>
    <div class="dual-mode-card mode-micro">
        <div class="dm-card-head">
            <div class="dm-card-icon">{svg_hub}</div>
            <div>
                <div class="dm-card-title">模式 B：全台 30 大戰略樞紐脈搏</div>
                <div class="dm-card-sub">Station Hub Scale (Micro Diagnostic)</div>
            </div>
        </div>
        <ul class="dm-card-list">
            <li><span class="dm-bullet">●</span><strong>站點微觀 HUD 面板</strong> (Micro-Hub Diagnostic Panel)</li>
            <li><span class="dm-bullet">●</span>{svg_zap}<strong>EV 充電樁缺口指數</strong> (EV Charging Gap Index)</li>
            <li><span class="dm-bullet">●</span>{svg_food}<strong>一日三餐快銷餐飲商機雷達</strong> (F&B Grab-and-Go)</li>
        </ul>
    </div>
</div>'''

def render_modal_elasticity_card() -> str:
    svg_storm = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"/><polyline points="13 11 9 17 15 17 11 23"/></svg>'
    svg_bike = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fb7185" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M12 17.5V14l-3-3 4-3 2 3h3"/></svg>'
    svg_bus = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fb7185" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><rect x="4" y="3" width="16" height="15" rx="3"/><line x1="4" y1="11" x2="20" y2="11"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/></svg>'
    svg_car = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><rect x="3" y="11" width="18" height="6" rx="2"/><path d="M5 11l2-5h10l2 5"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>'
    svg_metro = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><rect x="4" y="3" width="16" height="16" rx="2"/><line x1="4" y1="11" x2="20" y2="11"/><path d="m8 19-3 3"/><path d="m16 19 3 3"/></svg>'
    svg_thsr = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><path d="M4 15s1-8 4-8h8s3 0 4 8v3H4v-3z"/><line x1="4" y1="15" x2="20" y2="15"/></svg>'

    return f'''<div class="elasticity-dashboard">
    <div class="elasticity-head">
        <div class="elasticity-title">{svg_storm} 豪大雨情境下運具彈性移轉量 (Modal Shift Elasticity)</div>
        <div class="elasticity-badge">實證觀測數據對比</div>
    </div>
    <div class="elasticity-rows">
        <div class="elasticity-row row-gain">
            <div class="el-mode">{svg_metro}都會捷運 (Metro)</div>
            <div class="el-pill pill-gain">▲ +8.3%</div>
            <div class="el-desc"><strong>避雨首選！</strong>地下化站體完全不受風雨影響，承接大量轉移人潮</div>
        </div>
        <div class="elasticity-row row-stable">
            <div class="el-mode">{svg_thsr}高鐵 (THSR)</div>
            <div class="el-pill pill-stable">▼ -1.2%</div>
            <div class="el-desc">長途剛需穩定，幾乎不受市區風雨動搖</div>
        </div>
        <div class="elasticity-row row-drop-low">
            <div class="el-mode">{svg_car}國道自駕車流</div>
            <div class="el-pill pill-drop-low">▼ -14.2%</div>
            <div class="el-desc">視線不佳抑制非必要非尖峰出行</div>
        </div>
        <div class="elasticity-row row-drop-med">
            <div class="el-mode">{svg_bus}市區公車 (Bus)</div>
            <div class="el-pill pill-drop-med">▼ -22.6%</div>
            <div class="el-desc">路面壅塞、候車淋雨導致搭乘意願下降</div>
        </div>
        <div class="elasticity-row row-drop-high">
            <div class="el-mode">{svg_bike}YouBike 公共自行車</div>
            <div class="el-pill pill-drop-high">▼ -78.4%</div>
            <div class="el-desc">幾乎全面停擺，人流轉移至步行或搭乘公車捷運</div>
        </div>
    </div>
</div>'''

def render_selection_decision_matrix() -> str:
    return '''<div class="matrix-decision-container">
    <div class="matrix-decision-header">🎯 您的分析目標是什麼？跨源數據落地選型指南</div>
    <div class="matrix-decision-grid">
        <div class="matrix-decision-col">
            <div class="matrix-target-box">【需要法定審計憑證】</div>
            <ul class="matrix-points">
                <li>TPASS 預算補貼審計</li>
                <li>站內地下街招商選址</li>
                <li>轉乘優惠核銷憑證</li>
            </ul>
            <div class="matrix-choice-box choice-ticp">🚆 優先選【交通票證】</div>
        </div>
        <div class="matrix-decision-col">
            <div class="matrix-target-box">【需要城際物流動脈】</div>
            <ul class="matrix-points">
                <li>國道高乘載疏運調度</li>
                <li>港口貨櫃聯外運輸</li>
                <li>交流道下匝道車流注入</li>
            </ul>
            <div class="matrix-choice-box choice-etag">🛣️ 優先選【eTag 車流】</div>
        </div>
        <div class="matrix-decision-col">
            <div class="matrix-target-box">【需要無閘門開闊人潮】</div>
            <ul class="matrix-points">
                <li>跨年晚會/煙火疏散監控</li>
                <li>開放型國家風景區人潮</li>
                <li>日夜常住人口普查</li>
            </ul>
            <div class="matrix-choice-box choice-telecom">📡 優先選【電信信令】</div>
        </div>
        <div class="matrix-decision-col">
            <div class="matrix-target-box">【需要生活圈全日軌跡】</div>
            <ul class="matrix-points">
                <li>TOD 樞紐生活圈規劃</li>
                <li>政策引流商圈振興</li>
                <li>綠運輸移轉率研究</li>
            </ul>
            <div class="matrix-choice-box choice-fusion">🚀 強烈建議【三源融合】</div>
        </div>
    </div>
</div>'''

def process_markdown(content: str, current_chapter_id: str) -> str:
    """Processes markdown text, rewrites links, turns callouts into stylish cards, and replaces Mermaid."""

    # 1. Protect Mermaid code blocks with tokens that Markdown won't parse as headers
    mermaid_blocks = {}
    def stash_mermaid(match):
        token = f"@@MERMAID_BLOCK_{len(mermaid_blocks)}@@"
        mermaid_blocks[token] = match.group(1).strip()
        return token

    content = re.sub(r'```mermaid(.*?)```', stash_mermaid, content, flags=re.DOTALL)

    # 1b. Intercept ASCII diagram code blocks and replace with responsive CSS components
    custom_blocks = {}
    def stash_custom_blocks(match):
        code = match.group(1)
        if "鋼鐵通勤族" in code and "悠遊銀髮族" in code:
            token = f"@@CUSTOM_BLOCK_{len(custom_blocks)}@@"
            custom_blocks[token] = render_personas_matrix()
            return token
        elif "全台交通動態人流數據底座概覽" in code or ("數據庫來源類別" in code and "量級規模" in code):
            token = f"@@CUSTOM_BLOCK_{len(custom_blocks)}@@"
            custom_blocks[token] = render_data_foundation_overview()
            return token
        elif "國家級交通大數據前處理安全防護管線" in code:
            token = f"@@CUSTOM_BLOCK_{len(custom_blocks)}@@"
            custom_blocks[token] = render_pipeline_safety_diagram()
            return token
        elif "模式 A：都會行政區動態指數" in code and "模式 B：全台 30 大戰略樞紐脈搏" in code:
            token = f"@@CUSTOM_BLOCK_{len(custom_blocks)}@@"
            custom_blocks[token] = render_dual_mode_architecture()
            return token
        elif "YouBike 公共自行車" in code and "都會捷運" in code and "-78.4%" in code:
            token = f"@@CUSTOM_BLOCK_{len(custom_blocks)}@@"
            custom_blocks[token] = render_modal_elasticity_card()
            return token
        elif "您的分析目標是什麼" in code and "法定審計憑證" in code:
            token = f"@@CUSTOM_BLOCK_{len(custom_blocks)}@@"
            custom_blocks[token] = render_selection_decision_matrix()
            return token
        return match.group(0)

    content = re.sub(r'```(?:[a-zA-Z0-9_-]*\n)?(.*?)```', stash_custom_blocks, content, flags=re.DOTALL)

    # 2. Rewrite internal markdown links (.md -> #anchor) & sanitize PDF links
    def rewrite_md_links(match):
        label = match.group(1)
        target = match.group(2)
        if target.endswith(".md"):
            anchor = target[:-3]
            return f'[{label}](#{anchor})'
        elif ".md#" in target:
            parts = target.split(".md#")
            return f'[{label}](#{parts[1]})'
        elif ".pdf" in target:
            if "guidebook_en.pdf" in target:
                return f'[{label}](https://tobytoy.github.io/taiwan-mobility-pulse/docs/taiwan_mobility_pulse_guidebook_en.pdf)'
            elif "guidebook.pdf" in target:
                return f'[{label}](https://tobytoy.github.io/taiwan-mobility-pulse/docs/taiwan_mobility_pulse_guidebook.pdf)'
        return match.group(0)

    content = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', rewrite_md_links, content)

    # 3. Handle interactive portal links line-by-line
    lines = content.split('\n')
    processed_lines = []

    for line in lines:
        # Skip raw inline "👉 **[進入第...章](...)" at bottom since .chapter-nav handles it
        if re.search(r'👉\s*\*\*\[進入第[一二三四五六七]章', line):
            continue

        if '|' in line and 'https://tobytoy.github.io/taiwan-mobility-pulse/' in line:
            # Table row: inline badge
            def inline_btn(m):
                label = m.group(1).replace("👉", "").strip()
                url = m.group(2).strip()
                return f'<a class="table-portal-btn" href="{url}" target="_blank">🚀 {label}</a>'
            line = re.sub(r'\[([^\]]+)\]\((https://tobytoy\.github\.io/taiwan-mobility-pulse/[^)]*)\)', inline_btn, line)
            processed_lines.append(line)
        elif '👉 立即跳轉至線上系統：' in line and 'https://tobytoy.github.io/taiwan-mobility-pulse/' in line:
            # Standalone portal link: full card, fully strip bullet and asterisks
            def full_card(m):
                raw_label = m.group(1).strip()
                url = m.group(2).strip()
                clean_title = raw_label.replace("👉 立即跳轉至線上系統：", "").replace("👉", "").strip()
                return f'''
<div class="portal-callout">
    <div class="portal-badge">🌐 官方線上即時互動系統 · 傳送門 (點擊直接進入)</div>
    <div class="portal-content">
        <a class="portal-btn" href="{url}" target="_blank">
            <span class="portal-icon">🚀</span>
            <span class="portal-title">{clean_title}</span>
            <span class="portal-arrow">➔</span>
        </a>
        <div class="portal-url"><span class="portal-url-label">完整網址：</span><span class="portal-url-link">{url}</span></div>
    </div>
</div>
'''
            line = re.sub(r'^\s*(?:\*\s*)?(?:\*\*)?\[(👉\s*立即跳轉至線上系統：[^\]]*)\]\((https://tobytoy\.github\.io/taiwan-mobility-pulse/[^)]*)\)(?:\*\*)?', full_card, line)
            processed_lines.append(line)
        else:
            processed_lines.append(line)

    content = '\n'.join(processed_lines)

    # 4. Standard Markdown to HTML conversion
    html = markdown.markdown(content, extensions=['tables', 'fenced_code', 'toc'])

    # 5. Substitute rendered HTML for Mermaid & Custom tokens
    for token, code in mermaid_blocks.items():
        rendered = render_mermaid_replacement(code)
        # Markdown might wrap the token in <p>...</p>, clean it up
        html = re.sub(rf'<p>\s*{re.escape(token)}\s*</p>', rendered, html)
        html = html.replace(token, rendered)

    for token, rendered in custom_blocks.items():
        html = re.sub(rf'<p>\s*{re.escape(token)}\s*</p>', rendered, html)
        html = html.replace(token, rendered)

    return html

EMOJI_SVG_MAP = {
    '📖': '<svg class="inline-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    '📚': '<svg class="inline-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    '👉': '<svg class="inline-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>',
    '➔': '<svg class="inline-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    '📥': '<svg class="inline-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    '🗺': '<svg class="inline-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>',
    '🎯': '<svg class="inline-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fb7185" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
    '🔍': '<svg class="inline-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    '🔬': '<svg class="inline-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2"><path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/></svg>',
    '💡': '<svg class="inline-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>',
    '🛠': '<svg class="inline-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
    '🛣': '<svg class="inline-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><line x1="4" y1="21" x2="8" y2="3"/><line x1="20" y1="21" x2="16" y2="3"/><line x1="12" y1="5" x2="12" y2="8"/><line x1="12" y1="13" x2="12" y2="16"/></svg>',
    '📑': '<svg class="inline-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
    '🛡': '<svg class="inline-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    '🔒': '<svg class="inline-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    '📦': '<svg class="inline-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>',
    '⚡': '<svg class="inline-svg" width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" stroke-width="1"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    '🚆': '<svg class="inline-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2"><rect x="4" y="3" width="16" height="16" rx="2"/><line x1="4" y1="11" x2="20" y2="11"/><line x1="12" y1="3" x2="12" y2="11"/><path d="m8 19-3 3"/><path d="m16 19 3 3"/></svg>',
    '🚅': '<svg class="inline-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M4 15s1-8 4-8h8s3 0 4 8v3H4v-3z"/><line x1="4" y1="15" x2="20" y2="15"/></svg>',
    '📡': '<svg class="inline-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2"><path d="M4.93 4.93a10 10 0 0 1 14.14 0"/><path d="M7.76 7.76a6 6 0 0 1 8.48 0"/><circle cx="12" cy="12" r="2"/><path d="M12 14v8"/></svg>',
    '🌧': '<svg class="inline-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2"><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/><line x1="8" y1="19" x2="8" y2="21"/><line x1="8" y1="13" x2="8" y2="15"/><line x1="16" y1="19" x2="16" y2="21"/><line x1="16" y1="13" x2="16" y2="15"/></svg>',
    '⛈': '<svg class="inline-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2"><path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"/><polyline points="13 11 9 17 15 17 11 23"/></svg>',
    '⛅': '<svg class="inline-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"/></svg>',
    '☀️': '<svg class="inline-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
    '☀': '<svg class="inline-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
    '🅿': '<svg class="inline-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>',
    '🌐': '<svg class="inline-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    '🚛': '<svg class="inline-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
    '🏖': '<svg class="inline-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2"><path d="M18 10h4a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h4"/><path d="m14 10-2-6-2 6"/><circle cx="12" cy="14" r="4"/></svg>',
    '🧳': '<svg class="inline-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
    '💼': '<svg class="inline-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
    '🚲': '<svg class="inline-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M12 17.5V14l-3-3 4-3 2 3h3"/></svg>',
    '🚌': '<svg class="inline-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2"><rect x="4" y="3" width="16" height="15" rx="3"/><line x1="4" y1="11" x2="20" y2="11"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/><path d="M4 18v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2"/><path d="M17 18v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2"/></svg>',
    '🚗': '<svg class="inline-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fb7185" stroke-width="2"><rect x="3" y="11" width="18" height="6" rx="2"/><path d="M5 11l2-5h10l2 5"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>',
    '👔': '<svg class="inline-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M12 3 9 7l3 14 3-14-3-4z"/><path d="m9 7-5 2 2 4 3-2z"/><path d="m15 7 5 2-2 4-3-2z"/></svg>',
    '👵': '<svg class="inline-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
    '🎓': '<svg class="inline-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
    '🏢': '<svg class="inline-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="9" y1="22" x2="9" y2="18"/><line x1="15" y1="22" x2="15" y2="18"/><line x1="8" y1="6" x2="10" y2="6"/><line x1="14" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="10" y2="10"/><line x1="14" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="14" y1="14" x2="16" y2="14"/></svg>',
    '🍔': '<svg class="inline-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2"><path d="M3 11c0-3.87 4.03-7 9-7s9 3.13 9 7H3z"/><rect x="2" y="15" width="20" height="4" rx="2"/></svg>',
    '📊': '<svg class="inline-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    '🚀': '<svg class="inline-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/></svg>',
    '🧬': '<svg class="inline-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2"><path d="m8 8 8 8"/><path d="m9 2 6 6"/><path d="m2 9 6 6"/><path d="m15 16 6 6"/><path d="m16 9 6 6"/><path d="m2 16 6 6"/></svg>',
    '🎉': '<svg class="inline-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2"><path d="m2 22 1-6 5 5-6 1z"/><path d="M12 2v3"/><path d="m4.93 4.93 2.12 2.12"/><path d="M22 12h-3"/><path d="m19.07 4.93-2.12 2.12"/></svg>',
    '⚓': '<svg class="inline-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>',
}

def replace_emojis_in_html(html: str) -> str:
    parts = re.split(r'(<style\b[^>]*>.*?</style>)', html, flags=re.DOTALL | re.IGNORECASE)
    for idx in range(0, len(parts), 2):
        chunk = parts[idx]
        tag_parts = re.split(r'(<[^>]+>)', chunk)
        for t_idx in range(0, len(tag_parts), 2):
            text = tag_parts[t_idx]
            if text:
                for em, svg in EMOJI_SVG_MAP.items():
                    text = text.replace(em + '\ufe0f', svg).replace(em, svg)
                # Remove any remaining astral unicode emojis to protect Cairo from CBDT glyph bugs
                text = re.sub(r'[\U00010000-\U0010ffff](?:\ufe0f)?', '', text)
                tag_parts[t_idx] = text
        parts[idx] = "".join(tag_parts)
    return "".join(parts)

def build_html():
    print("Reading and parsing all book chapters...")
    sync_images()
    body_parts = []

    # Cover Page
    body_parts.append('''
    <div class="cover-page">
        <div class="cover-badge">國家級交通大數據與微觀人流研究專著 · 官方旗艦指南 (v1.3.1)</div>
        <h1 class="cover-title">台灣動態移動脈搏</h1>
        <h2 class="cover-subtitle">Taiwan Mobility Pulse: The Master Guide to National Multi-Modal Mobility & Spatial Intelligence</h2>
        <div class="cover-divider"></div>
        <p class="cover-desc">
            融匯交通部 TICP 4.48 億筆真實票證、高速公路局 eTag 門架車流、TDX 觀光署 74 處 4K/360° 即時影像 CCTV、<br>
            中央氣象署 CODiS 30 年氣候觀測，解構台灣地表上最震撼的 114 條動態走廊、全島微氣候潮汐與觀光山海脈動。
        </p>
        <div class="cover-meta-card">
            <div class="cover-meta-row"><strong>官方線上即時系統：</strong><a href="https://tobytoy.github.io/taiwan-mobility-pulse/">https://tobytoy.github.io/taiwan-mobility-pulse/</a></div>
            <div class="cover-meta-row"><strong>全書出版版本：</strong>Version 1.3.1 (全景精裝專著版 · 9巨章全域閉環)</div>
            <div class="cover-meta-row"><strong>研究編製團隊：</strong>Taiwan Mobility Pulse 核心研究組</div>
            <div class="cover-meta-row"><strong>數據權責機關：</strong>交通部 TICP / 交通部 TDX / 交通部高速公路局 / 交通部中央氣象署 / 交通部觀光署</div>
            <div class="cover-meta-row"><strong>發行出刊日期：</strong>2026 年 10 月 (v1.3.1)</div>
        </div>
    </div>
    ''')

    # Chapters
    for idx, (filename, title, cid) in enumerate(CHAPTERS):
        filepath = os.path.join(DOCS_DIR, filename)
        if not os.path.exists(filepath):
            print(f"Warning: {filename} does not exist, skipping.")
            continue
        
        with open(filepath, "r", encoding="utf-8") as f:
            raw_text = f.read()

        chapter_html = process_markdown(raw_text, cid)
        
        # Navigation bar at the bottom of each chapter
        nav_html = '<div class="chapter-nav">'
        if cid != "README":
            nav_html += '<a class="nav-btn nav-prev" href="#README">📖 返回全書總綱目錄 (TOC)</a>'
        if idx + 1 < len(CHAPTERS):
            next_title = CHAPTERS[idx + 1][1]
            next_cid = CHAPTERS[idx + 1][2]
            nav_html += f'<a class="nav-btn nav-next" href="#{next_cid}">👉 進入下一章：{next_title} ➔</a>'
        nav_html += '</div>'

        body_parts.append(f'''
        <section class="chapter-section" id="{cid}">
            <a id="{cid}" name="{cid}"></a>
            {chapter_html}
            {nav_html}
        </section>
        ''')

    css = get_book_css(lang="zh")

    full_html = f'''<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="utf-8">
    <title>台灣動態移動脈搏 - 全書指南 (Taiwan Mobility Pulse)</title>
    <style>{css}</style>
</head>
<body>
    {"".join(body_parts)}
</body>
</html>
'''
    full_html = replace_emojis_in_html(full_html)
    full_html = re.sub(r'href=[\'"][^\'"]*taiwan_mobility_pulse_guidebook_en\.pdf[\'"]', 'href="https://tobytoy.github.io/taiwan-mobility-pulse/docs/taiwan_mobility_pulse_guidebook_en.pdf"', full_html)
    full_html = re.sub(r'href=[\'"][^\'"]*taiwan_mobility_pulse_guidebook\.pdf[\'"]', 'href="https://tobytoy.github.io/taiwan-mobility-pulse/docs/taiwan_mobility_pulse_guidebook.pdf"', full_html)
    full_html = re.sub(r'href=[\'"]file://[^\'"]*[\'"]', 'href="https://tobytoy.github.io/taiwan-mobility-pulse/#download"', full_html)

    os.makedirs(PUBLIC_DOCS_DIR, exist_ok=True)
    with open(OUTPUT_HTML, "w", encoding="utf-8") as f:
        f.write(full_html)
    print(f"HTML successfully generated at: {OUTPUT_HTML}")
    return OUTPUT_HTML

def generate_pdf_weasyprint():
    print("Generating Master PDF with WeasyPrint...")
    os.makedirs(PUBLIC_DOCS_DIR, exist_ok=True)
    html = weasyprint.HTML(filename=OUTPUT_HTML, base_url=PUBLIC_DOCS_DIR)
    html.write_pdf(OUTPUT_PDF)
    size_mb = os.path.getsize(OUTPUT_PDF) / (1024 * 1024)
    print(f"Master PDF successfully generated at: {OUTPUT_PDF} ({size_mb:.2f} MB)")

def verify_pdf():
    print("Verifying PDF structure and hyperlinks...")
    with pdfplumber.open(OUTPUT_PDF) as pdf:
        total_pages = len(pdf.pages)
        print(f"Total Pages in PDF: {total_pages}")
        
        external_links = []
        internal_links = []
        
        for i, page in enumerate(pdf.pages):
            for annot in page.annots:
                data = annot.get("data", {})
                subtype = str(data.get("Subtype", ""))
                if "Link" in subtype:
                    action = data.get("A", {})
                    dest = data.get("Dest")
                    if action and "URI" in str(action.get("S", "")):
                        uri = action.get("URI")
                        if isinstance(uri, bytes):
                            uri = uri.decode("utf-8", errors="ignore")
                        external_links.append((i + 1, str(uri)))
                    elif dest:
                        if isinstance(dest, bytes):
                            dest = dest.decode("utf-8", errors="ignore")
                        internal_links.append((i + 1, str(dest)))
        
        print(f"Found {len(external_links)} active external links in PDF.")
        print(f"Found {len(internal_links)} active internal anchor links in PDF.")
        
        print("\nSample External Links:")
        for page_num, uri in external_links[:8]:
            print(f"  [Page {page_num}] {uri}")
            
        print("\nSample Internal Anchor Links:")
        for page_num, dest in internal_links[:8]:
            print(f"  [Page {page_num}] #{dest}")

if __name__ == "__main__":
    build_html()
    generate_pdf_weasyprint()
    verify_pdf()
