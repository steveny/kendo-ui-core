﻿using Microsoft.AspNetCore.Mvc;

namespace Kendo.Mvc.Examples.Controllers
{
    public partial class ListViewController : Controller
    {
        [Demo]
        public ActionResult Right_To_Left_Support()
        {
            return View(GetProducts());
        }
    }
}