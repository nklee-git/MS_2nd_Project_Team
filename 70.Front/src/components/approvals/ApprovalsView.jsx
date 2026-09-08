import { useMemo, useState } from "react";
import { Clock, CheckCircle2, XCircle, Timer } from "lucide-react";
import SummaryCard from "../ui/SummaryCard";
import FilterBar from "./FilterBar";
import ApprovalsTable from "./ApprovalsTable";
import DetailDrawer from "./DetailDrawer";
import { REORDER_RECOMMENDATIONS, MOCK_NOW } from "../../data/mockData";

const TODAY = new Date(MOCK_NOW).toDateString();

export default function ApprovalsView() {
  const [records, setRecords] = useState(REORDER_RECOMMENDATIONS);
  const [filters, setFilters] = useState({ status: "all", category: "all", tier: "all", search: "" });
  const [sort, setSort] = useState({ key: "risk_score", dir: "desc" });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const summary = useMemo(() => {
    const pending = records.filter((r) => r.status === "Pending");
    const approvedToday = records.filter(
      (r) => r.status === "Approved" && new Date(r.created_at).toDateString() === TODAY
    );
    const approved = records.filter((r) => r.status === "Approved");
    const rejected = records.filter((r) => r.status === "Rejected");
    const rejectionRate =
      approved.length + rejected.length === 0
        ? 0
        : (rejected.length / (approved.length + rejected.length)) * 100;

    const resolved = records.filter((r) => r.resolved_at);
    const avgHours =
      resolved.length === 0
        ? 0
        : resolved.reduce((sum, r) => {
            const hrs = (new Date(r.resolved_at) - new Date(r.created_at)) / 3600000;
            return sum + hrs;
          }, 0) / resolved.length;

    return {
      pendingCount: pending.length,
      approvedTodayCount: approvedToday.length,
      rejectionRate,
      avgHours,
    };
  }, [records]);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (filters.status !== "all" && r.status !== filters.status) return false;
      if (filters.category !== "all" && r.category_code !== filters.category) return false;
      if (filters.tier !== "all" && r.popularity_tier !== filters.tier) return false;
      if (filters.search && !r.sku_code.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [records, filters]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      let av = a[sort.key];
      let bv = b[sort.key];
      if (sort.key === "created_at") {
        av = new Date(av).getTime();
        bv = new Date(bv).getTime();
      }
      return sort.dir === "desc" ? bv - av : av - bv;
    });
    return copy;
  }, [filtered, sort]);

  const updateFilters = (next) => {
    setFilters(next);
    setPage(1);
  };

  const handleApprove = (record) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === record.id
          ? { ...r, status: "Approved", approved_by: "이서연 (나)", resolved_at: new Date().toISOString() }
          : r
      )
    );
    setSelected(null);
  };

  const handleReject = (record, reason) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === record.id
          ? { ...r, status: "Rejected", rejection_reason: reason, resolved_at: new Date().toISOString() }
          : r
      )
    );
    setSelected(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="대기중 발주추천" value={summary.pendingCount} unit="건" icon={Clock} />
        <SummaryCard label="오늘 승인 건수" value={summary.approvedTodayCount} unit="건" icon={CheckCircle2} />
        <SummaryCard
          label="반려율"
          value={summary.rejectionRate.toFixed(1)}
          unit="%"
          tone={summary.rejectionRate > 20 ? "bad" : "neutral"}
          icon={XCircle}
        />
        <SummaryCard label="평균 처리시간" value={summary.avgHours.toFixed(1)} unit="시간" icon={Timer} />
      </div>

      <FilterBar filters={filters} onChange={updateFilters} />

      <ApprovalsTable
        rows={sorted}
        sort={sort}
        onSortChange={setSort}
        page={page}
        onPageChange={setPage}
        onRowClick={setSelected}
      />

      <DetailDrawer
        record={selected}
        onClose={() => setSelected(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
