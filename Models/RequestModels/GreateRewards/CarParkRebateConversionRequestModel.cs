using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GreateRewardsService.Models.RequestModels
{
    public class CarParkRebateConversionRequestModel
    {
        public string MemberId { get; set; }
        public int PointsToBeConverted { get; set; }
    }
}