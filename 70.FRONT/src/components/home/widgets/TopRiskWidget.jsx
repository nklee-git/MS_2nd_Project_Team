import Badge from "../../ui/Badge";
import RiskBar from "../../ui/RiskBar";
import { REORDER_RECOMMENDATIONS } from "../../../data/mockData";

const TOP = [...REORDER_RECOMMENDATIONS].sort((a, b) => b.risk_score - a.risk_score).slice(0, 5);

export default function TopRiskWidget() {
  return (
    <ul className="divide-y divide-[var(--color-border)]">
      {TOP.map((r) => (
        <li key={r.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-[var(--color-text)]">{r.style_name}</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-[var(--color-text-faint)]">
              <span className="font-[var(--font-mono)]">{r.sku_code}</span>
              <Badge>{r.category_code}</Badge>
            </div>
          </div>
          <RiskBar score={r.risk_score} />
        </li>
      ))}
    </ul>
  );
}
