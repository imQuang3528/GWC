using GreateRewardsService.Entities;
using GreateRewardsService.Models.ResponseModels;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using System.Web;

namespace GreateRewardsService.Services
{
    public class GameScoreService
    {
        private readonly PaymentDbContext context = new PaymentDbContext();

        public Task<List<StoreGameScoreResponseModel>> TaskGetDetailUser(string memberId, string gameId)
        {

            Task<List<StoreGameScoreResponseModel>> taskGetUserDetail = new Task<List<StoreGameScoreResponseModel>>(() =>
            {
                var lstUserScore = new List<StoreGameScoreResponseModel>();
                lstUserScore = GetDetailUser(memberId, gameId);
                return lstUserScore;
            }
            );
            taskGetUserDetail.Start();
            taskGetUserDetail.Wait();
            return taskGetUserDetail;
        }

        public Task<List<StoreGameScoreResponseModel>> TaskGetListUser(string memberId, string gameId, int numberDisplay)
        {

            Task<List<StoreGameScoreResponseModel>> taskGetUserDetail = new Task<List<StoreGameScoreResponseModel>>(() =>
            {
                var lstUserScore = new List<StoreGameScoreResponseModel>();
                lstUserScore = GetListUser(memberId, gameId, numberDisplay);
                return lstUserScore;
            }
            );
            taskGetUserDetail.Start();
            taskGetUserDetail.Wait();
            return taskGetUserDetail;
        }

        private List<StoreGameScoreResponseModel> GetDetailUser(string memberId, string gameId)
        {
            var lstUserScore = new List<StoreGameScoreResponseModel>();
            string FilePath = Path.Combine(Path.Combine(AppDomain.CurrentDomain.BaseDirectory), @"SQLScripts\GetDetailUser.sql");
            string sqlCommand = File.ReadAllText(FilePath);
            var memberParam = new SqlParameter("@MemberId", memberId);
            var gameParam = new SqlParameter("@GameId", gameId);
            lstUserScore = context.Database.SqlQuery<StoreGameScoreResponseModel>(sqlCommand, memberParam, gameParam).ToList();
            return lstUserScore;
        }

        private List<StoreGameScoreResponseModel> GetListUser(string memberId, string gameId, int numberDisplay)
        {
            var lstUserScore = new List<StoreGameScoreResponseModel>();
            string FilePath = Path.Combine(Path.Combine(AppDomain.CurrentDomain.BaseDirectory), @"SQLScripts\RawQuerySQL.sql");
            string sqlCommand = File.ReadAllText(FilePath);
            var memberParam = new SqlParameter("@MemberId", memberId);
            var gameParam = new SqlParameter("@GameId", gameId);
            var numberDisplayParam = new SqlParameter("@NumberDisplay", numberDisplay);
            lstUserScore = context.Database.SqlQuery<StoreGameScoreResponseModel>(sqlCommand, memberParam, gameParam, numberDisplayParam).OrderBy(x => x.Rank).ToList();
            var newLstUserScore = new List<StoreGameScoreResponseModel>();
            if (lstUserScore.Count > 0)
            {
                lstUserScore.ForEach(item =>
                {
                    if (item.MemberId == memberId)
                    {
                        var objUserScore = new StoreGameScoreResponseModel();
                        objUserScore.MemberId = memberId;
                        objUserScore.CurrentHighestScore = item.CurrentHighestScore;
                        objUserScore.StartTimeGame = item.StartTimeGame;
                        objUserScore.EndTimeGame = item.EndTimeGame;
                        objUserScore.MemberName = item.MemberName;
                        objUserScore.Rank = item.Rank;
                        newLstUserScore.Add(objUserScore);
                    }
                    else
                    {
                        var objUserScore = new StoreGameScoreResponseModel();
                        objUserScore.CurrentHighestScore = item.CurrentHighestScore;
                        objUserScore.StartTimeGame = item.StartTimeGame;
                        objUserScore.EndTimeGame = item.EndTimeGame;
                        objUserScore.MemberName = ReturnIncognito(item.MemberName);
                        objUserScore.Rank = item.Rank;
                        newLstUserScore.Add(objUserScore);
                    }
                });
            }
            return newLstUserScore;
        }

        public async Task<bool> SaveScoreGame(GameScore gameScore)
        {
            var member = await context.GameScores.Where(x => x.MemberId == gameScore.MemberId && x.GameId == gameScore.GameId).FirstOrDefaultAsync();
            if (member != null)
            {
                if (member.CurrentHighestScore < gameScore.CurrentHighestScore)
                {
                    member.CurrentHighestScore = gameScore.CurrentHighestScore;
                    var result = await context.SaveChangesAsync() > 0;
                    return result;
                }
                return true;
            }
            else
            {
                context.GameScores.Add(gameScore);
                var result = await context.SaveChangesAsync() > 0;
                return result;
            }
        }

        private string ReturnIncognito(string name)
        {
            if (!string.IsNullOrEmpty(name))
            {
                var lstName = name.Split(' ');
                var newName = "";
                if (lstName.Length > 0)
                {
                    for (int i = 0; i < lstName.Length; i++)
                    {
                        if (i == 0)
                        {
                            newName = lstName[i];
                        }
                        else
                        {
                            newName += " " + lstName[i].Substring(0, 1) + "xxx";
                        }
                    }
                }
                return newName;
            }
            return name;
        }
    }
}