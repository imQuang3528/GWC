using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GreateRewardsService.Models.RequestModels
{
    public class UpdateDeviceInfoRequestModel
    {
        public string DeviceId { get; set; }
        public string DeviceToken { get; set; }
        public string DeviceModel { get; set; }
        public string AppName { get; set; }
        public string AppVersion { get; set; }
        public bool PushAlert { get; set; }
    }
}