using System.Collections.Generic;

namespace GreateRewardsService.Models.ResponseModels
{
    public class MemberEnquiryResponse
    {
        public List<MemberList> MemberLists { get; set; }
        public List<CardList> CardLists { get; set; }
        public List<MembershipMovementHistory> MembershipMovementHistory { get; set; }
        public int TotalCardCounts { get; set; }
        public int ReturnStatus { get; set; }
        public string ReturnMessage { get; set; }
        public string RequestTime { get; set; }
        public string ResponseTime { get; set; }
    }

    public class MemberList
    {
        public List<DynamicFieldList> DynamicFieldLists { get; set; }
    }

    public class CardList
    {
        public string CardNo { get; set; }
        public string MemberID { get; set; }
        public string TierCode { get; set; }
        public string MembershipStatusCode { get; set; }
    }

    public class DynamicFieldList
    {
        public string Name { get; set; }
        public string ColValue { get; set; }
    }

    public class MembershipMovementHistory
    {
        public string CardNo { get; set; }
    }
}