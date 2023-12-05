namespace GreateRewardsService.Models.RequestModels
{
    public class ResetPasswordRequestModel
    {
        public int Channel { get; set; }
        public string Identifier { get; set; }
    }
}