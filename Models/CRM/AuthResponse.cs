namespace GreateRewardsService.Models
{
    public class GraphQlAuthResponse
    {
        public string Access_token { get; set; }
        public int Expires_in { get; set; }
        public string Token_type { get; set; }
    }

    public class AuthResponse : GraphQlAuthResponse
    {
        public string Scope { get; set; }
    }

    public class RewardCampaignResponse
    {
        public int ReturnStatus { get; set; }
        public string ReturnMessage { get; set; }
    }
}