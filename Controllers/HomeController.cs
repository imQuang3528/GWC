using GreateRewardsService.Models;
using GreateRewardsService.Models.RequestModels;
using GreateRewardsService.Services;
using System;
using System.Configuration;
using System.Linq;
using System.Runtime.Caching;
using System.Web.Mvc;

namespace GreateRewardsService.Controllers
{
    public class HomeController : Controller
    {
        private readonly PaymentService transactionService = new PaymentService();
        public ActionResult Index()
        {
            ViewBag.Title = "Payment";
            decimal amount = Convert.ToDecimal(Request.QueryString["amount"]);
            string type = Convert.ToString(Request.QueryString["type"]);
            MemoryCache cache = MemoryCache.Default;
            if (amount > 0)
            {
                if (type == "vouchers")
                {
                    if (!string.IsNullOrEmpty(Request.QueryString["key"]))
                    {
                        string domain = ConfigurationManager.AppSettings[Constants.AppSettingKeys.ENETS_Domain];
                        ViewBag.Domain = domain;
                        string cacheKey = Request.QueryString["key"];
                        PrepareTxnReq(amount, cacheKey, type);
                    }
                }

            }
            return View();
        }

        private void PrepareTxnReq(decimal amount, string returnUrlParams, string type)
        {
            Enets trans = new Enets
            {
                UMID = ConfigurationManager.AppSettings[Constants.AppSettingKeys.ENETS_UMID],
                SecretKey = ConfigurationManager.AppSettings[Constants.AppSettingKeys.ENETS_Secret],
                KeyID = ConfigurationManager.AppSettings[Constants.AppSettingKeys.ENETS_KeyID],
                Amount = amount,
                MerchantReference = DateTime.Now.ToString("yyMMddHHmmssFFF") + RandomString(5)
            };

            trans.Currency = ConfigurationManager.AppSettings[Constants.AppSettingKeys.ENETS_Currency];
            trans.TimeZone = ConfigurationManager.AppSettings[Constants.AppSettingKeys.ENETS_TimeZone];
            trans.PaymentMode = ConfigurationManager.AppSettings[Constants.AppSettingKeys.ENETS_PaymentMode];
            trans.ReturnURL = ConfigurationManager.AppSettings[Constants.AppSettingKeys.ENETS_ReturnURL];
            trans.NotifyURL = ConfigurationManager.AppSettings[Constants.AppSettingKeys.ENETS_NotifyURL];
            trans.TransactionDate = DateTime.Now.ToString("yyyyMMdd HH:mm:ss.FFF");
            trans.TID = "";
            trans.ReturnURLParam = returnUrlParams;

            string ip = Request.ServerVariables["HTTP_X_FORWARDED_FOR"];
            if (string.IsNullOrEmpty(ip))
            {
                ip = Request.ServerVariables["REMOTE_ADDR"];
            }

            trans.IPAddress = ip;
            MemoryCache cache = MemoryCache.Default;
            IssueDigitalVoucherRequestModel requestedDigitalVoucher = (IssueDigitalVoucherRequestModel)cache.Get(Request.QueryString["key"]);
            transactionService.OnTxnReqSent(trans, requestedDigitalVoucher, Request.QueryString["key"]);
            string strpayload = trans.GetPayload(trans.GetPaymentRequest());
            string strhmac = trans.GetHmac(strpayload);
            ViewBag.TxnReq = strpayload;
            ViewBag.Hmac = strhmac;
            ViewBag.KeyId = trans.KeyID;

        }
        public static string RandomString(int length)
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            Random random = new Random();
            return new string(Enumerable.Repeat(chars, length)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }
    }

}
