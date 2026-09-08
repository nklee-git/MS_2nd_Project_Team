const VARIANTS = {
  neutral: "text-[var(--color-text-muted)] bg-[#F2F4F7] border-[var(--color-border)]",
  accent: "text-[var(--color-accent)] bg-[var(--color-accent-soft)] border-transparent",
  amber: "text-[var(--color-amber)] bg-[var(--color-amber-soft)] border-[var(--color-amber-border)]",
  green: "text-[var(--color-green)] bg-[var(--color-green-soft)] border-[var(--color-green-border)]",
  red: "text-[var(--color-red)] bg-[var(--color-red-soft)] border-[var(--color-red-border)]",
};

// Small pill used for status, category, color, size, popularity tier.
export default function Badge({ variant = "neutral", children, mono = false }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium leading-5 whitespace-nowrap ${VARIANTS[variant]} ${mono ? "font-[var(--font-mono)]" : ""}`}
    >
      {children}
    </span>
  );
}
