using System.Collections.Generic;

namespace GreateRewardsService.Models.ResponseModels
{
    public class DigitalVouchersResponseModel
    {
        public int TotalCount { get; set; }
        public List<Item> Items { get; set; }
    }

    public class RefInfo
    {
        public string Ref1 { get; set; }
        public string Ref2 { get; set; }
        public string Ref3 { get; set; }
        public string Ref4 { get; set; }
        public string Ref5 { get; set; }
        public string Ref6 { get; set; }
        public string Ref7 { get; set; }
    }

    public class Item
    {
        public string Code { get; set; }
        public int Quantity { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Type { get; set; }
        public string TypeValue { get; set; }
        public string PromoMsg { get; set; }
        public bool IsReusable { get; set; }
        public bool IsBirthdayVoucher { get; set; }
        public bool IsCampaignVoucher { get; set; }
        public bool IsRedeemable { get; set; }
        public double VoucherRedemptionValue { get; set; }
        public bool IsMinSpendingReq { get; set; }
        public double MinSpendingValue { get; set; }
        public string FullImageName { get; set; }
        public string Base64ImageString { get; set; }
        public string ImageLink { get; set; }
        public string Remarks { get; set; }
        public string PointUsageType { get; set; }
        public string TnC { get; set; }
        public int IssuanceLimit { get; set; }
        public string IssuanceLimitPeriodType { get; set; }
        public int CurrentIssuedCount { get; set; }
        public int RedemptionLimit { get; set; }
        public string RedemptionLimitPeriodType { get; set; }
        public int CurrentRedeemedCount { get; set; }
        public RefInfo RefInfo { get; set; }
        public string ActiveDaysOfWeek { get; set; }
        public string MembershipTypeEligibility { get; set; }
        public string MembershipTierEligibility { get; set; }
        public List<object> OutletCostsLists { get; set; }
        public string Category { get; set; }
        public string SubCategory { get; set; }
        public int LifeTimeIssuanceLimit { get; set; }
        public int LifeTimeRedemptionLimit { get; set; }
        public int LifetimeIssuedCount { get; set; }
        public int LifetimeRedeemedCount { get; set; }
        public bool IsReserved { get; set; }
        public string VoucherData { get; set; }
        public double SellingPrice { get; set; }
    }
}