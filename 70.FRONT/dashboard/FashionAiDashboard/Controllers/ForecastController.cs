using Microsoft.AspNetCore.Mvc;
using FashionAiDashboard.Services;

namespace FashionAiDashboard.Controllers;

public class ForecastController : Controller
{
    private readonly SampleDataService _data;

    public ForecastController(SampleDataService data)
    {
        _data = data;
    }

    public IActionResult Index()
    {
        ViewBag.Series = _data.ForecastSeries;
        ViewBag.CategoryErrorRates = _data.CategoryErrorRates;
        ViewBag.Summary = _data.ForecastSummaryInfo;
        ViewBag.SkuErrors = _data.SkuErrors;
        return View();
    }
}
