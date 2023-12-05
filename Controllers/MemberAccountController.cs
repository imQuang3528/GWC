using GreateRewardsService.Models.ResponseModels;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;

namespace GreateRewardsService.Controllers
{
    [ClientAuthorize]
    public class MemberAccountController : ApiController
    {
        [HttpGet]
        [Route(Constants.Urls.Member.GetProfile)]
        public async Task<APIResultResponse> GetProfileInfo(string token)
        {
            try
            {
                var result = await RequestHelper<object>.Get(Constants.Urls.Member.GetProfile + ControllerContext.Request.RequestUri.Query, isVendorRequest: false, accessToken: token);
                var objTemp = JObject.Parse(JsonConvert.SerializeObject(result));
                if (Convert.ToBoolean(objTemp["success"]) == true)
                {
                    var objUser = new MemberProfileResponseModel()
                    {
                        MemberId = Convert.ToString(objTemp["result"]["memberID"]),
                        UserName = Convert.ToString(objTemp["result"]["userName"]),
                        Name = Convert.ToString(objTemp["result"]["name"]),
                        SurName = Convert.ToString(objTemp["result"]["surname"]),
                        Dob = Convert.ToDateTime(objTemp["result"]["dob"])
                    };
                    return new APIResultResponse<MemberProfileResponseModel>(objUser, true, "Get profile success");
                }
                return new APIResultResponse(false, "Get profile fail");
            }
            catch (Exception ex)
            {

                return new APIResultResponse(false, ex.Message);
            }

        }
    }
}
