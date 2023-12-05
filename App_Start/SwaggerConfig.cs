using GreateRewardsService;
using Swashbuckle.Application;
using System.Web.Http;
using WebActivatorEx;

[assembly: PreApplicationStartMethod(typeof(SwaggerConfig), "Register")]

namespace GreateRewardsService
{
    public class SwaggerConfig
    {
        public static void Register()
        {
            System.Reflection.Assembly thisAssembly = typeof(SwaggerConfig).Assembly;

            GlobalConfiguration.Configuration
                .EnableSwagger(c =>
                    {
                        c.SingleApiVersion("v1", "GreateRewardsService");
                        c.OperationFilter<AuthorizationHeaderParameterOperationFilter>();
                    })
                .EnableSwaggerUi();
        }
    }
}
