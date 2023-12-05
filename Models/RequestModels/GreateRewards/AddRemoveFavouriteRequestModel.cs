using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GreateRewardsService.Models.RequestModels
{
    public class AddRemoveFavouriteRequestModel
    {
        public string SubjectCode { get; set; }
        public string SubjectCodeType { get; set; }
        public string FavouriteType { get; set; }
        public int Mode { get; set; }
    }
}