﻿using Microsoft.AspNetCore.Mvc;

namespace Kendo.Mvc.Examples.Controllers
{
    public partial class Area_ChartsController : Controller
    {
        [Demo]
        public IActionResult Stacked_Area()
        {
            return View();
        }
    }
}