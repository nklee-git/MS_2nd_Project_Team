// ---------------------------------------------------------------------------
// Mock data layer.
//
// This file exists so the UI has something real to render before the actual
// Dataverse / Databricks integration is wired up. Every shape here follows
// "20.ARCHITECTURE/26. 대시보드 기술명세 (프론트).md" and
// "20.ARCHITECTURE/24. 기능명세서 v1" field names 1:1, so swapping this out
// for a real `fetch`/React Query hook later should not require touching the
// view components — only the data-loading hook.
// ---------------------------------------------------------------------------

// Small seeded PRNG so the mock data is stable across reloads instead of
// jumping around every time the dev server hot-reloads.
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
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const int = (min, max) => Math.floor(min + rand() * (max - min + 1));

export const CATEGORIES = [
  { code: "TOP", label: "상의" },
  { code: "PNT", label: "팬츠" },
  { code: "OUT", label: "아우터" },
  { code: "DRS", label: "원피스" },
  { code: "CLR", label: "스커트" },
  { code: "ACC", label: "액세서리" },
];

export const POPULARITY_TIERS = ["HERO", "STEADY", "NICHE"];
const COLORS = ["BLK", "WHT", "BEG", "NVY", "GRY", "KHK"];
const SIZES = ["XS", "S", "M", "L", "XL"];

const STYLE_NAMES = {
  TOP: ["베이직 크루넥 니트", "오버핏 코튼 셔츠", "리브 반팔 티", "브이넥 가디건"],
  PNT: ["와이드 슬랙스", "스트레이트 데님", "밴딩 조거 팬츠", "크롭 슬림팬츠"],
  OUT: ["울 블렌드 코트", "퍼프 패딩", "무스탕 재킷", "바시티 자켓"],
  DRS: ["셔링 원피스", "니트 롱 원피스", "슬립 미디 드레스", "카라 셔츠 원피스"],
  CLR: ["플리츠 롱스커트", "H라인 미니스커트", "데님 스커트", "니트 스커트"],
  ACC: ["레더 벨트", "울 머플러", "버킷햇", "숄더백"],
};

function makeSkuCode(category, color, size, idx) {
  return `${category}-${color}-${size}-${String(idx).padStart(4, "0")}`;
}

// ---------------------------------------------------------------------------
// 1. 승인이력 뷰 — ReorderRecommendation 목록
// ---------------------------------------------------------------------------

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

// Fixed "지금" 기준점 — 실제 시스템 시계와 무관하게 상대시간 표시를 안정적으로
// 재현하기 위한 앵커. 실데이터 연동 시에는 그냥 Date.now()로 바꾸면 됨.
export const MOCK_NOW = "2026-09-08T09:00:00+09:00";

function daysAgoISO(days, hours = 0) {
  const d = new Date(MOCK_NOW);
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

export const REORDER_RECOMMENDATIONS = Array.from({ length: 42 }).map((_, i) => {
  const category = pick(CATEGORIES).code;
  const color = pick(COLORS);
  const size = pick(SIZES);
  const styleName = pick(STYLE_NAMES[category]);
  const tier = pick(POPULARITY_TIERS);

  // risk_score = 재고소진임박도(stockout_urgency) x 인기도가중치(popularity_weight)
  const stockoutUrgency = Math.round(rand() * 100) / 100;
  const popularityWeight =
    tier === "HERO" ? 0.8 + rand() * 0.2 : tier === "STEADY" ? 0.5 + rand() * 0.3 : 0.2 + rand() * 0.3;
  const riskScore = Math.round(stockoutUrgency * popularityWeight * 100) / 100;

  const predictedDemand = int(20, 400);
  const recommendedQty = Math.round(predictedDemand * (1.05 + rand() * 0.25));

  const status = weightedStatus();
  const createdDaysAgo = int(0, 6);
  const createdHoursAgo = int(0, 23);
  const resolutionHours = int(1, 30); // 승인/반려까지 걸린 시간 (평균 처리시간 계산용)

  const availableQty = int(0, 120);
  const reservedQty = int(0, 40);
  const safetyStock = int(30, 80);
  const reorderPoint = safetyStock + int(10, 40);

  const salesTrend = Array.from({ length: 14 }).map(() => int(0, 25));

  return {
    id: `RR-${1000 + i}`,
    sku_code: makeSkuCode(category, color, size, 200 + i),
    style_name: styleName,
    category_code: category,
    color_code: color,
    size,
    popularity_tier: tier,
    risk_score: riskScore,
    risk_breakdown: {
      stockout_urgency: stockoutUrgency,
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
      available_qty: availableQty,
      reserved_qty: reservedQty,
      safety_stock: safetyStock,
      reorder_point: reorderPoint,
    },
    sales_trend: salesTrend,
  };
});

// ---------------------------------------------------------------------------
// 2. 예측대조 뷰 — held-out 구간 예측치 vs 실측치
// ---------------------------------------------------------------------------

const CUTOFF_DATE = new Date("2026-08-20");
const HELD_OUT_DAYS = 30;

function dateStr(offset) {
  const d = new Date(CUTOFF_DATE);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

// 카테고리별 계절 민감도(간단 근사) — OUT은 날짜가 지날수록(가을 진입) 수요 우상향,
// DRS는 하강, 나머지는 완만. 실제 로직은 ML 롤의 held-out 결과로 대체될 자리.
const CATEGORY_SEASONAL_DRIFT = {
  TOP: 0.15,
  PNT: 0.05,
  OUT: 0.9,
  DRS: -0.6,
  CLR: -0.1,
  ACC: 0.1,
};
const CATEGORY_BASE_DEMAND = { TOP: 340, PNT: 260, OUT: 180, DRS: 150, CLR: 120, ACC: 90 };
// OUT은 계절 전환기라 오차가 크고, TOP/PNT처럼 정상판매 카테고리는 오차가 작다는
// 서사를 반영 (발표 포인트: "왜 이 카테고리는 유독 잘 맞았는지").
const CATEGORY_NOISE = { TOP: 0.05, PNT: 0.06, OUT: 0.19, DRS: 0.15, CLR: 0.08, ACC: 0.07 };

export const FORECAST_SERIES = Array.from({ length: HELD_OUT_DAYS }).map((_, dayIdx) => {
  const row = { date: dateStr(dayIdx) };
  let actualTotal = 0;
  let predictedTotal = 0;

  CATEGORIES.forEach(({ code }) => {
    const drift = CATEGORY_SEASONAL_DRIFT[code] * (dayIdx / HELD_OUT_DAYS);
    const base = CATEGORY_BASE_DEMAND[code] * (1 + drift);
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

// SKU별 오차 상세 (오차 큰 순)
export const SKU_ERRORS = REORDER_RECOMMENDATIONS.slice(0, 16).map((r) => {
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
}).sort((a, b) => b.mape - a.mape);

// SKU별 일별 예측-실측 시리즈 (SKU_ERRORS 16건 한정) — SkuErrorTable 행 클릭 시
// ForecastLineChart에 해당 SKU만 하이라이트하는 인터랙션(26. 대시보드 기술명세
// 2-5절)용 목업. 카테고리 집계와 같은 계절 드리프트를 쓰되 SKU 1개 규모로 축소.
export const SKU_DAILY_SERIES = Object.fromEntries(
  SKU_ERRORS.map((row) => {
    const drift = CATEGORY_SEASONAL_DRIFT[row.category_code];
    const noise = CATEGORY_NOISE[row.category_code];
    const skuBase = 4 + rand() * 10; // SKU 1개 단위 일평균 판매량 규모
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
