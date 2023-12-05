using System.Collections.Generic;

namespace GreateRewardsService.Models
{
    public class UpdateProfile : BaseCRM
    {
        public UpdateProfile()
        {

        }

        public UpdateProfile(PostDataModel model) : base(model)
        {
            FilterByMemberID = model.FilterByMemberID;
            Password = model.Password;
            DynamicColumnLists = model.DynamicColumnLists;
            DynamicFieldLists = model.DynamicFieldLists;
            RunCampaign = model.RunCampaign;
            RewardToCardNo = model.RewardToCardNo;
            CampaignCode = model.CampaignCode;
            CampaignType = model.CampaignType;
            CheckQualificationRules = model.CheckQualificationRules;
            AcceptEmptyString = model.AcceptEmptyString;
        }
        public string FilterByMemberID { get; set; }
        public string Password { get; set; }
        public List<object> DynamicColumnLists { get; set; }
        public List<RequestDynamicFieldList> DynamicFieldLists { get; set; }
        public bool RunCampaign { get; set; }
        public string RewardToCardNo { get; set; }
        public string CampaignType { get; set; }
        public string CampaignCode { get; set; }
        public bool CheckQualificationRules { get; set; }
        public bool AcceptEmptyString { get; set; }
    }
}
