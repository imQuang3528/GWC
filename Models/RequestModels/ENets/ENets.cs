using GreateRewardsService.Entities;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;

namespace GreateRewardsService.Models
{
    public class Enets
    {
        public string Environment { get; set; }
        public string TransactionDate { get; set; }
        public string TimeZone { get; set; }
        public string UMID { get; set; }
        public string TID { get; set; }
        public string SecretKey { get; set; }
        public string KeyID { get; set; }
        public string Currency { get; set; }
        public decimal Amount { get; set; }
        public string MerchantReference { get; set; }
        public string ReturnURL { get; set; }
        public string ReturnURLParam { get; set; }
        public string NotifyURL { get; set; }
        public string NotifyURLParam { get; set; }
        public string SubmissionMode = "B";
        public string PaymentType = "SALE";
        public string PaymentMode { get; set; }
        public string ClientType = "W";
        public string MIDIndicator = "U";
        public string MobileOS { get; set; }
        public string Language = "en";
        public string IPAddress { get; set; }
        public string CardHolderName { get; set; }
        public string Pan { get; set; }
        public string ExpiryDate { get; set; }
        public string CVV { get; set; }

        public string XID { get; set; }
        public string CAVV { get; set; }
        public string ECI { get; set; }
        public string AuthenticationStatus { get; set; }
        public string Pareq { get; set; }
        public string TermUrl { get; set; }
        public string MD { get; set; }
        public string ACSUrl { get; set; }
        public string NetsReference { get; set; }
        public string NetsStatus { get; set; }
        public string NetsMessage { get; set; }
        public DateTime AuthorizationDate { get; set; }
        public decimal AuthorizationAmount { get; set; }
        public string AuthorizationCode { get; set; }
        public string StageResponseCode { get; set; }
        public string TransactionRandom { get; set; }
        public string ActionCode { get; set; }

        public readonly DateTime UnixEpoch = new DateTime(1970, 1, 1);

        public Enets()
        {
        }

        public PaymentRequest ToPaymentRequest()
        {
            return new PaymentRequest
            {
                B2sTxnEndURL = ReturnURL,
                B2sTxnEndURLParam = ReturnURLParam,
                CardHolderName = CardHolderName,
                Cavv = CAVV,
                ClientType = ClientType,
                CurrencyCode = Currency,
                Cvv = CVV,
                Eci = ECI,
                ExpiryDate = ExpiryDate,
                IpAddress = IPAddress,
                Language = Language,
                MerchantTimeZone = TimeZone,
                MerchantTxnDtm = TransactionDate,
                MerchantTxnRef = MerchantReference,
                NetsMid = UMID,
                NetsMidIndicator = MIDIndicator,
                Pan = Pan,
                PaymentMode = PaymentMode,
                PaymentType = PaymentType,
                PurchaseXid = XID,
                S2sTxnEndURL = NotifyURL,
                S2sTxnEndURLParam = NotifyURLParam,
                SubmissionMode = SubmissionMode,
                SupMsg = NetsMessage,
                Tid = TID,
                TxnAmount = Amount
            };
        }

        public string GetHmac(string request_payload)
        {
            string payload = request_payload;
            string hashstring = GetHashString(request_payload + SecretKey);
            string base64string = Convert.ToBase64String(StringToByteArray(hashstring));
            return base64string;
        }

        public string GetPayload(Dictionary<string, string> request)
        {
            Dictionary<string, object> payload = new Dictionary<string, object>
            {
                { "ss", "1" },
                { "msg", request }
            };
            string json_payload = JsonConvert.SerializeObject(payload);
            return json_payload;
        }

        public Dictionary<string, string> GetPaymentRequest()
        {
            Dictionary<string, string> request = new Dictionary<string, string>();
            if (!string.IsNullOrEmpty(UMID))
            {
                request.Add("netsMid", UMID);
            }
            else
            {
                throw new Exception("umid is mandatory in the payload");
            }
            request.Add("tid", TID);
            if (!string.IsNullOrEmpty(SubmissionMode))
            {
                request.Add("submissionMode", SubmissionMode);
            }
            else
            {
                throw new Exception("submission_mode is mandatory in the payload");
            }
            if (!string.IsNullOrEmpty(Currency))
            {
                request.Add("currencyCode", Currency);
            }
            else
            {
                throw new Exception("currency is mandatory in the payload");
            }
            if (Amount > 0)
            {
                request.Add("txnAmount", (Amount * 100).ToString("00"));
            }
            else
            {
                throw new Exception("amount is mandatory in the payload");
            }
            if (!string.IsNullOrEmpty(MerchantReference))
            {
                request.Add("merchantTxnRef", MerchantReference);
            }
            else
            {
                throw new Exception("merchant_reference is mandatory in the payload");
            }
            if (!string.IsNullOrEmpty(TransactionDate))
            {
                request.Add("merchantTxnDtm", TransactionDate);
            }
            else
            {
                throw new Exception("transaction_date is mandatory in the payload");
            }
            if (!string.IsNullOrEmpty(TimeZone))
            {
                request.Add("merchantTimeZone", TimeZone);
            }
            else
            {
                throw new Exception("time_zone is mandatory in the payload");
            }
            if (!string.IsNullOrEmpty(PaymentType))
            {
                if (!string.IsNullOrEmpty(PaymentMode) && (PaymentMode == "DD" || PaymentMode == "QR") && PaymentType != "SALE")
                {
                    throw new Exception("payment_type value must be set to 'SALE' for direct debit or qr code payment mode");
                }
                request.Add("paymentType", PaymentType);
            }
            else
            {
                throw new Exception("payment_type is mandatory in the payload");
            }
            if (!string.IsNullOrEmpty(PaymentMode))
            {
                request.Add("paymentMode", PaymentMode);
            }
            if (!string.IsNullOrEmpty(ReturnURL))
            {
                request.Add("b2sTxnEndURL", ReturnURL);
            }
            else
            {
                if (!string.IsNullOrEmpty(SubmissionMode) && SubmissionMode != "B")
                {
                    throw new Exception("return_url is mandatory in the payload for non server to server submission type");
                }
            }
            if (!string.IsNullOrEmpty(ReturnURLParam))
            {
                request.Add("b2sTxnEndURLParam", ReturnURLParam);
            }
            if (!string.IsNullOrEmpty(NotifyURL))
            {
                request.Add("s2sTxnEndURL", NotifyURL);
            }
            else
            {
                if (!string.IsNullOrEmpty(SubmissionMode) && SubmissionMode != "B")
                {
                    throw new Exception("notify_url is mandatory in the payload for non server to server submission type");
                }
            }
            if (!string.IsNullOrEmpty(NotifyURLParam))
            {
                request.Add("s2sTxnEndURLParam", NotifyURLParam);
            }
            if (!string.IsNullOrEmpty(ClientType))
            {
                request.Add("clientType", ClientType);
            }
            else
            {
                if (!string.IsNullOrEmpty(SubmissionMode) && SubmissionMode == "B")
                {
                    throw new Exception("client_type is mandatory in the payload for non server to server submission type");
                }
            }
            if (!string.IsNullOrEmpty(MIDIndicator))
            {
                request.Add("netsMidIndicator", MIDIndicator);
            }
            if (!string.IsNullOrEmpty(MobileOS))
            {
                request.Add("mobileOs", MobileOS);
            }
            else
            {
                if (!string.IsNullOrEmpty(ClientType) && ClientType == "S")
                {
                    throw new Exception("mobile_os is mandatory in the payload for SDK client type");
                }
            }
            if (!string.IsNullOrEmpty(IPAddress))
            {
                request.Add("ipAddress", IPAddress);
            }
            if (!string.IsNullOrEmpty(Language))
            {
                request.Add("language", Language);
            }
            if (!string.IsNullOrEmpty(CardHolderName))
            {
                request.Add("cardholderName", CardHolderName);
            }
            else
            {
                if (!string.IsNullOrEmpty(SubmissionMode) && SubmissionMode == "S" && PaymentType == "SALE")
                {
                    throw new Exception("cardholder_name is mandatory in the payload for SALE or AUTH payment type on non server to server submission type");
                }
            }
            if (!string.IsNullOrEmpty(Pan))
            {
                request.Add("pan", Pan);
            }
            else
            {
                if (!string.IsNullOrEmpty(SubmissionMode) && SubmissionMode == "S" && PaymentType == "SALE")
                {
                    throw new Exception("pan is mandatory in the payload  for SALE or AUTH payment type on non server to server submission type");
                }
            }
            if (!string.IsNullOrEmpty(ExpiryDate))
            {
                request.Add("expiryDate", ExpiryDate);
            }
            if (!string.IsNullOrEmpty(CVV))
            {
                request.Add("cvv", CVV);
            }
            if (!string.IsNullOrEmpty(XID))
            {
                request.Add("purchaseXid", XID);
            }
            if (!string.IsNullOrEmpty(CAVV))
            {
                request.Add("cavv", CAVV);
            }
            else
            {
                if (!string.IsNullOrEmpty(AuthenticationStatus) && "AuthenticationStatus" == "Y" || "AuthenticationStatus" == "A")
                {
                    throw new Exception("cavv is mandatory in the payload  for successful or attempted 3ds authentication_status");
                }
            }
            if (!string.IsNullOrEmpty(ECI))
            {
                request.Add("eci", ECI);
            }
            if (!string.IsNullOrEmpty(AuthenticationStatus))
            {
                request.Add("status", AuthenticationStatus);
            }
            request.Add("supMsg", "");
            return request;
        }

        public static byte[] GetSHA256Hash(string inputString)
        {
            HashAlgorithm algorithm = SHA256.Create();
            return algorithm.ComputeHash(Encoding.UTF8.GetBytes(inputString));
        }

        public static string GetHashString(string inputString)
        {
            StringBuilder sb = new StringBuilder();
            foreach (byte b in GetSHA256Hash(inputString))
            {
                sb.Append(b.ToString("X2"));
            }

            return sb.ToString();
        }

        public static byte[] StringToByteArray(string hex)
        {
            int NumberChars = hex.Length;
            byte[] bytes = new byte[NumberChars / 2];
            for (int i = 0; i < NumberChars; i += 2)
            {
                bytes[i / 2] = Convert.ToByte(hex.Substring(i, 2), 16);
            }

            return bytes;
        }

        public static string Base64Decode(string base64EncodedData)
        {
            byte[] base64EncodedBytes = System.Convert.FromBase64String(base64EncodedData);
            return System.Text.Encoding.UTF8.GetString(base64EncodedBytes);
        }
    }
}