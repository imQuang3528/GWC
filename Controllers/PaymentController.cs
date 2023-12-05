using GreateRewardsService.Models;
using GreateRewardsService.Models.ResponseModels;
using GreateRewardsService.Services;
using System;
using System.Threading.Tasks;
using System.Web.Http;

namespace GreateRewardsService.Controllers
{
    public class PaymentController : ApiController
    {
        [HttpPost]
        [Route("Endpoint")]
        public async Task<string> GetResponse(TxnRes txnRes)
        {
            try
            {
                PaymentService transactionService = new PaymentService();
                await transactionService.OnTxnResReceivedAsync(txnRes);
                //return ConfigurationManager.AppSettings[Constants.AppSettingKeys.ENETS_ReturnURL] + "?key=" + txnRes.Msg.B2sTxnEndURLParam;
                return "OK";
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return ex.ToString();
            }
        }

        [HttpGet]
        [Route("Endpoint")]
        public TransactionStatus CheckPaymentStatus(string key)
        {
            PaymentService transactionService = new PaymentService();
            var transaction = transactionService.GetTransactionStatus(key);
            return transaction;
        }


    }
}