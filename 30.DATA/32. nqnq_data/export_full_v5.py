# -*- coding: utf-8 -*-
"""
nqnq.db (v5, HUB/매장 재고 분리 + WHOLESALE 반영판)에서 14개 엔터티 전체를
샘플링 없이 CSV로 뽑는 스크립트. export_full_for_dataverse.py는 v5 이전
스키마(inventory/inventory_ledger에 location_id 없음) 기준이라 그대로 쓰면
컬럼이 어긋나서, models.py 실스키마에 맞춰 새로 작성.

출력 위치: full_export/
"""
import csv
import os
import sqlite3

con = sqlite3.connect("nqnq.db")
cur = con.cursor()

OUT_DIR = "full_export"
os.makedirs(OUT_DIR, exist_ok=True)

BATCH = 50000


def export_table(table, columns, path):
    cur.execute(f"SELECT {', '.join(columns)} FROM {table}")
    path = os.path.join(OUT_DIR, path)
    n = 0
    with open(path, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow(columns)
        while True:
            rows = cur.fetchmany(BATCH)
            if not rows:
                break
            w.writerows(rows)
            n += len(rows)
    size_mb = os.path.getsize(path) / 1024 / 1024
    print(f"{path}: {n:,}건 ({size_mb:.1f}MB)")


export_table("category", ["category_code", "name"], "category.csv")
export_table("product", ["product_id", "category_code", "style_name", "body_tone_code",
                          "season", "status", "line_type", "popularity_tier", "launch_date"], "product.csv")
export_table("sku", ["sku_code", "product_id", "size", "color_code", "price", "cost"], "sku.csv")
export_table("factory", ["factory_id", "name", "moq", "lead_time_days", "payment_terms"], "factory.csv")
export_table("channel", ["channel_id", "name", "commission_rate", "settlement_cycle"], "channel.csv")
export_table("store", ["store_id", "type", "location", "open_date", "close_date"], "store.csv")
export_table("inventory", ["sku_code", "location_id", "available_qty", "reserved_qty", "defective_qty",
                            "pending_return_qty", "safety_stock", "reorder_point", "last_updated"], "inventory.csv")
export_table("purchase_order", ["po_id", "factory_id", "order_date", "expected_arrival_date", "status"], "purchase_order.csv")
export_table("po_item", ["po_id", "sku_code", "qty", "unit_cost"], "po_item.csv")

export_table("orders", ["order_id", "customer_id", "channel_id", "store_id", "order_date", "status", "total_amount"], "orders.csv")
export_table("order_item", ["order_id", "sku_code", "qty", "unit_price"], "order_item.csv")
export_table("customer", ["customer_id", "persona_segment", "signup_channel", "signup_date"], "customer.csv")
export_table("return_request", ["return_id", "order_id", "sku_code", "reason_code", "status", "request_date", "resolution"], "return_request.csv")
export_table("inventory_ledger", ["ledger_id", "sku_code", "location_id", "movement_type", "qty_change", "reference_id", "movement_date"], "inventory_ledger.csv")

con.close()
print(f"\n[완료] {OUT_DIR}/ 에 14개 엔터티 전체(샘플 없음) CSV 생성 완료 (nqnq.db v5, location_id 반영)")
