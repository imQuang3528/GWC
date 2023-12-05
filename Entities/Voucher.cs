using System;

namespace GreateRewardsService.Entities
{
    public class Voucher : BaseEntity
    {
        public string VoucherTypeCode { get; set; }
        public string VoucherType { get; set; }
        public int Qty { get; set; }
        public string VoucherNo { get; set; }
        public Guid DigitalVoucherId { get; set; }
        public virtual DigitalVoucher DigitalVoucher { get; set; }
    }
}