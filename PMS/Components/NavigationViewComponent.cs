using Microsoft.AspNetCore.Mvc;

namespace PMS.Components;

public class NavigationViewComponent : ViewComponent
{
    public IViewComponentResult Invoke()
    {
        return View();
    }
}

