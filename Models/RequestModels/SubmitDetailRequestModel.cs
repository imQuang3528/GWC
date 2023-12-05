using System.Collections.Generic;

namespace GreateRewardsService.Models.RequestModels
{
    public class SubmitDetailRequestModel
    {
        public string Reference { get; set; }
        public string MemberQrCode { get; set; }
        public string Points { get; set; }
        public List<string> VoucherList { get; set; }
    }
}