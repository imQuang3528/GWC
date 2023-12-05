using GraphQL.Client.Http;
using GreateRewardsService.Models;
using GreateRewardsService.Services;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Runtime.Caching;
using System.Security.Policy;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;
using static GreateRewardsService.Constants;

namespace GreateRewardsService.Controllers
{
    public class CMSController : ApiController
    {
        [HttpPost]
        [Route("mallsmobile/api/graphql")]
        public async Task<object> SendRequest()
        {
            string query = await Request.Content.ReadAsStringAsync();
            query = query.Replace("\\r\\n", "");
            JObject jObject = JObject.Parse(query);
            GraphQLHttpRequest graphRequest = new GraphQLHttpRequest
            {
                Query = Convert.ToString(jObject["query"])
            };
            GraphQLHttpClient graphClient = new GraphqlClientBase().GetGraphQlApiClient();
            try
            {
                string token = await CMSAuth();
                graphClient.HttpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                GraphQL.GraphQLResponse<object> res = await graphClient.SendQueryAsync<object>(graphRequest);
                return res.Data;
            }
            catch (GraphQLHttpRequestException ex)
            {
                if (ex.StatusCode == HttpStatusCode.BadRequest && (ex.Content == null || ex.Content == ""))
                {
                    MemoryCache cache = MemoryCache.Default;
                    cache.Remove("CRM_AUTH_TOKEN");
                    string token = await CMSAuth();
                    graphClient.HttpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                    try
                    {
                        GraphQL.GraphQLResponse<object> res2 = await graphClient.SendQueryAsync<object>(graphRequest);
                        return res2.Data;
                    }
                    catch (GraphQLHttpRequestException ex2)
                    {
                        return ex2.Content;
                    }
                }
                return ex.Content;
            }
        }

        [HttpGet]
        [Route("mallsmobile/media")]
        public async Task<HttpResponseMessage> Get(string uri)
        {
            HttpClient client = new HttpClient();
            var response = await client.GetAsync(uri);
            return response;
        }

        [HttpGet]
        [Route(Constants.Urls.GraphQl.Media)]
        public async Task<HttpResponseMessage> CustomMediaRouter(string template)
        {
            template = template.Replace('=', '%');
            template = ConfigurationManager.AppSettings[Constants.AppSettingKeys.CMS_InstanceURL] + HttpUtility.UrlDecode(template);
            HttpClient client = new HttpClient();
            var response = await client.GetAsync(template);
            return response;
        }

        private async Task<string> CMSAuth()
        {
            HttpRequestMessage msg = new HttpRequestMessage
            {
                Method = HttpMethod.Post,
                RequestUri = new Uri(ConfigurationManager.AppSettings[Constants.AppSettingKeys.CMS_InstanceURL] + "/mallsmobile/connect/token")
            };
            MemoryCache cache = MemoryCache.Default;
            if ((string)cache.Get("CRM_AUTH_TOKEN") != null)
            {
                return (string)cache.Get("CRM_AUTH_TOKEN");
            }
            try
            {
                Dictionary<string, string> d = new Dictionary<string, string>
                {
                    { "grant_type", ConfigurationManager.AppSettings[Constants.AppSettingKeys.CMS_GrantType] },
                    { "client_id", ConfigurationManager.AppSettings[Constants.AppSettingKeys.CMS_ClientID] },
                    { "client_secret", ConfigurationManager.AppSettings[Constants.AppSettingKeys.CMS_ClientSecret] }
                };
                msg.Content = new FormUrlEncodedContent(d);
                HttpClient client = new HttpClient();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                HttpResponseMessage res = await client.SendAsync(msg);
                if (res.StatusCode == HttpStatusCode.OK)
                {
                    string responseBody = await res.Content.ReadAsStringAsync();
                    AuthResponse result = JsonConvert.DeserializeObject<AuthResponse>(responseBody);
                    cache.Set("CRM_AUTH_TOKEN", result.Access_token, DateTimeOffset.Now.AddSeconds(1800.0));
                    return result.Access_token;
                }
                else
                {
                    return null;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}