"""
NQNQ 가상데이터 생성 스크립트 v5
근거 문서: 00. Home / 01. Master Roadmap (Year1-3) — 2026.08 개정판
           30. Supply Chain & Inventory / 33. Returns & RMA Process
           16. PPT plan (컷오프 8/20)

v4 대비 변경점 (2026-09-11, HUB/매장 재고 분리):
  1. INVENTORY를 (sku_code, location_id) 복합키로 변경 — HUB(중앙창고) +
     매장별(STORE-01~04) 재고를 각각 독립적으로 추적. models.py도 같이 수정됨.
  2. HUB<->매장 이동을 inventory_ledger의 'movement_type=이관'으로 실제 기록
     (v4에선 이 값이 스키마에 정의만 되고 한 번도 안 쓰였음).
  3. 매장 오픈 시 HUB->매장 사전비축(이관), 팝업 폐점 시 매장 잔여재고->HUB 반납(이관),
     상설쇼룸은 매일 로컬재고 점검 후 부족하면 HUB->매장 보충(이관) 추가.
  4. v4의 매장선택 버그 해소: 동시에 여러 매장이 열려있으면 그중 랜덤 선택
     (v4는 STORES 딕셔너리 순서상 항상 첫 매칭 매장만 선택 -> STORE-03/04가
     한 번도 안 뽑히던 버그. 이제 매장별로 독립 재고를 가지므로 "하나만 골라야
     하는" 문제 자체가 없어짐).
  5. 온라인(ZIGZAG)/홀세일(WHOLESALE) 판매는 HUB 재고를, 오프라인(OFFLINE) 판매는
     해당 매장의 로컬 재고를 차감. 팩토리 재발주 트리거는 HUB 재고 기준으로만 작동
     (매장 재고가 낮으면 팩토리 재발주가 아니라 HUB->매장 보충으로 해결).
  6. 트렌드캡슐<->팝업 연동(어떤 캡슐을 어느 팝업에 먼저 푸는지)은 이번 버전에서
     제외 — 별도 마케팅 배분 규칙이 필요해서 복잡도가 한 단계 더 올라감. 캡슐은
     v4와 동일하게 온라인(HUB) 전용으로 유지.

⚠️ 단순화 가정 (v4와 동일 + 추가):
  - STAFF/TASK 등 조직 운영 데이터는 이번 라운드에서 다루지 않음
  - safety_stock/reorder_point는 위치별로 별도 계산하지 않고 SKU당 공통 공식값을
    모든 location 행에 동일하게 저장(단순화) — 실제 팩토리 재발주 판단은 HUB 행만 사용
  - pending_return_qty는 반품이 어디로 들어오든 전부 HUB에 귀속(단순화)
  - HUB는 STORE 테이블에 없는 가상 위치라 location_id에 FK 제약을 걸지 않음
"""

import random
import sqlite3
from datetime import date, datetime, timedelta
from itertools import count as _count

import numpy as np

from models import get_engine, init_db

random.seed(42)
np.random.seed(42)

TODAY = date(2026, 8, 20)
LAUNCH_DATE = date(2024, 3, 1)
DB_PATH = "nqnq.db"
HUB = "HUB"

# ---------------------------------------------------------------------------
# 마스터 데이터 정의 (v4와 동일)
# ---------------------------------------------------------------------------
CATEGORIES = {
    "TOP": {"name": "상의", "intro": date(2024, 3, 1),
            "sizes": ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"],
            "core_colors": ["BLK", "WHT", "GRY", "NVY"], "point_colors": ["ORC", "SKB", "LYL"],
            "body_tags": ["STR", "WAV", "NAT"], "price": 39000, "return_rate": 0.15},
    "PNT": {"name": "하의", "intro": date(2024, 3, 1),
            "sizes": ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"],
            "core_colors": ["BLK", "GRY", "BEG"], "point_colors": ["KHK", "NVY"],
            "body_tags": None, "price": 49000, "return_rate": 0.20},
    "CLR": {"name": "컬러베이직", "intro": date(2024, 3, 1), "body_codes": ["WRM", "COOL", "MUT"],
            "sizes": ["S", "M", "L"], "colors": ["CRM", "ASH", "IVR"], "price": 35000, "return_rate": 0.10},
    "OUT": {"name": "아우터", "intro": date(2025, 3, 1), "body_tags": ["STR", "WAV", "NAT"],
            "sizes": ["S", "M", "L"], "colors": ["BLK", "BEG", "GRY", "NVY"], "price": 89000, "return_rate": 0.18},
    "ACC": {"name": "액세서리", "intro": date(2026, 3, 1), "body_codes": ["BAG", "BLT", "SCF", "CAP", "PCH"],
            "sizes": ["FREE"], "colors": ["BLK", "BEG", "WHT", "BRN"], "price": 19000, "return_rate": 0.08},
    "DRS": {"name": "원피스", "intro": date(2026, 3, 1), "body_tags": ["STR", "WAV", "NAT"],
            "sizes": ["S", "M", "L"], "colors": ["BLK", "IVR"], "price": 59000, "return_rate": 0.15},
}

COST_RATIO = 0.48
LEAD_TIME_DAYS = 52
AVG_ITEMS_PER_ORDER = 1.5

REORDER_BUFFER = 1.3
PAR_BUFFER = 3.0
INITIAL_BUFFER = 3.0
SAFETY_STOCK_RATIO = 0.5

# 매장 보충(HUB->STORE) 정책 — 신규(v5)
STORE_REORDER_DAYS = 7    # 매장 로컬재고가 이만큼(일) 이하로 떨어지면 보충
STORE_TOPUP_DAYS = 14     # 보충 시 이만큼(일)치를 채워넣음
OFFLINE_SHARE = 0.05      # ⚠️ 필수: 오프라인 채널은 전체 수요의 5%뿐(메인루프 5% 분기와 동일 비율).
                           # velocity_for_date()는 "전체 판매속도"라 이 배율 없이 매장 사전비축/
                           # 보충 물량을 계산하면 매장이 마치 전국 수요 전체를 감당하는 것처럼
                           # HUB 재고를 과도하게 빨아들여서 온라인 재고가 말라버림(최초 실행에서 실제로
                           # 발생 확인 - 분기별 매출 목표 달성률이 94~111%->0~85%로 붕괴했었음)

PROMO_WINDOWS = [
    ((3, 1), (3, 14), 2.5, "신학기 프로모션"),
    ((7, 25), (8, 10), 2.5, "여름 정리 세일"),
    ((11, 20), (11, 30), 3.0, "블랙프라이데이"),
    ((12, 15), (1, 15), 2.0, "연말 이월 프로모션"),
]

QUARTERS = [
    (date(2024, 3, 1), date(2024, 5, 31), 2_000_000_000),
    (date(2024, 6, 1), date(2024, 8, 31), 2_200_000_000),
    (date(2024, 9, 1), date(2024, 11, 30), 2_800_000_000),
    (date(2024, 12, 1), date(2025, 2, 28), 3_000_000_000),
    (date(2025, 3, 1), date(2025, 5, 31), 8_000_000_000),
    (date(2025, 6, 1), date(2025, 8, 31), 8_800_000_000),
    (date(2025, 9, 1), date(2025, 11, 30), 11_200_000_000),
    (date(2025, 12, 1), date(2026, 2, 28), 12_000_000_000),
    (date(2026, 3, 1), date(2026, 5, 31), 20_000_000_000),
    (date(2026, 6, 1), date(2026, 8, 31), 22_000_000_000),
]

STORES = {
    "STORE-01": {"type": "팝업", "location": "성수", "open": date(2024, 10, 1), "close": date(2024, 10, 31)},
    "STORE-02": {"type": "상설쇼룸", "location": "홍대", "open": date(2025, 3, 15), "close": None},
    "STORE-03": {"type": "팝업", "location": "강남", "open": date(2025, 11, 1), "close": date(2025, 11, 30)},
    "STORE-04": {"type": "상설쇼룸", "location": "강남", "open": date(2026, 4, 1), "close": None},
}
SHOWROOM_PREP_WEEKS = 4
POPUP_PREP_WEEKS = 2  # 팝업은 상설쇼룸보다 짧게(신규, v5) — 팝업도 이제 사전비축 대상

SEOUL_MONTHLY_TEMP = {
    1: -2.0, 2: 0.4, 3: 5.7, 4: 12.5, 5: 17.8, 6: 22.2,
    7: 24.9, 8: 26.1, 9: 21.3, 10: 14.6, 11: 7.5, 12: 0.4,
}

SOLAR_TERMS_24 = [
    ("입춘", 2, 4), ("우수", 2, 19), ("경칩", 3, 6), ("춘분", 3, 21),
    ("청명", 4, 5), ("곡우", 4, 20), ("입하", 5, 6), ("소만", 5, 21),
    ("망종", 6, 6), ("하지", 6, 21), ("소서", 7, 7), ("대서", 7, 23),
    ("입추", 8, 8), ("처서", 8, 23), ("백로", 9, 8), ("추분", 9, 23),
    ("한로", 10, 8), ("상강", 10, 23), ("입동", 11, 7), ("소설", 11, 22),
    ("대설", 12, 7), ("동지", 12, 22), ("소한", 1, 6), ("대한", 1, 20),
]


def get_temp(d: date) -> float:
    m, day = d.month, d.day
    if day >= 15:
        m1, m2, frac = m, (m % 12) + 1, (day - 15) / 30
    else:
        m1, m2, frac = (m - 2) % 12 + 1, m, (day + 15) / 30
    t1, t2 = SEOUL_MONTHLY_TEMP[m1], SEOUL_MONTHLY_TEMP[m2]
    return t1 + (t2 - t1) * frac


def category_weather_factor(cat_code: str, temp: float) -> float:
    if cat_code == "OUT":
        return 1.0 + max(0.0, (18 - temp) / 18) * 1.5
    if cat_code == "DRS":
        return 1.0 + max(0.0, (temp - 15) / 15) * 1.2
    if cat_code == "TOP":
        return 1.0 + max(0.0, (temp - 10) / 25) * 0.4
    if cat_code == "PNT":
        return 1.0 + max(0.0, (15 - temp) / 25) * 0.5
    return 1.0


SIZE_WEIGHTS_3 = {"S": 0.36, "M": 0.37, "L": 0.27}
SIZE_WEIGHTS_FREE = {"FREE": 1.0}
SIZE_WEIGHTS_8 = {
    "XS": 0.04, "S": 0.14, "M": 0.24, "L": 0.24,
    "XL": 0.16, "2XL": 0.10, "3XL": 0.05, "4XL": 0.03,
}

TREND_CAPSULES = [
    {"id": "TRD-CLR-01", "category": "CLR", "name": "톤온톤 니트 셋업",
     "intro": date(2024, 9, 1), "discontinue": date(2025, 2, 28),
     "body_codes": ["WRM", "COOL", "MUT"], "sizes": ["S", "M", "L"], "colors": ["CRM", "ASH"], "price": 45000},
    {"id": "TRD-OUT-01", "category": "OUT", "name": "액티브 반집업 아우터",
     "intro": date(2025, 3, 1), "discontinue": date(2025, 8, 31),
     "body_codes": ["STR", "WAV", "NAT"], "sizes": ["S", "M", "L"], "colors": ["BLK", "GRY"], "price": 79000},
    {"id": "TRD-TOP-01", "category": "TOP", "name": "원숄더 니트탑",
     "intro": date(2025, 9, 1), "discontinue": date(2026, 2, 28),
     "body_codes": ["STR", "WAV", "NAT"], "sizes": ["S", "M", "L"], "colors": ["BLK", "IVR"], "price": 42000},
    {"id": "TRD-OUT-02", "category": "OUT", "name": "뉴트럴 플리스 아우터(그래놀라코어)",
     "intro": date(2025, 9, 1), "discontinue": date(2026, 2, 28),
     "body_codes": ["STR", "WAV", "NAT"], "sizes": ["S", "M", "L"], "colors": ["BRN", "GRN", "BEG"], "price": 79000},
    {"id": "TRD-OUT-03", "category": "OUT", "name": "쿼터집 후드",
     "intro": date(2026, 3, 1), "discontinue": date(2026, 8, 31),
     "body_codes": ["STR", "WAV", "NAT"], "sizes": ["S", "M", "L"], "colors": ["BLK", "BEG"], "price": 69000},
    {"id": "TRD-ACC-01", "category": "ACC", "name": "참키링 액세서리",
     "intro": date(2026, 3, 1), "discontinue": date(2026, 8, 31),
     "body_codes": ["CHM"], "sizes": ["FREE"], "colors": ["BLK", "GLD", "SLV"], "price": 15000},
]


def promo_multiplier(d: date) -> float:
    mult = 1.0
    for (sm, sd), (em, ed), factor, _ in PROMO_WINDOWS:
        if em < sm:
            start_a, end_a = date(d.year, sm, sd), date(d.year, 12, 31)
            start_b, end_b = date(d.year, 1, 1), date(d.year, em, ed)
            if start_a <= d <= end_a or start_b <= d <= end_b:
                mult = max(mult, factor)
        else:
            start, end = date(d.year, sm, sd), date(d.year, em, ed)
            if start <= d <= end:
                mult = max(mult, factor)
    return mult


def dow_factor(d: date) -> float:
    return 1.3 if d.weekday() >= 5 else 0.9


_id_counters = {}


def gen_id(prefix):
    if prefix not in _id_counters:
        _id_counters[prefix] = _count(1)
    return f"{prefix}-{next(_id_counters[prefix]):09d}"


def estimate_aov(d: date) -> int:
    total_price, n = 0, 0
    for sku_code, intro in active_from.items():
        if intro <= d:
            total_price += sku_info[sku_code]["price"]
            n += 1
    avg_price = total_price / n if n else 40000
    return avg_price * AVG_ITEMS_PER_ORDER


def active_sku_count(d: date) -> int:
    return sum(1 for s, intro in active_from.items() if intro <= d) or 1


# ---------------------------------------------------------------------------
# 재고 헬퍼 (신규, v5) — sku_pool[sku]["locations"][loc] 딕셔너리 기반
# ---------------------------------------------------------------------------
def stock_at(sku_code, loc):
    return sku_pool[sku_code]["locations"].get(loc, 0)


def move_stock(sku_code, loc, delta):
    cur_qty = sku_pool[sku_code]["locations"].get(loc, 0)
    sku_pool[sku_code]["locations"][loc] = cur_qty + delta


def transfer(sku_code, from_loc, to_loc, qty, ref_id, when: datetime, rows_buf):
    """HUB<->매장 이관 — 양쪽에 각각 이관 레저를 남김."""
    if qty <= 0:
        return
    move_stock(sku_code, from_loc, -qty)
    move_stock(sku_code, to_loc, qty)
    rows_buf.append((gen_id("LED"), sku_code, from_loc, "이관", -qty, ref_id, when.isoformat()))
    rows_buf.append((gen_id("LED"), sku_code, to_loc, "이관", qty, ref_id, when.isoformat()))


# ---------------------------------------------------------------------------
# 1. DB 초기화
# ---------------------------------------------------------------------------
import os
if os.path.exists(DB_PATH):
    os.remove(DB_PATH)
engine = get_engine(DB_PATH)
init_db(engine)
engine.dispose()

con = sqlite3.connect(DB_PATH)
con.execute("PRAGMA foreign_keys=OFF")
con.execute("PRAGMA synchronous=OFF")
con.execute("PRAGMA journal_mode=MEMORY")
cur = con.cursor()

# ---------------------------------------------------------------------------
# 2. 마스터 데이터 삽입 (v4와 동일)
# ---------------------------------------------------------------------------
cur.executemany("INSERT INTO category (category_code, name) VALUES (?, ?)",
                 [(c, m["name"]) for c, m in CATEGORIES.items()])

cur.execute("INSERT INTO factory VALUES (?, ?, ?, ?, ?)",
            ("FAC-001", "성진어패럴", 300, 45, "선급30%/잔금70%"))

cur.executemany("INSERT INTO channel VALUES (?, ?, ?, ?)", [
    ("ZIGZAG", "지그재그(직진배송)", 0.15, "월 2회"),
    ("OFFLINE", "오프라인 쇼룸/팝업", 0.0, "-"),
    ("WHOLESALE", "홀세일/입점", 0.0, "월 1회"),
])

cur.executemany("INSERT INTO store VALUES (?, ?, ?, ?, ?)", [
    (sid, s["type"], s["location"], s["open"].isoformat(), s["close"].isoformat() if s["close"] else None)
    for sid, s in STORES.items()
])

TIER_WEIGHT = {"HERO": 3.0, "STEADY": 1.0, "NICHE": 0.3}

DESIGNS_BY_CATEGORY = {
    "TOP": [
        ("스퀘어라인 기본티", "HERO"), ("브이넥 니트", "STEADY"), ("포켓 셔츠", "STEADY"),
        ("오버사이즈 맨투맨", "NICHE"), ("집업 후드", "NICHE"),
    ],
    "PNT": [
        ("5-Length 슬랙스", "HERO"), ("핀턱 와이드", "STEADY"),
        ("테이퍼드 데님", "STEADY"), ("조거 팬츠", "NICHE"),
    ],
    "CLR": [
        ("퍼스널컬러 베이직 탑", "HERO"), ("퍼스널컬러 니트 가디건", "STEADY"),
    ],
    "OUT": [
        ("드롭숄더 아우터", "HERO"), ("롱 트렌치코트", "STEADY"), ("숏패딩", "NICHE"),
    ],
    "DRS": [
        ("체형핏 원피스", "HERO"), ("니트 원피스", "STEADY"),
    ],
}
ACC_TIER = {"BAG": "STEADY", "BLT": "NICHE", "SCF": "NICHE", "CAP": "NICHE", "PCH": "NICHE"}

STYLE_NAME_TEMPLATES = {
    "TOP": "{design}", "PNT": "{design}", "CLR": "{body} {design}",
    "OUT": "{design}", "ACC": "{body} 액세서리", "DRS": "{design}",
}

sku_pool = {}          # sku_code -> {"locations": {loc: qty}, "pending_po": bool}
sku_info = {}
active_from = {}
discontinue_at = {}
product_rows, sku_rows = [], []


def _make_sku_rows(product_id, cat_code, price, cost, sizes, colors, tier, intro, season_label_unused=None):
    for size in sizes:
        for color in colors:
            sku_code = f"{product_id}-{size}-{color}"
            sku_rows.append((sku_code, product_id, size, color, price, cost))
            sku_pool[sku_code] = {"locations": {HUB: 0}, "pending_po": False}
            sku_info[sku_code] = {"price": price, "cost": cost, "category": cat_code,
                                   "line_type": "BASIC", "size": size, "tier": tier}
            active_from[sku_code] = intro
            discontinue_at[sku_code] = None


for cat_code, meta in CATEGORIES.items():
    season_label = ("Y1SS" if meta["intro"] == date(2024, 3, 1) else
                     "Y2SS" if meta["intro"] == date(2025, 3, 1) else "Y3SS")
    price = meta["price"]
    cost = round(price * COST_RATIO)
    seq = 0

    if cat_code == "ACC":
        for body in meta["body_codes"]:
            seq += 1
            product_id = f"NQ-{cat_code}-{body}-{seq:03d}"
            tier = ACC_TIER.get(body, "NICHE")
            product_rows.append((
                product_id, cat_code, STYLE_NAME_TEMPLATES[cat_code].format(body=body),
                body, season_label, "판매중", "BASIC", tier, meta["intro"].isoformat(),
            ))
            _make_sku_rows(product_id, cat_code, price, cost, meta["sizes"], meta["colors"], tier, meta["intro"])

    elif cat_code == "CLR":
        for design, tier in DESIGNS_BY_CATEGORY[cat_code]:
            for body in meta["body_codes"]:
                seq += 1
                product_id = f"NQ-{cat_code}-{body}-{seq:03d}"
                product_rows.append((
                    product_id, cat_code, STYLE_NAME_TEMPLATES[cat_code].format(body=body, design=design),
                    body, season_label, "판매중", "BASIC", tier, meta["intro"].isoformat(),
                ))
                _make_sku_rows(product_id, cat_code, price, cost, meta["sizes"], meta["colors"], tier, meta["intro"])

    elif cat_code in ("TOP", "PNT"):
        body_tag_str = ",".join(meta["body_tags"]) if meta.get("body_tags") else "-"
        for design, tier in DESIGNS_BY_CATEGORY[cat_code]:
            seq += 1
            product_id = f"NQ-{cat_code}-{seq:03d}"
            product_rows.append((
                product_id, cat_code, STYLE_NAME_TEMPLATES[cat_code].format(design=design),
                body_tag_str, season_label, "판매중", "BASIC", tier, meta["intro"].isoformat(),
            ))
            colors = meta["core_colors"] + meta["point_colors"] if tier == "HERO" else meta["core_colors"]
            _make_sku_rows(product_id, cat_code, price, cost, meta["sizes"], colors, tier, meta["intro"])

    else:
        body_tag_str = ",".join(meta["body_tags"]) if meta.get("body_tags") else "-"
        for design, tier in DESIGNS_BY_CATEGORY[cat_code]:
            seq += 1
            product_id = f"NQ-{cat_code}-{seq:03d}"
            product_rows.append((
                product_id, cat_code, STYLE_NAME_TEMPLATES[cat_code].format(design=design),
                body_tag_str, season_label, "판매중", "BASIC", tier, meta["intro"].isoformat(),
            ))
            _make_sku_rows(product_id, cat_code, price, cost, meta["sizes"], meta["colors"], tier, meta["intro"])

for cap in TREND_CAPSULES:
    if cap["intro"] > TODAY:
        continue
    for i, body in enumerate(cap["body_codes"], start=1):
        product_id = f"{cap['id']}-{body}-{i:03d}"
        product_rows.append((
            product_id, cap["category"], cap["name"], body,
            ("Y1FW" if cap["intro"].month in (9, 10, 11, 12) and cap["intro"].year == 2024 else
             "Y2SS" if cap["intro"] == date(2025, 3, 1) else
             "Y2FW" if cap["intro"] == date(2025, 9, 1) else "Y3SS"),
            "단종" if cap["discontinue"] < TODAY else "판매중", "TREND", "STEADY", cap["intro"].isoformat(),
        ))
        price, cost = cap["price"], round(cap["price"] * COST_RATIO)
        for size in cap["sizes"]:
            for color in cap["colors"]:
                sku_code = f"{product_id}-{size}-{color}"
                sku_rows.append((sku_code, product_id, size, color, price, cost))
                sku_pool[sku_code] = {"locations": {HUB: 0}, "pending_po": False}
                sku_info[sku_code] = {"price": price, "cost": cost, "category": cap["category"],
                                       "line_type": "TREND", "size": size, "tier": "STEADY"}
                active_from[sku_code] = cap["intro"]
                discontinue_at[sku_code] = cap["discontinue"]

cur.executemany("INSERT INTO product VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", product_rows)
cur.executemany("INSERT INTO sku VALUES (?, ?, ?, ?, ?, ?)", sku_rows)
con.commit()
n_basic = sum(1 for v in sku_info.values() if v["line_type"] == "BASIC")
n_trend = sum(1 for v in sku_info.values() if v["line_type"] == "TREND")
print(f"카테고리 {len(CATEGORIES)}개 / 스타일 {len(product_rows)}개 / SKU {len(sku_rows)}개 생성 "
      f"(베이직 {n_basic} + 트렌드캡슐 {n_trend})")

_cat_tier_sum, _cat_tier_cnt = {}, {}
for info in sku_info.values():
    c = info["category"]
    _cat_tier_sum[c] = _cat_tier_sum.get(c, 0) + TIER_WEIGHT.get(info.get("tier", "STEADY"), 1.0)
    _cat_tier_cnt[c] = _cat_tier_cnt.get(c, 0) + 1
CAT_AVG_TIER = {c: _cat_tier_sum[c] / _cat_tier_cnt[c] for c in _cat_tier_sum}


def tier_ratio_for(sku_code: str) -> float:
    info = sku_info[sku_code]
    avg = CAT_AVG_TIER.get(info["category"], 1.0) or 1.0
    return TIER_WEIGHT.get(info.get("tier", "STEADY"), 1.0) / avg

# ---------------------------------------------------------------------------
# 3. 분기별 매출목표 -> 판매속도(velocity) 산출 (v4와 동일)
# ---------------------------------------------------------------------------
quarter_velocity = []
daily_order_target = {}
quarter_summary = []

for q_start, q_end, target in QUARTERS:
    full_days = (q_end - q_start).days + 1
    aov_full = estimate_aov(q_start)
    full_total_orders = target / aov_full
    avg_daily_orders_full = full_total_orders / full_days
    n_active_skus = active_sku_count(q_start) or 1
    velocity = (avg_daily_orders_full * AVG_ITEMS_PER_ORDER) / n_active_skus
    quarter_velocity.append((q_start, q_end, velocity))

    actual_start = max(q_start, LAUNCH_DATE)
    actual_end = min(q_end, TODAY)
    if actual_end < actual_start:
        continue
    actual_days = (actual_end - actual_start).days + 1
    scaled_target = target * actual_days / full_days
    aov = estimate_aov(actual_start)
    total_orders = max(int(round(scaled_target / aov)), 1)

    days = [actual_start + timedelta(n) for n in range(actual_days)]
    weights = np.array([promo_multiplier(d) * dow_factor(d) for d in days])
    probs = weights / weights.sum()
    counts = np.random.multinomial(total_orders, probs)
    for d, c in zip(days, counts):
        daily_order_target[d] = daily_order_target.get(d, 0) + int(c)
    quarter_summary.append((q_start, actual_end, scaled_target, total_orders, round(aov), round(velocity, 2)))

print("\n=== 분기별 타겟 & 판매속도 요약 ===")
for q_start, actual_end, target, orders, aov, vel in quarter_summary:
    print(f"{q_start} ~ {actual_end}: 목표 {target/1e8:.1f}억 / 예상주문 {orders:,}건 / "
          f"AOV {aov:,}원 / SKU당 속도 {vel}건/일")


def velocity_for_date(d: date) -> float:
    idx = None
    for i, (qs, qe, v) in enumerate(quarter_velocity):
        if qs <= d <= qe:
            idx = i
            break
    if idx is None:
        return quarter_velocity[-1][2] if d > quarter_velocity[-1][1] else quarter_velocity[0][2]
    v_cur = quarter_velocity[idx][2]
    v_next = quarter_velocity[idx + 1][2] if idx + 1 < len(quarter_velocity) else v_cur
    return max(v_cur, v_next)


def reorder_point_for(d: date, tier_ratio: float = 1.0) -> int:
    return max(int(velocity_for_date(d) * tier_ratio * LEAD_TIME_DAYS * REORDER_BUFFER), 5)


def par_level_for(d: date, tier_ratio: float = 1.0) -> int:
    return max(int(velocity_for_date(d) * tier_ratio * LEAD_TIME_DAYS * PAR_BUFFER), 10)


def safety_stock_for(d: date, tier_ratio: float = 1.0) -> int:
    return int(reorder_point_for(d, tier_ratio) * SAFETY_STOCK_RATIO)


# ---------------------------------------------------------------------------
# 4. 초도 입고(전부 HUB) + 매장 사전비축(HUB->STORE 이관, v5 신규: 팝업도 포함)
# ---------------------------------------------------------------------------
po_rows, po_item_rows, ledger_rows = [], [], []

TREND_INITIAL_BUFFER = 1.0

for sku_code, intro in active_from.items():
    is_trend = sku_info[sku_code]["line_type"] == "TREND"
    buffer = TREND_INITIAL_BUFFER if is_trend else INITIAL_BUFFER
    tr = 1.0 if is_trend else tier_ratio_for(sku_code)
    initial_qty = int(velocity_for_date(intro) * tr * LEAD_TIME_DAYS * buffer)
    initial_qty = max(initial_qty, 30 if is_trend else 20)
    po_id = gen_id("PO-INIT")
    po_rows.append((po_id, "FAC-001", (intro - timedelta(days=LEAD_TIME_DAYS)).isoformat(),
                     intro.isoformat(), "입고완료"))
    po_item_rows.append((po_id, sku_code, initial_qty, sku_info[sku_code]["cost"]))
    ledger_rows.append((gen_id("LED"), sku_code, HUB, "입고", initial_qty, po_id,
                         datetime.combine(intro, datetime.min.time()).isoformat()))
    move_stock(sku_code, HUB, initial_qty)

# 매장 사전비축(HUB -> STORE 이관) — v5: 상설쇼룸(4주 전) + 팝업(2주 전) 둘 다 대상
for sid, s in STORES.items():
    prep_weeks = SHOWROOM_PREP_WEEKS if s["type"] == "상설쇼룸" else POPUP_PREP_WEEKS
    prep_date = s["open"] - timedelta(weeks=prep_weeks)
    for sku_code, intro in active_from.items():
        if intro > s["open"] or sku_info[sku_code]["line_type"] == "TREND":
            continue  # 캡슐은 온라인(HUB) 전용, 매장엔 안 내려감
        bump = max(int(velocity_for_date(s["open"]) * tier_ratio_for(sku_code) * OFFLINE_SHARE * 14), 5)
        transfer(sku_code, HUB, sid, bump, f"PREP-{sid}",
                 datetime.combine(prep_date, datetime.min.time()), ledger_rows)

cur.executemany("INSERT INTO purchase_order VALUES (?, ?, ?, ?, ?)", po_rows)
cur.executemany("INSERT INTO po_item (po_id, sku_code, qty, unit_cost) VALUES (?, ?, ?, ?)", po_item_rows)
cur.executemany("INSERT INTO inventory_ledger VALUES (?, ?, ?, ?, ?, ?, ?)", ledger_rows)
con.commit()
print(f"초도 입고(HUB) {len(active_from)}건 + 매장 사전비축(이관) 처리 완료")
po_rows, po_item_rows, ledger_rows = [], [], []

# ---------------------------------------------------------------------------
# 5. 메인 시뮬레이션 루프
# ---------------------------------------------------------------------------
pending_po_arrivals = {}
customer_pool = []
customer_rows, order_rows, order_item_rows, return_rows = [], [], [], []
restock_bump = {}   # sku_code -> qty (반품 재입고분, HUB 귀속)
order_counter = 0
FLUSH_EVERY = 50_000

d = LAUNCH_DATE
while d <= TODAY:
    if d in pending_po_arrivals:
        for sku_code, qty, po_id in pending_po_arrivals[d]:
            move_stock(sku_code, HUB, qty)
            sku_pool[sku_code]["pending_po"] = False
            ledger_rows.append((gen_id("LED"), sku_code, HUB, "입고", qty, po_id,
                                 datetime.combine(d, datetime.min.time()).isoformat()))
        del pending_po_arrivals[d]

    # 동시 활성 매장 목록 (v5: 여러 개 동시 가능, break 없음 — v4 매장선택 버그 해소)
    active_stores_today = [sid for sid, s in STORES.items()
                            if s["open"] <= d and (s["close"] is None or d <= s["close"])]

    # 팝업 폐점일: 잔여재고 HUB로 반납
    for sid in active_stores_today:
        s = STORES[sid]
        if s["type"] == "팝업" and s["close"] == d:
            for sku_code in list(sku_pool.keys()):
                remain = stock_at(sku_code, sid)
                if remain > 0:
                    transfer(sku_code, sid, HUB, remain, f"CLOSE-{sid}",
                             datetime.combine(d, datetime.min.time()), ledger_rows)

    # 상설쇼룸: 로컬재고 낮으면 HUB->STORE 보충 (v5 신규)
    for sid in active_stores_today:
        s = STORES[sid]
        if s["type"] != "상설쇼룸":
            continue
        for sku_code, intro in active_from.items():
            if intro > d or sku_info[sku_code]["line_type"] == "TREND":
                continue
            local = stock_at(sku_code, sid)
            _tr = tier_ratio_for(sku_code)
            low_bar = max(int(velocity_for_date(d) * _tr * OFFLINE_SHARE * STORE_REORDER_DAYS), 2)
            if local <= low_bar:
                topup = max(int(velocity_for_date(d) * _tr * OFFLINE_SHARE * STORE_TOPUP_DAYS), 3)
                available_at_hub = stock_at(sku_code, HUB)
                topup = min(topup, available_at_hub)  # HUB에 있는 만큼만(없으면 매장 품절 리스크 그대로 반영)
                if topup > 0:
                    transfer(sku_code, HUB, sid, topup, f"TOPUP-{sid}",
                             datetime.combine(d, datetime.min.time()), ledger_rows)

    n_orders = daily_order_target.get(d, 0)
    if n_orders > 0:
        temp_today = get_temp(d)

        def _weight(s):
            info = sku_info[s]
            w_cat = category_weather_factor(info["category"], temp_today)
            size_map = (SIZE_WEIGHTS_8 if info["category"] in ("TOP", "PNT") else
                        SIZE_WEIGHTS_FREE if info["category"] == "ACC" else SIZE_WEIGHTS_3)
            w_size = size_map.get(info["size"], 1.0)
            w_tier = TIER_WEIGHT.get(info.get("tier", "STEADY"), 1.0)
            return w_cat * w_size * w_tier

        # 온라인(HUB) 후보 — v4와 동일한 개념, HUB 재고 기준
        online_skus = [s for s, intro in active_from.items()
                       if intro <= d and (discontinue_at[s] is None or d <= discontinue_at[s])
                       and stock_at(s, HUB) > 0]
        online_weights = [_weight(s) for s in online_skus]

        # 매장별 후보(BASIC만, 로컬재고 기준) — v5 신규
        store_skus = {}
        store_weights = {}
        for sid in active_stores_today:
            cand = [s for s, intro in active_from.items()
                    if intro <= d and (discontinue_at[s] is None or d <= discontinue_at[s])
                    and sku_info[s]["line_type"] == "BASIC" and stock_at(s, sid) > 0]
            store_skus[sid] = cand
            store_weights[sid] = [_weight(s) for s in cand]

        for _ in range(n_orders):
            if not online_skus and not any(store_skus.values()):
                break
            order_counter += 1
            order_id = gen_id("ORD")

            if customer_pool and random.random() < 0.30:
                customer_id = random.choice(customer_pool)
            else:
                customer_id = gen_id("CUST")
                persona = "Primary(18-24)" if random.random() < 0.7 else "Secondary(25-28)"
                customer_rows.append((customer_id, persona, "ZIGZAG", d.isoformat()))
                customer_pool.append(customer_id)

            usable_stores = [sid for sid in active_stores_today if store_skus.get(sid)]
            if usable_stores and random.random() < 0.05:
                channel_id = "OFFLINE"
                store_id = random.choice(usable_stores)  # v5: 동시활성 매장 중 랜덤 (버그 수정)
                loc = store_id
                cand_skus, cand_weights = store_skus[store_id], store_weights[store_id]
            else:
                if not online_skus:
                    order_counter -= 1
                    continue
                channel_id, store_id, loc = "ZIGZAG", None, HUB
                cand_skus, cand_weights = online_skus, online_weights

            n_items = random.choices([1, 2, 3], weights=[0.6, 0.3, 0.1])[0]
            k = min(n_items, len(cand_skus))
            chosen = list({s: None for s in random.choices(cand_skus, weights=cand_weights, k=k * 2)})[:k]
            if len(chosen) < k:
                remain = [s for s in cand_skus if s not in chosen]
                chosen += random.sample(remain, k=min(k - len(chosen), len(remain)))
            order_dt = datetime.combine(d, datetime.min.time()) + timedelta(
                hours=random.randint(8, 23), minutes=random.randint(0, 59))

            total_amount, items_payload = 0, []
            for sku_code in chosen:
                if stock_at(sku_code, loc) <= 0:
                    continue
                move_stock(sku_code, loc, -1)
                info = sku_info[sku_code]
                total_amount += info["price"]
                items_payload.append((sku_code, info["price"], info["category"]))
                ledger_rows.append((gen_id("LED"), sku_code, loc, "판매출고", -1, order_id, order_dt.isoformat()))

                # 재발주 트리거는 HUB 재고만 대상 (매장 부족은 위 상설쇼룸 보충 로직이 처리)
                _tr = tier_ratio_for(sku_code)
                if (loc == HUB and info["line_type"] == "BASIC"
                        and stock_at(sku_code, HUB) <= reorder_point_for(d, _tr)
                        and not sku_pool[sku_code]["pending_po"]):
                    order_qty = par_level_for(d, _tr) - stock_at(sku_code, HUB)
                    po_id = gen_id("PO")
                    arrival = d + timedelta(days=LEAD_TIME_DAYS)
                    po_rows.append((po_id, "FAC-001", d.isoformat(), arrival.isoformat(), "발주"))
                    po_item_rows.append((po_id, sku_code, order_qty, info["cost"]))
                    pending_po_arrivals.setdefault(arrival, []).append((sku_code, order_qty, po_id))
                    sku_pool[sku_code]["pending_po"] = True

                rate = CATEGORIES[info["category"]]["return_rate"]
                if random.random() < rate:
                    req_date = d + timedelta(days=random.randint(0, 25) if channel_id == "OFFLINE" else random.randint(5, 25))
                    if req_date <= TODAY:
                        if channel_id == "OFFLINE":
                            reason_code = "R05" if random.random() < 0.7 else random.choices(
                                ["R01", "R02", "R03"], weights=[0.5, 0.2, 0.3])[0]
                            elapsed = (TODAY - req_date).days
                            status = "완료" if elapsed >= 0 else "접수"
                            resolution = random.choices(["교환", "환불"], weights=[0.8, 0.2])[0] if status == "완료" else None
                        else:
                            reason_code = random.choices(["R01", "R02", "R03", "R04"], weights=[0.5, 0.15, 0.25, 0.10])[0]
                            elapsed = (TODAY - req_date).days
                            status = "완료" if elapsed >= 3 else ("검수중" if elapsed >= 1 else "접수")
                            resolution = random.choices(["교환", "환불"], weights=[0.6, 0.4])[0] if status == "완료" else None

                        return_rows.append((gen_id("RET"), order_id, sku_code, reason_code, status,
                                             req_date.isoformat(), resolution))
                        # 반품 재입고는 전부 HUB로 귀속(단순화, v5 가정)
                        if status == "완료" and reason_code != "R04":
                            resolve_dt = datetime.combine(req_date, datetime.min.time()) + timedelta(
                                hours=2 if channel_id == "OFFLINE" else 72)
                            ledger_rows.append((gen_id("LED"), sku_code, HUB, "반품입고", 1, order_id, resolve_dt.isoformat()))
                            restock_bump[sku_code] = restock_bump.get(sku_code, 0) + 1
                        elif reason_code == "R04":
                            ledger_rows.append((gen_id("LED"), sku_code, HUB, "불량처리", 0, order_id,
                                                 datetime.combine(req_date, datetime.min.time()).isoformat()))

            if not items_payload:
                order_counter -= 1
                continue

            elapsed = (TODAY - d).days
            status = "구매확정" if elapsed > 35 else ("배송완료" if elapsed > 3 else "배송중")
            order_rows.append((order_id, customer_id, channel_id, store_id, order_dt.isoformat(), status, total_amount))
            for sku_code, price, _cat in items_payload:
                order_item_rows.append((order_id, sku_code, 1, price))

    if len(order_rows) >= FLUSH_EVERY:
        cur.executemany("INSERT INTO customer VALUES (?, ?, ?, ?)", customer_rows)
        cur.executemany("INSERT INTO purchase_order VALUES (?, ?, ?, ?, ?)", po_rows)
        cur.executemany("INSERT INTO po_item (po_id, sku_code, qty, unit_cost) VALUES (?, ?, ?, ?)", po_item_rows)
        cur.executemany("INSERT INTO orders VALUES (?, ?, ?, ?, ?, ?, ?)", order_rows)
        cur.executemany("INSERT INTO order_item (order_id, sku_code, qty, unit_price) VALUES (?, ?, ?, ?)", order_item_rows)
        cur.executemany("INSERT INTO inventory_ledger VALUES (?, ?, ?, ?, ?, ?, ?)", ledger_rows)
        cur.executemany("INSERT INTO return_request VALUES (?, ?, ?, ?, ?, ?, ?)", return_rows)
        con.commit()
        print(f"  ...진행 중: {d} 시점까지 주문 {order_counter:,}건 누적 (플러시 완료)")
        customer_rows, po_rows, po_item_rows = [], [], []
        order_rows, order_item_rows, ledger_rows, return_rows = [], [], [], []

    d += timedelta(days=1)

cur.executemany("INSERT INTO customer VALUES (?, ?, ?, ?)", customer_rows)
cur.executemany("INSERT INTO purchase_order VALUES (?, ?, ?, ?, ?)", po_rows)
cur.executemany("INSERT INTO po_item (po_id, sku_code, qty, unit_cost) VALUES (?, ?, ?, ?)", po_item_rows)
cur.executemany("INSERT INTO orders VALUES (?, ?, ?, ?, ?, ?, ?)", order_rows)
cur.executemany("INSERT INTO order_item (order_id, sku_code, qty, unit_price) VALUES (?, ?, ?, ?)", order_item_rows)
cur.executemany("INSERT INTO inventory_ledger VALUES (?, ?, ?, ?, ?, ?, ?)", ledger_rows)
cur.executemany("INSERT INTO return_request VALUES (?, ?, ?, ?, ?, ?, ?)", return_rows)
con.commit()
print(f"\n주문 생성 완료: 총 {order_counter:,}건 (고객 {len(customer_pool):,}명)")

# ---------------------------------------------------------------------------
# 6. Inventory 최종 스냅샷 — (sku_code, location_id)별로 한 행씩
# ---------------------------------------------------------------------------
for sku_code, bump in restock_bump.items():
    move_stock(sku_code, HUB, bump)

pending_return_by_sku = {}
cur.execute("SELECT sku_code, COUNT(*) FROM return_request WHERE status != '완료' GROUP BY sku_code")
for sku_code, cnt in cur.fetchall():
    pending_return_by_sku[sku_code] = cnt

inv_rows = []
for sku_code, state in sku_pool.items():
    _tr = tier_ratio_for(sku_code)
    ss = safety_stock_for(TODAY, _tr)
    rp = reorder_point_for(TODAY, _tr)
    for loc, qty in state["locations"].items():
        # pending_return_qty는 HUB 행에만 반영(단순화, v5 가정)
        pending_ret = pending_return_by_sku.get(sku_code, 0) if loc == HUB else 0
        inv_rows.append((
            sku_code, loc, max(qty, 0), 0, 0, pending_ret, ss, rp,
            datetime.combine(TODAY, datetime.min.time()).isoformat(),
        ))
cur.executemany("INSERT INTO inventory VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", inv_rows)
con.commit()

# ---------------------------------------------------------------------------
# 7. 요약 + 검증
# ---------------------------------------------------------------------------
print("\n=== 최종 테이블 로우 수 ===")
for t in ["category", "product", "sku", "factory", "channel", "store", "customer",
          "orders", "order_item", "purchase_order", "po_item", "inventory",
          "inventory_ledger", "return_request"]:
    cur.execute(f"SELECT COUNT(*) FROM {t}")
    print(f"{t:16s}: {cur.fetchone()[0]:>10,d}")

print("\n=== 매장별 판매 실적 (v5 검증용 — STORE-03/04도 0이 아니어야 정상) ===")
cur.execute("""SELECT store_id, COUNT(*), MIN(order_date), MAX(order_date)
               FROM orders WHERE store_id IS NOT NULL GROUP BY store_id""")
for row in cur.fetchall():
    print(row)

print("\n=== location별 재고 합계 ===")
cur.execute("SELECT location_id, SUM(available_qty), COUNT(*) FROM inventory GROUP BY location_id")
for row in cur.fetchall():
    print(row)

print("\n=== 분기별 실제 매출 vs 목표 ===")
for q_start, q_end, target in QUARTERS:
    actual_end = min(q_end, TODAY)
    if actual_end < q_start:
        continue
    cur.execute("SELECT COALESCE(SUM(total_amount),0), COUNT(*) FROM orders WHERE order_date >= ? AND order_date <= ?",
                (q_start.isoformat(), (actual_end + timedelta(days=1)).isoformat()))
    actual_rev, actual_orders = cur.fetchone()
    full_days = (q_end - q_start).days + 1
    actual_days = (actual_end - q_start).days + 1
    scaled_target = target * actual_days / full_days
    print(f"{q_start}~{actual_end}: 목표 {scaled_target/1e8:.1f}억 / 실제 {actual_rev/1e8:.1f}억 "
          f"({actual_rev/scaled_target*100:.0f}%), 주문 {actual_orders:,}건")

con.close()
print("\n[완료] nqnq.db 생성 완료 (v5 — HUB/매장 재고 분리)")
