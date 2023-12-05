using System.Collections.Generic;

namespace GreateRewardsService.Models.ResponseModels
{
    public class TransactionStatus
    {
        public string Status { get; set; }
        public List<IssuedVoucher> Vouchers { get; set; }
    }

    public class IssuedVoucher
    {
        public string VoucherTypeCode { get; set; }
        public string Type { get; set; }
        public List<string> VoucherNo { get; set; }
    }
}