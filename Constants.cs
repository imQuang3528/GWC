namespace GreateRewardsService
{
    public class Constants
    {
        public class AppSettingKeys
        {
            public const string MMS_InstanceURL = "MMS_InstanceURL";
            public const string MMS_V_Username = "MMS_V_Username";
            public const string MMS_V_Password = "MMS_V_Password";
            public const string MMS_M_Username = "MMS_M_Username";
            public const string MMS_M_Password = "MMS_M_Password";
            public const string MMS_AscPosID = "AppMMS_AscPosID";
            public const string MMS_Src = "MMS_Src";
            public const string MMS_AppName = "MMS_AppName";
            public const string Client_Secret = "Client_Secret";
            public const string ENETS_KeyID = "ENETS_KeyID";
            public const string ENETS_Secret = "ENETS_Secret";
            public const string ENETS_UMID = "ENETS_UMID";
            public const string ENETS_Domain = "ENETS_Domain";
            public const string ENETS_ReturnURL = "ENETS_ReturnURL";
            public const string ENETS_NotifyURL = "ENETS_NotifyURL";
            public const string ENETS_Currency = "ENETS_Currency";
            public const string ENETS_TimeZone = "ENETS_TimeZone";
            public const string ENETS_PaymentMode = "ENETS_PaymentMode";
            public const string ENETS_Environment = "ENETS_Environment";
            public const string CarPark_EndPointPrefix = "CarPark_EndPointPrefix";
            public const string CarPark_EndPointPrefix_TM = "CarPark_EndPointPrefix_TM";
            public const string CarPark_EndPointPrefix_GW = "CarPark_EndPointPrefix_GW";
            public const string CarPark_Key = "CarPark_Key";
            public const string CRM_TokenURL = "CRM_TokenURL";
            public const string CRM_InstanceURL = "CRM_InstanceURL";
            public const string CRM_GrantType = "CRM_GrantType";
            public const string CRM_ClientID = "CRM_ClientID";
            public const string CRM_ClientSecret = "CRM_ClientSecret";
            public const string CRM_Scope = "CRM_Scope";
            public const string SoapAction = "SoapAction";
            public const string Origin = "Origin";
            public const string CMS_InstanceURL = "CMS_InstanceURL";
            public const string CMS_ClientID = "CMS_ClientID";
            public const string CMS_ClientSecret = "CMS_ClientSecret";
            public const string CMS_GrantType = "CMS_GrantType";
            public const string Jeripay_Url = "Jeripay_Url";
            public const string Jeripay_UserName = "Jeripay_UserName";
            public const string Jeripay_Password = "Jeripay_Password";
            public const string Jeripay_Partner = "Jeripay_Partner";
            public const string CRM_Enquiry_Code = "CRM_Enquiry_Code";
            public const string CRM_Outlet_Code = "CRM_Outlet_Code";
            public const string CRM_Pos_ID = "CRM_Pos_ID";
            public const string CRM_Cashier_ID = "CRM_Cashier_ID";
            public const string CRM_Ignore_CCNchecking = "CRM_Ignore_CCNchecking";
            public const string WebPageURL = "WebPageURL";
        }

        public class Urls
        {
            public class Vendor
            {
                public const string Authenticate = "api/TokenAuth/Authenticate";
                public const string GetDigitalVouchersByType = "api/services/app/DigitalVoucher/GetDigitalVouchersByType";
                public const string GetEvoucherEncryptedString = "api/services/app/Evoucher/GetEvoucherEncryptedString";
                public const string GetMembershipSystemCodeString = "api/services/app/KeyValue/GetMembershipSystemCodeString";
                public const string GetOTP = "api/services/app/MemberAccount/GetOTP";
                public const string IssueDigitalVoucher = "api/services/app/DigitalVoucher/IssueDigitalVoucher";
                public const string IssueDigitalVoucherCache = "api/services/app/DigitalVoucher/IssueDigitalVoucherCache";
                public const string Register = "api/services/app/MemberAccount/Register";
                public const string ResetPassword = "api/services/app/MemberAccount/ResetPassword";
                public const string ValidateOTP = "api/services/app/MemberAccount/ValidateOTP";
                public const string GetOutletDetails = "api/services/app/KeyValue/GetOutletDetails";
                public const string IsEmailAvailable = "api/services/app/MemberAccount/IsEmailAvailable";
                public const string IsMobileNoAvailable = "api/services/app/MemberAccount/IsMobileNoAvailable";
                public const string GetGameInfo = "api/services/app/LuckyDip/GetGameInfo";
                public const string GetPublicGames = "api/services/app/LuckyDip/GetPublicGames";
                public const string PlayGame = "api/services/app/LuckyDip/PlayGame";
                public const string SubmitDetails = "api/submitDetails";
                public const string GetEvoucherDetails = "api/services/app/Evoucher/GetEvoucherDetails";
                public const string GetGiftingDetails = "api/services/app/Evoucher/GetGiftingDetails";
            }

            public class Member
            {
                public const string Authenticate = "api/MemberTokenAuth/Authenticate";
                public const string ActivateIU = "api/services/app/Membership/ActivateIU";
                public const string AddRemoveFavourite = "api/services/app/Membership/AddRemoveFavourite";
                public const string CarParkBalanceEnquiry = "api/services/app/Membership/CarParkBalanceEnquiry";
                public const string CarParkRebateConversion = "api/services/app/Membership/CarParkRebateConversion";
                public const string ChangePassword = "api/services/app/Membership/ChangePassword";
                public const string ContactUs = "api/services/app/Communications/ContactUs";
                public const string DeleteInAppMessage = "api/services/app/Membership/DeleteInAppMessage";
                public const string GenerateSecureMemberQRCode = "api/services/app/Membership/GenerateSecureMemberQRCode";
                public const string GetAllReceiptSubmissions = "api/services/app/Membership/GetAllReceiptSubmissions";
                public const string GetAllRewards = "api/services/app/Membership/GetAllRewards";
                public const string GetAllTransactions = "api/services/app/Membership/GetAllTransactions";
                public const string GetCard = "api/services/app/Membership/GetCard";
                public const string GetCarParkTransactionHistory = "api/services/app/Membership/GetCarParkTransactionHistory";
                public const string GetEvoucherDetails = "api/services/app/Membership/GetEvoucherDetails";
                public const string GetFavourites = "api/services/app/Membership/GetFavourites";
                public const string GetGameInfo = "api/services/app/LuckyDip/GetGameInfo";
                public const string GetIU = "api/services/app/Membership/GetIU";
                public const string GetPointsUtilizationString = "api/services/app/Membership/GetPointsUtilizationString";
                public const string GetProfile = "api/services/app/Membership/GetProfile";
                public const string GetPublicGames = "api/services/app/LuckyDip/GetPublicGames";
                public const string GetReceiptSubmission = "api/services/app/Membership/GetReceiptSubmission";
                public const string GetReferralCode = "api/services/app/Membership/GetReferralCode";
                public const string GetRewardCatalogueItems = "api/services/app/RewardCatalogue/GetRewardCatalogueItems";
                public const string MembershipCancellation = "api/services/app/Membership/MembershipCancellation";
                public const string PlayGame = "api/services/app/LuckyDip/PlayGame";
                public const string RedeemRewardsWithPoints = "api/services/app/Membership/RedeemRewardsWithPoints";
                public const string RenewToken = "api/MemberTokenAuth/RenewToken";
                public const string RetrieveInAppMessage = "api/services/app/Membership/RetrieveInAppMessage";
                public const string TagVoucher = "api/services/app/Membership/TagVoucher";
                public const string UpdateDeviceInfo = "api/services/app/Membership/UpdateDeviceInfo";
                public const string UpdateProfile = "api/services/app/Membership/UpdateProfile";
                public const string UploadImageFile = "File/UploadImageFile";
                public const string UtilizePromoCode = "api/services/app/Membership/UtilizePromoCode";
                public const string UtilizeRewards = "api/services/app/Membership/UtilizeRewards";
                public const string SubmitReceipt = "api/services/app/Membership/SubmitReceipt";
            }

            public class CarPark
            {
                public const string TMTicket = "tm_asc/intf_act_tm/f_ticket";
                public const string GRTicket = "gwc_asc/intf_act_gwc/f_ticket";
                public const string Ticket = "webepark/intf_act_gw/f_ticket";
                public const string TMFeeRouter = "tm_asc/intf_act_tm/f_feecalc";
                public const string GRFeeRouter = "gwc_asc/intf_act_gwc/f_feecalc";
                public const string FeeEndpoint = "webepark/intf_act_gw/f_feecalc_api";
            }

            public class Payment
            {
                public const string PaymentVoucherPage = "{0}?type=vouchers&amount=1&key={1}";
            }

            public class GraphQl
            {
                public const string GraphQlPage = "mallsmobile/api/graphql/";
                public const string Media = "mallsmobile/api/media/{template:regex(^.*$)=}";
            }

            public class GameScores
            {
                public const string GetScoreGame = "api/GameScore/get-game-score";
                public const string StoreScoreGame = "api/GameScore/store-game-score";
            }

            public class Game
            {
                public const string IssuedGameVoucher = "api/game/issued-game-voucher";
            }
        }

        public class ENets
        {
            public const string TxnReq =
                "{" +
                    "\"ss\":\"1\"," +
                    "\"msg\":{" +
                        "\"txnAmount\":\"<Amount>\"," +
                        "\"merchantTxnRef\":\"<MerchantTxnRef>\"," +
                        "\"b2sTxnEndURL\":\"<b2sTxnEndURL>\"," +
                        "\"s2sTxnEndURL\":\"<s2sTxnEndURL>\"," +
                        "\"netsMid\":\"UMID_877772003\"," +
                        "\"merchantTxnDtm\":\"<MerchantTxnDtm>\"," +
                        "\"cardHolderName\":\"Ah Hoa\"," +
                        "\"cvv\":\"232\"," +
                        "\"expiryDate\":\"2301\"," +
                        "\"pan\":\"4111111111111111\"," +
                        "\"submissionMode\":\"S\"," +
                        "\"paymentType\":\"SALE\"," +
                        "\"paymentMode\":\"CC\"," +
                        "\"currencyCode\":\"SGD\"," +
                        "\"merchantTimeZone\":\"+7:00\"," +
                        "\"netsMidIndicator\":\"U\" " +
                    "}" +
                "}";


            public class ReplaceKey
            {
                public class TxnReq
                {
                    public const string CardHolderName = "<CardHolderName>";
                    public const string CurrencyCode = "<CurrencyCode>";
                    public const string CVV = "<CVV>";
                    public const string ExpiryDate = "<ExpiryDate>";
                    public const string IpAddress = "<IpAddress>";
                    public const string TimeZone = "<TimeZone>";
                    public const string MerchantTxnDtm = "<MerchantTxnDtm>";
                    public const string MerchantTxnRef = "<MerchantTxnRef>";
                    public const string ENetUMID = "<ENetUMID>";
                    public const string CardNumber = "<CardNumber>";
                    public const string Tid = "<tid>";
                    public const string Amount = "<Amount>";
                    public const string B2sTxnEndURL = "<b2sTxnEndURL>";
                    public const string S2sTxnEndURL = "<s2sTxnEndURL>";
                }
            }
        }

        public class Command
        {
            public const string MEMBER_AUTHENTICATION = "MEMBER AUTHENTICATION";
            public const string MEMBER_ENQUIRY = "MEMBER ENQUIRY";
            public const string GET_CUSTOM_CODES = "GET CUSTOM CODES";
            public const string GET_VOUCHERS = "GET VOUCHERS";
            public const string VOUCHER_REDEMPTION = "VOUCHER REDEMPTION";
            public const string REWARD_CAMPAIGN = "REWARD CAMPAIGN";
            public const string UPDATE_PROFILE3 = "UPDATE PROFILE3";
            public const string SEND_EMAIL = "SEND EMAIL";


            public const string AddTicket = "addticket";
            public const string CheckScanTicket = "checkscanticket";
            public const string CheckTicket = "checkticket";
            public const string GetFee = "feecalc";
        }
    }
}