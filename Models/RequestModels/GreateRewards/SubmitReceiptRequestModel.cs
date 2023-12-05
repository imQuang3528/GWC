using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GreateRewardsService.Models.RequestModels
{
    public class SubmitReceiptRequestModel
    {
        public int OrganizationUnitId { get; set; }
        public string Src { get; set; }
        public List<Receipt> Receipts { get; set; }
    }

    public class Receipt
    {
        public DateTime TransactDate { get; set; }
        public int Amount { get; set; }
        public string OutletCode { get; set; }
        public string ReceiptNumber { get; set; }
        public List<string> TempImageGuid { get; set; }
        public string SourceRemarks { get; set; }
    }
}