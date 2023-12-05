namespace GreateRewardsService.Entities
{
    public class PaymentResponse : BaseEntity
    {
        public string NetsMid { get; set; }
        public string Tid { get; set; }
        public int NetsAmountDeducted { get; set; }
        public string CurrencyCode { get; set; }
        public string PaymentType { get; set; }
        public string PaymentMode { get; set; }
        public string NetsMidIndicator { get; set; }
        public string B2sTxnEndURLParam { get; set; }
        public string S2sTxnEndURLParam { get; set; }
        public string MerchantTxnRef { get; set; }
        public string MerchantTxnDtm { get; set; }
        public string MerchantTimeZone { get; set; }
        public string NetsTxnRef { get; set; }
        public string NetsTxnDtm { get; set; }
        public string NetsTxnStatus { get; set; }
        public string ActionCode { get; set; }
        public string StageRespCode { get; set; }
        public string NetsTxnMsg { get; set; }
        public string BankAuthId { get; set; }
        public string MaskPan { get; set; }
        public string TxnRand { get; set; }
        public string NetsValueDate { get; set; }
        public string BankId { get; set; }
        public string BankRefCode { get; set; }
        public string Eci { get; set; }
        public string Pareq { get; set; }
        public string TermUrl { get; set; }
        public string Md { get; set; }
        public string AcsUrl { get; set; }
        public string Param1 { get; set; }
        public string Param2 { get; set; }
        public string Param3 { get; set; }
        public string Param4 { get; set; }
        public string Param5 { get; set; }
        public string SubmissionMode { get; set; }
        public string ClientType { get; set; }
        public string NetsTimeZone { get; set; }
    }
}