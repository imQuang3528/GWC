using System.Collections.Generic;

namespace GreateRewardsService.Models
{
    public class PostDataModel
    {
        public string Command { get; set; }
        public string EnquiryCode { get; set; }
        public string OutletCode { get; set; }
        public string PosID { get; set; }
        public string CashierID { get; set; }
        public bool IgnoreCCNchecking { get; set; }
        public string MobileNo { get; set; }
        public string Email { get; set; }
        public string MemberID { get; set; }
        public string FilterCardsByStatus { get; set; }
        public bool MobileNoExactSearch { get; set; }
        public List<object> RequestDynamicColumnLists { get; set; }
        public List<RequestDynamicFieldList> RequestDynamicFieldLists { get; set; }
        public string CardNo { get; set; }
        public int AmtToCalculateAR { get; set; }
        public object CampaignProcessingDate { get; set; }
        public string CampaignType { get; set; }
        public string CampaignCode { get; set; }
        public bool CheckQualificationRules { get; set; }
        public bool RetrieveMembershipInfo { get; set; }
        public bool RetrieveIssuedVoucherLists { get; set; }
        public bool RetrieveActiveVouchersLists { get; set; }
        public string FilterByMemberID { get; set; }
        public string Password { get; set; }
        public List<object> DynamicColumnLists { get; set; }
        public List<RequestDynamicFieldList> DynamicFieldLists { get; set; }
        public bool RunCampaign { get; set; }
        public string RewardToCardNo { get; set; }
        public bool AcceptEmptyString { get; set; }

        public string EmailTemplateName { get; set; }
    }
}
