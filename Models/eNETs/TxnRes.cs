namespace GreateRewardsService.Models
{
    public class TxnRes1
    {
        public string KeyId { get; set; }
        public string Hmac { get; set; }
        public string Message { get; set; }
    }

    public class TxnRes
    {
        public string Ss { get; set; }
        public Msg Msg { get; set; }
    }

    public class Msg
    {
        public string NetsMid { get; set; }
        public string MerchantTxnRef { get; set; }
        public string NetsMidIndicator { get; set; }
        public string NetsTxnRef { get; set; }
        public string PaymentMode { get; set; }
        public string SubmissionMode { get; set; }
        public string CurrencyCode { get; set; }
        public string MerchantTxnDtm { get; set; }
        public string MerchantTimeZone { get; set; }
        public string PaymentType { get; set; }
        public string B2sTxnEndURLParam { get; set; }
        public string S2sTxnEndURLParam { get; set; }
        public string ClientType { get; set; }
        public string MaskPan { get; set; }
        public string BankAuthId { get; set; }
        public string StageRespCode { get; set; }
        public string TxnRand { get; set; }
        public string ActionCode { get; set; }
        public string NetsTxnDtm { get; set; }
        public string NetsTimeZone { get; set; }
        public string NetsTxnStatus { get; set; }
        public string NetsTxnMsg { get; set; }
        public int NetsAmountDeducted { get; set; }
    }
}