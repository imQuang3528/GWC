using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GreateRewardsService.Models.ResponseModels
{
    public class PlayGameResponse
    {
        public int PrizeType { get; set; }
        public string PrizeTypeValue { get; set; }
        public string DisplayName { get; set; }
        public int Quantity { get; set; }
    }
}