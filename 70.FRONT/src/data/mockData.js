// ---------------------------------------------------------------------------
// Mock data layer.
//
// The product/SKU catalog below is NOT invented — it's parsed straight out of
// the real generated dataset at
// "30.DATA/32. nqnq_data/csv_preview/{products,sku_master,inventory_snapshot,
// popularity_tier_performance}.csv" (copied into src/data/nqnq/ as-is).
// Only two layers are still synthetic, because no real system produces them
// yet: (1) the ReorderRecommendation workflow state (status/승인자/반려사유 —
// no approval workflow has run), and (2) the held-out 예측-실측 daily series
// in the 예측대조 뷰 (no ML model has produced real predictions yet). Both are
// marked below. Swapping this whole file for a `fetch`/React Query hook later
// should not require touching the view components — only the data-loading
// hook.
// ---------------------------------------------------------------------------

import productsCsv from "./nqnq/products.csv?raw";
import skuMasterCsv from "./nqnq/sku_master.csv?raw";
import inventoryCsv from "./nqnq/inventory_snapshot.csv?raw";
import performanceCsv from "./nqnq/popularity_tier_performance.csv?raw";

// Small seeded PRNG so synthetic layers (workflow state, held-out drift/noise)
// are stable across reloads instead of jumping around every hot-reload.
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260820);
const int = (min, max) => Math.floor(min + rand() * (max - min + 1));

function parseCsv(raw) {
  const lines = raw.trim().split(/\r?\n/);
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(",");
    return Object.fromEntries(headers.map((h, i) => [h, cells[i]?.trim()]));
  });
}

export const CATEGORIES = [
  { code: "TOP", label: "상의" },
  { code: "PNT", label: "팬츠" },
  { code: "OUT", label: "아우터" },
  { code: "DRS", label: "원피스" },
  { code: "CLR", label: "퍼스널컬러 베이직" },
  { code: "ACC", label: "액세서리" },
];

export const POPULARITY_TIERS = ["HERO", "STEADY", "NICHE"];

// ---------------------------------------------------------------------------
// 0. 실데이터 파싱·조인 — products x sku_master x inventory_snapshot x
//    popularity_tier_performance
// ---------------------------------------------------------------------------

const products = parseCsv(productsCsv);
const skuRows = parseCsv(skuMasterCsv);
const inventoryRows = parseCsv(inventoryCsv);
const performanceRows = parseCsv(performanceCsv);

const productById = new Map(products.map((p) => [p.product_id, p]));
const inventoryBySku = new Map(inventoryRows.map((r) => [r.sku_code, r]));
// 실적 파일은 카테고리+스타일명(체형코드 포함, 예: "STR 스퀘어라인 기본티") 단위로
// 연간 판매량을 집계해뒀음 — products.csv의 style_name과 1:1로 매칭됨.
const performanceByKey = new Map(
  performanceRows.map((r) => [`${r.category_code}|${r.style_name}`, r])
);

const POPULARITY_WEIGHT_RANGE = {
  HERO: [0.8, 1.0],
  STEADY: [0.5, 0.8],
  NICHE: [0.2, 0.5],
};

function popularityWeightFor(tier) {
  const [lo, hi] = POPULARITY_WEIGHT_RANGE[tier] ?? POPULARITY_WEIGHT_RANGE.STEADY;
  return lo + rand() * (hi - lo);
}

const ENRICHED_SKUS = skuRows
  .map((sku) => {
    const product = productById.get(sku.product_id);
    const inventory = inventoryBySku.get(sku.sku_code);
    if (!product || !inventory) return null; // preview CSV은 일부 product/SKU가 빠져있음

    const perf = performanceByKey.get(`${product.category_code}|${product.style_name}`);
    const annualSoldUnits = perf ? Number(perf.avg_per_sku) : 500; // 실적 없는 경우의 보수적 기본값

    return {
      sku_code: sku.sku_code,
      product_id: sku.product_id,
      style_name: product.style_name,
      category_code: product.category_code,
      body_tone_code: product.body_tone_code,
      popularity_tier: product.popularity_tier,
      line_type: product.line_type,
      size: sku.size,
      color_code: sku.color_code,
      price: Number(sku.price),
      available_qty: Number(inventory.available_qty),
      reserved_qty: Number(inventory.reserved_qty),
      safety_stock: Number(inventory.safety_stock),
      reorder_point: Number(inventory.reorder_point),
      annual_sold_units: annualSoldUnits,
    };
  })
  .filter(Boolean);

// ---------------------------------------------------------------------------
// 1. 승인이력 뷰 — ReorderRecommendation 목록
//    실제 트리거 조건(23. Alert & Trigger Rules 1번 행): available_qty가
//    reorder_point 이하로 떨어진 SKU만 레코드가 생성됨.
// ---------------------------------------------------------------------------

export const MOCK_NOW = "2026-09-08T09:00:00+09:00";

function daysAgoISO(days, hours = 0) {
  const d = new Date(MOCK_NOW);
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

const STATUSES = ["Pending", "Approved", "Rejected"];
const STATUS_WEIGHTS = [0.5, 0.35, 0.15]; // 대기 절반, 승인 다수, 반려 소수

function weightedStatus() {
  const r = rand();
  let acc = 0;
  for (let i = 0; i < STATUSES.length; i++) {
    acc += STATUS_WEIGHTS[i];
    if (r <= acc) return STATUSES[i];
  }
  return STATUSES[STATUSES.length - 1];
}

export const REORDER_RECOMMENDATIONS = ENRICHED_SKUS.filter(
  (s) => s.available_qty <= s.reorder_point
).map((s, i) => {
  // risk_score = 재고소진임박도(실 재고/재발주점) × 인기도가중치(실 popularity_tier)
  const stockoutUrgency = Math.min(
    1,
    Math.max(0.05, 1 - s.available_qty / s.reorder_point)
  );
  const popularityWeight = popularityWeightFor(s.popularity_tier);
  const riskScore = Math.round(stockoutUrgency * popularityWeight * 100) / 100;

  // predicted_demand: 실 연간 판매량(annual_sold_units)을 4주 발주 주기로
  // 환산(÷13) — ML 모델이 아직 없어 실측 기반 추정치로 대체.
  const predictedDemand = Math.max(5, Math.round((s.annual_sold_units / 13) * (0.85 + rand() * 0.3)));
  const recommendedQty = Math.round(predictedDemand * (1.05 + rand() * 0.25));

  const status = weightedStatus();
  const createdDaysAgo = int(0, 6);
  const createdHoursAgo = int(0, 23);
  const resolutionHours = int(1, 30);

  // 최근 14일 판매 추이 — SKU 단위 일별 실데이터가 없어 연간 판매량 기반 일평균을
  // 중심으로 지터를 준 근사치 (스파크라인용).
  const dailyAvg = Math.max(1, s.annual_sold_units / 365);
  const salesTrend = Array.from({ length: 14 }).map(() =>
    Math.max(0, Math.round(dailyAvg * (0.5 + rand())))
  );

  return {
    id: `RR-${1000 + i}`,
    sku_code: s.sku_code,
    style_name: s.style_name,
    category_code: s.category_code,
    color_code: s.color_code,
    size: s.size,
    popularity_tier: s.popularity_tier,
    risk_score: riskScore,
    risk_breakdown: {
      stockout_urgency: Math.round(stockoutUrgency * 100) / 100,
      popularity_weight: Math.round(popularityWeight * 100) / 100,
    },
    predicted_demand: predictedDemand,
    recommended_qty: recommendedQty,
    status,
    created_at: daysAgoISO(createdDaysAgo, createdHoursAgo),
    resolved_at:
      status === "Pending"
        ? null
        : new Date(
            new Date(daysAgoISO(createdDaysAgo, createdHoursAgo)).getTime() + resolutionHours * 3600 * 1000
          ).toISOString(),
    approved_by: status === "Approved" ? "seoyeon.l@kakaostyle.com" : null,
    rejection_reason: status === "Rejected" ? "이번 시즌 컬러 단종 예정 — 재발주 보류" : null,
    inventory: {
      available_qty: s.available_qty,
      reserved_qty: s.reserved_qty,
      safety_stock: s.safety_stock,
      reorder_point: s.reorder_point,
    },
    sales_trend: salesTrend,
  };
});

// ---------------------------------------------------------------------------
// 2. 예측대조 뷰 — held-out 구간 예측치 vs 실측치
//    ⚠️ 아직 진짜 시뮬레이션: 9월 held-out 실측·ML 예측 둘 다 실제로 존재하지
//    않음(모델링 롤 산출 전). 카테고리별 기준 수요(CATEGORY_BASE_DEMAND)만
//    실데이터(popularity_tier_performance.csv 카테고리별 연간 판매량 ÷365)로
//    앵커링했고, 날짜별 드리프트·오차 패턴은 여전히 서사용 근사치.
// ---------------------------------------------------------------------------

const CUTOFF_DATE = new Date("2026-08-20");
const HELD_OUT_DAYS = 30;

function dateStr(offset) {
  const d = new Date(CUTOFF_DATE);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

const CATEGORY_SEASONAL_DRIFT = {
  TOP: 0.15,
  PNT: 0.05,
  OUT: 0.9,
  DRS: -0.6,
  CLR: -0.1,
  ACC: 0.1,
};

// 카테고리별 연간 판매량(popularity_tier_performance.csv 실적 합계) ÷ 365
const CATEGORY_BASE_DEMAND = (() => {
  const totals = {};
  performanceRows.forEach((r) => {
    totals[r.category_code] = (totals[r.category_code] ?? 0) + Number(r.sold_units);
  });
  return Object.fromEntries(
    Object.entries(totals).map(([code, total]) => [code, Math.round(total / 365)])
  );
})();

const CATEGORY_NOISE = { TOP: 0.05, PNT: 0.06, OUT: 0.19, DRS: 0.15, CLR: 0.08, ACC: 0.07 };

export const FORECAST_SERIES = Array.from({ length: HELD_OUT_DAYS }).map((_, dayIdx) => {
  const row = { date: dateStr(dayIdx) };
  let actualTotal = 0;
  let predictedTotal = 0;

  CATEGORIES.forEach(({ code }) => {
    const drift = CATEGORY_SEASONAL_DRIFT[code] * (dayIdx / HELD_OUT_DAYS);
    const base = (CATEGORY_BASE_DEMAND[code] ?? 100) * (1 + drift);
    const actual = Math.max(10, Math.round(base * (0.95 + rand() * 0.1)));
    const noise = CATEGORY_NOISE[code];
    const predicted = Math.max(10, Math.round(actual * (1 + (rand() * 2 - 1) * noise)));

    row[`${code}_actual`] = actual;
    row[`${code}_predicted`] = predicted;
    actualTotal += actual;
    predictedTotal += predicted;
  });

  row.actual = actualTotal;
  row.predicted = predictedTotal;
  return row;
});

export const CATEGORY_ERROR_RATES = CATEGORIES.map(({ code, label }) => {
  let errSum = 0;
  FORECAST_SERIES.forEach((row) => {
    errSum += Math.abs(row[`${code}_predicted`] - row[`${code}_actual`]) / row[`${code}_actual`];
  });
  const mape = Math.round((errSum / FORECAST_SERIES.length) * 1000) / 10; // %
  return { category_code: code, category_label: label, mape };
});

const overallMape =
  Math.round(
    (CATEGORY_ERROR_RATES.reduce((s, c) => s + c.mape, 0) / CATEGORY_ERROR_RATES.length) * 10
  ) / 10;

export const FORECAST_SUMMARY = {
  validation_start: dateStr(0),
  validation_end: dateStr(HELD_OUT_DAYS - 1),
  mape: overallMape,
  target_mape: 12.0, // KPI Definitions 분기 목표(예시값) — 실제 값으로 교체 필요
};

// SKU별 오차 상세 (오차 큰 순) — risk_score 상위 SKU 기준
export const SKU_ERRORS = [...REORDER_RECOMMENDATIONS]
  .sort((a, b) => b.risk_score - a.risk_score)
  .slice(0, 16)
  .map((r) => {
    const err = CATEGORY_ERROR_RATES.find((c) => c.category_code === r.category_code).mape;
    const jitter = Math.round((rand() * 14 - 4) * 10) / 10;
    return {
      sku_code: r.sku_code,
      style_name: r.style_name,
      category_code: r.category_code,
      predicted_total: r.predicted_demand,
      actual_total: Math.round(r.predicted_demand * (1 - (err + jitter) / 100)),
      mape: Math.max(1, Math.round((err + jitter) * 10) / 10),
    };
  })
  .sort((a, b) => b.mape - a.mape);

// SKU별 일별 예측-실측 시리즈 (SKU_ERRORS 16건 한정) — SkuErrorTable 행 클릭 시
// ForecastLineChart에 해당 SKU만 하이라이트하는 인터랙션(26. 대시보드 기술명세
// 2-5절)용. 카테고리 집계와 같은 계절 드리프트를 쓰되 SKU 1개 규모로 축소한 근사치.
export const SKU_DAILY_SERIES = Object.fromEntries(
  SKU_ERRORS.map((row) => {
    const drift = CATEGORY_SEASONAL_DRIFT[row.category_code];
    const noise = CATEGORY_NOISE[row.category_code];
    const skuBase = 4 + rand() * 10;
    const series = Array.from({ length: HELD_OUT_DAYS }).map((_, dayIdx) => {
      const base = skuBase * (1 + drift * (dayIdx / HELD_OUT_DAYS));
      const actual = Math.max(1, Math.round(base * (0.9 + rand() * 0.2)));
      const predicted = Math.max(1, Math.round(actual * (1 + (rand() * 2 - 1) * noise)));
      return { date: dateStr(dayIdx), sku_actual: actual, sku_predicted: predicted };
    });
    return [row.sku_code, series];
  })
);

// ---------------------------------------------------------------------------
// 3. 데이터 조회 뷰 — 질문 칩 결과 (Should)
//    "가장 위험한 SKU 5개"·"인기도 티어별 평균 판매량"은 REORDER_RECOMMENDATIONS
//    (실데이터 기반)에서 바로 뽑음. 반품·채널별 매출은 preview 샘플이 너무
//    작아(반품 500건 샘플, 채널은 ZIGZAG 단일값만 존재) 아직 대표성이 없어
//    기존처럼 예시 수치로 남겨둠 — 실데이터 연동 시 교체.
// ---------------------------------------------------------------------------

export const QUERY_CHIPS = [
  {
    id: "returns-by-category",
    label: "이번 주 반품 많은 카테고리는?",
    type: "bar",
    result: CATEGORIES.map(({ label }) => ({
      category: label,
      value: int(4, 42),
    })),
  },
  {
    id: "top-risk-sku",
    label: "가장 위험한 SKU 5개는?",
    type: "table",
    result: [...REORDER_RECOMMENDATIONS]
      .sort((a, b) => b.risk_score - a.risk_score)
      .slice(0, 5)
      .map((r) => ({
        sku_code: r.sku_code,
        style_name: r.style_name,
        risk_score: r.risk_score,
        recommended_qty: r.recommended_qty,
      })),
  },
  {
    id: "revenue-by-channel",
    label: "이번 달 채널별 매출은?",
    type: "bar",
    result: [
      { category: "자사몰", value: int(8000, 15000) },
      { category: "지그재그", value: int(20000, 42000) },
      { category: "홀세일", value: int(3000, 9000) },
      { category: "오프라인 쇼룸", value: int(1500, 6000) },
    ],
  },
  {
    id: "avg-sales-by-tier",
    label: "인기도 티어별 평균 판매량은?",
    type: "bar",
    result: POPULARITY_TIERS.map((tier) => ({
      category: tier,
      value:
        Math.round(
          (REORDER_RECOMMENDATIONS.filter((r) => r.popularity_tier === tier).reduce(
            (s, r) => s + r.predicted_demand,
            0
          ) /
            Math.max(1, REORDER_RECOMMENDATIONS.filter((r) => r.popularity_tier === tier).length)) * 10
        ) / 10,
    })),
  },
];

export const STATUS_LABEL = { Pending: "대기", Approved: "승인", Rejected: "반려" };
