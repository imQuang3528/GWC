using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GreateRewardsService.Models.RequestModels
{
    public class CarParkBalanceEnquiryRequestModel
    {
        public string Iu { get; set; }
        public string Vehicle { get; set; }
        public string CarParkLocation { get; set; }
        public string CarParkCode { get; set; }
    }
}