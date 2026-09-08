import { useState } from "react";
import { X } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import Badge from "../ui/Badge";
import { STATUS_LABEL } from "../../data/mockData";
import { absoluteTime, formatNumber } from "../../utils/format";

const STATUS_VARIANT = { Pending: "amber", Approved: "green", Rejected: "red" };

function InventoryBar({ inventory }) {
  const { available_qty, reserved_qty, safety_stock, reorder_point } = inventory;
  const max = Math.max(available_qty + reserved_qty, reorder_point, safety_stock) * 1.1;

  const seg = (value, color, label) => (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-20 shrink-0 text-[var(--color-text-muted)]">{label}</span>
      <div className="h-2 flex-1 rounded-full bg-[#F1F2F4]">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(100, (value / max) * 100)}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-10 text-right tabular-nums text-[var(--color-text)]">{value}</span>
    </div>
  );

  return (
    <div className="space-y-2">
      {seg(available_qty, "#4338CA", "가용재고")}
      {seg(reserved_qty, "#93A5FD", "예약재고")}
      {seg(safety_stock, "#E08A2E", "안전재고")}
      {seg(reorder_point, "#8A3B0F", "재발주점")}
    </div>
  );
}

export default function DetailDrawer({ record, onClose, onApprove, onReject }) {
  const [reason, setReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  if (!record) return null;

  const { stockout_urgency, popularity_weight } = record.risk_breakdown;
  const trendData = record.sales_trend.map((v, i) => ({ i, v }));

  return (
    <div className="fixed inset-0 z-20 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-start justify-between border-b border-[var(--color-border)] px-5 py-4">
          <div>
            <div className="font-[var(--font-mono)] text-sm text-[var(--color-text-muted)]">
              {record.sku_code}
            </div>
            <div className="text-base font-semibold text-[var(--color-text)]">{record.style_name}</div>
          </div>
          <button onClick={onClose} className="rounded p-1 hover:bg-[#F2F4F7]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-6 px-5 py-5">
          <div className="flex items-center gap-2">
            <Badge variant={STATUS_VARIANT[record.status]}>{STATUS_LABEL[record.status]}</Badge>
            <Badge>{record.category_code}</Badge>
            <Badge>{record.color_code}</Badge>
            <Badge>{record.size}</Badge>
          </div>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-[var(--color-text)]">
              위험도 산출 근거 · {record.risk_score.toFixed(2)}
            </h3>
            <p className="mb-3 text-xs text-[var(--color-text-muted)]">
              재고소진임박도 × 인기도가중치
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-24 shrink-0 text-[var(--color-text-muted)]">재고소진임박도</span>
                <div className="h-2 flex-1 rounded-full bg-[#F1F2F4]">
                  <div
                    className="h-full rounded-full bg-[var(--color-accent)]"
                    style={{ width: `${stockout_urgency * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right tabular-nums">{stockout_urgency.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-24 shrink-0 text-[var(--color-text-muted)]">인기도가중치</span>
                <div className="h-2 flex-1 rounded-full bg-[#F1F2F4]">
                  <div
                    className="h-full rounded-full bg-[var(--color-accent)]"
                    style={{ width: `${popularity_weight * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right tabular-nums">{popularity_weight.toFixed(2)}</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-[var(--color-text)]">재고 현황</h3>
            <InventoryBar inventory={record.inventory} />
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-[var(--color-text)]">최근 14일 판매 추이</h3>
            <div className="h-10 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <Line type="monotone" dataKey="v" stroke="#4338CA" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs text-[var(--color-text-muted)]">예측수요</div>
              <div className="font-medium text-[var(--color-text)]">
                {formatNumber(record.predicted_demand)}
              </div>
            </div>
            <div>
              <div className="text-xs text-[var(--color-text-muted)]">추천수량</div>
              <div className="font-medium text-[var(--color-text)]">
                {formatNumber(record.recommended_qty)}
              </div>
            </div>
            <div className="col-span-2">
              <div className="text-xs text-[var(--color-text-muted)]">생성일시</div>
              <div className="text-[var(--color-text)]">{absoluteTime(record.created_at)}</div>
            </div>
            {record.status !== "Pending" && (
              <div className="col-span-2">
                <div className="text-xs text-[var(--color-text-muted)]">
                  {record.status === "Approved" ? "승인자" : "반려 사유"}
                </div>
                <div className="text-[var(--color-text)]">
                  {record.status === "Approved" ? record.approved_by : record.rejection_reason}
                </div>
              </div>
            )}
          </section>
        </div>

        {record.status === "Pending" && (
          <div className="border-t border-[var(--color-border)] px-5 py-4">
            {showRejectInput && (
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="반려 사유를 입력하세요"
                rows={2}
                className="mb-3 w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm placeholder:text-[var(--color-text-faint)]"
              />
            )}
            <div className="flex gap-2">
              {showRejectInput ? (
                <>
                  <button
                    onClick={() => setShowRejectInput(false)}
                    className="flex-1 rounded-md border border-[var(--color-border)] py-2 text-sm font-medium text-[var(--color-text-muted)] hover:bg-[#F2F4F7]"
                  >
                    취소
                  </button>
                  <button
                    disabled={!reason.trim()}
                    onClick={() => onReject(record, reason)}
                    className="flex-1 rounded-md bg-[var(--color-red)] py-2 text-sm font-medium text-white disabled:opacity-40"
                  >
                    반려 확정
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowRejectInput(true)}
                    className="flex-1 rounded-md border border-[var(--color-border)] py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[#F2F4F7]"
                  >
                    반려
                  </button>
                  <button
                    onClick={() => onApprove(record)}
                    className="flex-1 rounded-md bg-[var(--color-accent)] py-2 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)]"
                  >
                    승인
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
