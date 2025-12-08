using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using PMS.Models;

namespace PMS.Controllers;

// This route attribute removes the 'views' prefix in the url to access the views
[Route("")]
public class ViewsController : Controller
{
    [Route("")]
    public IActionResult Index()
    {
        // Target Controller is ViewsController and action is Projects
        return RedirectToAction("Projects", "Views");
    }

    [Route("/projects")]
    public IActionResult Projects()
    {
        return View("~/Views/Projects.cshtml");
    }

    [Route("/projects/{projectID:int}")]
    public IActionResult ProjectTasks(int projectID)
    {
        ViewBag.ProjectID = projectID;
        return View("~/Views/ProjectTasks.cshtml");
    }

    [Route("/projects/{projectId:int}/tasks/{taskID:int}")]
    public IActionResult Task(int projectID, int taskID)
    {
        ViewBag.ProjectID = projectID;
        ViewBag.TaskID = taskID;
        return View("~/Views/Task.cshtml");
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    [Route("/error")]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
