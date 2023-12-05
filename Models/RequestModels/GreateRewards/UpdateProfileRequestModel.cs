using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GreateRewardsService.Models.RequestModels
{
    public class UpdateProfileRequestModel
    {
        public string Surname { get; set; }
        public string MobileNo { get; set; }
        public string Gender { get; set; }
        public List<InterestGroupList> InterestGroupLists { get; set; }
        public List<MailingList> MailingLists { get; set; }
        public bool SmsSubscription { get; set; }
        public List<DynamicFieldList> DynamicFieldLists { get; set; }
        public DateTime Dob { get; set; }
        public string MemberID { get; set; }
        public string Email { get; set; }
        public string Name { get; set; }
        public string UserName { get; set; }
        public string PhoneNo { get; set; }
        public string Salutation { get; set; }
        public string MaritalStatus { get; set; }
        public string Nric { get; set; }
        public string Passport { get; set; }
        public string Nationality { get; set; }
        public string PostalCode { get; set; }
        public string Country { get; set; }
        public string IncomeGroupCode { get; set; }
        public string OccupationCode { get; set; }
        public string Address1 { get; set; }
        public string Address2 { get; set; }
        public string Address3 { get; set; }
        public string ContactNo { get; set; }
        public string FaxNo { get; set; }
        public string ReferrerCode { get; set; }
        public string FacebookID { get; set; }
        public string FullPhotoName { get; set; }
        public string CountryCode { get; set; }
        public string AreaCode { get; set; }
        public string ImageFileName { get; set; }
    }

    public class InterestGroupList
    {
        public string Name { get; set; }
    }

    public class MailingList
    {
        public string Name { get; set; }
    }

    public class DynamicFieldList
    {
        public string Name { get; set; }
        public string ColValue { get; set; }
        public string Type { get; set; }
    }
}