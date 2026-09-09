import Badge from "../../ui/Badge";
import { BEST_SELLERS } from "../../../data/mockData";
import { formatNumber } from "../../../utils/format";

const TIER_VARIANT = { HERO: "accent", STEADY: "neutral", NICHE: "neutral" };

export default function BestSellerWidget() {
  return (
    <ul className="divide-y divide-[var(--color-border)]">
      {BEST_SELLERS.map((s) => (
        <li key={s.style_name} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-[var(--color-text)]">{s.style_name}</div>
            <div className="mt-0.5 flex items-center gap-1.5">
              <Badge>{s.category_code}</Badge>
              <Badge variant={TIER_VARIANT[s.popularity_tier]}>{s.popularity_tier}</Badge>
            </div>
          </div>
          <div className="shrink-0 text-right text-sm tabular-nums text-[var(--color-text)]">
            {formatNumber(s.sold_units)}
            <span className="ml-0.5 text-xs text-[var(--color-text-faint)]">개/년</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
