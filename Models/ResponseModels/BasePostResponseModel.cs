using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GreateRewardsService.Models.ResponseModels
{
    public class BasePostResponseModel<T>
    {
        public T Result { get; set; }
        public bool Success { get; set; }
        public object Error { get; set; }
    }
}