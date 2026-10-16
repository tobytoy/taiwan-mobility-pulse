#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Taiwan Mobility Pulse - English Master Book PDF Generator
Converts markdown chapters in docs/en/ into a publication-grade single-volume PDF with:
1. Publication-grade dark mode layout, typography & CSS (#0b0f19)
2. Strict image containment (max-width: 100% !important)
3. Active clickable external hyperlinks to live web app (https://tobytoy.github.io/taiwan-mobility-pulse/#...)
4. Active internal clickable anchor jumps between chapters and Table of Contents
5. Automatic PDF outline/bookmarks from chapter headings
6. Native A4 page layout with headers, footers, and page numbers via WeasyPrint
"""

import os
import re
import sys
import shutil
import markdown
import weasyprint
import pdfplumber
import pypdfium2

# Ensure scripts directory is on sys.path to import book_css
SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPTS_DIR not in sys.path:
    sys.path.insert(0, SCRIPTS_DIR)
from book_css import get_book_css

PROJECT_ROOT = os.path.dirname(SCRIPTS_DIR)
DOCS_DIR = os.path.join(PROJECT_ROOT, "docs")
EN_DOCS_DIR = os.path.join(DOCS_DIR, "en")
PUBLIC_DOCS_DIR = os.path.join(PROJECT_ROOT, "public", "docs")
PUBLIC_IMAGES_DIR = os.path.join(PUBLIC_DOCS_DIR, "images")
OUTPUT_HTML = os.path.join(PUBLIC_DOCS_DIR, "taiwan_mobility_pulse_guidebook_en.html")
OUTPUT_PDF = os.path.join(PUBLIC_DOCS_DIR, "taiwan_mobility_pulse_guidebook_en.pdf")

CHAPTERS = [
    ("README.md", "Preface & Master Guidebook Navigation", "README"),
    ("chapter1_data_philosophy.md", "Chapter 1: Data Philosophy & Architectural Selection", "chapter1_data_philosophy"),
    ("chapter2_data_dictionary_and_samples.md", "Chapter 2: National Data Foundation & Entity Schemas", "chapter2_data_dictionary_and_samples"),
    ("chapter3_flow_arteries.md", "Chapter 3: Intercity Arteries & Urban Mobility Corridors", "chapter3_flow_arteries"),
    ("chapter4_etag_halos_heatmap.md", "Chapter 4: Hotspot Radiation & Off-Ramp Catchment Halos", "chapter4_etag_halos_heatmap"),
    ("chapter5_personas_weather.md", "Chapter 5: Four Micro-Personas & Weather Sensitivity", "chapter5_personas_weather"),
    ("chapter6_climate_pulse.md", "Chapter 6: Islandwide Climate Pulse & Microclimate Livability", "chapter6_climate_pulse"),
    ("chapter7_commercial_pulse.md", "Chapter 7: Commercial Pulse & Station Hub Intelligence", "chapter7_commercial_pulse"),
    ("chapter8_data_fusion_strategy.md", "Chapter 8: National Multi-Source Data Fusion Strategy", "chapter8_data_fusion_strategy"),
    ("chapter9_tourism_mobility_cctv.md", "Chapter 9: Scenic Tourism, Live CCTVs & Holiday Traffic Dispersal", "chapter9_tourism_mobility_cctv"),
    ("chapter10_traffic_safety_blackspots.md", "Chapter 10: Nationwide Historical Traffic Safety & Fatal Blackspots Atlas", "chapter10_traffic_safety_blackspots"),
]

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

def render_mermaid_replacement(code: str) -> str:
    """Renders Mermaid code into clean, publication-grade CSS flowcharts in English."""
    if "C1" in code and ("C6" in code or "C7" in code or "C8" in code or "C9" in code or "C10" in code):
        steps = [
            ("Chapter 1: Data Philosophy & Selection", "Rigid Skeleton vs. Flexible Muscle", "chapter1_data_philosophy"),
            ("Chapter 2: National Data Foundation", "Schema Dictionaries & CODiS Climate Standards", "chapter2_data_dictionary_and_samples"),
            ("Chapter 3: Intercity Arteries & Corridors", "114 Corridors & Passenger/Freight Tides", "chapter3_flow_arteries"),
            ("Chapter 4: Hotspot Halos & Off-Ramps", "eTag Vehicle Influx & Parking Pressure", "chapter4_etag_halos_heatmap"),
            ("Chapter 5: Four Personas & Weather", "Who Moves? How Rain Reshapes Routes", "chapter5_personas_weather"),
            ("Chapter 6: Islandwide Climate Pulse", "30-Year Trends, Extremes & Seasonal Tides", "chapter6_climate_pulse"),
            ("Chapter 7: Commercial Hub Pulse", "TOD Living Spheres, EV Charging & F&B Retail", "chapter7_commercial_pulse"),
            ("Chapter 8: Multi-Source Data Fusion", "Door-to-Door Closed Loop & Policy Matrix", "chapter8_data_fusion_strategy"),
            ("Chapter 9: Scenic Tourism & Live CCTV", "74 4K Feeds, Mountain-Coast Pulses & Smart Travel", "chapter9_tourism_mobility_cctv"),
            ("Chapter 10: Nationwide Traffic Safety Atlas", "1,339 Spatial Blackspots & Vision Zero", "chapter10_traffic_safety_blackspots"),
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
        return '''<div class="architecture-diagram">
<div class="arch-layer arch-layer-1">
    <div class="arch-layer-title">Tier 1: Ground Truth Rigid Skeleton (Census Baseline)</div>
    <div class="arch-boxes">
        <div class="arch-box">
            <div class="arch-box-title">🛣️ eTag Freeway Gantry Vehicle Flows</div>
            <div class="arch-box-desc">0m chainage physical ground truth / 5 vehicle classes / Freight & auto separation</div>
        </div>
        <div class="arch-box">
            <div class="arch-box-title">🚆 TICP Transit Ticketing Big Data</div>
            <div class="arch-box-desc">Centimeter-level turnstile transactions / TPASS Monthly Pass / Legal concession identity</div>
        </div>
    </div>
</div>
<div class="arch-connector">⚡ Natural Strict Mutual Exclusivity: 100% Precise Modal Split with Zero Double-Counting</div>
<div class="arch-layer arch-layer-2">
    <div class="arch-layer-title">Tier 2: Outer Continuous Spatial Muscle (Flexible Shell)</div>
    <div class="arch-boxes">
        <div class="arch-box" style="flex:1;">
            <div class="arch-box-title">📡 Mobile Cellular Signaling</div>
            <div class="arch-box-desc">Turnstile-free outdoor parks / Commercial district dwell times / Last-mile walking trajectories</div>
        </div>
    </div>
</div>
<div class="arch-connector arch-connector-bottom">⚓ Hard Ground Truth Anchoring: Calibrating cellular expansion factors using eTag and ticketing censuses</div>
</div>'''

    elif "STAGE 1" in code and "STAGE 5" in code:
        stages = [
            ("STAGE 1: Cellular-Led", "Depart Home ➔ 400m Walk", "Cellular logs record morning departure from Yonghe apartment, walking 400m to MRT Dingxi Station."),
            ("STAGE 2: Ticketing Anchor", "Swipe TPASS at Turnstile", "08:15 tap-in at Dingxi faregate; tagged as TPASS commuter, eliminating base station drift in milliseconds."),
            ("STAGE 3: Ticketing Anchor", "Transit Ride ➔ Exit at Xihu", "08:42 alighting at Xihu Station in Neihu Science Park; definitively confirms employment destination."),
            ("STAGE 4: Cellular-Led", "Commercial Dwell & Office Work", "15-minute coffee shop dwell on Ruiguang Rd for breakfast, followed by 9 hours inside tech corporate office."),
            ("STAGE 5: Dual-Source Fusion", "Evening YouBike Ride Home", "18:10 YouBike rental; cellular continuously logs 25-minute riverside ride, completing full-day green transit loop."),
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
        <div class="persona-header">{svg_commuter}<div><div class="persona-title">Iron Commuters</div><div class="persona-sub">Regular Daily Commuters</div></div></div>
        <div class="persona-detail">
            <div><span class="persona-badge b-commuter">Fare Type</span>TPASS Monthly Pass (TicketType=4)</div>
            <div><span class="persona-badge b-commuter">Traits</span>Extreme morning/evening twin peaks, cross-regional corridors</div>
        </div>
    </div>
    <div class="persona-card card-senior">
        <div class="persona-header">{svg_senior}<div><div class="persona-title">Active Seniors</div><div class="persona-sub">Senior & Concession Pass</div></div></div>
        <div class="persona-detail">
            <div><span class="persona-badge b-senior">Fare Type</span>Senior / Welfare Card (03/04)</div>
            <div><span class="persona-badge b-senior">Traits</span>Completely avoids peak hours, off-peak healthcare & markets</div>
        </div>
    </div>
    <div class="persona-card card-student">
        <div class="persona-header">{svg_student}<div><div class="persona-title">Gen-Z Students</div><div class="persona-sub">Secondary & Higher Ed</div></div></div>
        <div class="persona-detail">
            <div><span class="persona-badge b-student">Fare Type</span>Student Card (02)</div>
            <div><span class="persona-badge b-student">Traits</span>07:00 morning arrival, evening cram school dispersal wave</div>
        </div>
    </div>
    <div class="persona-card card-tourist">
        <div class="persona-header">{svg_tourist}<div><div class="persona-title">Weekend Tourists</div><div class="persona-sub">Leisure & Inbound Visitors</div></div></div>
        <div class="persona-detail">
            <div><span class="persona-badge b-tourist">Fare Type</span>Single Token / Mobile QR Code</div>
            <div><span class="persona-badge b-tourist">Traits</span>Clusters at scenic spots, surges 10:00 Sat/Sun mornings</div>
        </div>
    </div>
</div>'''

def render_data_foundation_overview() -> str:
    svg_train = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><rect x="4" y="3" width="16" height="16" rx="2"/><line x1="4" y1="11" x2="20" y2="11"/><line x1="12" y1="3" x2="12" y2="11"/><path d="m8 19-3 3"/><path d="m16 19 3 3"/></svg>'
    svg_road = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><line x1="4" y1="21" x2="8" y2="3"/><line x1="20" y1="21" x2="16" y2="3"/><line x1="12" y1="5" x2="12" y2="8"/><line x1="12" y1="13" x2="12" y2="16"/></svg>'
    svg_park = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>'
    svg_rain = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/><line x1="8" y1="19" x2="8" y2="21"/><line x1="8" y1="13" x2="8" y2="15"/><line x1="16" y1="19" x2="16" y2="21"/></svg>'

    return f'''<div class="data-matrix-card">
    <div class="data-matrix-head">National Mobility & Passenger Flow Data Infrastructure Overview</div>
    <table class="data-matrix-tbl">
        <thead>
            <tr>
                <th style="width: 28%;">Data Category</th>
                <th style="width: 36%;">Empirical Scale</th>
                <th style="width: 36%;">Temporal Horizon & Sampling</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <div class="dm-source-title">{svg_train}MOTC TICP</div>
                    <div class="dm-source-sub">Public Transit Ticketing Base</div>
                </td>
                <td>
                    <div class="dm-stat-highlight">448 Million Verified Electronic Ticketing Taps</div>
                    <div class="dm-stat-sub">(843M Cross-Month Passenger Journeys)</div>
                </td>
                <td>
                    <div class="dm-time-badge">Continuous 181 to 255 Day Horizon</div>
                    <div class="dm-stat-sub">Second-level turnstile validations, hourly aggregates</div>
                </td>
            </tr>
            <tr>
                <td>
                    <div class="dm-source-title">{svg_road}Freeway Bureau eTag</div>
                    <div class="dm-source-sub">Electronic Toll Collection</div>
                </td>
                <td>
                    <div class="dm-stat-highlight">325 Gantry Posts & Interchanges Islandwide</div>
                    <div class="dm-stat-sub">5 Statutory Motor Vehicle Regulatory Classes</div>
                </td>
                <td>
                    <div class="dm-time-badge">5-Minute Passage Aggregations</div>
                    <div class="dm-stat-sub">24/7 continuous non-stop highway monitoring</div>
                </td>
            </tr>
            <tr>
                <td>
                    <div class="dm-source-title">{svg_park}MOTC TDX</div>
                    <div class="dm-source-sub">Parking & Amenities API</div>
                </td>
                <td>
                    <div class="dm-stat-highlight">76 Transit Hubs & 16 Strategic Interchange Radii</div>
                    <div class="dm-stat-sub">3,000+ public and commercial parking facilities</div>
                </td>
                <td>
                    <div class="dm-time-badge">1 to 5 Minute Dynamic Refresh</div>
                    <div class="dm-stat-sub">Occupancy rates, turnover & step-tier tariffs</div>
                </td>
            </tr>
            <tr>
                <td>
                    <div class="dm-source-title">{svg_rain}CWA CODiS</div>
                    <div class="dm-source-sub">Historical Climatology Base</div>
                </td>
                <td>
                    <div class="dm-stat-highlight">29 First-Order Meteorological Stations</div>
                    <div class="dm-stat-sub">Continuous 30-year hourly, daily & monthly series</div>
                </td>
                <td>
                    <div class="dm-time-badge">Hourly Continuous Observations</div>
                    <div class="dm-stat-sub">Sunny, moderate rain, torrential storm stress tests</div>
                </td>
            </tr>
        </tbody>
    </table>
</div>'''

def render_pipeline_safety_diagram() -> str:
    return '''<div class="pipeline-diagram">
    <div class="pipeline-head">
        <div class="pipeline-head-title">🛡️ National Big Data Pre-Processing Safety Pipeline</div>
    </div>
    <div class="pipeline-connector">▼ Dual Parallel Architecture ▼</div>
    <div class="pipeline-columns">
        <div class="pipeline-col col-privacy">
            <div class="pipeline-col-title">🔒 Independent Salting Hash De-Identification</div>
            <div class="pipeline-col-sub">Privacy-Preserving Salt Architecture</div>
            <ul class="pipeline-list">
                <li>Independent salt per operator prevents multi-vendor longitudinal tracking</li>
                <li>Transfers validated strictly on physical smartcard chip firmware</li>
            </ul>
        </div>
        <div class="pipeline-col col-stream">
            <div class="pipeline-col-title">⚡ Zero-OOM Streaming Architecture</div>
            <div class="pipeline-col-sub">PyArrow Streaming Pipeline</div>
            <ul class="pipeline-list">
                <li>16MB chunk streaming decompress, zero disk I/O bottlenecks</li>
                <li>Polars LazyFrame projection & filter pushdown; strictly &lt;1.5GB RAM</li>
            </ul>
        </div>
    </div>
    <div class="pipeline-connector">▼ Final Output ▼</div>
    <div class="pipeline-foot">
        <div class="pipeline-foot-title">📦 Final Artifact: 16.5GB Compressed Apache Parquet Corpus (88% Compression)</div>
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
                <div class="dm-card-title">Mode A: Metropolitan District Dynamic Index</div>
                <div class="dm-card-sub">District Scale (Macro Spatial)</div>
            </div>
        </div>
        <ul class="dm-card-list">
            <li><span class="dm-bullet">●</span><strong>Footfall Activity Index</strong></li>
            <li><span class="dm-bullet">●</span><strong>Retail Spending Propensity</strong></li>
            <li><span class="dm-bullet">●</span><strong>Green Transit Share</strong></li>
        </ul>
    </div>
    <div class="dual-mode-card mode-micro">
        <div class="dm-card-head">
            <div class="dm-card-icon">{svg_hub}</div>
            <div>
                <div class="dm-card-title">Mode B: Top 30 Strategic Transit Hubs</div>
                <div class="dm-card-sub">Station Hub Scale (Micro Diagnostic)</div>
            </div>
        </div>
        <ul class="dm-card-list">
            <li><span class="dm-bullet">●</span><strong>Micro-Hub Diagnostic HUD Panel</strong></li>
            <li><span class="dm-bullet">●</span>{svg_zap}<strong>EV Charging Gap Index</strong></li>
            <li><span class="dm-bullet">●</span>{svg_food}<strong>F&B Grab-and-Go Opportunity Radar</strong></li>
        </ul>
    </div>
</div>'''

def render_modal_elasticity_card() -> str:
    svg_storm = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"/><polyline points="13 11 9 17 15 17 11 23"/></svg>'
    svg_bike = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fb7185" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M12 17.5V14l-3-3 4-3 2 3h3"/></svg>'
    svg_bus = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fb7185" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><rect x="4" y="3" width="16" height="15" rx="3"/><line x1="4" y1="11" x2="20" y2="11"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/></svg>'
    svg_car = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><rect x="3" y="11" width="18" height="6" rx="2"/><path d="M5 11l2-5h10l2 5"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>'
    svg_metro = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><rect x="4" y="3" width="16" height="16" rx="2"/><line x1="4" y1="11" x2="20" y2="11"/><line x1="12" y1="3" x2="12" y2="11"/><path d="m8 19-3 3"/><path d="m16 19 3 3"/></svg>'
    svg_thsr = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><path d="M4 15s1-8 4-8h8s3 0 4 8v3H4v-3z"/><line x1="4" y1="15" x2="20" y2="15"/></svg>'

    return f'''<div class="elasticity-dashboard">
    <div class="elasticity-head">
        <div class="elasticity-title">{svg_storm} Modal Shift Elasticity Under Torrential Rain Scenarios</div>
        <div class="elasticity-badge">Empirical Observations</div>
    </div>
    <div class="elasticity-rows">
        <div class="elasticity-row row-gain">
            <div class="el-mode">{svg_metro}Metropolitan Metro</div>
            <div class="el-pill pill-gain">▲ +8.3%</div>
            <div class="el-desc"><strong>Shelter of Choice!</strong> Underground stations unaffected by rain; absorbs massive transfers</div>
        </div>
        <div class="elasticity-row row-stable">
            <div class="el-mode">{svg_thsr}High-Speed Rail (THSR)</div>
            <div class="el-pill pill-stable">▼ -1.2%</div>
            <div class="el-desc">Long-haul rigid demand remains steadfast; virtually immune to urban downpours</div>
        </div>
        <div class="elasticity-row row-drop-low">
            <div class="el-mode">{svg_car}Freeway Auto Driving</div>
            <div class="el-pill pill-drop-low">▼ -14.2%</div>
            <div class="el-desc">Impaired highway visibility deters discretionary non-peak trips</div>
        </div>
        <div class="elasticity-row row-drop-med">
            <div class="el-mode">{svg_bus}Urban City Bus</div>
            <div class="el-pill pill-drop-med">▼ -22.6%</div>
            <div class="el-desc">Surface gridlock and wet curbside boarding reduce passenger willingness</div>
        </div>
        <div class="elasticity-row row-drop-high">
            <div class="el-mode">{svg_bike}YouBike Bikeshare</div>
            <div class="el-pill pill-drop-high">▼ -78.4%</div>
            <div class="el-desc">Near-total shutdown; trips transfer into walking or subway corridors</div>
        </div>
    </div>
</div>'''

def render_selection_decision_matrix() -> str:
    return '''<div class="matrix-decision-container">
    <div class="matrix-decision-header">🎯 What is Your Analytical Goal? Multi-Source Data Selection Guide</div>
    <div class="matrix-decision-grid">
        <div class="matrix-decision-col">
            <div class="matrix-target-box">【Statutory Audit Proof】</div>
            <ul class="matrix-points">
                <li>TPASS Subsidy Audit</li>
                <li>Station Tenant Leasing</li>
                <li>Transfer Rebate Write-Offs</li>
            </ul>
            <div class="matrix-choice-box choice-ticp">🚆 Prioritize【Transit Ticketing】</div>
        </div>
        <div class="matrix-decision-col">
            <div class="matrix-target-box">【Intercity Freight Logistics】</div>
            <ul class="matrix-points">
                <li>Freeway HOV Dispersal</li>
                <li>Port Container Logistics</li>
                <li>Off-Ramp Vehicle Queues</li>
            </ul>
            <div class="matrix-choice-box choice-etag">🛣️ Prioritize【eTag Freeway Flows】</div>
        </div>
        <div class="matrix-decision-col">
            <div class="matrix-target-box">【Open-Air Crowds (No Gates)】</div>
            <ul class="matrix-points">
                <li>NYE Fireworks Evacuation</li>
                <li>National Scenic Parks</li>
                <li>Day/Night Resident Census</li>
            </ul>
            <div class="matrix-choice-box choice-telecom">📡 Prioritize【Cellular Signaling】</div>
        </div>
        <div class="matrix-decision-col">
            <div class="matrix-target-box">【Full-Day Closed Loop】</div>
            <ul class="matrix-points">
                <li>TOD Station Living Spheres</li>
                <li>Policy Shift Simulations</li>
                <li>Green Transit Shift Rates</li>
            </ul>
            <div class="matrix-choice-box choice-fusion">🚀 Recommend【Three-Source Fusion】</div>
        </div>
    </div>
</div>'''

def process_markdown(content: str, current_chapter_id: str) -> str:
    """Processes markdown text, rewrites links, turns callouts into stylish cards, and replaces Mermaid."""
    mermaid_blocks = {}
    def stash_mermaid(match):
        token = f"@@MERMAID_BLOCK_{len(mermaid_blocks)}@@"
        mermaid_blocks[token] = match.group(1).strip()
        return token

    content = re.sub(r'```mermaid(.*?)```', stash_mermaid, content, flags=re.DOTALL)

    custom_blocks = {}
    def stash_custom_blocks(match):
        code = match.group(1)
        if ("Iron Commuters" in code and "Active Seniors" in code) or ("鋼鐵通勤族" in code and "悠遊銀髮族" in code):
            token = f"@@CUSTOM_BLOCK_{len(custom_blocks)}@@"
            custom_blocks[token] = render_personas_matrix()
            return token
        elif ("National Mobility & Passenger Flow Data Infrastructure" in code) or ("全台交通動態人流數據底座概覽" in code):
            token = f"@@CUSTOM_BLOCK_{len(custom_blocks)}@@"
            custom_blocks[token] = render_data_foundation_overview()
            return token
        elif ("National Big Data Pre-Processing Safety Pipeline" in code) or ("國家級交通大數據前處理安全防護管線" in code):
            token = f"@@CUSTOM_BLOCK_{len(custom_blocks)}@@"
            custom_blocks[token] = render_pipeline_safety_diagram()
            return token
        elif ("Mode A: Metropolitan District Dynamic Index" in code) or ("模式 A：都會行政區動態指數" in code):
            token = f"@@CUSTOM_BLOCK_{len(custom_blocks)}@@"
            custom_blocks[token] = render_dual_mode_architecture()
            return token
        elif ("Modal Shift Elasticity" in code) or ("YouBike" in code and "Metro" in code and "-78.4%" in code):
            token = f"@@CUSTOM_BLOCK_{len(custom_blocks)}@@"
            custom_blocks[token] = render_modal_elasticity_card()
            return token
        elif ("What is Your Analytical Goal" in code) or ("您的分析目標是什麼" in code):
            token = f"@@CUSTOM_BLOCK_{len(custom_blocks)}@@"
            custom_blocks[token] = render_selection_decision_matrix()
            return token
        return match.group(0)

    content = re.sub(r'```(?:[a-zA-Z0-9_-]*\n)?(.*?)```', stash_custom_blocks, content, flags=re.DOTALL)

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

    lines = content.split('\n')
    processed_lines = []

    for line in lines:
        if re.search(r'👉\s*\*\*\[Proceed to Chapter', line) or re.search(r'👉\s*\*\*\[進入第', line):
            continue

        if '|' in line and 'https://tobytoy.github.io/taiwan-mobility-pulse/' in line:
            def inline_btn(m):
                label = m.group(1).replace("👉", "").strip()
                url = m.group(2).strip()
                return f'<a class="table-portal-btn" href="{url}" target="_blank">🚀 {label}</a>'
            line = re.sub(r'\[([^\]]+)\]\((https://tobytoy\.github\.io/taiwan-mobility-pulse/[^)]*)\)', inline_btn, line)
            processed_lines.append(line)
        elif ('👉 Launch Live Application:' in line or '👉 立即跳轉至線上系統：' in line) and 'https://tobytoy.github.io/taiwan-mobility-pulse/' in line:
            def full_card(m):
                raw_label = m.group(1).strip()
                url = m.group(2).strip()
                clean_title = raw_label.replace("👉 Launch Live Application:", "").replace("👉 立即跳轉至線上系統：", "").replace("👉", "").strip()
                return f'''
<div class="portal-callout">
    <div class="portal-badge">🌐 Official Live Web Application Portal (Click to Open)</div>
    <div class="portal-content">
        <a class="portal-btn" href="{url}" target="_blank">
            <span class="portal-icon">🚀</span>
            <span class="portal-title">{clean_title}</span>
            <span class="portal-arrow">➔</span>
        </a>
        <div class="portal-url"><span class="portal-url-label">Direct URL: </span><span class="portal-url-link">{url}</span></div>
    </div>
</div>
'''
            line = re.sub(r'^\s*(?:\*\s*)?(?:\*\*)?\[(👉\s*(?:Launch Live Application:|立即跳轉至線上系統：)[^\]]*)\]\((https://tobytoy\.github\.io/taiwan-mobility-pulse/[^)]*)\)(?:\*\*)?', full_card, line)
            processed_lines.append(line)
        else:
            processed_lines.append(line)

    content = '\n'.join(processed_lines)
    html = markdown.markdown(content, extensions=['tables', 'fenced_code', 'toc'])

    for token, code in mermaid_blocks.items():
        rendered = render_mermaid_replacement(code)
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
                for emo, svg in EMOJI_SVG_MAP.items():
                    text = text.replace(emo + '\ufe0f', svg).replace(emo, svg)
                # Remove any remaining astral unicode emojis to protect Cairo from CBDT glyph bugs
                text = re.sub(r'[\U00010000-\U0010ffff](?:\ufe0f)?', '', text)
                tag_parts[t_idx] = text
        parts[idx] = "".join(tag_parts)
    return "".join(parts)

def build_html() -> str:
    print("Building English Master Book HTML...")
    sync_images()
    body_parts = []

    # Cover Page
    cover_html = '''
    <div class="cover-page">
        <div class="cover-badge">National Mobility Big Data & Spatial Intelligence Monograph · Official Guide (v1.3.1)</div>
        <h1 class="cover-title">Taiwan Mobility Pulse</h1>
        <h2 class="cover-subtitle">The Master Guide to National Multi-Modal Mobility & Spatial Intelligence</h2>
        <div class="cover-divider"></div>
        <p class="cover-desc">
            Synthesizing 448 million verified ticket tap transactions from MOTC TICP, millions of Freeway Bureau eTag gantry vehicle observations across 5 regulatory classes, TDX 74 scenic 4K/360° live CCTV streams, and CWA CODiS 30-year microclimate observations.<br>
            Deciphering 114 dynamic flow corridors, islandwide weather disruption tides, and scenic mountain-to-coast tourism pulses.
        </p>
        <div class="cover-meta-card">
            <div class="cover-meta-row"><strong>Official Interactive System:</strong> <a href="https://tobytoy.github.io/taiwan-mobility-pulse/">https://tobytoy.github.io/taiwan-mobility-pulse/</a></div>
            <div class="cover-meta-row"><strong>Publication Edition:</strong> Version 1.3.1 (Master Monograph · 9 Comprehensive Chapters)</div>
            <div class="cover-meta-row"><strong>Research & Engineering Team:</strong> Taiwan Mobility Pulse Core Spatial Analytics Lab</div>
            <div class="cover-meta-row"><strong>Authoritative Data Sources:</strong> MOTC TICP / TDX Platform / Freeway Bureau / CWA / Tourism Administration</div>
            <div class="cover-meta-row"><strong>Publication Date:</strong> October 2026 (v1.3.1)</div>
        </div>
    </div>
    '''
    body_parts.append(cover_html)

    # Chapters
    for idx, (filename, chapter_title, anchor) in enumerate(CHAPTERS):
        file_path = os.path.join(EN_DOCS_DIR, filename)
        if not os.path.exists(file_path):
            print(f"Warning: Chapter file not found: {file_path}")
            continue

        with open(file_path, "r", encoding="utf-8") as f:
            raw_content = f.read()

        # Normalize relative image paths to 'images/...' so they resolve against public/docs/
        raw_content = re.sub(r'\]\(\.\./images/', '](images/', raw_content)
        raw_content = re.sub(r'\]\(images/', '](images/', raw_content)

        processed_html = process_markdown(raw_content, anchor)

        # Navigation bar at the bottom of each chapter
        nav_html = '<div class="chapter-nav">'
        if anchor != "README":
            nav_html += '<a class="nav-btn nav-prev" href="#README">📖 Back to Master Table of Contents</a>'
        if idx + 1 < len(CHAPTERS):
            next_title = CHAPTERS[idx + 1][1]
            next_cid = CHAPTERS[idx + 1][2]
            nav_html += f'<a class="nav-btn nav-next" href="#{next_cid}">👉 Proceed to Next Chapter: {next_title} ➔</a>'
        nav_html += '</div>'

        chapter_html = f'''
        <section class="chapter-section" id="{anchor}">
            <a id="{anchor}" name="{anchor}"></a>
            <div class="chapter-content">
                {processed_html}
            </div>
            {nav_html}
        </section>
        '''
        body_parts.append(chapter_html)

    css = get_book_css(lang="en")

    full_html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Taiwan Mobility Pulse - Master Guidebook (English Edition v1.3.1)</title>
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
    print(f"English HTML generated at: {OUTPUT_HTML}")
    return OUTPUT_HTML

def generate_pdf_weasyprint():
    print("Generating English Master PDF with WeasyPrint...")
    html = weasyprint.HTML(filename=OUTPUT_HTML, base_url=PUBLIC_DOCS_DIR)
    html.write_pdf(OUTPUT_PDF)
    size_mb = os.path.getsize(OUTPUT_PDF) / (1024 * 1024)
    print(f"English Master PDF generated at: {OUTPUT_PDF} ({size_mb:.2f} MB)")

def verify_pdf():
    print("Verifying English PDF structure and hyperlinks...")
    with pdfplumber.open(OUTPUT_PDF) as pdf:
        total_pages = len(pdf.pages)
        print(f"Total Pages in English PDF: {total_pages}")
        
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
        
        print(f"Found {len(external_links)} active external links in English PDF.")
        print(f"Found {len(internal_links)} active internal anchor links in English PDF.")
        print("\nSample External Links:")
        for page_num, uri in external_links[:6]:
            print(f"  [Page {page_num}] {uri}")
        print("\nSample Internal Anchor Links:")
        for page_num, dest in internal_links[:6]:
            print(f"  [Page {page_num}] #{dest}")

if __name__ == "__main__":
    build_html()
    generate_pdf_weasyprint()
    verify_pdf()
