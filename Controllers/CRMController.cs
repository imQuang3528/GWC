using GreateRewardsService.Models;
using GreateRewardsService.Models.ResponseModels;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using System.Web.Http;

namespace GreateRewardsService.Controllers
{
    [ClientAuthorize]
    public class CRMController : ApiController
    {

        [HttpPost]
        [Route("CRM")]
        public async Task<object> SendRequest(PostDataModel model)
        {
            if (model == null)
            {
                return BadRequest(ModelState);
            }
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
                switch (model.Command)
                {
                    case Constants.Command.UPDATE_PROFILE3:
                        msg.Content = JsonContent.Create(new UpdateProfile(model), options: options);
                        break;
                    case Constants.Command.MEMBER_ENQUIRY:
                        msg.Content = JsonContent.Create(new MemberEnquiry(model), options: options);
                        break;
                    case Constants.Command.REWARD_CAMPAIGN:
                        msg.Content = JsonContent.Create(new RewardCampaign(model), options: options);
                        break;
                    case Constants.Command.SEND_EMAIL:
                        msg.Content = JsonContent.Create(new SendEmail(model), options: options);
                        break;
                }
                HttpClient client = new HttpClient();
                client.DefaultRequestHeaders.Add("SoapAction", ConfigurationManager.AppSettings[Constants.AppSettingKeys.SoapAction]);
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", authResult.Access_token);
                HttpResponseMessage res = await client.SendAsync(msg);
                string responseBody = await res.Content.ReadAsStringAsync();
                if (model.Command.Equals(Constants.Command.MEMBER_ENQUIRY) || model.Command.Equals(Constants.Command.UPDATE_PROFILE3))
                {
                    return JsonConvert.DeserializeObject<MemberEnquiryResponse>(responseBody);
                } else
                {
                    return JsonConvert.DeserializeObject(responseBody);
                }
            }
            catch (Exception ex)
            {
                return ex;
            }

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