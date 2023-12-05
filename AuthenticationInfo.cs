using System;

namespace GreateRewardsService
{
    public class AuthenticationInfo
    {
        private AuthenticationInfo() { }
        private static AuthenticationInfo instance = null;
        public static AuthenticationInfo Instance
        {
            get
            {
                if (instance == null)
                {
                    instance = new AuthenticationInfo();
                }
                return instance;
            }
        }
        public string VendorAccessToken { get; set; }
        public DateTime VendorExpiryTime { get; set; }
        public string MemberAccessToken { get; set; }
        public DateTime MemberExpiryTime { get; set; }
    }
}