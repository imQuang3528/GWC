using GreateRewardsService.Models;
using GreateRewardsService.Models.RequestModels;
using GreateRewardsService.Services;
using Newtonsoft.Json;
using System;
using System.Configuration;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using System.Web.Http;

namespace GreateRewardsService.Controllers
{
    [ClientAuthorize]
    public class GreateRewardsController : ApiController
    {
        #region Vendor APIs
        [HttpPost]
        [Route(Constants.Urls.Vendor.IssueDigitalVoucher)]
        public async Task<object> IssueDigitalVoucher(IssueDigitalVoucherRequestModel model)
        {
            return await RequestHelper<IssueDigitalVoucherRequestModel>.Post(model, Constants.Urls.Vendor.IssueDigitalVoucher);
        }

        [HttpPost]
        [Route(Constants.Urls.Vendor.IssueDigitalVoucherCache)]
        public string IssueDigitalVoucherCache(IssueDigitalVoucherRequestModel model)
        {
            try
            {
                PaymentService paymentService = new PaymentService();
                Guid key = paymentService.OnPreSendTxnReq(model);
                return key.ToString();
            }
            catch (Exception ex)
            {
                return ex.ToString();
            }
            
        }

        [HttpPost]
        [Route(Constants.Urls.Vendor.IsEmailAvailable)]
        public async Task<object> IsEmailAvailable(IsEmailAvailableRequestModel model)
        {
            return await RequestHelper<IsEmailAvailableRequestModel>.Post(model, Constants.Urls.Vendor.IsEmailAvailable);
        }

        [HttpPost]
        [Route(Constants.Urls.Vendor.IsMobileNoAvailable)]
        public async Task<object> IsMobileNoAvailable(IsMobileNoAvailableRequestModel model)
        {
            return await RequestHelper<IsMobileNoAvailableRequestModel>.Post(model, Constants.Urls.Vendor.IsMobileNoAvailable);
        }

        [HttpPost]
        [Route(Constants.Urls.Vendor.Register)]
        public async Task<object> Register(RegisterRequestModel model)
        {
            return await RequestHelper<RegisterRequestModel>.Post(model, Constants.Urls.Vendor.Register, true);
        }

        [HttpPost]
        [Route(Constants.Urls.Vendor.ResetPassword)]
        public async Task<object> ResetPassword(ResetPasswordRequestModel model)
        {
            return await RequestHelper<ResetPasswordRequestModel>.Post(model, Constants.Urls.Vendor.ResetPassword, true);
        }

        [HttpPost]
        [Route(Constants.Urls.Vendor.ValidateOTP)]
        public async Task<object> ValidateOTP(ValidateOtpRequestModel model)
        {
            return await RequestHelper<ValidateOtpRequestModel>.Post(model, Constants.Urls.Vendor.ValidateOTP);
        }

        [HttpPost]
        [Route(Constants.Urls.Vendor.PlayGame)]
        public async Task<object> PlayGame(PlayGameRequestModel model)
        {
            return await RequestHelper<PlayGameRequestModel>.Post(model, Constants.Urls.Vendor.PlayGame, accessToken: model.Token);
        }

        [HttpPost]
        [Route(Constants.Urls.Vendor.SubmitDetails)]
        public async Task<object> SubmitDetails(SubmitDetailRequestModel model)
        {
            HttpRequestMessage msg = new HttpRequestMessage
            {
                Method = HttpMethod.Post,
                RequestUri = new Uri(ConfigurationManager.AppSettings[Constants.AppSettingKeys.Jeripay_Url] + Constants.Urls.Vendor.SubmitDetails)
            };
            HttpClient client = new HttpClient();
            try
            {
                if (model != null)
                {
                    msg.Content = JsonContent.Create(model);
                }

                string authLoginInfo = string.Format("{0}:{1}", ConfigurationManager.AppSettings[Constants.AppSettingKeys.Jeripay_UserName], ConfigurationManager.AppSettings[Constants.AppSettingKeys.Jeripay_Password]);
                byte[] authAsByte = System.Text.ASCIIEncoding.ASCII.GetBytes(authLoginInfo);
                string authorInfo = Convert.ToBase64String(authAsByte);

                client.DefaultRequestHeaders.Add("partner", ConfigurationManager.AppSettings[Constants.AppSettingKeys.Jeripay_Partner]);
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", authorInfo);


                HttpResponseMessage res = await client.SendAsync(msg);
                string responseBody = await res.Content.ReadAsStringAsync();

                return JsonConvert.DeserializeObject<object>(responseBody);
            }
            catch (Exception ex)
            {
                return ex;
            }
        }

        [HttpGet]
        [Route(Constants.Urls.Vendor.GetMembershipSystemCodeString)]
        public async Task<object> GetMembershipSystemCodeString(string SystemCodeType)
        {
            return await RequestHelper<object>.Get(Constants.Urls.Vendor.GetMembershipSystemCodeString + ControllerContext.Request.RequestUri.Query);
        }

        [HttpGet]
        [Route(Constants.Urls.Vendor.GetEvoucherDetails)]
        public async Task<object> GetEvoucherDetails(string encryptedEvoucherString)
        {
            return await RequestHelper<object>.Get(Constants.Urls.Vendor.GetEvoucherDetails + ControllerContext.Request.RequestUri.Query);
        }

        [HttpGet]
        [Route(Constants.Urls.Vendor.GetGiftingDetails)]
        public async Task<object> GetGiftingDetails(string redemptionPin)
        {
            return await RequestHelper<object>.Get(Constants.Urls.Vendor.GetGiftingDetails + ControllerContext.Request.RequestUri.Query);
        }

        [HttpGet]
        [Route(Constants.Urls.Vendor.GetPublicGames)]
        public async Task<object> GetPublicGames(string token, string Sorting = "", int? SkipCount = 0, int? MaxResultCount = 99)
        {
            return await RequestHelper<object>.Get(Constants.Urls.Vendor.GetPublicGames + ControllerContext.Request.RequestUri.Query, isVendorRequest: false, accessToken: token);
        }

        [HttpGet]
        [Route(Constants.Urls.Vendor.GetGameInfo)]
        public async Task<object> GetGameInfo(string token, string LuckyDipId = "", string IncludeChances = "")
        {
            return await RequestHelper<object>.Get(Constants.Urls.Vendor.GetGameInfo + ControllerContext.Request.RequestUri.Query, isVendorRequest: false, accessToken: token);
        }

        [HttpGet]
        [Route(Constants.Urls.Vendor.GetEvoucherEncryptedString)]
        public async Task<object> GetEvoucherEncryptedString(string CardNo, string VoucherNumbers)
        {
            return await RequestHelper<object>.Get(Constants.Urls.Vendor.GetEvoucherEncryptedString + ControllerContext.Request.RequestUri.Query, true);
        }

        [HttpGet]
        [Route(Constants.Urls.Vendor.GetDigitalVouchersByType)]
        public async Task<object> GetDigitalVouchersByType(string TransactionType, string MallRefCode = "", string VoucherSubCategory = "", bool? IncludeExpired = null, bool? Redeemable = null, string Sorting = "", int? SkipCount = 0, int? MaxResultCount = 999)
        {
            return await RequestHelper<object>.Get(Constants.Urls.Vendor.GetDigitalVouchersByType + ControllerContext.Request.RequestUri.Query);
        }

        [HttpGet]
        [Route(Constants.Urls.Vendor.GetOutletDetails)]
        public async Task<object> GetOutletDetails(string OutletCode)
        {
            return await RequestHelper<object>.Get(Constants.Urls.Vendor.GetOutletDetails + ControllerContext.Request.RequestUri.Query, true);
        }

        [HttpGet]
        [Route(Constants.Urls.Vendor.GetOTP)]
        public async Task<object> GetOTP(string MobileNo)
        {
            return await RequestHelper<object>.Get(Constants.Urls.Vendor.GetOTP + ControllerContext.Request.RequestUri.Query, true);
        }
        #endregion
    }
}