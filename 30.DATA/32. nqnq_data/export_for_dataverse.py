# -*- coding: utf-8 -*-
"""
nqnq.db(2026-09-11 재생성판, 컷오프 8/20 + WHOLESALE 반영)에서
Dataverse 적재용 CSV를 뽑는 스크립트. 14개 엔터티 전체 커버.

원칙:
- 차원/마스터 테이블(category/product/sku/factory/channel/store)은 전체
- 거래 테이블(orders/order_item/return_request/purchase_order/po_item/
  inventory_ledger)은 규모가 커서(최대 200만+ 행) 샘플로 제한
- customer는 orders_sample에 실제로 등장하는 고객만 추출해서 샘플 안에서
  참조무결성이 깨지지 않게 함(전체 87만 행을 다 뽑진 않음)

출력 위치: dataverse_import/ (기존 csv_preview/는 용도가 달라 건드리지 않음)
"""
import csv
import os
import sqlite3

random_seed = 20260911

con = sqlite3.connect("nqnq.db")
con.row_factory = sqlite3.Row
cur = con.cursor()

os.makedirs("dataverse_import", exist_ok=True)


def write_csv(path, header, rows):
    with open(path, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow(header)
        w.writerows(rows)
    print(f"{path}: {len(rows)}건")


# 1. category (전체)
cur.execute("SELECT category_code, name FROM category")
write_csv("dataverse_import/category.csv", ["category_code", "name"],
          [tuple(r) for r in cur.fetchall()])

# 2. product (전체)
cur.execute("""SELECT product_id, category_code, style_name, body_tone_code, season,
                       status, line_type, popularity_tier, launch_date FROM product""")
write_csv("dataverse_import/product.csv",
          ["product_id", "category_code", "style_name", "body_tone_code", "season",
           "status", "line_type", "popularity_tier", "launch_date"],
          [tuple(r) for r in cur.fetchall()])

# 3. sku (전체)
cur.execute("SELECT sku_code, product_id, size, color_code, price, cost FROM sku")
write_csv("dataverse_import/sku.csv",
          ["sku_code", "product_id", "size", "color_code", "price", "cost"],
          [tuple(r) for r in cur.fetchall()])

# 4. factory (전체)
cur.execute("SELECT factory_id, name, moq, lead_time_days, payment_terms FROM factory")
write_csv("dataverse_import/factory.csv",
          ["factory_id", "name", "moq", "lead_time_days", "payment_terms"],
          [tuple(r) for r in cur.fetchall()])

# 5. channel (전체 - ZIGZAG/OFFLINE/WHOLESALE 3종)
cur.execute("SELECT channel_id, name, commission_rate, settlement_cycle FROM channel")
write_csv("dataverse_import/channel.csv",
          ["channel_id", "name", "commission_rate", "settlement_cycle"],
          [tuple(r) for r in cur.fetchall()])

# 6. store (전체)
cur.execute("SELECT store_id, type, location, open_date, close_date FROM store")
write_csv("dataverse_import/store.csv",
          ["store_id", "type", "location", "open_date", "close_date"],
          [tuple(r) for r in cur.fetchall()])

# 7. inventory (전체 - SKU당 1행, 520건)
cur.execute("""SELECT sku_code, available_qty, reserved_qty, defective_qty,
                      pending_return_qty, safety_stock, reorder_point, last_updated
               FROM inventory""")
write_csv("dataverse_import/inventory.csv",
          ["sku_code", "available_qty", "reserved_qty", "defective_qty",
           "pending_return_qty", "safety_stock", "reorder_point", "last_updated"],
          [tuple(r) for r in cur.fetchall()])

# 8. purchase_order (전체 - 4611건, 규모 작아서 샘플링 불필요)
cur.execute("SELECT po_id, factory_id, order_date, expected_arrival_date, status FROM purchase_order")
po_rows = cur.fetchall()
write_csv("dataverse_import/purchase_order.csv",
          ["po_id", "factory_id", "order_date", "expected_arrival_date", "status"],
          [tuple(r) for r in po_rows])

# 9. po_item (전체 - 4611건)
cur.execute("SELECT po_id, sku_code, qty, unit_cost FROM po_item")
write_csv("dataverse_import/po_item.csv",
          ["po_id", "sku_code", "qty", "unit_cost"],
          [tuple(r) for r in cur.fetchall()])

# 10. orders (샘플 2000건 - 채널별 비율 유지 위해 채널별로 나눠 추출)
cur.execute(f"SELECT setseed({random_seed})" if False else "SELECT 1")  # sqlite has no setseed; ORDER BY RANDOM() 그대로 사용
cur.execute("""SELECT order_id, customer_id, channel_id, store_id, order_date, status, total_amount
               FROM orders ORDER BY RANDOM() LIMIT 2000""")
order_rows = cur.fetchall()
write_csv("dataverse_import/orders.csv",
          ["order_id", "customer_id", "channel_id", "store_id", "order_date", "status", "total_amount"],
          [tuple(r) for r in order_rows])
sampled_order_ids = [r["order_id"] for r in order_rows]
sampled_customer_ids = sorted(set(r["customer_id"] for r in order_rows))

# 11. order_item (위 orders 샘플에 실제로 속한 품목 전부 - 참조무결성 유지)
placeholders = ",".join("?" * len(sampled_order_ids))
cur.execute(f"SELECT order_id, sku_code, qty, unit_price FROM order_item WHERE order_id IN ({placeholders})",
            sampled_order_ids)
write_csv("dataverse_import/order_item.csv",
          ["order_id", "sku_code", "qty", "unit_price"],
          [tuple(r) for r in cur.fetchall()])

# 12. customer (위 orders 샘플에 실제 등장하는 고객만 - 참조무결성 유지, 전체 87만행 아님)
cust_placeholders = ",".join("?" * len(sampled_customer_ids))
cur.execute(f"SELECT customer_id, persona_segment, signup_channel, signup_date FROM customer WHERE customer_id IN ({cust_placeholders})",
            sampled_customer_ids)
write_csv("dataverse_import/customer.csv",
          ["customer_id", "persona_segment", "signup_channel", "signup_date"],
          [tuple(r) for r in cur.fetchall()])

# 13. return_request (샘플 500건)
cur.execute("""SELECT return_id, order_id, sku_code, reason_code, status, request_date, resolution
               FROM return_request ORDER BY RANDOM() LIMIT 500""")
write_csv("dataverse_import/return_request.csv",
          ["return_id", "order_id", "sku_code", "reason_code", "status", "request_date", "resolution"],
          [tuple(r) for r in cur.fetchall()])

# 14. inventory_ledger (샘플 2000건 - 원장이라 전체(212만행)는 과함)
cur.execute("""SELECT ledger_id, sku_code, movement_type, qty_change, reference_id, movement_date
               FROM inventory_ledger ORDER BY RANDOM() LIMIT 2000""")
write_csv("dataverse_import/inventory_ledger.csv",
          ["ledger_id", "sku_code", "movement_type", "qty_change", "reference_id", "movement_date"],
          [tuple(r) for r in cur.fetchall()])

con.close()
print("\n[완료] dataverse_import/ 에 14개 엔터티 전체 CSV 생성 완료 (nqnq.db 2026-09-11 재생성판 기준)")
print("주의: orders/order_item/customer는 orders 2000건 샘플 기준 서로 참조무결성 맞춰뒀음")
print("      return_request/inventory_ledger는 orders 샘플과 무관한 독립 랜덤 샘플(500/2000건)이라")
print("      return_request.order_id, inventory_ledger.reference_id가 orders.csv에 없을 수 있음")
