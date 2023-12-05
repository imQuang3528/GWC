using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GreateRewardsService.Models.ResponseModels
{

    public class CustomCodeResponse
    {      
        public int TotalResults { get; set; }
        public List<CustomCodes> CustomCodes { get; set; }
        public int ReturnStatus { get; set; }
        public string ReturnMessage { get; set; }
        public string RequestTime { get; set; }
        public string ResponseTime { get; set; }
    }

    public class CustomCodes
    {
        public string CustomCode { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string ParentCode { get; set; }
        public string ParentID { get; set; }
    }
}