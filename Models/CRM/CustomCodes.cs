using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;

namespace GreateRewardsService.Models.CRM
{
    public class CustomCodeModel
    {
        public CustomCodeModel()
        {

        }
        public CustomCodeModel(GetCustomCodeRequet model)
        {
            Command = model.Command;
            EnquiryCode = ConfigurationManager.AppSettings[Constants.AppSettingKeys.CRM_Enquiry_Code];
            OutletCode = ConfigurationManager.AppSettings[Constants.AppSettingKeys.CRM_Outlet_Code];
            PosID = ConfigurationManager.AppSettings[Constants.AppSettingKeys.CRM_Pos_ID];
            CashierID = ConfigurationManager.AppSettings[Constants.AppSettingKeys.CRM_Cashier_ID];
            IgnoreCCNchecking = ConfigurationManager.AppSettings[Constants.AppSettingKeys.CRM_Ignore_CCNchecking] == "true";
            ParentCode = model.ParentCode;
        }
        public string Command { get; set; }
        public string EnquiryCode { get; set; }
        public string OutletCode { get; set; }
        public string PosID { get; set; }
        public string CashierID { get; set; }
        public bool IgnoreCCNchecking { get; set; }
        public string ParentCode { get; set; }
    }

    public class GetCustomCodeRequet
    {
        public string Command { get; set; }
        public string ParentCode { get; set; }
    }
}