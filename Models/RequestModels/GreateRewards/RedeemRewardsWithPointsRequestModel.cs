using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GreateRewardsService.Models.RequestModels
{
    public class RedeemRewardsWithPointsRequestModel
    {
        public List<Reward> Rewards { get; set; }
        public bool RetrieveIssuedVouchersList { get; set; }
    }
    public class Reward
    {
        public string RewardId { get; set; }
        public int Quantity { get; set; }
    }
}