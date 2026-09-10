using FashionAiDashboard.Data;
using FashionAiDashboard.Models;

namespace FashionAiDashboard.Services;

/// <summary>
/// React mockData.js를 그대로 이식한 샘플 데이터 레이어.
/// 30.DATA/32.nqnq_data에서 나온 실제 카탈로그(CSV)를 파싱·조인해서 쓰고,
/// ReorderRecommendation 워크플로우 상태(승인/반려)만 아직 진짜 시스템이 없어
/// 시드 고정 PRNG로 시뮬레이션한다 (원본 설명 그대로: React mockData.js 헤더 주석 참고).
/// 앱 시작 시 한 번만 계산해서 싱글턴으로 캐싱 — 나중에 Dataverse Web API 등으로
/// 교체할 때 이 서비스의 인터페이스만 유지하면 컨트롤러/뷰는 안 건드려도 됨.
/// </summary>
public class SampleDataService
{
    private static readonly DateTime MockNow = new(2026, 9, 8, 9, 0, 0, DateTimeKind.Unspecified);

    private static readonly Dictionary<string, (double Lo, double Hi)> PopularityWeightRange = new()
    {
        ["HERO"] = (0.8, 1.0),
        ["STEADY"] = (0.5, 0.8),
        ["NICHE"] = (0.2, 0.5),
    };

    private static readonly string[] Statuses = { "Pending", "Approved", "Rejected" };
    private static readonly double[] StatusWeights = { 0.5, 0.35, 0.15 };

    public static readonly List<CategoryInfo> Categories = new()
    {
        new("TOP", "상의"),
        new("PNT", "팬츠"),
        new("OUT", "아우터"),
        new("DRS", "원피스"),
        new("CLR", "퍼스널컬러 베이직"),
        new("ACC", "액세서리"),
    };

    private static readonly Dictionary<string, double> CategorySeasonalDrift = new()
    {
        ["TOP"] = 0.15, ["PNT"] = 0.05, ["OUT"] = 0.9, ["DRS"] = -0.6, ["CLR"] = -0.1, ["ACC"] = 0.1,
    };

    private static readonly Dictionary<string, double> CategoryNoise = new()
    {
        ["TOP"] = 0.05, ["PNT"] = 0.06, ["OUT"] = 0.19, ["DRS"] = 0.15, ["CLR"] = 0.08, ["ACC"] = 0.07,
    };

    private static readonly DateTime CutoffDate = new(2026, 8, 20);
    private const int HeldOutDays = 30;

    public List<EnrichedSku> EnrichedSkus { get; }
    public List<ReorderRecommendation> ReorderRecommendations { get; }
    public List<ForecastDay> ForecastSeries { get; }
    public List<CategoryErrorRate> CategoryErrorRates { get; }
    public ForecastSummary ForecastSummaryInfo { get; }
    public List<SkuError> SkuErrors { get; }
    public Dictionary<string, List<SkuDailyPoint>> SkuDailySeries { get; }

    public SampleDataService(IWebHostEnvironment env)
    {
        var dir = Path.Combine(env.ContentRootPath, "Data", "nqnq");
        var rand = new Mulberry32(20260820);

        var products = CsvReader.Read(Path.Combine(dir, "products.csv"));
        var skuRows = CsvReader.Read(Path.Combine(dir, "sku_master.csv"));
        var inventoryRows = CsvReader.Read(Path.Combine(dir, "inventory_snapshot.csv"));
        var performanceRows = CsvReader.Read(Path.Combine(dir, "popularity_tier_performance.csv"));

        var productById = products.ToDictionary(p => p.ToStr("product_id"));
        var inventoryBySku = inventoryRows.ToDictionary(r => r.ToStr("sku_code"));
        var performanceByKey = performanceRows.ToDictionary(r => $"{r.ToStr("category_code")}|{r.ToStr("style_name")}");

        EnrichedSkus = new List<EnrichedSku>();
        foreach (var sku in skuRows)
        {
            var skuCode = sku.ToStr("sku_code");
            var productId = sku.ToStr("product_id");
            if (!productById.TryGetValue(productId, out var product)) continue;
            if (!inventoryBySku.TryGetValue(skuCode, out var inventory)) continue;

            var perfKey = $"{product.ToStr("category_code")}|{product.ToStr("style_name")}";
            var annualSoldUnits = performanceByKey.TryGetValue(perfKey, out var perf)
                ? perf.ToDouble("avg_per_sku")
                : 500;

            EnrichedSkus.Add(new EnrichedSku
            {
                SkuCode = skuCode,
                ProductId = productId,
                StyleName = product.ToStr("style_name"),
                CategoryCode = product.ToStr("category_code"),
                BodyToneCode = product.ToStr("body_tone_code"),
                PopularityTier = product.ToStr("popularity_tier"),
                LineType = product.ToStr("line_type"),
                Size = sku.ToStr("size"),
                ColorCode = sku.ToStr("color_code"),
                Price = sku.ToInt("price"),
                Cost = sku.ToInt("cost"),
                AvailableQty = inventory.ToInt("available_qty"),
                ReservedQty = inventory.ToInt("reserved_qty"),
                SafetyStock = inventory.ToInt("safety_stock"),
                ReorderPoint = inventory.ToInt("reorder_point"),
                AnnualSoldUnits = annualSoldUnits,
            });
        }

        ReorderRecommendations = BuildReorderRecommendations(rand);

        // 카테고리별 연간 판매량(실적 합계) ÷ 365 — React CATEGORY_BASE_DEMAND
        var categoryBaseDemand = performanceRows
            .GroupBy(r => r.ToStr("category_code"))
            .ToDictionary(g => g.Key, g => (int)Math.Round(g.Sum(r => r.ToDouble("sold_units")) / 365));

        ForecastSeries = BuildForecastSeries(rand, categoryBaseDemand);
        CategoryErrorRates = BuildCategoryErrorRates();
        ForecastSummaryInfo = BuildForecastSummary();
        SkuErrors = BuildSkuErrors(rand);
        SkuDailySeries = BuildSkuDailySeries(rand);
    }

    private static string DateStr(int offset) => CutoffDate.AddDays(offset).ToString("yyyy-MM-dd");

    private List<ForecastDay> BuildForecastSeries(Mulberry32 rand, Dictionary<string, int> categoryBaseDemand)
    {
        var series = new List<ForecastDay>();
        for (int dayIdx = 0; dayIdx < HeldOutDays; dayIdx++)
        {
            var day = new ForecastDay { Date = DateStr(dayIdx) };
            foreach (var cat in Categories)
            {
                var drift = CategorySeasonalDrift[cat.Code] * ((double)dayIdx / HeldOutDays);
                var baseDemand = categoryBaseDemand.GetValueOrDefault(cat.Code, 100) * (1 + drift);
                var actual = Math.Max(10, (int)Math.Round(baseDemand * (0.95 + rand.NextDouble() * 0.1)));
                var noise = CategoryNoise[cat.Code];
                var predicted = Math.Max(10, (int)Math.Round(actual * (1 + (rand.NextDouble() * 2 - 1) * noise)));

                day.ActualByCategory[cat.Code] = actual;
                day.PredictedByCategory[cat.Code] = predicted;
                day.ActualTotal += actual;
                day.PredictedTotal += predicted;
            }
            series.Add(day);
        }
        return series;
    }

    private List<CategoryErrorRate> BuildCategoryErrorRates()
    {
        return Categories.Select(cat =>
        {
            var errSum = ForecastSeries.Sum(day =>
                Math.Abs(day.PredictedByCategory[cat.Code] - day.ActualByCategory[cat.Code]) / (double)day.ActualByCategory[cat.Code]);
            var mape = Math.Round(errSum / ForecastSeries.Count * 1000) / 10;
            return new CategoryErrorRate { CategoryCode = cat.Code, CategoryLabel = cat.Label, Mape = mape };
        }).ToList();
    }

    private ForecastSummary BuildForecastSummary()
    {
        var overallMape = Math.Round(CategoryErrorRates.Average(c => c.Mape) * 10) / 10;
        return new ForecastSummary
        {
            ValidationStart = DateStr(0),
            ValidationEnd = DateStr(HeldOutDays - 1),
            Mape = overallMape,
            TargetMape = 12.0,
        };
    }

    // risk_score 상위 16건 기준 오차 상세 (React SKU_ERRORS)
    private List<SkuError> BuildSkuErrors(Mulberry32 rand)
    {
        var top16 = ReorderRecommendations.OrderByDescending(r => r.RiskScore).Take(16);
        var errors = top16.Select(r =>
        {
            var err = CategoryErrorRates.First(c => c.CategoryCode == r.CategoryCode).Mape;
            var jitter = Math.Round((rand.NextDouble() * 14 - 4) * 10) / 10;
            var mape = Math.Max(1, Math.Round((err + jitter) * 10) / 10);
            return new SkuError
            {
                SkuCode = r.SkuCode,
                StyleName = r.StyleName,
                CategoryCode = r.CategoryCode,
                PredictedTotal = r.PredictedDemand,
                ActualTotal = (int)Math.Round(r.PredictedDemand * (1 - (err + jitter) / 100)),
                Mape = mape,
            };
        }).OrderByDescending(e => e.Mape).ToList();
        return errors;
    }

    // SkuErrors 16건 한정 — SKU별 일별 예측-실측 시리즈 (React SKU_DAILY_SERIES)
    private Dictionary<string, List<SkuDailyPoint>> BuildSkuDailySeries(Mulberry32 rand)
    {
        var result = new Dictionary<string, List<SkuDailyPoint>>();
        foreach (var row in SkuErrors)
        {
            var drift = CategorySeasonalDrift[row.CategoryCode];
            var noise = CategoryNoise[row.CategoryCode];
            var skuBase = 4 + rand.NextDouble() * 10;
            var series = new List<SkuDailyPoint>();
            for (int dayIdx = 0; dayIdx < HeldOutDays; dayIdx++)
            {
                var baseVal = skuBase * (1 + drift * ((double)dayIdx / HeldOutDays));
                var actual = Math.Max(1, (int)Math.Round(baseVal * (0.9 + rand.NextDouble() * 0.2)));
                var predicted = Math.Max(1, (int)Math.Round(actual * (1 + (rand.NextDouble() * 2 - 1) * noise)));
                series.Add(new SkuDailyPoint(DateStr(dayIdx), actual, predicted));
            }
            result[row.SkuCode] = series;
        }
        return result;
    }

    private List<ReorderRecommendation> BuildReorderRecommendations(Mulberry32 rand)
    {
        var result = new List<ReorderRecommendation>();
        int i = 0;
        foreach (var s in EnrichedSkus.Where(s => s.AvailableQty <= s.ReorderPoint))
        {
            // risk_score = 재고소진임박도(실 재고/재발주점) x 인기도가중치
            var stockoutUrgency = Math.Min(1, Math.Max(0.05, 1 - (double)s.AvailableQty / s.ReorderPoint));
            var (lo, hi) = PopularityWeightRange.GetValueOrDefault(s.PopularityTier, PopularityWeightRange["STEADY"]);
            var popularityWeight = lo + rand.NextDouble() * (hi - lo);
            var riskScore = Math.Round(stockoutUrgency * popularityWeight * 100) / 100;

            // predicted_demand: 실 연간 판매량을 4주 발주 주기로 환산(÷13)
            var predictedDemand = Math.Max(5, (int)Math.Round((s.AnnualSoldUnits / 13) * (0.85 + rand.NextDouble() * 0.3)));
            var recommendedQty = (int)Math.Round(predictedDemand * (1.05 + rand.NextDouble() * 0.25));

            var status = WeightedStatus(rand);
            var createdDaysAgo = rand.NextInt(0, 6);
            var createdHoursAgo = rand.NextInt(0, 23);
            var resolutionHours = rand.NextInt(1, 30);
            var createdAt = MockNow.AddDays(-createdDaysAgo).AddHours(-createdHoursAgo);

            var dailyAvg = Math.Max(1, s.AnnualSoldUnits / 365);
            var salesTrend = Enumerable.Range(0, 14)
                .Select(_ => Math.Max(0, (int)Math.Round(dailyAvg * (0.5 + rand.NextDouble()))))
                .ToList();

            result.Add(new ReorderRecommendation
            {
                Id = $"RR-{1000 + i}",
                SkuCode = s.SkuCode,
                StyleName = s.StyleName,
                CategoryCode = s.CategoryCode,
                ColorCode = s.ColorCode,
                Size = s.Size,
                PopularityTier = s.PopularityTier,
                RiskScore = riskScore,
                StockoutUrgency = Math.Round(stockoutUrgency * 100) / 100,
                PopularityWeight = Math.Round(popularityWeight * 100) / 100,
                PredictedDemand = predictedDemand,
                RecommendedQty = recommendedQty,
                Status = status,
                CreatedAt = createdAt,
                ResolvedAt = status == "Pending" ? null : createdAt.AddHours(resolutionHours),
                ApprovedBy = status == "Approved" ? "seoyeon.l@kakaostyle.com" : null,
                RejectionReason = status == "Rejected" ? "이번 시즌 컬러 단종 예정 — 재발주 보류" : null,
                AvailableQty = s.AvailableQty,
                ReservedQty = s.ReservedQty,
                SafetyStock = s.SafetyStock,
                ReorderPoint = s.ReorderPoint,
                SalesTrend = salesTrend,
            });
            i++;
        }
        return result;
    }

    private static string WeightedStatus(Mulberry32 rand)
    {
        var r = rand.NextDouble();
        double acc = 0;
        for (int i = 0; i < Statuses.Length; i++)
        {
            acc += StatusWeights[i];
            if (r <= acc) return Statuses[i];
        }
        return Statuses[^1];
    }
}
