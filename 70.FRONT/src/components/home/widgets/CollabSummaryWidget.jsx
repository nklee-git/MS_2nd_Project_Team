import { AtSign, ListTodo, ArrowRight } from "lucide-react";

// 27. 이해관계자 협업 대시보드 UX-UI 기능명세서 4-1절 "오늘의 협업 요약" —
// MENTION/TASK 엔티티가 아직 없어(3-3절 🔴) 카운트는 데모용 정적 숫자.
// 실제 값은 협업 허브 백엔드 연동 후 교체.
export default function CollabSummaryWidget({ onNavigateTab }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] p-3">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
            <AtSign className="h-4 w-4" />
          </div>
          <div>
            <div className="text-lg font-semibold tabular-nums text-[var(--color-text)]">2</div>
            <div className="text-[11px] leading-tight text-[var(--color-text-muted)]">안 읽은 멘션</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] p-3">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
            <ListTodo className="h-4 w-4" />
          </div>
          <div>
            <div className="text-lg font-semibold tabular-nums text-[var(--color-text)]">1</div>
            <div className="text-[11px] leading-tight text-[var(--color-text-muted)]">대기 중인 태스크</div>
          </div>
        </div>
      </div>
      <button
        onClick={() => onNavigateTab?.("collab")}
        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-accent)] hover:underline"
      >
        협업 허브에서 전체 보기
        <ArrowRight className="h-3 w-3" />
      </button>
      <p className="mt-2 text-[11px] text-[var(--color-text-faint)]">
        데모용 예시 숫자 — MENTION/TASK 엔티티 연동 전까지는 실제 값이 아님.
      </p>
    </div>
  );
}
