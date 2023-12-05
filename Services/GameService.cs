using GreateRewardsService.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net.Http.Headers;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using GreateRewardsService.Models.ResponseModels;
using GreateRewardsService.Models.CRM;
using System.Net.Http.Json;
using System.Text.Json;
using GreateRewardsService.Models.RequestModels;
using GreateRewardsService.Models.Game;
using GreateRewardsService.Entities;
using Newtonsoft.Json.Linq;

namespace GreateRewardsService.Services
{
    public class GameService
    {
        public async Task<IssuedVoucherResponse> HandleIssuedGameVoucher(GameRequestModel model)
        {
            if (model.Point <= 0)
            {
                var checkChancePlayGame = await HandlePlayGame(model);
                if (checkChancePlayGame != null && checkChancePlayGame.Success)
                {

                    return new IssuedVoucherResponse()
                    {
                        Success = true,
                        MinusChance = true
                    };
                }
                return new IssuedVoucherResponse()
                {
                    Success = false,
                    MinusChance = false,
                    Message = JsonConvert.SerializeObject(checkChancePlayGame?.Error != null ? checkChancePlayGame?.Error : "insufficient chance")
                };             
            }
            else
            {
                var lstCustomCode = await GetListCustomCode(model);
                var voucher = GetVoucherCode(lstCustomCode, model);
                if (!string.IsNullOrEmpty(voucher))
                {
                    var checkChancePlayGame = await HandlePlayGame(model);
                    if (checkChancePlayGame != null && checkChancePlayGame.Success)
                    {

                        var reward = new Reward();
                        var lstreward = new List<Reward>();
                        reward.RewardId = voucher;
                        reward.Quantity = 1;
                        lstreward.Add(reward);

                        var lstReward = new RedeemRewardsWithPointsRequestModel();
                        lstReward.Rewards = lstreward;
                        lstReward.RetrieveIssuedVouchersList = true;
                        var result = await RequestHelper<RedeemRewardsWithPointsRequestModel>.Post(lstReward, Constants.Urls.Member.RedeemRewardsWithPoints, accessToken: model.AccessToken);

                        BasePostResponseModel<IssuedVoucherResponse> responseModel = JsonConvert.DeserializeObject<BasePostResponseModel<IssuedVoucherResponse>>(JsonConvert.SerializeObject(result));

                        if (responseModel.Success)
                        {
                            var lstVoucher = responseModel.Result.IssuedVoucherLists;
                            var lstVoucherTemp = new List<VoucherResponse>();

                            if (lstVoucher?.Count() > 0)
                            {
                                foreach (var item in lstVoucher)
                                {
                                    lstVoucherTemp.Add(item);
                                }

                                _ = await HandleUtilizeRewards(lstVoucherTemp, model);
                            }

                            return new IssuedVoucherResponse()
                            {
                                TotalIssuedVoucherCount = responseModel.Result.TotalIssuedVoucherCount,
                                IssuedVoucherLists = lstVoucherTemp,
                                Success = responseModel.Success,
                                MinusChance = true
                            };
                        }
                        return new IssuedVoucherResponse()
                        {
                            Success = responseModel.Success,
                            Message = JsonConvert.SerializeObject(checkChancePlayGame?.Error)
                        };
                    }

                    return new IssuedVoucherResponse()
                    {
                        Success = false,
                        MinusChance = false,
                        Message = JsonConvert.SerializeObject(checkChancePlayGame?.Error != null ? checkChancePlayGame?.Error : "insufficient chance")
                    };
                }
                return new IssuedVoucherResponse()
                {
                    Success = false,
                    MinusChance = false,
                    Message = "Have not voucher valid"
                };
            }

        }

        private async Task<object> HandleUtilizeRewards(List<VoucherResponse> lstVoucher, GameRequestModel model)
        {
            if (lstVoucher?.Count > 0)
            {
                var lstVouch = new List<string>();
                foreach (var item in lstVoucher)
                {
                    lstVouch.Add(item.VoucherNo);
                }
                var objUtilRewards = new UtilizeRewardsRequestModel();
                objUtilRewards.VoucherNo = lstVouch;
                objUtilRewards.OutletCode = "App";
                var result = await RequestHelper<UtilizeRewardsRequestModel>.Post(objUtilRewards, Constants.Urls.Member.UtilizeRewards, accessToken: model.AccessToken);
                return result;
            }
            return null;

        }

        private string GetVoucherCode(List<CustomCodes> lstCustomCode, GameRequestModel model)
        {
            var voucher = "";
            if (lstCustomCode.Count > 0)
            {
                var result = lstCustomCode.Find(x => x.CustomCode == model.GameCode);
                if (result != null)
                {
                    Dictionary<string, string> setValue = new Dictionary<string, string>();
                    var lstRangePoint = JsonConvert.DeserializeObject<dynamic>(result.Description);
                    foreach (var item in lstRangePoint)
                    {
                        var lstPoint = item.Name.Split('-');
                        if (lstPoint.Length > 0)
                        {
                            if (string.IsNullOrEmpty(lstPoint[1]))
                            {
                                if (model.Point >= Convert.ToInt32(lstPoint[0]))
                                {
                                    voucher = item.Value;
                                    return voucher;
                                }
                            }
                            if (model.Point >= Convert.ToInt32(lstPoint[0]) && model.Point <= Convert.ToInt32(lstPoint[1]))
                            {
                                voucher = item.Value;
                                break;
                            }

                        }
                    }
                }
            }
            return voucher;
        }
        public async Task<List<CustomCodes>> GetListCustomCode(GameRequestModel param)
        {
            var listCustomCode = new List<CustomCodes>();
            HttpRequestMessage msg = new HttpRequestMessage
            {
                Method = HttpMethod.Post,
                RequestUri = new Uri(ConfigurationManager.AppSettings[Constants.AppSettingKeys.CRM_InstanceURL])
            };

            AuthResponse authResult = await CrmAuth();
            JsonSerializerOptions options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
            };
            GetCustomCodeRequet model = new GetCustomCodeRequet();
            model.Command = Constants.Command.GET_CUSTOM_CODES;
            model.ParentCode = "CG Prize Code";
            msg.Content = JsonContent.Create(new CustomCodeModel(model), options: options);

            HttpClient client = new HttpClient();
            client.DefaultRequestHeaders.Add("SoapAction", ConfigurationManager.AppSettings[Constants.AppSettingKeys.SoapAction]);
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", authResult.Access_token);
            HttpResponseMessage res = await client.SendAsync(msg);
            string responseBody = await res.Content.ReadAsStringAsync();
            CustomCodeResponse result = JsonConvert.DeserializeObject<CustomCodeResponse>(responseBody);
            listCustomCode = result.CustomCodes;
            return listCustomCode;
        }

        public async Task<BasePostResponseModel<PlayGameResponse>> HandlePlayGame(GameRequestModel param)
        {
            if (param != null)
            {
                var requestModel = new PlayGameRequestModel()
                {
                    ChanceValueTypeCode = param.ChanceValueTypeCode,
                    LuckyDipId = param.LuckyDipId,
                    ClientSeed = param.ClientSeed,
                    Token = param.AccessToken
                };

                var result = await RequestHelper<PlayGameRequestModel>.Post(requestModel, Constants.Urls.Member.PlayGame, accessToken: param.AccessToken);
                BasePostResponseModel<PlayGameResponse> responseModel = JsonConvert.DeserializeObject<BasePostResponseModel<PlayGameResponse>>(JsonConvert.SerializeObject(result));
                return responseModel;
            }
            return null;
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