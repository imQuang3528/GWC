using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace GreateRewardsService.Entities
{
    public class GameScore
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Index("ScoreIndex", IsUnique = true,Order =1)]
        public int Id { get; set; }
        [Column(TypeName = "VARCHAR")]
        [StringLength(50)]
        [Index("MemberIndex",Order =2)]
        public string MemberId { get; set; }
        public string GameId { get; set; }
        public float CurrentHighestScore { get; set; }
        public DateTime StartTimeGame { get; set; }
        public DateTime EndTimeGame { get; set; }
        public string CampaignCode { get; set; }
        public string MemberName { get; set; }
    }
}