using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GreateRewardsService.Models.RequestModels
{
    public class ContactUsRequestModel
    {
        public string Message { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Mobile { get; set; }
        public string Enquiry { get; set; }
        public string Mall { get; set; }
        public string EmailNotificationTemplate { get; set; }
        public string Source { get; set; }
    }
}