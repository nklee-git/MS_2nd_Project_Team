import { AlertTriangle, TriangleAlert, CheckCircle2 } from "lucide-react";
import { ENRICHED_SKUS } from "../../../data/mockData";

const outOfStockSoon = ENRICHED_SKUS.filter((s) => s.available_qty <= s.safety_stock);
const reorderNeeded = ENRICHED_SKUS.filter(
  (s) => s.available_qty > s.safety_stock && s.available_qty <= s.reorder_point
);
const healthy = ENRICHED_SKUS.length - outOfStockSoon.length - reorderNeeded.length;

const ROWS = [
  { label: "품절 임박 (재고 ≤ 안전재고)", count: outOfStockSoon.length, tone: "red", Icon: AlertTriangle },
  { label: "재주문 필요 (재고 ≤ 재주문점)", count: reorderNeeded.length, tone: "amber", Icon: TriangleAlert },
  { label: "정상", count: healthy, tone: "green", Icon: CheckCircle2 },
];

const TONE_CLASS = {
  red: "text-[var(--color-red)] bg-[var(--color-red-soft)]",
  amber: "text-[var(--color-amber)] bg-[var(--color-amber-soft)]",
  green: "text-[var(--color-green)] bg-[var(--color-green-soft)]",
};

export default function StockAlertWidget() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {ROWS.map((row) => (
        <div key={row.label} className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] p-3">
          <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${TONE_CLASS[row.tone]}`}>
            <row.Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-semibold tabular-nums text-[var(--color-text)]">{row.count}</div>
            <div className="text-[11px] leading-tight text-[var(--color-text-muted)]">{row.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
