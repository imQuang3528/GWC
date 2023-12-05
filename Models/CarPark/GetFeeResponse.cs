namespace GreateRewardsService.Models.CarPark
{
    public class GetFeeResponse
    {
        public string cmd { get; set; }
        public string iu { get; set; }
        public string result { get; set; }
        public string entrytime { get; set; }
        public string exittime { get; set; }
        public string fee { get; set; }
        public string reason { get; set; }
        public string mall { get; set; }
    }
}