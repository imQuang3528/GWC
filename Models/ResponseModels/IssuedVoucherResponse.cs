using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GreateRewardsService.Models.ResponseModels
{
    public class IssuedVoucherResponse
    {
        public int TotalIssuedVoucherCount { get; set; }
        public List<VoucherResponse> IssuedVoucherLists { get; set; }
        public bool MinusChance { get; set; }
        [JsonIgnore]
        public bool Success { get; set; }
        [JsonIgnore]
        public string Message { get; set; }
    }
}