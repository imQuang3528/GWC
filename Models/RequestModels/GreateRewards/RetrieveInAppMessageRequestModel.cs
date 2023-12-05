using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GreateRewardsService.Models.RequestModels
{
    public class RetrieveInAppMessageRequestModel
    {
        public string DeviceUID { get; set; }
        public string AppName { get; set; }
        public string BlastID { get; set; }
        public string BlastHeaderID { get; set; }
        public string FilterFrom { get; set; }
        public string FilterTo { get; set; }
        public int MaxResultCount { get; set; }
        public int SkipCount { get; set; }
    }
}