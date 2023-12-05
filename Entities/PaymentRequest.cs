namespace GreateRewardsService.Entities
{
    public class PaymentRequest : BaseEntity
    {
        public string NetsMid { get; set; }
        public string Tid { get; set; }
        public string ClientType { get; set; }
        public string MobileOs { get; set; }
        public string SubmissionMode { get; set; }
        public decimal TxnAmount { get; set; }
        public string CurrencyCode { get; set; }
        public string MerchantTxnRef { get; set; }
        public string MerchantTxnDtm { get; set; }
        public string MerchantTimeZone { get; set; }
        public string PaymentType { get; set; }
        public string PaymentMode { get; set; }
        public string BankId { get; set; }
        public string NetsMidIndicator { get; set; }
        public string B2sTxnEndURL { get; set; }
        public string B2sTxnEndURLParam { get; set; }
        public string S2sTxnEndURL { get; set; }
        public string S2sTxnEndURLParam { get; set; }
        public string Pan { get; set; }
        public string Cvv { get; set; }
        public string ExpiryDate { get; set; }
        public string CardHolderName { get; set; }
        public string Cavv { get; set; }
        public string PurchaseXid { get; set; }
        public string Status { get; set; }
        public string Eci { get; set; }
        public string Param1 { get; set; }
        public string Param2 { get; set; }
        public string Param3 { get; set; }
        public string Param4 { get; set; }
        public string Param5 { get; set; }
        public string SupMsg { get; set; }
        public string Language { get; set; }
        public string IpAddress { get; set; }
    }
}