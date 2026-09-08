import { ArrowUpDown, Inbox } from "lucide-react";
import Badge from "../ui/Badge";
import RiskBar from "../ui/RiskBar";
import { STATUS_LABEL } from "../../data/mockData";
import { relativeTime, absoluteTime, formatNumber } from "../../utils/format";

const STATUS_VARIANT = { Pending: "amber", Approved: "green", Rejected: "red" };
const TIER_VARIANT = { HERO: "accent", STEADY: "neutral", NICHE: "neutral" };

const SORT_OPTIONS = [
  { id: "risk_score", label: "위험도" },
  { id: "created_at", label: "생성일시" },
  { id: "recommended_qty", label: "추천수량" },
];

const PAGE_SIZE = 20;

export default function ApprovalsTable({ rows, sort, onSortChange, page, onPageChange, onRowClick }) {
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (id) => {
    if (sort.key === id) {
      onSortChange({ key: id, dir: sort.dir === "desc" ? "asc" : "desc" });
    } else {
      onSortChange({ key: id, dir: "desc" });
    }
  };

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] py-20 text-center">
        <Inbox className="h-8 w-8 text-[var(--color-text-faint)]" />
        <p className="text-sm text-[var(--color-text-muted)]">
          조건에 맞는 발주추천이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="flex items-center justify-end gap-2 border-b border-[var(--color-border)] px-4 py-2 text-xs text-[var(--color-text-muted)]">
        정렬:
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => toggleSort(opt.id)}
            className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 ${
              sort.key === opt.id ? "font-semibold text-[var(--color-text)]" : "hover:text-[var(--color-text)]"
            }`}
          >
            {opt.label}
            {sort.key === opt.id && <ArrowUpDown className="h-3 w-3" />}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-text-muted)]">
              <th className="px-4 py-2.5 font-medium">SKU</th>
              <th className="px-4 py-2.5 font-medium">스타일명</th>
              <th className="px-4 py-2.5 font-medium">카테고리 / 컬러 / 사이즈</th>
              <th className="px-4 py-2.5 font-medium">인기도</th>
              <th className="px-4 py-2.5 font-medium">위험도</th>
              <th className="px-4 py-2.5 font-medium text-right">예측수요</th>
              <th className="px-4 py-2.5 font-medium text-right">추천수량</th>
              <th className="px-4 py-2.5 font-medium">상태</th>
              <th className="px-4 py-2.5 font-medium">생성일시</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r) => (
              <tr
                key={r.id}
                onClick={() => onRowClick(r)}
                className="cursor-pointer border-b border-[var(--color-border)] last:border-0 hover:bg-[#FAFBFC]"
              >
                <td className="whitespace-nowrap px-4 py-2.5 font-[var(--font-mono)] text-[13px] text-[var(--color-text)]">
                  {r.sku_code}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-[var(--color-text)]">{r.style_name}</td>
                <td className="px-4 py-2.5">
                  <div className="flex flex-wrap gap-1">
                    <Badge>{r.category_code}</Badge>
                    <Badge>{r.color_code}</Badge>
                    <Badge>{r.size}</Badge>
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <Badge variant={TIER_VARIANT[r.popularity_tier]}>{r.popularity_tier}</Badge>
                </td>
                <td className="px-4 py-2.5">
                  <RiskBar score={r.risk_score} />
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-right tabular-nums text-[var(--color-text)]">
                  {formatNumber(r.predicted_demand)}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-right tabular-nums font-medium text-[var(--color-text)]">
                  {formatNumber(r.recommended_qty)}
                </td>
                <td className="px-4 py-2.5">
                  <Badge variant={STATUS_VARIANT[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                </td>
                <td
                  className="whitespace-nowrap px-4 py-2.5 text-[var(--color-text-muted)]"
                  title={absoluteTime(r.created_at)}
                >
                  {relativeTime(r.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-[var(--color-border)] px-4 py-2.5 text-xs text-[var(--color-text-muted)]">
        <span>
          총 {formatNumber(rows.length)}건 중 {(page - 1) * PAGE_SIZE + 1}–
          {Math.min(page * PAGE_SIZE, rows.length)}건
        </span>
        <div className="flex items-center gap-1">
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="rounded px-2 py-1 disabled:opacity-30 hover:bg-[#F2F4F7]"
          >
            이전
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="rounded px-2 py-1 disabled:opacity-30 hover:bg-[#F2F4F7]"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
