import { CHANGELOG } from "../../data/changelog";

export default function ChangelogView() {
  return (
    <div className="space-y-4">
      {CHANGELOG.map((entry, i) => (
        <div key={entry.version} className="flex gap-4">
          <div className="flex w-24 shrink-0 flex-col items-start pt-4">
            <span className="rounded-md bg-[var(--color-accent-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--color-accent)]">
              v{entry.version}
            </span>
            <span className="mt-1 text-xs text-[var(--color-text-faint)]">{entry.date}</span>
          </div>
          <div className="relative flex-1 pb-2">
            {i !== CHANGELOG.length - 1 && (
              <span className="absolute left-[-17px] top-6 h-full w-px bg-[var(--color-border)]" />
            )}
            <span className="absolute left-[-21px] top-[26px] h-2 w-2 rounded-full bg-[var(--color-accent)]" />
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <ul className="space-y-1.5">
                {entry.changes.map((change, j) => (
                  <li key={j} className="flex gap-2 text-sm text-[var(--color-text)]">
                    <span className="text-[var(--color-text-faint)]">·</span>
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
