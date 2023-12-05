using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GreateRewardsService.Models.RequestModels
{
    public class GameRequestModel
    {
        public string ChanceValueTypeCode { get; set; }
        public int LuckyDipId { get; set; }
        public string ClientSeed { get; set; }
        public string GameCode { get; set; }
        public int Point { get; set; }
        public string AccessToken { get; set; }
    }
}