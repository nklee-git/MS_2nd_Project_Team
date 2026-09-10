using Microsoft.AspNetCore.Mvc;
using FashionAiDashboard.Services;

namespace FashionAiDashboard.Controllers;

public class QueryController : Controller
{
    private readonly SampleDataService _data;

    public QueryController(SampleDataService data)
    {
        _data = data;
    }

    public IActionResult Index(string? chip)
    {
        var chips = _data.QueryChips;
        var selected = chips.FirstOrDefault(c => c.Id == chip) ?? chips[0];

        ViewBag.Chips = chips;
        ViewBag.Selected = selected;
        ViewBag.TopRiskSkus = _data.TopRiskSkus;
        return View();
    }

    public IActionResult ExportCsv(string chip)
    {
        var selected = _data.QueryChips.FirstOrDefault(c => c.Id == chip);
        if (selected == null) return NotFound();

        var sb = new System.Text.StringBuilder();
        if (selected.Id == "top-risk-sku")
        {
            sb.AppendLine("sku_code,style_name,risk_score,recommended_qty");
            foreach (var r in _data.TopRiskSkus)
                sb.AppendLine($"{r.SkuCode},{r.StyleName},{r.RiskScore:F2},{r.RecommendedQty}");
        }
        else
        {
            sb.AppendLine("category,value");
            foreach (var (category, value) in selected.BarResult)
                sb.AppendLine($"{category},{value}");
        }

        var bytes = new System.Text.UTF8Encoding(true).GetBytes(sb.ToString());
        return File(bytes, "text/csv", $"{selected.Id}.csv");
    }
}
