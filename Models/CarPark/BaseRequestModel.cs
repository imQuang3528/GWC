using Newtonsoft.Json;

namespace GreateRewardsService.Models
{
    public class BaseRequestModel
    {
        public string Cmd { get; set; }
        public string Ticketno { get; set; }
        public string Accesscode { get; set; }
        public string Iucardno { get; set; }

        [JsonProperty("tickettype ")]
        public string Tickettype { get; set; }
        public string Ticketvalue { get; set; }
        public string Iu { get; set; }
        public string Time { get; set; }
        public string Key { get; set; }
        public string Debug { get; set; }
    }
}