import Badge from "../../ui/Badge";
import { REORDER_RECOMMENDATIONS, STATUS_LABEL } from "../../../data/mockData";
import { relativeTime } from "../../../utils/format";

const STATUS_VARIANT = { Pending: "amber", Approved: "green", Rejected: "red" };

const RECENT = [...REORDER_RECOMMENDATIONS]
  .filter((r) => r.resolved_at)
  .sort((a, b) => new Date(b.resolved_at) - new Date(a.resolved_at))
  .slice(0, 6);

export default function RecentActivityWidget() {
  return (
    <ul className="divide-y divide-[var(--color-border)]">
      {RECENT.map((r) => (
        <li key={r.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-[var(--color-text)]">{r.style_name}</div>
            <div className="mt-0.5 font-[var(--font-mono)] text-xs text-[var(--color-text-faint)]">{r.sku_code}</div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge variant={STATUS_VARIANT[r.status]}>{STATUS_LABEL[r.status]}</Badge>
            <span className="w-14 text-right text-xs text-[var(--color-text-muted)]">
              {relativeTime(r.resolved_at)}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
