using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GreateRewardsService.Models.RequestModels
{
    public class ChangePasswordRequestModel
    {
        public string CurrentPassword { get; set; }
        public string NewPassword { get; set; }
    }
}