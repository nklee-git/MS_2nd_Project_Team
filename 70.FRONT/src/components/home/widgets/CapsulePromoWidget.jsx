import Badge from "../../ui/Badge";
import { TREND_CAPSULES } from "../../../data/mockData";
import { formatNumber } from "../../../utils/format";

const STATUS_VARIANT = { 판매중: "green", 단종: "neutral" };

export default function CapsulePromoWidget() {
  return (
    <div>
      <ul className="divide-y divide-[var(--color-border)]">
        {TREND_CAPSULES.map((c) => (
          <li key={c.style_name} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-[var(--color-text)]">{c.style_name}</div>
              <div className="mt-0.5 text-xs text-[var(--color-text-faint)]">{c.launch_date} 출시</div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge variant={STATUS_VARIANT[c.status]}>{c.status}</Badge>
              <span className="w-20 text-right text-xs tabular-nums text-[var(--color-text-muted)]">
                {formatNumber(c.sold_units)}개
              </span>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] text-[var(--color-text-faint)]">
        정식 프로모션/할인 엔터티는 아직 없어(백로그) — 시즌 한정 트렌드캡슐 출시 실적으로 대체.
      </p>
    </div>
  );
}
