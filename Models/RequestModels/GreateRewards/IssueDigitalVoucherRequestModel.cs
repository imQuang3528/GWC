using System.Collections.Generic;

namespace GreateRewardsService.Models.RequestModels
{
    public class IssueDigitalVoucherRequestModel
    {
        public string OutletCode { get; set; }
        public string CardNo { get; set; }
        public string TransactionType { get; set; }
        public string PaymentMethod { get; set; }
        public string Remarks { get; set; }
        public string Src { get; set; }
        public bool RetrieveIssuedVouchersList { get; set; }
        public List<Voucher> Vouchers { get; set; }
    }

    public class Voucher
    {
        public string VoucherTypeCode { get; set; }
        public int Qty { get; set; }
    }
}