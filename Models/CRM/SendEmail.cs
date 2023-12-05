namespace GreateRewardsService.Models
{
    public class SendEmail : BaseCRM
    {
        public SendEmail(PostDataModel model) : base(model)
        {
            CardNo = model.CardNo;
            MemberID = model.MemberID;
            Email = model.Email;
            EmailTemplateName = model.EmailTemplateName;
        }

        public SendEmail()
        {

        }
        public string CardNo { get; set; }
        public string MemberID { get; set; }
        public string Email { get; set; }
        public string EmailTemplateName { get; set; }
    }
}
