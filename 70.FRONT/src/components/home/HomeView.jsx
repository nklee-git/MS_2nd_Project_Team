import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import WidgetShell from "./WidgetShell";
import { WIDGET_REGISTRY, DEFAULT_WIDGET_ORDER } from "../../data/homeWidgets";

const STORAGE_KEY = "fashion-ai-dashboard:home-widget-order";

function loadOrder() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_WIDGET_ORDER;
    const saved = JSON.parse(raw);
    const cleaned = saved.filter((id) => WIDGET_REGISTRY.some((w) => w.id === id));
    // 레지스트리에 새로 추가된 위젯(저장된 순서에는 없는 것)은 맨 뒤에 붙여준다.
    const missing = DEFAULT_WIDGET_ORDER.filter((id) => !cleaned.includes(id));
    return [...cleaned, ...missing];
  } catch {
    return DEFAULT_WIDGET_ORDER;
  }
}

export default function HomeView({ role, onNavigateTab }) {
  const [visibleIds, setVisibleIds] = useState(loadOrder);
  const [dragId, setDragId] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(visibleIds));
    } catch {
      // localStorage 접근 불가한 환경 — 새로고침 시 순서만 초기화됨, 기능엔 영향 없음
    }
  }, [visibleIds]);

  const widgetsById = useMemo(() => Object.fromEntries(WIDGET_REGISTRY.map((w) => [w.id, w])), []);

  // 27. 이해관계자 협업 대시보드 UX-UI 기능명세서 4-1절 — 역할에 태깅되지
  // 않은 위젯은 순서/표시 상태와 무관하게 그리드·"숨긴 위젯" 목록 모두에서 제외.
  const idsForRole = useMemo(
    () => WIDGET_REGISTRY.filter((w) => w.roles.includes(role)).map((w) => w.id),
    [role]
  );
  const visibleIdsForRole = useMemo(
    () => visibleIds.filter((id) => idsForRole.includes(id)),
    [visibleIds, idsForRole]
  );
  const hiddenIds = useMemo(
    () => idsForRole.filter((id) => !visibleIds.includes(id)),
    [idsForRole, visibleIds]
  );

  const handleRemove = (id) => setVisibleIds((prev) => prev.filter((x) => x !== id));
  const handleAdd = (id) => setVisibleIds((prev) => [...prev, id]);

  // id 기반으로 재정렬 — visibleIds는 모든 역할의 위젯이 섞인 전역 순서라,
  // 지금 화면에 안 보이는(다른 역할 소속) 항목의 상대 순서는 그대로 둬야 함.
  const handleDrop = (dropId) => {
    setVisibleIds((prev) => {
      if (dragId === null || dragId === dropId) return prev;
      const next = prev.filter((id) => id !== dragId);
      const dropAt = next.indexOf(dropId);
      if (dropAt === -1) return prev;
      next.splice(dropAt, 0, dragId);
      return next;
    });
    setDragId(null);
  };

  return (
    <div className="space-y-4">
      {hiddenIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 py-3">
          <span className="text-xs text-[var(--color-text-muted)]">숨긴 위젯:</span>
          {hiddenIds.map((id) => (
            <button
              key={id}
              onClick={() => handleAdd(id)}
              className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] bg-white px-2.5 py-1 text-xs font-medium text-[var(--color-text-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              <Plus className="h-3 w-3" />
              {widgetsById[id].title}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {visibleIdsForRole.map((id) => {
          const widget = widgetsById[id];
          if (!widget) return null;
          const Content = widget.Component;
          return (
            <div
              key={id}
              className={widget.span}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(id)}
            >
              <WidgetShell
                title={widget.title}
                description={widget.description}
                onRemove={() => handleRemove(id)}
                dragHandleProps={{
                  draggable: true,
                  onDragStart: () => setDragId(id),
                  onDragEnd: () => setDragId(null),
                }}
              >
                <Content onNavigateTab={onNavigateTab} />
              </WidgetShell>
            </div>
          );
        })}
      </div>
    </div>
  );
}
