using System;

namespace GreateRewardsService.Entities
{
    public class Payment : BaseEntity
    {
        public Guid PaymentRequestId { get; set; }
        public Guid? PaymentResponseId { get; set; }
        public Guid DigitalVoucherId { get; set; }
        public virtual PaymentRequest PaymentRequest { get; set; }
        public virtual PaymentResponse PaymentResponse { get; set; }
        //public virtual DigitalVoucher DigitalVoucher { get; set; }
        public string TransactionStatus { get; set; }
    }
}