using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using FashionAiDashboard.Models;
using FashionAiDashboard.Services;

namespace FashionAiDashboard.Controllers;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;
    private readonly SampleDataService _data;

    public HomeController(ILogger<HomeController> logger, SampleDataService data)
    {
        _logger = logger;
        _data = data;
    }

    public IActionResult Index()
    {
        // 30.DATA/32.nqnq_data 실 카탈로그 기반 샘플 데이터 (SampleDataService) — React mockData.js 이식
        var recs = _data.ReorderRecommendations;
        var mockToday = new DateTime(2026, 9, 8); // React MOCK_NOW와 동일 기준일 — 실제 배포 시 DateTime.Now로 교체
        var pending = recs.Count(r => r.Status == "Pending");
        var approvedToday = recs.Count(r => r.Status == "Approved" && r.CreatedAt.Date == mockToday);
        var approved = recs.Count(r => r.Status == "Approved");
        var rejected = recs.Count(r => r.Status == "Rejected");
        var rejectionRate = approved + rejected == 0 ? 0 : (double)rejected / (approved + rejected) * 100;

        var model = new HomeStatsViewModel
        {
            KpiCards = new List<StatCard>
            {
                new() { Label = "대기중 발주추천", Value = pending.ToString(), Unit = "건" },
                new() { Label = "오늘 승인 건수", Value = approvedToday.ToString(), Unit = "건" },
                new() { Label = "반려율", Value = rejectionRate.ToString("F1"), Unit = "%", Tone = rejectionRate > 20 ? "bad" : "neutral" },
                new() { Label = "전체 발주추천", Value = recs.Count.ToString(), Unit = "건" },
            },
        };
        return View(model);
    }

    public IActionResult Privacy()
    {
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
