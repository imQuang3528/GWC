using System.Web.Mvc;

namespace GreateRewardsService.Controllers
{
    public class GameController : Controller
    {
        // GET: Game
        public ActionResult Index()
        {
            return PartialView();
        }
    }
}