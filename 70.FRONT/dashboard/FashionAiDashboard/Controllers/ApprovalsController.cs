using Microsoft.AspNetCore.Mvc;
using FashionAiDashboard.Services;

namespace FashionAiDashboard.Controllers;

public class ApprovalsController : Controller
{
    private readonly SampleDataService _data;

    public ApprovalsController(SampleDataService data)
    {
        _data = data;
    }

    public IActionResult Index()
    {
        // risk_score 높은 순 정렬 — 실제 페이지네이션/필터는 다음 단계에서 추가
        var rows = _data.ReorderRecommendations.OrderByDescending(r => r.RiskScore).Take(20).ToList();
        return View(rows);
    }
}
