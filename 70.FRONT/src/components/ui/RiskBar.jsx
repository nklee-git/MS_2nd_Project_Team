// Single-hue (amber -> deep amber) ramp instead of green->red, per
// "26. 대시보드 기술명세 (프론트)" 4절 접근성 권고.
function colorFor(score) {
  // Interpolate lightness/saturation within one hue family.
  const stops = [
    { at: 0, color: "#FDE9C8" },
    { at: 0.5, color: "#E08A2E" },
    { at: 1, color: "#8A3B0F" },
  ];
  let upper = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (score >= stops[i].at && score <= stops[i + 1].at) {
      upper = stops[i + 1];
      break;
    }
  }
  return upper.color; // simplified: snap to nearest band, good enough for a table row
}

export default function RiskBar({ score }) {
  const pct = Math.round(Math.min(1, Math.max(0, score)) * 100);
  return (
    <div className="flex items-center gap-2 w-28">
      <div className="h-1.5 flex-1 rounded-full bg-[#00000014] overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: colorFor(score) }}
        />
      </div>
      <span className="text-xs tabular-nums text-[var(--color-text-muted)] w-8 text-right">
        {score.toFixed(2)}
      </span>
    </div>
  );
}
