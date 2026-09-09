import { GripVertical, X } from "lucide-react";

// Card shell for one home-dashboard widget. Sizing/order live one level up
// (HomeView's grid wrapper) so this only owns the drag handle + remove button.
export default function WidgetShell({ title, description, onRemove, dragHandleProps, children }) {
  return (
    <div className="h-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-start gap-1.5">
          <span
            {...dragHandleProps}
            title="드래그해서 순서 변경"
            className="mt-0.5 -ml-1 cursor-grab rounded p-0.5 text-[var(--color-text-faint)] hover:text-[var(--color-text-muted)] active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text)]">{title}</h3>
            {description && <p className="text-xs text-[var(--color-text-muted)]">{description}</p>}
          </div>
        </div>
        <button
          onClick={onRemove}
          title="위젯 숨기기"
          className="shrink-0 rounded-md p-1 text-[var(--color-text-faint)] hover:bg-[#F2F4F7] hover:text-[var(--color-text-muted)]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {children}
    </div>
  );
}
