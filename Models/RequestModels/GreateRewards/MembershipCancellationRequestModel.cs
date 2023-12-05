using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GreateRewardsService.Models.RequestModels
{
    public class MembershipCancellationRequestModel
    {
        public bool SendNotification { get; set; }
        public int NotificationChannel { get; set; }
    }
}