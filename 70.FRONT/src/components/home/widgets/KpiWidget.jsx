import StatRow from "../StatRow";
import { REORDER_RECOMMENDATIONS, MOCK_NOW } from "../../../data/mockData";

const TODAY = new Date(MOCK_NOW).toDateString();

export default function KpiWidget() {
  const pending = REORDER_RECOMMENDATIONS.filter((r) => r.status === "Pending");
  const approvedToday = REORDER_RECOMMENDATIONS.filter(
    (r) => r.status === "Approved" && new Date(r.created_at).toDateString() === TODAY
  );
  const approved = REORDER_RECOMMENDATIONS.filter((r) => r.status === "Approved");
  const rejected = REORDER_RECOMMENDATIONS.filter((r) => r.status === "Rejected");
  const rejectionRate =
    approved.length + rejected.length === 0 ? 0 : (rejected.length / (approved.length + rejected.length)) * 100;

  return (
    <StatRow
      items={[
        { label: "대기중 발주추천", value: pending.length, unit: "건" },
        { label: "오늘 승인 건수", value: approvedToday.length, unit: "건" },
        {
          label: "반려율",
          value: rejectionRate.toFixed(1),
          unit: "%",
          tone: rejectionRate > 20 ? "bad" : "neutral",
        },
        { label: "전체 발주추천", value: REORDER_RECOMMENDATIONS.length, unit: "건" },
      ]}
    />
  );
}
