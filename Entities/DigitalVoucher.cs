using System.Collections.Generic;

namespace GreateRewardsService.Entities
{
    public class DigitalVoucher : BaseEntity
    {
        public string OutletCode { get; set; }
        public string CardNo { get; set; }
        public string TransactionType { get; set; }
        public string PaymentMethod { get; set; }
        public string Src { get; set; }
        public virtual ICollection<Voucher> Vouchers { get; set; }
    }
}