import { COLLAB_TAGS } from "../../data/collabTags";

// 27. 이해관계자 협업 대시보드 UX-UI 기능명세서 3-2절 — 정적 해시태그 다중선택 칩.
export default function HashtagPicker({ selected, onToggle }) {
  return (
    <div className="mb-3 flex flex-wrap gap-1.5">
      {COLLAB_TAGS.map((tag) => {
        const isSelected = selected.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            onClick={() => onToggle(tag)}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
              isSelected
                ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[#F9F9F9]"
            }`}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
