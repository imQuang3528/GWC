using GreateRewardsService.Entities;
using GreateRewardsService.Models.RequestModels;
using GreateRewardsService.Models.ResponseModels;
using GreateRewardsService.Services;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web.Http;
using Microsoft.Ajax.Utilities;
using System.Linq;

namespace GreateRewardsService.Controllers
{
    [ClientAuthorize]
    public class GameScoreController : ApiController
    {
        [HttpGet]
        [Route(Constants.Urls.GameScores.GetScoreGame)]
        public async Task<APIResultResponse> GetScoreGame(string memberId, string gameId, int numberDisplay = 1)
        {
            try
            {
                var lstUserResponse = new ListStoreGameScoreResponse();
                GameScoreService gameScoreService = new GameScoreService();
                var taskGetDetail = gameScoreService.TaskGetDetailUser(memberId, gameId);
                var taskGetList = gameScoreService.TaskGetListUser(memberId, gameId, numberDisplay);
                await Task.WhenAll(taskGetDetail, taskGetList);
                var userDetail = taskGetDetail.Result;
                var lstUser = taskGetList.Result;
                lstUserResponse.CurrentUser = userDetail.Count() > 0 ? userDetail[0] : null;
                lstUserResponse.ListUserBoard = lstUser;
                return new APIResultResponse<ListStoreGameScoreResponse>(lstUserResponse, true, "Get success");
            }
            catch (Exception ex)
            {
                return new APIResultResponse(false, ex.Message);
            }
        }

        [HttpPost]
        [Route(Constants.Urls.GameScores.StoreScoreGame)]
        public async Task<APIResultResponse> StoreGameScore([FromBody] GameScore gameScore)
        {
            try
            {
                GameScoreService scoreService = new GameScoreService();
                var result = await scoreService.SaveScoreGame(gameScore);
                return new APIResultResponse<bool>(result, true, "Save success");
            }
            catch (Exception ex)
            {
                return new APIResultResponse(false, ex.Message);
            }
        }

        [HttpPost]
        [Route(Constants.Urls.Game.IssuedGameVoucher)]
        public async Task<APIResultResponse> IssuedGameVoucher([FromBody] GameRequestModel model)
        {
            try
            {
                GameService service = new GameService();
                var result = await service.HandleIssuedGameVoucher(model);
                if (result.Success)
                {
                    return new APIResultResponse<IssuedVoucherResponse>(result, true, "Success");
                }
                return new APIResultResponse<IssuedVoucherResponse>(result, result.Success, result.Message);
            }
            catch (Exception ex)
            {

                return new APIResultResponse(false, ex.Message);
            }
        }
    }
}
