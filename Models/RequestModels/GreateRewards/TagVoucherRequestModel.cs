using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GreateRewardsService.Models.RequestModels
{
    public class TagVoucherRequestModel
    {
        public List<string> VoucherNo { get; set; }
        public string Ref3 { get; set; }
        public bool ReplaceExisting { get; set; }
    }
}