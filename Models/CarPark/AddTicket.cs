using Newtonsoft.Json;

namespace GreateRewardsService.Models
{
    public class AddTicket
    {
        public string Cmd { get; set; }
        public string Ticketno { get; set; }

        [JsonProperty("tickettype ")]
        public string Tickettype { get; set; }
        public string Ticketvalue { get; set; }
        public string Iucardno { get; set; }
        public string Accesscode { get; set; }
    }
}