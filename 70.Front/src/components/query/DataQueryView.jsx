import { useState } from "react";
import { Download, MessageSquareText } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { QUERY_CHIPS } from "../../data/mockData";
import { formatNumber } from "../../utils/format";

function downloadCsv(chip) {
  const rows = chip.result;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => r[h]).join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${chip.id}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function DataQueryView() {
  const [activeId, setActiveId] = useState(null);
  const active = QUERY_CHIPS.find((c) => c.id === activeId);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="mb-1 flex items-center gap-2">
          <MessageSquareText className="h-4 w-4 text-[var(--color-accent)]" />
          <h3 className="text-sm font-semibold text-[var(--color-text)]">자주 묻는 질문으로 바로 조회</h3>
        </div>
        <p className="mb-4 text-xs text-[var(--color-text-muted)]">
          자유 서술형 질의 대신, 미리 정의한 질문만 안전하게 실행합니다. 결과는 표 또는 차트로
          바로 확인하고 CSV로 내려받을 수 있습니다.
        </p>
        <div className="flex flex-wrap gap-2">
          {QUERY_CHIPS.map((chip) => (
            <button
              key={chip.id}
              onClick={() => setActiveId(chip.id)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                activeId === chip.id
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                  : "border-[var(--color-border)] text-[var(--color-text)] hover:bg-[#F2F4F7]"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {active && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-[var(--color-text)]">{active.label}</h4>
            <button
              onClick={() => downloadCsv(active)}
              className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-text)] hover:bg-[#F2F4F7]"
            >
              <Download className="h-3.5 w-3.5" />
              CSV 다운로드
            </button>
          </div>

          {active.type === "bar" ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={active.result} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#EEF0F3" vertical={false} />
                  <XAxis dataKey="category" tick={{ fontSize: 11, fill: "#98A2B3" }} axisLine={{ stroke: "#E4E7EC" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#98A2B3" }} axisLine={false} tickLine={false} width={44} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E4E7EC" }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#4338CA" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-text-muted)]">
                  {Object.keys(active.result[0]).map((key) => (
                    <th key={key} className="px-3 py-2 font-medium">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {active.result.map((row, i) => (
                  <tr key={i} className="border-b border-[var(--color-border)] last:border-0">
                    {Object.values(row).map((v, j) => (
                      <td key={j} className="whitespace-nowrap px-3 py-2 tabular-nums">
                        {typeof v === "number" ? formatNumber(v) : v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
