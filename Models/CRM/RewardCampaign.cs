namespace GreateRewardsService.Models
{
    public class RewardCampaign : BaseCRM
    {
        public RewardCampaign(PostDataModel model) : base(model)
        {
            CardNo = model.CardNo;
            AmtToCalculateAR = model.AmtToCalculateAR;
            CampaignCode = model.CampaignCode;
            CampaignProcessingDate = model.CampaignProcessingDate;
            CampaignType = model.CampaignType;
            CheckQualificationRules = model.CheckQualificationRules;
            RetrieveActiveVouchersLists = model.RetrieveActiveVouchersLists;
            RetrieveIssuedVoucherLists = model.RetrieveIssuedVoucherLists;
            RetrieveMembershipInfo = model.RetrieveMembershipInfo;
        }

        public RewardCampaign()
        {

        }
        public string CardNo { get; set; }
        public int AmtToCalculateAR { get; set; }
        public object CampaignProcessingDate { get; set; }
        public string CampaignType { get; set; }
        public string CampaignCode { get; set; }
        public bool CheckQualificationRules { get; set; }
        public bool RetrieveMembershipInfo { get; set; }
        public bool RetrieveIssuedVoucherLists { get; set; }
        public bool RetrieveActiveVouchersLists { get; set; }
    }
}
