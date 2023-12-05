using GreateRewardsService.Models;
using GreateRewardsService.Models.CarPark;
using System;
using System.Configuration;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;

namespace GreateRewardsService.Controllers
{
    public class CarParkController : ApiController
    {
        [HttpPost]
        [Route(Constants.Urls.CarPark.TMTicket)]
        public async Task<object> Ticket_TM(BaseRequestModel model)
        {
            string url = ConfigurationManager.AppSettings[Constants.AppSettingKeys.CarPark_EndPointPrefix_TM] + Constants.Urls.CarPark.Ticket + ".php";
            return await sendRequest(model, url);
        }

        [HttpPost]
        [Route(Constants.Urls.CarPark.GRTicket)]
        public async Task<object> Ticket_GW(BaseRequestModel model)
        {
            string url = ConfigurationManager.AppSettings[Constants.AppSettingKeys.CarPark_EndPointPrefix_GW] + Constants.Urls.CarPark.Ticket + ".php";
            return await sendRequest(model, url);
        }

        [HttpPost]
        [Route(Constants.Urls.CarPark.TMFeeRouter)]
        public async Task<object> TMGetFee(BaseRequestModel model)
        {
            string url = ConfigurationManager.AppSettings[Constants.AppSettingKeys.CarPark_EndPointPrefix_TM] + Constants.Urls.CarPark.FeeEndpoint + ".php";
            return await sendRequest(model, url);
        }

        [HttpPost]
        [Route(Constants.Urls.CarPark.GRFeeRouter)]
        public async Task<GetFeeResponse> GRGetFee(BaseRequestModel model)
        {
            GetFeeResponse result;
            try
            {
                string urlGW = ConfigurationManager.AppSettings[Constants.AppSettingKeys.CarPark_EndPointPrefix_GW] + Constants.Urls.CarPark.FeeEndpoint + ".php";
                string urlTM = ConfigurationManager.AppSettings[Constants.AppSettingKeys.CarPark_EndPointPrefix_TM] + Constants.Urls.CarPark.FeeEndpoint + ".php";

                var key = CreateMD5(ConfigurationManager.AppSettings[Constants.AppSettingKeys.CarPark_Key] + model.Iu + model.Time);
                GetFeeResponse getFeeResponseGW = await RequestHelper<GetFeeRequest>.PostCarParkFee(new GetFeeRequest { Cmd = model.Cmd, Key = key, Time = model.Time, Iu = model.Iu, Debug = model.Debug }, urlGW);
                if (getFeeResponseGW != null && getFeeResponseGW.result != null && getFeeResponseGW.result.ToLower().Equals("ok"))
                {
                    result = getFeeResponseGW;
                    if (result != null)
                    {
                        result.mall = "Great World";
                    }
                }
                else
                {
                    result = await RequestHelper<GetFeeRequest>.PostCarParkFee(new GetFeeRequest { Cmd = model.Cmd, Key = key, Time = model.Time, Iu = model.Iu, Debug = model.Debug }, urlTM);
                    if (result != null)
                    {
                        result.mall = "Tanglin Mall";
                    }
                }
                if (result == null)
                {
                    result = new GetFeeResponse { cmd = model.Cmd , iu = model.Iu, result = "fail", reason = "no entry record" };
                }
            }
            catch (System.Exception ex)
            {
                return new GetFeeResponse { reason = ex.Message };
            }

            return result;
        }

        private async Task<object> sendRequest(BaseRequestModel model, string url)
        {
            if (string.IsNullOrEmpty(url))
            {
                url = ConfigurationManager.AppSettings[Constants.AppSettingKeys.CarPark_EndPointPrefix_TM] + Constants.Urls.CarPark.Ticket + ".php";
            }

            object result = null;
            try
            {
                var key = "";
                switch (model.Cmd)
                {
                    case Constants.Command.AddTicket:
                        key = CreateMD5(ConfigurationManager.AppSettings[Constants.AppSettingKeys.CarPark_Key] + model.Ticketno);
                        result = await RequestHelper<AddTicket>.PostCarPark(new AddTicket { Cmd = model.Cmd, Accesscode = key, Iucardno = model.Iucardno, Ticketno = model.Ticketno, Tickettype = model.Tickettype, Ticketvalue = model.Ticketvalue }, url);
                        break;
                    case Constants.Command.CheckScanTicket:
                        key = CreateMD5(ConfigurationManager.AppSettings[Constants.AppSettingKeys.CarPark_Key] + model.Iucardno);
                        result = await RequestHelper<CheckScanTicket>.PostCarPark(new CheckScanTicket { Cmd = model.Cmd, Accesscode = key, Iucardno = model.Iucardno }, url);
                        break;
                    case Constants.Command.CheckTicket:
                        key = CreateMD5(ConfigurationManager.AppSettings[Constants.AppSettingKeys.CarPark_Key] + model.Ticketno);
                        result = await RequestHelper<CheckTicket>.PostCarPark(new CheckTicket { Cmd = model.Cmd, Accesscode = key, Ticketno = model.Ticketno }, url);
                        break;
                }
            }
            catch (System.Exception ex)
            {
                return BadRequest(ex.Message);
            }
            return result;
        }

        private string CreateMD5(string input)
        {
            // Create an instance of the MD5 hash algorithm class
            MD5 md5 = MD5.Create();

            // Convert the input string to a byte array
            byte[] inputBytes = Encoding.ASCII.GetBytes(input);

            // Compute the MD5 hash of the input byte array
            byte[] hashBytes = md5.ComputeHash(inputBytes);

            // Convert the hash byte array to a hexadecimal string
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < hashBytes.Length; i++)
            {
                sb.Append(hashBytes[i].ToString("x2"));
            }
            return sb.ToString();
        }
    }
}