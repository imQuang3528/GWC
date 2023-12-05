using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace GreateRewardsService.Entities
{
    public class GameScoreDetail
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Index("ScoreDetailIndex", IsUnique = true, Order = 1)]
        public int Id { get; set; }
        public string MemberId { get; set; }
        public string GameId { get; set; }
        public float Score { get; set; }
        public int Chance { get; set; }
        public DateTime StartTimeGame { get; set; }
        public DateTime EndTimeGame { get; set; }
    }
}