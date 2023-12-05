using GraphQL.Client.Http;
using GraphQL.Client.Serializer.Newtonsoft;
using System;
using System.Configuration;

namespace GreateRewardsService.Services
{
    public class GraphqlClientBase
    {
        public readonly GraphQLHttpClient _graphQLHttpClient;
        public GraphqlClientBase()
        {
            if (_graphQLHttpClient == null)
            {
                _graphQLHttpClient = GetGraphQlApiClient();
            }
        }

        public GraphQLHttpClient GetGraphQlApiClient()
        {
            string endpoint = string.Format("{0}{1}", ConfigurationManager.AppSettings[Constants.AppSettingKeys.CMS_InstanceURL], Constants.Urls.GraphQl.GraphQlPage);

            GraphQLHttpClientOptions httpClientOption = new GraphQLHttpClientOptions
            {
                EndPoint = new Uri(endpoint)
            };

            return new GraphQLHttpClient(httpClientOption, new NewtonsoftJsonSerializer());
        }
    }
}