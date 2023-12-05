using System;
using System.Collections.Generic;

namespace GreateRewardsService.Models.RequestModels
{
    public class RegisterRequestModel
    {
        public string UserName { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public string Nric { get; set; }
        public string Email { get; set; }
        public string ContactNo { get; set; }
        public string MobileNo { get; set; }
        public string Password { get; set; }
        public string Gender { get; set; }
        public string Salutation { get; set; }
        public string Nationality { get; set; }
        public string MaritalStatus { get; set; }
        public string Passport { get; set; }
        public string Country { get; set; }
        public string IncomeGroupCode { get; set; }
        public string OccupationCode { get; set; }
        public string Address1 { get; set; }
        public string Address2 { get; set; }
        public string Address3 { get; set; }
        public string PostalCode { get; set; }
        public string CountryCode { get; set; }
        public string AreaCode { get; set; }
        public List<MailingSubscription> MailingSubscriptions { get; set; }
        public bool SmsSubscription { get; set; }
        public DateTime Dob { get; set; }
        public List<object> InterestGroupLists { get; set; }
        public List<object> DynamicFieldLists { get; set; }
        public string SignupLocationCode { get; set; }
        public string CampaignCode { get; set; }
        public string CampaignType { get; set; }
        public string PromotionCode { get; set; }
        public string CardNo { get; set; }
        public string ReferralCode { get; set; }
    }

    public class MailingSubscription
    {
        public string Name { get; set; }
    }
}