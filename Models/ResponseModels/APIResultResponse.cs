using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GreateRewardsService.Models.ResponseModels
{
    public class APIResultResponse
    {
        public APIResultResponse()
        {

        }

        public APIResultResponse(bool success, string message)
        {
            if (success == false)
            {
                this.Success = success;
                this.Message = message;
            }
        }
        public int Status { get; set; }
        public string Message { get; set; }
        public bool Success { get; set; }
    }
    public class APIResultResponse<T> : APIResultResponse
    {
        public APIResultResponse(bool success, string message) : base(success, message)
        {
        }
        public APIResultResponse(T result, bool success, string message = "") : base(success, message)
        {
            this.Data = result;
            this.Success = success;
            this.Message = message;
        }

        public T Data { get; set; }
    }
}