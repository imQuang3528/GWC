using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GreateRewardsService.Models.RequestModels
{
    public class PlayGameRequestModel
    {
        public string Token { get; set; }
        public string ChanceValueTypeCode { get; set; }
        public int LuckyDipId { get; set; }
        public string ClientSeed { get; set; }
    }
}