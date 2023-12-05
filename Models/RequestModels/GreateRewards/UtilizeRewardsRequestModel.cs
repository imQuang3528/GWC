using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GreateRewardsService.Models.RequestModels
{
    public class UtilizeRewardsRequestModel
    {
        public List<string> VoucherNo { get; set; }
        public string OutletCode { get; set; }
        public string ReceiptNo { get; set; }
    }
}