#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Taiwan Mobility Pulse - Unified Master Publication CSS
Shared styling engine for both Traditional Chinese and English editions.
Provides:
1. Publication-grade dark mode palette (#0b0f19)
2. Exact page geometry (A4, 22mm 18mm 20mm 18mm)
3. Language-aware typography ('Inter' for English, 'Noto Sans TC' for Chinese)
4. Dynamic headers, footers, and page counters
5. Strict image width containment (max-width: 100% !important; height: auto;)
6. Full component styling (portals, flowcharts, timelines, architecture layers, cards)
"""

def get_book_css(lang: str = "zh") -> str:
    is_en = (lang.lower() == "en")
    
    top_left_title = "Taiwan Mobility Pulse · Master Monograph" if is_en else "台灣動態移動脈搏 · Taiwan Mobility Pulse"
    top_right_title = "National Big Data & Spatial Intelligence · v1.3.1" if is_en else "國家級多源動態移動全書指南 · v1.3.1"
    page_counter_str = '"Page " counter(page) " of " counter(pages)' if is_en else '"第 " counter(page) " 頁 / 共 " counter(pages) " 頁"'
    
    body_font = (
        "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans TC', sans-serif"
        if is_en else
        "'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', -apple-system, sans-serif"
    )
    
    return f"""
    @page {{
        size: A4;
        margin: 22mm 18mm 20mm 18mm;
        background-color: #0b0f19;
        @top-left {{
            content: "{top_left_title}";
            font-family: {body_font};
            font-size: 8pt;
            color: #64748b;
            border-bottom: 0.5pt solid #1e293b;
            padding-bottom: 4px;
        }}
        @top-right {{
            content: "{top_right_title}";
            font-family: {body_font};
            font-size: 8pt;
            color: #64748b;
            border-bottom: 0.5pt solid #1e293b;
            padding-bottom: 4px;
        }}
        @bottom-left {{
            content: "https://tobytoy.github.io/taiwan-mobility-pulse/ (v1.3.1)";
            font-family: {body_font};
            font-size: 7.5pt;
            color: #64748b;
            border-top: 0.5pt solid #1e293b;
            padding-top: 4px;
        }}
        @bottom-right {{
            content: {page_counter_str};
            font-family: {body_font};
            font-size: 8pt;
            color: #94a3b8;
            border-top: 0.5pt solid #1e293b;
            padding-top: 4px;
        }}
    }}

    @page :first {{
        margin: 0;
        background-color: #070a13;
        @top-left {{ content: normal; }}
        @top-right {{ content: normal; }}
        @bottom-left {{ content: normal; }}
        @bottom-right {{ content: normal; }}
    }}

    * {{
        box-sizing: border-box;
    }}

    body {{
        font-family: {body_font};
        color: #cbd5e1;
        line-height: {'1.7' if is_en else '1.8'};
        font-size: {'10pt' if is_en else '10.2pt'};
        background-color: #0b0f19;
        margin: 0;
        padding: 0;
    }}

    /* Cover Page */
    .cover-page {{
        page-break-after: always;
        break-after: page;
        min-height: 297mm;
        box-sizing: border-box;
        padding: 35mm 22mm 25mm 22mm;
        text-align: center;
        background: #070a13;
        color: #ffffff;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }}

    .cover-badge {{
        display: inline-block;
        background: rgba(56, 189, 248, 0.15);
        color: #38bdf8;
        border: 1px solid rgba(56, 189, 248, 0.4);
        font-weight: 700;
        font-size: 9.5pt;
        padding: 6px 18px;
        border-radius: 20px;
        margin-bottom: 24px;
        letter-spacing: 1.2px;
    }}

    .cover-title {{
        font-size: 32pt;
        font-weight: 900;
        color: #f8fafc;
        margin: 0 0 16px 0;
        letter-spacing: 2px;
        line-height: 1.25;
    }}

    .cover-subtitle {{
        font-size: 12.5pt;
        font-weight: 500;
        color: #94a3b8;
        margin: 0 0 32px 0;
        line-height: 1.5;
        max-width: 680px;
    }}

    .cover-divider {{
        width: 140px;
        height: 4px;
        background: linear-gradient(90deg, #38bdf8, #818cf8);
        margin: 0 auto 32px auto;
        border-radius: 2px;
    }}

    .cover-desc {{
        font-size: 10.5pt;
        color: #cbd5e1;
        line-height: 1.85;
        max-width: 620px;
        margin: 0 auto 42px auto;
        text-align: center;
    }}

    .cover-meta-card {{
        background: rgba(17, 24, 39, 0.85);
        border: 1px solid rgba(71, 85, 105, 0.6);
        border-radius: 12px;
        padding: 20px 26px;
        font-size: 9.2pt;
        color: #cbd5e1;
        text-align: left;
        line-height: 2.0;
        width: 100%;
        max-width: 620px;
        margin: 0 auto;
    }}

    .cover-meta-card a {{
        color: #38bdf8;
        text-decoration: underline;
        font-weight: 600;
    }}

    .cover-meta-row strong {{
        color: #f1f5f9;
    }}

    /* Chapter Section */
    .chapter-section {{
        page-break-before: always;
        break-before: page;
        padding-top: 6mm;
    }}

    /* Typography */
    h1 {{
        font-size: 20pt;
        font-weight: 900;
        color: #38bdf8;
        margin-top: 10pt;
        margin-bottom: 14pt;
        padding-bottom: 8pt;
        border-bottom: 2.5px solid #0284c7;
        page-break-after: avoid;
        break-after: avoid;
        line-height: 1.35;
    }}

    h2 {{
        font-size: 14pt;
        font-weight: 800;
        color: #60a5fa;
        margin-top: 20pt;
        margin-bottom: 8pt;
        padding-bottom: 4pt;
        border-bottom: 1px solid #1e293b;
        page-break-after: avoid;
        break-after: avoid;
    }}

    h3 {{
        font-size: 11.5pt;
        font-weight: 700;
        color: #f1f5f9;
        margin-top: 14pt;
        margin-bottom: 6pt;
        page-break-after: avoid;
        break-after: avoid;
    }}

    h4 {{
        font-size: 10.5pt;
        font-weight: 700;
        color: #94a3b8;
        margin-top: 10pt;
        margin-bottom: 4pt;
        page-break-after: avoid;
        break-after: avoid;
    }}

    p {{
        margin-top: 0;
        margin-bottom: 10pt;
        text-align: justify;
        color: #cbd5e1;
    }}

    strong {{
        color: #f8fafc;
    }}

    ul, ol {{
        margin-top: 0;
        margin-bottom: 10pt;
        padding-left: 20pt;
        color: #cbd5e1;
    }}

    hr {{
        border: none;
        border-top: 1px solid #1e293b;
        margin: 18pt 0;
    }}

    /* Screenshots & Figures - STRICT WIDTH FIT */
    img {{
        max-width: 100% !important;
        width: 100% !important;
        height: auto !important;
        border-radius: 8px;
        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.6);
        border: 1px solid #1e293b;
        margin: 14pt auto 6pt auto;
        display: block;
        page-break-inside: avoid;
        break-inside: avoid;
    }}

    p > em:only-child, p.figure-caption, em.caption {{
        display: block;
        text-align: center;
        color: #94a3b8;
        font-size: 8.8pt;
        margin-top: 4pt;
        margin-bottom: 14pt;
        font-style: normal;
        line-height: 1.45;
    }}

    /* Links */
    a {{
        color: #38bdf8;
        text-decoration: none;
        font-weight: 600;
    }}

    a:hover {{
        text-decoration: underline;
    }}

    /* Blockquotes */
    blockquote {{
        margin: 14pt 0;
        padding: 10pt 16pt;
        background: #0c1829;
        border-left: 4px solid #0284c7;
        border-radius: 0 8px 8px 0;
        color: #93c5fd;
    }}

    blockquote p {{
        margin: 0;
        color: #93c5fd;
    }}

    blockquote strong {{
        color: #e0f2fe;
    }}

    /* Tables */
    table {{
        width: 100%;
        border-collapse: collapse;
        margin: 14pt 0;
        font-size: 8.8pt;
        page-break-inside: avoid;
        break-inside: avoid;
    }}

    th, td {{
        border: 1px solid #1e293b;
        padding: 7pt 9pt;
        text-align: left;
        vertical-align: top;
    }}

    th {{
        background-color: #131b2e;
        color: #f8fafc;
        font-weight: 800;
    }}

    td {{
        background-color: #0b0f19;
        color: #cbd5e1;
    }}

    tr:nth-child(even) td {{
        background-color: #0f172a;
    }}

    .table-portal-btn {{
        display: inline-block;
        background: #0284c7;
        color: #ffffff !important;
        padding: 3pt 8pt;
        border-radius: 4px;
        font-size: 8pt;
        font-weight: 700;
        text-decoration: none !important;
        white-space: nowrap;
        border: 1px solid #38bdf8;
    }}

    /* Interactive Portal Callout Cards */
    .portal-callout {{
        background: linear-gradient(135deg, #0c1829 0%, #10243e 100%);
        border: 1.5px solid #0284c7;
        border-radius: 12px;
        padding: 14pt 18pt;
        margin: 18pt 0;
        page-break-inside: avoid;
        break-inside: avoid;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    }}

    .portal-badge {{
        font-size: 8.5pt;
        font-weight: 800;
        color: #38bdf8;
        text-transform: uppercase;
        letter-spacing: 0.8px;
        margin-bottom: 8pt;
    }}

    .portal-content {{
        display: flex;
        flex-direction: column;
        gap: 6pt;
    }}

    .portal-btn {{
        display: inline-flex;
        align-items: center;
        background: #0284c7;
        color: #ffffff !important;
        font-size: 11pt;
        font-weight: 700;
        padding: 8pt 16pt;
        border-radius: 8px;
        text-decoration: none !important;
        border: 1px solid #38bdf8;
        gap: 8pt;
    }}

    .portal-icon {{
        font-size: 13pt;
    }}

    .portal-title {{
        flex: 1;
        color: #ffffff;
    }}

    .portal-arrow {{
        font-size: 11pt;
        font-weight: 900;
        color: #e0f2fe;
    }}

    .portal-url {{
        margin-top: 2pt;
    }}

    .portal-url-label {{
        font-family: {body_font};
        font-size: 8.5pt;
        color: #64748b;
    }}

    .portal-url-link {{
        font-family: 'Noto Sans Mono CJK TC', 'Liberation Mono', SFMono-Regular, Consolas, Menlo, Monaco, monospace;
        font-size: 8pt;
        color: #38bdf8;
        text-decoration: underline;
    }}

    /* Flowcharts & Visual Cards */
    .flowchart-container {{
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6pt;
        margin: 16pt 0;
        page-break-inside: avoid;
        break-inside: avoid;
    }}

    .flow-step {{
        background: #101726;
        border: 1.5px solid #0284c7;
        border-radius: 10px;
        padding: 9pt 18pt;
        width: 88%;
        text-align: center;
        text-decoration: none !important;
        display: block;
        color: inherit;
    }}

    .flow-step:hover {{
        background: #162238;
    }}

    .flow-badge {{
        font-size: 8pt;
        color: #38bdf8;
        font-weight: 800;
        text-transform: uppercase;
        margin-bottom: 2pt;
    }}

    .flow-title {{
        font-size: 10.5pt;
        font-weight: 800;
        color: #f8fafc;
    }}

    .flow-sub {{
        font-size: 8.5pt;
        color: #94a3b8;
        margin-top: 2pt;
    }}

    .flow-arrow {{
        color: #38bdf8;
        font-size: 11pt;
        line-height: 1;
    }}

    /* Architecture Diagram */
    .architecture-diagram {{
        background: #0a0e1a;
        border: 1px solid #1e293b;
        border-radius: 12px;
        padding: 14pt;
        margin: 16pt 0;
        page-break-inside: avoid;
        break-inside: avoid;
    }}

    .arch-layer {{
        border-radius: 8px;
        padding: 10pt;
        margin-bottom: 6pt;
    }}

    .arch-layer-1 {{
        background: #0c1f38;
        border: 1px solid #0284c7;
    }}

    .arch-layer-2 {{
        background: #231238;
        border: 1px solid #8b5cf6;
    }}

    .arch-layer-title {{
        font-size: 9.5pt;
        font-weight: 800;
        margin-bottom: 6pt;
        color: #f8fafc;
    }}

    .arch-boxes {{
        display: flex;
        gap: 8pt;
    }}

    .arch-box {{
        flex: 1;
        background: #111827;
        border-radius: 6px;
        padding: 7pt 9pt;
        border: 1px solid #1e293b;
    }}

    .arch-box-title {{
        font-weight: 700;
        font-size: 9pt;
        color: #38bdf8;
        margin-bottom: 3pt;
    }}

    .arch-box-desc {{
        font-size: 8pt;
        color: #94a3b8;
        line-height: 1.45;
    }}

    .arch-connector {{
        text-align: center;
        font-size: 8.5pt;
        font-weight: 700;
        color: #34d399;
        margin: 5pt 0;
        padding: 4pt;
        background: #062a1c;
        border-radius: 6px;
        border: 1px dashed #059669;
    }}

    .arch-connector-bottom {{
        color: #60a5fa;
        background: #0c1f38;
        border-color: #2563eb;
    }}

    /* Timeline Container */
    .timeline-container {{
        display: flex;
        flex-direction: column;
        gap: 6pt;
        margin: 16pt 0;
        page-break-inside: avoid;
        break-inside: avoid;
    }}

    .timeline-item {{
        background: #101726;
        border-left: 4px solid #38bdf8;
        border-radius: 0 8px 8px 0;
        padding: 8pt 12pt;
        border-top: 1px solid #1e293b;
        border-right: 1px solid #1e293b;
        border-bottom: 1px solid #1e293b;
    }}

    .timeline-badge {{
        font-size: 8pt;
        font-weight: 800;
        color: #38bdf8;
    }}

    .timeline-title {{
        font-size: 10pt;
        font-weight: 700;
        color: #f8fafc;
        margin: 2pt 0;
    }}

    .timeline-desc {{
        font-size: 8.5pt;
        color: #94a3b8;
        line-height: 1.5;
    }}

    /* Chapter Navigation Bar */
    .chapter-nav {{
        margin-top: 24pt;
        padding-top: 14pt;
        border-top: 1px solid #1e293b;
        display: flex;
        justify-content: space-between;
        align-items: center;
        page-break-inside: avoid;
        break-inside: avoid;
    }}

    .nav-btn {{
        display: inline-block;
        padding: 6pt 12pt;
        border-radius: 6px;
        font-size: 9pt;
        font-weight: 700;
        text-decoration: none !important;
    }}

    .nav-prev {{
        background: #111827;
        color: #94a3b8 !important;
        border: 1px solid #1e293b;
    }}

    .nav-next {{
        background: #0284c7;
        color: #ffffff !important;
        border: 1px solid #38bdf8;
    }}

    /* Code & Pre Blocks */
    pre, code {{
        font-family: 'Noto Sans Mono CJK TC', 'Liberation Mono', SFMono-Regular, Consolas, Menlo, Monaco, monospace;
    }}

    pre {{
        background: #050811;
        border: 1px solid #1e293b;
        border-radius: 6px;
        padding: 8pt 10pt;
        font-size: 8.5pt;
        color: #e2e8f0;
        overflow-x: auto;
        page-break-inside: avoid;
        break-inside: avoid;
    }}

    code {{
        background: #111827;
        padding: 1pt 4pt;
        border-radius: 3px;
        font-size: 8.5pt;
        color: #38bdf8;
        border: 1px solid #1e293b;
    }}

    pre code {{
        background: none;
        border: none;
        padding: 0;
        color: inherit;
    }}

    /* Custom Responsive Component: Personas 2x2 Grid */
    .personas-grid {{
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 8pt;
        margin: 14pt 0;
        page-break-inside: avoid;
        break-inside: avoid;
    }}

    .persona-card {{
        width: 48.5%;
        box-sizing: border-box;
        background: #101726;
        border: 1px solid #1e293b;
        border-top: 3px solid #38bdf8;
        border-radius: 8px;
        padding: 9pt 11pt;
        margin-bottom: 8pt;
    }}

    .card-commuter {{ border-top-color: #38bdf8; }}
    .card-senior   {{ border-top-color: #c084fc; }}
    .card-student  {{ border-top-color: #34d399; }}
    .card-tourist  {{ border-top-color: #fbbf24; }}

    .persona-header {{
        display: flex;
        align-items: center;
        gap: 6pt;
        margin-bottom: 6pt;
    }}

    .persona-title {{
        font-size: 10pt;
        font-weight: 800;
        color: #f8fafc;
    }}

    .persona-sub {{
        font-size: 7.5pt;
        color: #94a3b8;
    }}

    .persona-detail {{
        font-size: 8pt;
        color: #cbd5e1;
        line-height: 1.6;
    }}

    .persona-badge {{
        display: inline-block;
        padding: 1pt 4pt;
        border-radius: 3px;
        font-size: 7pt;
        font-weight: 700;
        margin-right: 4pt;
    }}

    .b-commuter {{ background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); }}
    .b-senior   {{ background: rgba(192, 132, 252, 0.2); color: #c084fc; border: 1px solid rgba(192, 132, 252, 0.4); }}
    .b-student  {{ background: rgba(52, 211, 153, 0.2); color: #34d399; border: 1px solid rgba(52, 211, 153, 0.4); }}
    .b-tourist  {{ background: rgba(251, 191, 36, 0.2); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.4); }}

    /* Inline SVG Icons */
    .inline-svg {{
        display: inline-block;
        width: 1.1em !important;
        height: 1.1em !important;
        vertical-align: -0.2em;
        margin-right: 4px;
        margin-left: 1px;
    }}

    /* Custom Responsive Component: Data Foundation Matrix (Chapter 2) */
    .data-matrix-card {{
        background: #0d1527;
        border: 1.5px solid #0284c7;
        border-radius: 8px;
        padding: 10pt 12pt;
        margin: 14pt 0;
        page-break-inside: avoid;
        break-inside: avoid;
    }}

    .data-matrix-head {{
        font-size: 10pt;
        font-weight: 800;
        color: #38bdf8;
        border-bottom: 1px solid #1e293b;
        padding-bottom: 6pt;
        margin-bottom: 8pt;
        text-align: center;
        letter-spacing: 0.5px;
    }}

    .data-matrix-tbl {{
        width: 100%;
        border-collapse: collapse;
        font-size: 8.2pt;
    }}

    .data-matrix-tbl th {{
        background: #111e38;
        color: #94a3b8;
        font-weight: 700;
        padding: 6pt 8pt;
        text-align: left;
        border-bottom: 1.5px solid #0284c7;
    }}

    .data-matrix-tbl td {{
        padding: 7pt 8pt;
        border-bottom: 1px solid #1e293b;
        vertical-align: top;
        line-height: 1.5;
    }}

    .data-matrix-tbl tr:last-child td {{
        border-bottom: none;
    }}

    .dm-source-title {{
        font-weight: 800;
        color: #f8fafc;
        font-size: 8.8pt;
        display: flex;
        align-items: center;
        gap: 4px;
    }}

    .dm-source-sub {{
        color: #64748b;
        font-size: 7.6pt;
        margin-top: 2px;
    }}

    .dm-stat-highlight {{
        font-weight: 700;
        color: #38bdf8;
    }}

    .dm-stat-sub {{
        color: #94a3b8;
        font-size: 7.6pt;
        margin-top: 2px;
    }}

    .dm-time-badge {{
        font-weight: 700;
        color: #34d399;
    }}

    /* Custom Responsive Component: Dual Mode Architecture (Chapter 6) */
    .dual-mode-container {{
        display: flex;
        gap: 10pt;
        margin: 14pt 0;
        page-break-inside: avoid;
        break-inside: avoid;
    }}

    .dual-mode-card {{
        flex: 1;
        background: #0d1527;
        border: 1.5px solid #0284c7;
        border-radius: 8px;
        padding: 10pt 12pt;
    }}

    .mode-micro {{
        border-color: #0284c7;
        background: #0d1933;
    }}

    .dm-card-head {{
        display: flex;
        align-items: center;
        gap: 6pt;
        border-bottom: 1px solid #1e293b;
        padding-bottom: 6pt;
        margin-bottom: 8pt;
    }}

    .dm-card-icon {{
        background: rgba(56, 189, 248, 0.15);
        border: 1px solid rgba(56, 189, 248, 0.3);
        border-radius: 6px;
        padding: 4pt;
        display: flex;
        align-items: center;
        justify-content: center;
    }}

    .dm-card-title {{
        font-size: 9.2pt;
        font-weight: 800;
        color: #f8fafc;
    }}

    .dm-card-sub {{
        font-size: 7.5pt;
        color: #64748b;
    }}

    .dm-card-list {{
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 5pt;
        font-size: 8.2pt;
        color: #cbd5e1;
    }}

    .dm-card-list li {{
        display: flex;
        align-items: center;
        gap: 5px;
    }}

    .dm-bullet {{
        color: #38bdf8;
        font-size: 6pt;
    }}

    /* Custom Responsive Component: Modal Shift Elasticity Dashboard (Chapter 5) */
    .elasticity-dashboard {{
        background: #0d1527;
        border: 1.5px solid #0284c7;
        border-radius: 8px;
        padding: 10pt 14pt;
        margin: 14pt 0;
        page-break-inside: avoid;
        break-inside: avoid;
    }}

    .elasticity-head {{
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #1e293b;
        padding-bottom: 6pt;
        margin-bottom: 8pt;
    }}

    .elasticity-title {{
        font-size: 9.8pt;
        font-weight: 800;
        color: #38bdf8;
        display: flex;
        align-items: center;
        gap: 6px;
    }}

    .elasticity-badge {{
        font-size: 7.5pt;
        background: #1e293b;
        color: #94a3b8;
        padding: 2pt 6pt;
        border-radius: 4px;
        font-weight: 600;
    }}

    .elasticity-rows {{
        display: flex;
        flex-direction: column;
        gap: 6pt;
    }}

    .elasticity-row {{
        display: flex;
        align-items: center;
        background: #111a2e;
        border: 1px solid #1e293b;
        border-radius: 6px;
        padding: 6pt 10pt;
        gap: 10pt;
    }}

    .el-mode {{
        width: 135pt;
        font-weight: 700;
        font-size: 8.8pt;
        color: #f8fafc;
        display: flex;
        align-items: center;
        gap: 6px;
    }}

    .el-pill {{
        width: 60pt;
        text-align: center;
        font-weight: 800;
        font-size: 8.5pt;
        padding: 2pt 5pt;
        border-radius: 4px;
        font-family: 'Noto Sans Mono CJK TC', monospace;
    }}

    .pill-gain      {{ background: #064e3b; color: #34d399; border: 1px solid #059669; }}
    .pill-stable    {{ background: #1e293b; color: #94a3b8; border: 1px solid #475569; }}
    .pill-drop-low  {{ background: #3b111e; color: #fb7185; border: 1px solid #be123c; }}
    .pill-drop-med  {{ background: #4c0519; color: #f43f5e; border: 1px solid #e11d48; }}
    .pill-drop-high {{ background: #5a0517; color: #fca5a5; border: 1px solid #f43f5e; }}

    .el-desc {{
        flex: 1;
        font-size: 8.2pt;
        color: #cbd5e1;
        line-height: 1.4;
    }}

    /* Custom Responsive Component: Selection Decision Matrix (Chapter 7) */
    .matrix-decision-container {{
        background: #0a0e1a;
        border: 1px solid #1e293b;
        border-radius: 10px;
        padding: 12pt;
        margin: 14pt 0;
        page-break-inside: avoid;
        break-inside: avoid;
    }}

    .matrix-decision-header {{
        background: #111827;
        border: 1px solid #0284c7;
        border-radius: 6px;
        padding: 7pt;
        text-align: center;
        font-weight: 800;
        font-size: 9.5pt;
        color: #38bdf8;
        margin-bottom: 10pt;
    }}

    .matrix-decision-grid {{
        display: flex;
        gap: 6pt;
    }}

    .matrix-decision-col {{
        flex: 1;
        background: #101726;
        border: 1px solid #1e293b;
        border-radius: 6px;
        padding: 7pt 6pt;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }}

    .matrix-target-box {{
        font-size: 7.8pt;
        font-weight: 800;
        color: #f8fafc;
        border-bottom: 1px solid #1e293b;
        padding-bottom: 4pt;
        margin-bottom: 4pt;
        text-align: center;
    }}

    .matrix-points {{
        margin: 0;
        padding-left: 10pt;
        font-size: 7.2pt;
        color: #94a3b8;
        line-height: 1.45;
        flex: 1;
    }}

    .matrix-points li {{
        margin-bottom: 2pt;
    }}

    .matrix-choice-box {{
        margin-top: 6pt;
        border-radius: 4px;
        padding: 4pt 2pt;
        font-size: 7.5pt;
        font-weight: 800;
        text-align: center;
    }}

    .choice-ticp    {{ background: #0c2b42; color: #38bdf8; border: 1px solid #0284c7; }}
    .choice-etag    {{ background: #1a2f18; color: #34d399; border: 1px solid #059669; }}
    .choice-telecom {{ background: #321c45; color: #c084fc; border: 1px solid #8b5cf6; }}
    .choice-fusion  {{ background: #3d230d; color: #fbbf24; border: 1px solid #d97706; }}

    /* Pipeline Diagram */
    .pipeline-diagram {{
        background: #0a0e1a;
        border: 1px solid #1e293b;
        border-radius: 10px;
        padding: 12pt;
        margin: 14pt 0;
        page-break-inside: avoid;
        break-inside: avoid;
    }}

    .pipeline-head {{
        background: #111827;
        border: 1px solid #0284c7;
        border-radius: 6px;
        padding: 6pt;
        text-align: center;
        font-weight: 800;
        font-size: 9.5pt;
        color: #38bdf8;
    }}

    .pipeline-connector {{
        text-align: center;
        color: #64748b;
        font-size: 7.5pt;
        font-weight: 700;
        margin: 6pt 0;
    }}

    .pipeline-columns {{
        display: flex;
        gap: 8pt;
    }}

    .pipeline-col {{
        flex: 1;
        background: #101726;
        border-radius: 6px;
        padding: 8pt 10pt;
        border: 1px solid #1e293b;
    }}

    .col-privacy {{ border-top: 3px solid #34d399; }}
    .col-stream  {{ border-top: 3px solid #38bdf8; }}

    .pipeline-col-title {{
        font-size: 8.8pt;
        font-weight: 800;
        color: #f8fafc;
        margin-bottom: 2pt;
    }}

    .pipeline-col-sub {{
        font-size: 7.2pt;
        color: #64748b;
        margin-bottom: 6pt;
    }}

    .pipeline-list {{
        margin: 0;
        padding-left: 12pt;
        font-size: 7.8pt;
        color: #cbd5e1;
        line-height: 1.45;
    }}

    .pipeline-foot {{
        background: #101726;
        border: 1px solid #d97706;
        border-radius: 6px;
        padding: 6pt;
        text-align: center;
        font-size: 8.5pt;
        font-weight: 700;
        color: #fbbf24;
    }}
    """
