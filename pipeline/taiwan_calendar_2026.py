#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Taiwan 2026 Official Administrative Calendar Module
依據行政院人事行政總處 (DGPA) 2026 年政府行政機關辦公日曆表嚴謹定義。
將日期精確劃分為：
- WORKDAY_REG: 常規工作日 (週一至五且非國定假日)
- WORKDAY_MKP: 補行上班日 (週六但政府公告上班上課)
- HOLIDAY_NAT: 國定/連假日 (落在週一至五之法定放假日)
- HOLIDAY_WKD: 常規週末日 (週六與週日且非補班日)
"""

import datetime
from typing import Dict, Optional, Tuple

# 2026 上半年國定假日、彈性放假日與連續假期對照表
# 格式: 'YYYY-MM-DD': ('節日名稱', '所屬連假名稱')
NATIONAL_HOLIDAYS_2026_H1: Dict[str, Tuple[str, str]] = {
    # 1. 中華民國開國紀念日 (元旦)
    '2026-01-01': ('元旦', '元旦假期'),
    
    # 2. 農曆除夕與春節連假 (2026-02-14 ~ 2026-02-22，其中週一至五為 2/16~2/20)
    '2026-02-16': ('農曆除夕', '春節連假'),
    '2026-02-17': ('春節初一', '春節連假'),
    '2026-02-18': ('春節初二', '春節連假'),
    '2026-02-19': ('春節初三', '春節連假'),
    '2026-02-20': ('春節補假/調整放假', '春節連假'),
    
    # 3. 和平紀念日 (228 為週六，週五 2/27 補假)
    '2026-02-27': ('和平紀念日補假', '228連假'),
    
    # 4. 兒童節與清明節連假 (2026-04-03 ~ 2026-04-06)
    '2026-04-03': ('兒童節 (提前補假)', '清明連假'),
    '2026-04-06': ('清明節補假', '清明連假'),
    
    # 5. 勞動節 (適用廣大勞工通勤族群，2026-05-01 週五)
    '2026-05-01': ('勞動節', '勞動節連假'),
    
    # 6. 端午節連假 (2026-06-19 週五為農曆五月初五)
    '2026-06-19': ('端午節', '端午連假'),
}

# 2026 上半年補行上班日 (週六需上班上課)
MAKEUP_WORKDAYS_2026_H1: Dict[str, str] = {
    # 春節彈性放假對應之週六補班日 (若有排定)
    '2026-02-07': '春節調整放假補班',
}

DAY_TYPE_WORKDAY_REG = 'WORKDAY_REG'
DAY_TYPE_WORKDAY_MKP = 'WORKDAY_MKP'
DAY_TYPE_HOLIDAY_NAT = 'HOLIDAY_NAT'
DAY_TYPE_HOLIDAY_WKD = 'HOLIDAY_WKD'


def parse_date(date_val) -> datetime.date:
    if isinstance(date_val, datetime.date):
        return date_val
    elif isinstance(date_val, datetime.datetime):
        return date_val.date()
    elif isinstance(date_val, str):
        # 支援 'YYYY-MM-DD', 'YYYY-MM-DD HH:MM:SS', 'YYYYMMDD'
        clean = date_val.strip().split()[0].replace('/', '-')
        if len(clean) == 8 and clean.isdigit():
            return datetime.date(int(clean[:4]), int(clean[4:6]), int(clean[6:8]))
        return datetime.date.fromisoformat(clean[:10])
    raise ValueError(f"無法解析日期格式: {date_val}")


def get_day_type(date_val) -> str:
    """
    精確回傳日型:
    - WORKDAY_REG: 常規工作日 (週一~五且非國定假日)
    - WORKDAY_MKP: 補班日 (週六補行上班)
    - HOLIDAY_NAT: 國定假日 (落在週一~五的放假)
    - HOLIDAY_WKD: 常規週末 (週六、週日且非補班)
    """
    d = parse_date(date_val)
    d_str = d.isoformat()
    weekday = d.weekday() # 0=Mon, 1=Tue, ..., 4=Fri, 5=Sat, 6=Sun
    
    if d_str in MAKEUP_WORKDAYS_2026_H1:
        return DAY_TYPE_WORKDAY_MKP
        
    if d_str in NATIONAL_HOLIDAYS_2026_H1:
        return DAY_TYPE_HOLIDAY_NAT
        
    if weekday in (5, 6):
        return DAY_TYPE_HOLIDAY_WKD
        
    return DAY_TYPE_WORKDAY_REG


def is_workday(date_val) -> bool:
    """
    嚴謹判斷是否為「實質上班上課日」:
    常規工作日 (WORKDAY_REG) 或 補班日 (WORKDAY_MKP) 為 True。
    落在週一至五的國定假日一律為 False！
    """
    dtype = get_day_type(date_val)
    return dtype in (DAY_TYPE_WORKDAY_REG, DAY_TYPE_WORKDAY_MKP)


def is_holiday(date_val) -> bool:
    """
    嚴謹判斷是否為「休閒假日」:
    週末例假日 (HOLIDAY_WKD) 或 週一至五國定假日 (HOLIDAY_NAT) 為 True。
    """
    dtype = get_day_type(date_val)
    return dtype in (DAY_TYPE_HOLIDAY_NAT, DAY_TYPE_HOLIDAY_WKD)


def get_holiday_name(date_val) -> Optional[str]:
    d = parse_date(date_val)
    d_str = d.isoformat()
    if d_str in NATIONAL_HOLIDAYS_2026_H1:
        return NATIONAL_HOLIDAYS_2026_H1[d_str][0]
    if d_str in MAKEUP_WORKDAYS_2026_H1:
        return MAKEUP_WORKDAYS_2026_H1[d_str]
    return None


if __name__ == '__main__':
    print("=== 2026 年上半年日曆校準測試 ===")
    test_dates = [
        '2026-01-01', # 元旦 (週四) -> 應為 HOLIDAY_NAT
        '2026-01-02', # 週五 -> 應為 WORKDAY_REG
        '2026-01-03', # 週六 -> 應為 HOLIDAY_WKD
        '2026-02-07', # 週六補班 -> 應為 WORKDAY_MKP
        '2026-02-16', # 除夕 (週一) -> 應為 HOLIDAY_NAT
        '2026-02-17', # 初一 (週二) -> 應為 HOLIDAY_NAT
        '2026-02-27', # 228補假 (週五) -> 應為 HOLIDAY_NAT
        '2026-03-09', # 常規通學週一 -> 應為 WORKDAY_REG
        '2026-04-03', # 兒童節 (週五) -> 應為 HOLIDAY_NAT
        '2026-04-06', # 清明補假 (週一) -> 應為 HOLIDAY_NAT
        '2026-05-01', # 勞動節 (週五) -> 應為 HOLIDAY_NAT
        '2026-06-19', # 端午節 (週五) -> 應為 HOLIDAY_NAT
    ]
    for td in test_dates:
        dt = parse_date(td)
        dtype = get_day_type(td)
        work = is_workday(td)
        hol = is_holiday(td)
        hname = get_holiday_name(td) or '一般平日/週末'
        print(f"[{td} {dt.strftime('%a')}] {dtype:<12} | 是上班日: {str(work):<5} | 是放假日: {str(hol):<5} | 備註: {hname}")
