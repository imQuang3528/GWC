using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GreateRewardsService.Models.ResponseModels
{
    public class VoucherResponse
    {
        public string VoucherNo { get; set; }
        public string VoucherTypeCode { get; set; }
        public string VoucherTypeName { get; set; }
        public string VoucherTypeDescription { get; set; }
        public int TypeValue { get; set; }
    }
}