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
import markdown
import weasyprint
import pdfplumber
import pypdfium2

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS_DIR = os.path.join(PROJECT_ROOT, "docs")
OUTPUT_HTML = os.path.join(DOCS_DIR, "taiwan_mobility_pulse_guidebook.html")
OUTPUT_PDF = os.path.join(DOCS_DIR, "taiwan_mobility_pulse_guidebook.pdf")

CHAPTERS = [
    ("README.md", "序言與全書導讀", "README"),
    ("chapter1_data_philosophy.md", "第一章：數據哲學與選型抉擇", "chapter1_data_philosophy"),
    ("chapter2_flow_arteries.md", "第二章：全台城際與都會走廊大動脈", "chapter2_flow_arteries"),
    ("chapter3_etag_halos_heatmap.md", "第三章：熱點輻射與下匝道光暈", "chapter3_etag_halos_heatmap"),
    ("chapter4_personas_weather.md", "第四章：四大微觀人群像與天候彈性", "chapter4_personas_weather"),
    ("chapter5_commercial_pulse.md", "第五章：商業脈搏與站點商機評估", "chapter5_commercial_pulse"),
    ("chapter6_data_fusion_strategy.md", "第六章：國家級大數據融合戰略", "chapter6_data_fusion_strategy"),
]

def render_mermaid_replacement(code: str) -> str:
    """Renders Mermaid code into clean, publication-grade CSS flowcharts."""
    if "C1" in code and "C6" in code:
        # Chapter overview flowchart
        steps = [
            ("第一章：數據哲學與選型抉擇", "剛性骨架 vs. 彈性肌肉", "chapter1_data_philosophy"),
            ("第二章：全台城際與都會走廊大動脈", "111 條動態走廊與客貨潮汐", "chapter2_flow_arteries"),
            ("第三章：熱點輻射與下匝道光暈", "eTag 車流注入與停車壓力連動", "chapter3_etag_halos_heatmap"),
            ("第四章：四大微觀人群像與天候彈性", "誰在移動？風雨如何改寫動線？", "chapter4_personas_weather"),
            ("第五章：商業脈搏與站點商機評估", "樞紐生活圈、EV 充電與零售快銷", "chapter5_commercial_pulse"),
            ("第六章：國家級大數據融合戰略", "門到門閉環與政策落地選型", "chapter6_data_fusion_strategy"),
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

def process_markdown(content: str, current_chapter_id: str) -> str:
    """Processes markdown text, rewrites links, turns callouts into stylish cards, and replaces Mermaid."""

    # 1. Protect Mermaid code blocks with tokens that Markdown won't parse as headers
    mermaid_blocks = {}
    def stash_mermaid(match):
        token = f"@@MERMAID_BLOCK_{len(mermaid_blocks)}@@"
        mermaid_blocks[token] = match.group(1).strip()
        return token

    content = re.sub(r'```mermaid(.*?)```', stash_mermaid, content, flags=re.DOTALL)

    # 2. Rewrite internal markdown links (.md -> #anchor)
    def rewrite_md_links(match):
        label = match.group(1)
        target = match.group(2)
        if target.endswith(".md"):
            anchor = target[:-3]
            return f'[{label}](#{anchor})'
        elif ".md#" in target:
            parts = target.split(".md#")
            return f'[{label}](#{parts[1]})'
        return match.group(0)

    content = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', rewrite_md_links, content)

    # 3. Handle interactive portal links line-by-line
    lines = content.split('\n')
    processed_lines = []

    for line in lines:
        # Skip raw inline "👉 **[進入第...章](...)" at bottom since .chapter-nav handles it
        if re.search(r'👉\s*\*\*\[進入第[一二三四五六]章', line):
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

    # 5. Substitute rendered HTML for Mermaid tokens
    for token, code in mermaid_blocks.items():
        rendered = render_mermaid_replacement(code)
        # Markdown might wrap the token in <p>...</p>, clean it up
        html = re.sub(rf'<p>\s*{re.escape(token)}\s*</p>', rendered, html)
        html = html.replace(token, rendered)

    return html

def build_html():
    print("Reading and parsing all book chapters...")
    body_parts = []

    # Cover Page
    body_parts.append('''
    <div class="cover-page">
        <div class="cover-badge">國家級交通大數據與微觀人流研究專著 · 官方旗艦指南</div>
        <h1 class="cover-title">台灣動態移動脈搏</h1>
        <h2 class="cover-subtitle">Taiwan Mobility Pulse: The Master Guide to National Multi-Modal Mobility & Spatial Intelligence</h2>
        <div class="cover-divider"></div>
        <p class="cover-desc">
            融匯交通部 TICP 4.48 億筆真實票證、高速公路局 eTag 門架車流、TDX 停車與空間機能 API，<br>
            解構台灣地表上最震撼的 111 條動態走廊、微觀生活圈輻射光暈與全域閉環數據戰略。
        </p>
        <div class="cover-meta-card">
            <div class="cover-meta-row"><strong>官方線上即時系統：</strong><a href="https://tobytoy.github.io/taiwan-mobility-pulse/">https://tobytoy.github.io/taiwan-mobility-pulse/</a></div>
            <div class="cover-meta-row"><strong>全書出版版本：</strong>Version 1.0 (全景精裝專著版)</div>
            <div class="cover-meta-row"><strong>研究編製團隊：</strong>Taiwan Mobility Pulse 核心研究組</div>
            <div class="cover-meta-row"><strong>數據權責機關：</strong>交通部 TICP / 交通部 TDX / 交通部高速公路局</div>
            <div class="cover-meta-row"><strong>發行出刊日期：</strong>2026 年 10 月</div>
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

    # Master CSS Template for WeasyPrint
    css = '''
    @page {
        size: A4;
        margin: 22mm 18mm 20mm 18mm;
        @top-left {
            content: "台灣動態移動脈搏 · Taiwan Mobility Pulse";
            font-family: 'Noto Sans TC', -apple-system, sans-serif;
            font-size: 8pt;
            color: #94a3b8;
            border-bottom: 0.5pt solid #e2e8f0;
            padding-bottom: 4px;
        }
        @top-right {
            content: "國家級多源動態移動全書指南";
            font-family: 'Noto Sans TC', -apple-system, sans-serif;
            font-size: 8pt;
            color: #94a3b8;
            border-bottom: 0.5pt solid #e2e8f0;
            padding-bottom: 4px;
        }
        @bottom-left {
            content: "https://tobytoy.github.io/taiwan-mobility-pulse/";
            font-family: -apple-system, sans-serif;
            font-size: 7.5pt;
            color: #94a3b8;
            border-top: 0.5pt solid #e2e8f0;
            padding-top: 4px;
        }
        @bottom-right {
            content: "第 " counter(page) " 頁 / 共 " counter(pages) " 頁";
            font-family: 'Noto Sans TC', -apple-system, sans-serif;
            font-size: 8pt;
            color: #64748b;
            border-top: 0.5pt solid #e2e8f0;
            padding-top: 4px;
        }
    }

    @page :first {
        margin: 0;
        @top-left { content: normal; }
        @top-right { content: normal; }
        @bottom-left { content: normal; }
        @bottom-right { content: normal; }
    }

    * {
        box-sizing: border-box;
    }

    body {
        font-family: 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', -apple-system, sans-serif;
        color: #1e293b;
        line-height: 1.8;
        font-size: 10.2pt;
        background: #ffffff;
        margin: 0;
        padding: 0;
    }

    /* Cover Page */
    .cover-page {
        page-break-after: always;
        break-after: page;
        min-height: 297mm;
        box-sizing: border-box;
        padding: 35mm 22mm 25mm 22mm;
        text-align: center;
        background: #090d16;
        color: #ffffff;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .cover-badge {
        display: inline-block;
        background: rgba(56, 189, 248, 0.15);
        color: #38bdf8;
        border: 1px solid rgba(56, 189, 248, 0.4);
        font-weight: 700;
        font-size: 9.5pt;
        padding: 6px 18px;
        border-radius: 20px;
        margin-bottom: 28px;
        letter-spacing: 1.5px;
    }

    .cover-title {
        font-size: 34pt;
        font-weight: 900;
        color: #ffffff;
        margin: 0 0 16px 0;
        letter-spacing: 3px;
        line-height: 1.25;
    }

    .cover-subtitle {
        font-size: 12.5pt;
        font-weight: 500;
        color: #94a3b8;
        margin: 0 0 36px 0;
        line-height: 1.5;
        max-width: 680px;
    }

    .cover-divider {
        width: 140px;
        height: 4px;
        background: linear-gradient(90deg, #38bdf8, #818cf8);
        margin: 0 auto 36px auto;
        border-radius: 2px;
    }

    .cover-desc {
        font-size: 11pt;
        color: #cbd5e1;
        line-height: 1.9;
        max-width: 620px;
        margin: 0 auto 50px auto;
        text-align: center;
    }

    .cover-meta-card {
        background: rgba(30, 41, 59, 0.7);
        border: 1px solid rgba(71, 85, 105, 0.6);
        border-radius: 12px;
        padding: 22px 28px;
        font-size: 9.5pt;
        color: #cbd5e1;
        text-align: left;
        line-height: 2.1;
        width: 100%;
        max-width: 620px;
        margin: 0 auto;
    }

    .cover-meta-card a {
        color: #38bdf8;
        text-decoration: underline;
        font-weight: 600;
    }

    .cover-meta-row strong {
        color: #f1f5f9;
    }

    /* Chapter Section */
    .chapter-section {
        page-break-before: always;
        break-before: page;
        padding-top: 6mm;
    }

    /* Typography */
    h1 {
        font-size: 20pt;
        font-weight: 900;
        color: #0f172a;
        margin-top: 10pt;
        margin-bottom: 14pt;
        padding-bottom: 8pt;
        border-bottom: 2.5px solid #0284c7;
        page-break-after: avoid;
        break-after: avoid;
        line-height: 1.35;
    }

    h2 {
        font-size: 14pt;
        font-weight: 800;
        color: #0369a1;
        margin-top: 20pt;
        margin-bottom: 8pt;
        padding-bottom: 4pt;
        border-bottom: 1px solid #e2e8f0;
        page-break-after: avoid;
        break-after: avoid;
    }

    h3 {
        font-size: 11.5pt;
        font-weight: 700;
        color: #0f172a;
        margin-top: 14pt;
        margin-bottom: 6pt;
        page-break-after: avoid;
        break-after: avoid;
    }

    h4 {
        font-size: 10.5pt;
        font-weight: 700;
        color: #334155;
        margin-top: 10pt;
        margin-bottom: 4pt;
        page-break-after: avoid;
        break-after: avoid;
    }

    p {
        margin-top: 0;
        margin-bottom: 10pt;
        text-align: justify;
    }

    ul, ol {
        margin-top: 0;
        margin-bottom: 10pt;
        padding-left: 20pt;
    }

    li {
        margin-bottom: 4pt;
    }

    /* Links */
    a {
        color: #0284c7;
        text-decoration: none;
        font-weight: 600;
    }

    a:hover {
        text-decoration: underline;
    }

    /* Blockquotes */
    blockquote {
        margin: 14pt 0;
        padding: 10pt 16pt;
        background: #f0f9ff;
        border-left: 4px solid #0284c7;
        border-radius: 0 8px 8px 0;
        color: #0369a1;
    }

    blockquote p {
        margin: 0;
    }

    /* Tables */
    table {
        width: 100%;
        border-collapse: collapse;
        margin: 14pt 0;
        font-size: 9pt;
        page-break-inside: avoid;
        break-inside: avoid;
    }

    th, td {
        border: 1px solid #cbd5e1;
        padding: 7pt 9pt;
        text-align: left;
        vertical-align: top;
    }

    th {
        background-color: #f1f5f9;
        color: #0f172a;
        font-weight: 800;
    }

    tr:nth-child(even) td {
        background-color: #f8fafc;
    }

    .table-portal-btn {
        display: inline-block;
        background: #0284c7;
        color: #ffffff !important;
        padding: 3pt 8pt;
        border-radius: 4px;
        font-size: 8pt;
        font-weight: 700;
        text-decoration: none !important;
        white-space: nowrap;
    }

    /* Interactive Portal Callout Cards */
    .portal-callout {
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        border: 1.5px solid #38bdf8;
        border-radius: 12px;
        padding: 14pt 18pt;
        margin: 18pt 0;
        page-break-inside: avoid;
        break-inside: avoid;
        box-shadow: 0 2px 4px rgba(2, 132, 199, 0.08);
    }

    .portal-badge {
        font-size: 8.5pt;
        font-weight: 800;
        color: #0284c7;
        text-transform: uppercase;
        letter-spacing: 0.8px;
        margin-bottom: 8pt;
    }

    .portal-content {
        display: flex;
        flex-direction: column;
        gap: 6pt;
    }

    .portal-btn {
        display: inline-flex;
        align-items: center;
        background: #0284c7;
        color: #ffffff !important;
        font-size: 11pt;
        font-weight: 700;
        padding: 8pt 16pt;
        border-radius: 8px;
        text-decoration: none !important;
        border: 1px solid #0369a1;
        gap: 8pt;
    }

    .portal-icon {
        font-size: 13pt;
    }

    .portal-title {
        flex: 1;
        color: #ffffff;
    }

    .portal-arrow {
        font-size: 11pt;
        font-weight: 900;
        color: #e0f2fe;
    }

    .portal-url {
        margin-top: 2pt;
    }

    .portal-url-label {
        font-family: 'Noto Sans TC', sans-serif;
        font-size: 8.5pt;
        color: #64748b;
    }

    .portal-url-link {
        font-family: SFMono-Regular, Consolas, monospace;
        font-size: 8pt;
        color: #0284c7;
        text-decoration: underline;
    }

    /* Flowcharts & Visual Cards */
    .flowchart-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6pt;
        margin: 16pt 0;
        page-break-inside: avoid;
        break-inside: avoid;
    }

    .flow-step {
        background: #f8fafc;
        border: 1.5px solid #0284c7;
        border-radius: 10px;
        padding: 9pt 18pt;
        width: 88%;
        text-align: center;
        text-decoration: none !important;
        display: block;
        color: inherit;
    }

    .flow-step:hover {
        background: #f0f9ff;
    }

    .flow-badge {
        font-size: 8pt;
        color: #0284c7;
        font-weight: 800;
        text-transform: uppercase;
        margin-bottom: 2pt;
    }

    .flow-title {
        font-size: 10.5pt;
        font-weight: 800;
        color: #0f172a;
    }

    .flow-sub {
        font-size: 8.5pt;
        color: #64748b;
        margin-top: 2pt;
    }

    .flow-arrow {
        color: #0284c7;
        font-size: 11pt;
        line-height: 1;
    }

    /* Architecture Diagram */
    .architecture-diagram {
        background: #f8fafc;
        border: 1px solid #cbd5e1;
        border-radius: 12px;
        padding: 14pt;
        margin: 16pt 0;
        page-break-inside: avoid;
        break-inside: avoid;
    }

    .arch-layer {
        border-radius: 8px;
        padding: 10pt;
        margin-bottom: 6pt;
    }

    .arch-layer-1 {
        background: #e0f2fe;
        border: 1px solid #38bdf8;
    }

    .arch-layer-2 {
        background: #f3e8ff;
        border: 1px solid #c084fc;
    }

    .arch-layer-title {
        font-size: 9.5pt;
        font-weight: 800;
        margin-bottom: 6pt;
        color: #0f172a;
    }

    .arch-boxes {
        display: flex;
        gap: 8pt;
    }

    .arch-box {
        flex: 1;
        background: #ffffff;
        border-radius: 6px;
        padding: 7pt 9pt;
        border: 1px solid #cbd5e1;
    }

    .arch-box-title {
        font-weight: 700;
        font-size: 9pt;
        color: #0f172a;
        margin-bottom: 3pt;
    }

    .arch-box-desc {
        font-size: 8pt;
        color: #475569;
        line-height: 1.45;
    }

    .arch-connector {
        text-align: center;
        font-size: 8.5pt;
        font-weight: 700;
        color: #059669;
        margin: 5pt 0;
        padding: 4pt;
        background: #ecfdf5;
        border-radius: 6px;
        border: 1px dashed #6ee7b7;
    }

    .arch-connector-bottom {
        color: #2563eb;
        background: #eff6ff;
        border-color: #93c5fd;
    }

    /* Timeline Container */
    .timeline-container {
        display: flex;
        flex-direction: column;
        gap: 6pt;
        margin: 16pt 0;
        page-break-inside: avoid;
        break-inside: avoid;
    }

    .timeline-item {
        background: #f8fafc;
        border-left: 4px solid #0284c7;
        border-radius: 0 8px 8px 0;
        padding: 8pt 12pt;
        border-top: 1px solid #e2e8f0;
        border-right: 1px solid #e2e8f0;
        border-bottom: 1px solid #e2e8f0;
    }

    .timeline-badge {
        font-size: 8pt;
        font-weight: 800;
        color: #0284c7;
    }

    .timeline-title {
        font-size: 10pt;
        font-weight: 700;
        color: #0f172a;
        margin: 2pt 0;
    }

    .timeline-desc {
        font-size: 8.5pt;
        color: #475569;
        line-height: 1.5;
    }

    /* Chapter Navigation Bar */
    .chapter-nav {
        margin-top: 24pt;
        padding-top: 14pt;
        border-top: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        page-break-inside: avoid;
        break-inside: avoid;
    }

    .nav-btn {
        display: inline-block;
        padding: 6pt 12pt;
        border-radius: 6px;
        font-size: 9pt;
        font-weight: 700;
        text-decoration: none !important;
    }

    .nav-prev {
        background: #f1f5f9;
        color: #475569 !important;
        border: 1px solid #cbd5e1;
    }

    .nav-next {
        background: #e0f2fe;
        color: #0284c7 !important;
        border: 1px solid #38bdf8;
    }

    pre, code {
        font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
    }

    pre {
        background: #f1f5f9;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        padding: 8pt 10pt;
        font-size: 8.5pt;
        overflow-x: auto;
        page-break-inside: avoid;
        break-inside: avoid;
    }

    code {
        background: #f1f5f9;
        padding: 1pt 4pt;
        border-radius: 3px;
        font-size: 8.5pt;
        color: #0f172a;
    }

    pre code {
        background: none;
        padding: 0;
    }
    '''

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

    with open(OUTPUT_HTML, "w", encoding="utf-8") as f:
        f.write(full_html)
    print(f"HTML successfully generated at: {OUTPUT_HTML}")
    return OUTPUT_HTML

def generate_pdf_weasyprint():
    print("Generating Master PDF with WeasyPrint...")
    html = weasyprint.HTML(filename=OUTPUT_HTML)
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
