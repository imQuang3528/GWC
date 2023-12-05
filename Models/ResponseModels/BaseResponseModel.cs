using System.Collections.Generic;

namespace GreateRewardsService.Models.ResponseModels
{
    public class BaseResponseModel<T> where T : class
    {
        public T Result { get; set; }
        public string TargetUrl { get; set; }
        public bool Success { get; set; }
        public Error Error { get; set; }
        public bool UnAuthorizedRequest { get; set; }
        public bool Abp { get; set; }
    }

    public class Error
    {
        public int Code { get; set; }
        public string Message { get; set; }
        public string Details { get; set; }
        public List<ValidationError> ValidationErrors { get; set; }
    }

    public class ValidationError
    {
        public string Message { get; set; }
        public string Members { get; set; }
    }
}