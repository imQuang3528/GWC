using System.Configuration;

namespace GreateRewardsService.Models.RequestModels
{
    public class VendorAuthenticateRequestModel
    {
        public VendorAuthenticateRequestModel(bool isVendor)
        {
            if (isVendor)
            {
                UserNameOrEmailAddress = ConfigurationManager.AppSettings[Constants.AppSettingKeys.MMS_V_Username];
                Password = ConfigurationManager.AppSettings[Constants.AppSettingKeys.MMS_V_Password];
            }
            else
            {
                UserNameOrEmailAddress = ConfigurationManager.AppSettings[Constants.AppSettingKeys.MMS_M_Username];
                Password = ConfigurationManager.AppSettings[Constants.AppSettingKeys.MMS_M_Password];
            }
            RememberClient = true;
        }
        public string UserNameOrEmailAddress { get; set; }
        public string Password { get; set; }
        public bool RememberClient { get; set; }
    }
}