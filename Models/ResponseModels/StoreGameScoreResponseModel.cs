using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace GreateRewardsService.Models.ResponseModels
{
    public class StoreGameScoreResponseModel
    {
        public int Id { get; set; }
        public string MemberId { get; set; }
        public string GameId { get; set; }
        public float CurrentHighestScore { get; set; }
        public DateTime StartTimeGame { get; set; }
        public DateTime EndTimeGame { get; set; }
        public string CampaignCode { get; set; }
        public string MemberName { get; set; }
        public int Rank { get; set; }
    }
}