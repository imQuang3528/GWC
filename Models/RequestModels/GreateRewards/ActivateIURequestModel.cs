using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GreateRewardsService.Models.RequestModels
{
    public class ActivateIURequestModel
    {
        public List<IuList> IuList { get; set; }
    }
    public class IuList
    {
        public string Iu { get; set; }
        public string VehicleNo { get; set; }
        public bool Activate { get; set; }
    }
}