using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;

namespace GreateRewardsService
{
    public class ClientAuthorize : AuthorizeAttribute
    {
        protected override bool IsAuthorized(HttpActionContext actionContext)
        {
            return Convert.ToString(actionContext.Request.Headers.Authorization) == ConfigurationManager.AppSettings[Constants.AppSettingKeys.Client_Secret];
        }
    }
}