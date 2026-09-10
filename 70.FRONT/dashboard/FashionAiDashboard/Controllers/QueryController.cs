using Microsoft.AspNetCore.Mvc;

namespace FashionAiDashboard.Controllers;

public class QueryController : Controller
{
    public IActionResult Index() => View();
}
