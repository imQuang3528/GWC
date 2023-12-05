using GreateRewardsService.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace GreateRewardsService.Controllers
{
    public class EmailVerifyController : Controller
    {
        public async Task<ActionResult> Index(string cardNo)
        {
            ViewBag.Title = "Email Verification";

            HttpRequestMessage msg = new HttpRequestMessage
            {
                Method = HttpMethod.Post,
                RequestUri = new Uri(ConfigurationManager.AppSettings[Constants.AppSettingKeys.CRM_InstanceURL])
            };

            try
            {
                AuthResponse authResult = await CrmAuth();
                JsonSerializerOptions options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                };
                PostDataModel model = new PostDataModel();
                model.Command = Constants.Command.REWARD_CAMPAIGN;
                model.CardNo = cardNo;
                model.AmtToCalculateAR = 0;
                model.CampaignType = "CardActivation Campaign";
                model.CampaignCode = "VerifyEmail";
                model.CheckQualificationRules = true;
                model.RetrieveMembershipInfo = false;
                model.RetrieveIssuedVoucherLists = false;
                model.RetrieveActiveVouchersLists = false;
                msg.Content = JsonContent.Create(new RewardCampaign(model), options: options);

                HttpClient client = new HttpClient();
                client.DefaultRequestHeaders.Add("SoapAction", ConfigurationManager.AppSettings[Constants.AppSettingKeys.SoapAction]);
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", authResult.Access_token);
                HttpResponseMessage res = await client.SendAsync(msg);
                string responseBody = await res.Content.ReadAsStringAsync();
                RewardCampaignResponse result = JsonConvert.DeserializeObject<RewardCampaignResponse>(responseBody);
                ViewBag.Status = result.ReturnStatus;
                ViewBag.Message = result.ReturnMessage;
            }
            catch (Exception ex)
            {
                ViewBag.Status = -1;
                ViewBag.Message = "ERROR" + ex.Message;
            }
            ViewBag.WebPageURL = ConfigurationManager.AppSettings[Constants.AppSettingKeys.WebPageURL];
            return View();
        }

        private async Task<AuthResponse> CrmAuth()
        {
            HttpRequestMessage msg = new HttpRequestMessage
            {
                Method = HttpMethod.Post,
                RequestUri = new Uri(ConfigurationManager.AppSettings[Constants.AppSettingKeys.CRM_TokenURL])
            };
            try
            {
                Dictionary<string, string> d = new Dictionary<string, string>
                {
                    { "grant_type", ConfigurationManager.AppSettings[Constants.AppSettingKeys.CRM_GrantType] },
                    { "client_id", ConfigurationManager.AppSettings[Constants.AppSettingKeys.CRM_ClientID] },
                    { "client_secret", ConfigurationManager.AppSettings[Constants.AppSettingKeys.CRM_ClientSecret] },
                    { "scope",  ConfigurationManager.AppSettings[Constants.AppSettingKeys.CRM_Scope] }
                };
                msg.Content = new FormUrlEncodedContent(d);
                HttpClient client = new HttpClient();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                HttpResponseMessage res = await client.SendAsync(msg);
                string responseBody = await res.Content.ReadAsStringAsync();
                AuthResponse result = JsonConvert.DeserializeObject<AuthResponse>(responseBody);
                return result;

            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}
