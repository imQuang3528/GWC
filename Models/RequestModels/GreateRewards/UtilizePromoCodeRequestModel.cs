using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GreateRewardsService.Models.RequestModels
{
    public class UtilizePromoCodeRequestModel
    {
        public string PromoCode { get; set; }
        public string PromoID { get; set; }
    }
}