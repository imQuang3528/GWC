using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GreateRewardsService.Models
{
    public class CheckTicketRequestModel
    {
        public string Cmd { get; set; }
        public string Ticketno { get; set; }
        public string Accesscode { get; set; }
    }
    public class AddTicketRequestModel : CheckTicketRequestModel
    {
        public int Returnstatus { get; set; }
        public string Tickettype { get; set; }
        public string Ticketvalue { get; set; }
        public string Expiry { get; set; }
    }
}