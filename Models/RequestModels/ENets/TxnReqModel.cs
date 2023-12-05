using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GreateRewardsService.Models
{
    public class TxnReqModel
    {
        public string CardHolderName { get; set; }
        public string CurrencyCode { get; set; }
        public string CVV { get; set; }
        public string ExpiryDate { get; set; }
        public string IpAddress { get; set; }
        public string TimeZone { get; set; }
        public string MerchantTxnDtm { get; set; }
        public string MerchantTxnRef { get; set; }
        public string ENetUMID { get; set; }
        public string CardNumber { get; set; }
        public string Tid { get; set; }
        public string Amount { get; set; }
        public string B2sTxnEndURL { get; set; }
        public string S2sTxnEndURL { get; set; }
    }
}