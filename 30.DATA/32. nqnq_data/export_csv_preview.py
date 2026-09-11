"""
nqnq.db(2026.09 체형태그·사이즈 개편 재생성판)에서 csv_preview/*.csv를 다시 뽑는 스크립트.
기존 csv_preview는 개편 전(65 스타일/530 SKU) 카탈로그 기준이라 새 DB(41/520)와 어긋나 있었음.
샘플(주문/반품 등)은 500건 랜덤 추출, 나머지(카탈로그/재고/집계)는 전체.
"""
import csv
import os
import sqlite3
import random

random.seed(20260910)
os.makedirs("csv_preview", exist_ok=True)

con = sqlite3.connect("nqnq.db")
con.row_factory = sqlite3.Row
cur = con.cursor()


def write_csv(path, header, rows):
    with open(path, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow(header)
        w.writerows(rows)
    print(f"{path}: {len(rows)}건")


# 1. products.csv (전체)
cur.execute("SELECT product_id, category_code, style_name, body_tone_code, season, status, line_type, popularity_tier, launch_date FROM product")
rows = cur.fetchall()
write_csv("csv_preview/products.csv",
          ["product_id", "category_code", "style_name", "body_tone_code", "season", "status", "line_type", "popularity_tier", "launch_date"],
          [tuple(r) for r in rows])

# 2. sku_master.csv (전체)
cur.execute("SELECT sku_code, product_id, size, color_code, price, cost FROM sku")
rows = cur.fetchall()
write_csv("csv_preview/sku_master.csv",
          ["sku_code", "product_id", "size", "color_code", "price", "cost"],
          [tuple(r) for r in rows])

# 3. inventory_snapshot.csv (전체, v5: location_id별로 행이 여러 개 — sku당 HUB+매장별)
cur.execute("SELECT sku_code, location_id, available_qty, reserved_qty, defective_qty, pending_return_qty, safety_stock, reorder_point, last_updated FROM inventory")
rows = cur.fetchall()
write_csv("csv_preview/inventory_snapshot.csv",
          ["sku_code", "location_id", "available_qty", "reserved_qty", "defective_qty", "pending_return_qty", "safety_stock", "reorder_point", "last_updated"],
          [tuple(r) for r in rows])

# 4. orders_sample.csv (500건 랜덤)
cur.execute("SELECT order_id, customer_id, channel_id, store_id, order_date, status, total_amount FROM orders ORDER BY RANDOM() LIMIT 500")
rows = cur.fetchall()
write_csv("csv_preview/orders_sample.csv",
          ["order_id", "customer_id", "channel_id", "store_id", "order_date", "status", "total_amount"],
          [tuple(r) for r in rows])

# 5. order_items_sample.csv (500건 랜덤, 실제 id 컬럼 그대로)
cur.execute("SELECT id, order_id, sku_code, qty, unit_price FROM order_item ORDER BY RANDOM() LIMIT 500")
rows = cur.fetchall()
write_csv("csv_preview/order_items_sample.csv",
          ["id", "order_id", "sku_code", "qty", "unit_price"],
          [tuple(r) for r in rows])

# 6. returns_sample.csv (500건 랜덤)
cur.execute("SELECT return_id, order_id, sku_code, reason_code, status, request_date, resolution FROM return_request ORDER BY RANDOM() LIMIT 500")
rows = cur.fetchall()
write_csv("csv_preview/returns_sample.csv",
          ["return_id", "order_id", "sku_code", "reason_code", "status", "request_date", "resolution"],
          [tuple(r) for r in rows])

# 7. popularity_tier_performance.csv (카테고리+인기도티어+스타일 단위 연간 실측 판매량 집계, 전체 order_item 기준)
cur.execute("""
    SELECT p.category_code, p.popularity_tier, p.style_name,
           COUNT(DISTINCT s.sku_code) AS sku_count,
           COALESCE(SUM(oi.qty), 0) AS sold_units
    FROM product p
    JOIN sku s ON s.product_id = p.product_id
    LEFT JOIN order_item oi ON oi.sku_code = s.sku_code
    WHERE p.line_type = 'BASIC'
    GROUP BY p.category_code, p.popularity_tier, p.style_name
    ORDER BY p.category_code, p.style_name
""")
rows = cur.fetchall()
out_rows = [(r["category_code"], r["popularity_tier"], r["style_name"], r["sku_count"], r["sold_units"],
             round(r["sold_units"] / r["sku_count"], 1) if r["sku_count"] else 0) for r in rows]
write_csv("csv_preview/popularity_tier_performance.csv",
          ["category_code", "popularity_tier", "style_name", "sku_count", "sold_units", "avg_per_sku"],
          out_rows)

# 8. monthly_revenue_summary.csv (월별 매출 집계, 전체 orders 기준)
cur.execute("""
    SELECT substr(order_date, 1, 7) AS month, COUNT(*) AS order_count, COALESCE(SUM(total_amount), 0) AS revenue
    FROM orders
    GROUP BY month
    ORDER BY month
""")
rows = cur.fetchall()
out_rows = [(r["month"], r["order_count"], r["revenue"], round(r["revenue"] / 1e8, 2)) for r in rows]
write_csv("csv_preview/monthly_revenue_summary.csv",
          ["month", "order_count", "revenue", "revenue_억"],
          out_rows)

# 9. trend_capsule_performance.csv (트렌드캡슐 스타일별 판매 실적, 전체 order_item 기준)
cur.execute("""
    SELECT p.style_name, p.status, p.launch_date,
           COALESCE(SUM(oi.qty), 0) AS sold_units,
           COALESCE(SUM(oi.qty * oi.unit_price), 0) AS revenue
    FROM product p
    JOIN sku s ON s.product_id = p.product_id
    LEFT JOIN order_item oi ON oi.sku_code = s.sku_code
    WHERE p.line_type = 'TREND'
    GROUP BY p.product_id, p.style_name, p.status, p.launch_date
    ORDER BY p.launch_date
""")
rows = cur.fetchall()
write_csv("csv_preview/trend_capsule_performance.csv",
          ["style_name", "status", "launch_date", "sold_units", "revenue"],
          [tuple(r) for r in rows])

con.close()
print("csv_preview 재생성 완료 (nqnq.db 2026.09 개편판 기준)")
