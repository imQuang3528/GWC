using System.Collections.Generic;

namespace GreateRewardsService.Models
{
    public class MemberEnquiry : BaseCRM
    {
        public MemberEnquiry(PostDataModel model) : base(model)
        {
            MobileNo = model.MobileNo;
            Email = model.Email;
            MemberID = model.MemberID;
            FilterCardsByStatus = model.FilterCardsByStatus;
            MobileNoExactSearch = model.MobileNoExactSearch;
            RequestDynamicColumnLists = model.RequestDynamicColumnLists;
            RequestDynamicFieldLists = model.RequestDynamicFieldLists;
        }
        public MemberEnquiry()
        {

        }
        public string MobileNo { get; set; }
        public string Email { get; set; }
        public string MemberID { get; set; }
        public string FilterCardsByStatus { get; set; }
        public bool MobileNoExactSearch { get; set; }
        public List<object> RequestDynamicColumnLists { get; set; }
        public List<RequestDynamicFieldList> RequestDynamicFieldLists { get; set; }
    }

    public class RequestDynamicFieldList
    {
        public string Name { get; set; }
        public string ColValue { get; set; }
    }
}
