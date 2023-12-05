using System.Configuration;

namespace GreateRewardsService.Models
{
    public class BaseCRM
    {
        public BaseCRM(PostDataModel model)
        {
            Command = model.Command;
            EnquiryCode = ConfigurationManager.AppSettings[Constants.AppSettingKeys.CRM_Enquiry_Code];
            OutletCode = ConfigurationManager.AppSettings[Constants.AppSettingKeys.CRM_Outlet_Code];
            PosID = ConfigurationManager.AppSettings[Constants.AppSettingKeys.CRM_Pos_ID];
            CashierID = ConfigurationManager.AppSettings[Constants.AppSettingKeys.CRM_Cashier_ID];
            IgnoreCCNchecking = ConfigurationManager.AppSettings[Constants.AppSettingKeys.CRM_Ignore_CCNchecking] == "true";
        }

        public BaseCRM()
        {

        }
        public string Command { get; set; }
        public string EnquiryCode { get; set; }
        public string OutletCode { get; set; }
        public string PosID { get; set; }
        public string CashierID { get; set; }
        public bool IgnoreCCNchecking { get; set; }
    }
}
