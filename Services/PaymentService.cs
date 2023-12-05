using GreateRewardsService.Entities;
using GreateRewardsService.Models;
using GreateRewardsService.Models.RequestModels;
using GreateRewardsService.Models.ResponseModels;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Caching;
using System.Threading.Tasks;

namespace GreateRewardsService.Services
{
    public class PaymentService
    {
        private readonly PaymentDbContext context = new PaymentDbContext();

        public Guid OnPreSendTxnReq(IssueDigitalVoucherRequestModel model)
        {

            DigitalVoucher digitalVoucher = context.DigitalVouchers.Add(new DigitalVoucher
            {
                Id = Guid.NewGuid(),
                CardNo = model.CardNo,
                OutletCode = model.OutletCode,
                PaymentMethod = string.Empty,
                Src = model.Src,
                TransactionType = model.TransactionType,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
            });
            context.SaveChanges();

            foreach (Models.RequestModels.Voucher voucher in model.Vouchers)
            {
                context.Vouchers.Add(new Entities.Voucher
                {
                    Id = Guid.NewGuid(),
                    DigitalVoucherId = digitalVoucher.Id,
                    VoucherTypeCode = voucher.VoucherTypeCode,
                    Qty = voucher.Qty,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now,
                });
            }
            context.SaveChanges();
            return digitalVoucher.Id;
        }

        public void OnTxnReqSent(Enets trans, IssueDigitalVoucherRequestModel model, string digitalVoucherKey)
        {
            PaymentRequest PaymentRequest = trans.ToPaymentRequest();
            PaymentRequest.Id = Guid.NewGuid();
            PaymentRequest.CreatedAt = DateTime.Now;
            PaymentRequest.UpdatedAt = DateTime.Now;
            context.PaymentRequests.Add(PaymentRequest);
            context.SaveChanges();
            Payment transaction = new Payment
            {
                Id = Guid.NewGuid(),
                PaymentRequest = PaymentRequest,
                PaymentRequestId = PaymentRequest.Id,
                DigitalVoucherId = Guid.Parse(digitalVoucherKey),
                TransactionStatus = "Start",
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
            };
            context.Transactions.Add(transaction);
            context.SaveChanges();
            trans.NotifyURLParam = transaction.Id.ToString();
            trans.ReturnURL += string.Format("?key={0}", digitalVoucherKey);
        }

        public async Task OnTxnResReceivedAsync(TxnRes txnRes)
        {
            try
            {
                PaymentResponse transResponse = new PaymentResponse
                {
                    Id = Guid.NewGuid(),
                    NetsMid = txnRes.Msg.NetsMid,
                    MerchantTxnRef = txnRes.Msg.MerchantTxnRef,
                    NetsMidIndicator = txnRes.Msg.NetsMidIndicator,
                    NetsTxnRef = txnRes.Msg.NetsTxnRef,
                    PaymentMode = txnRes.Msg.PaymentMode,
                    SubmissionMode = txnRes.Msg.SubmissionMode,
                    CurrencyCode = txnRes.Msg.CurrencyCode,
                    MerchantTxnDtm = txnRes.Msg.MerchantTxnDtm,
                    MerchantTimeZone = txnRes.Msg.MerchantTimeZone,
                    PaymentType = txnRes.Msg.PaymentType,
                    B2sTxnEndURLParam = txnRes.Msg.B2sTxnEndURLParam,
                    S2sTxnEndURLParam = txnRes.Msg.S2sTxnEndURLParam,
                    ClientType = txnRes.Msg.ClientType,
                    MaskPan = txnRes.Msg.MaskPan,
                    BankAuthId = txnRes.Msg.BankAuthId,
                    StageRespCode = txnRes.Msg.StageRespCode,
                    TxnRand = txnRes.Msg.TxnRand,
                    ActionCode = txnRes.Msg.ActionCode,
                    NetsTxnDtm = txnRes.Msg.NetsTxnDtm,
                    NetsTimeZone = txnRes.Msg.NetsTimeZone,
                    NetsTxnStatus = txnRes.Msg.NetsTxnStatus,
                    NetsTxnMsg = txnRes.Msg.NetsTxnMsg,
                    NetsAmountDeducted = txnRes.Msg.NetsAmountDeducted,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now,
                };
                context.PaymentResponses.Add(transResponse);

                Payment transaction = context.Transactions.Where(t => t.Id.ToString() == txnRes.Msg.S2sTxnEndURLParam).SingleOrDefault();
                if (transaction != null)
                {
                    transaction.PaymentResponseId = transResponse.Id;
                    transaction.UpdatedAt = DateTime.Now;
                    if ((txnRes.Msg.NetsTxnMsg.ToUpper() == "APPROVAL" || txnRes.Msg.NetsTxnMsg.ToUpper() == "SUCCESSFUL") && txnRes.Msg.NetsTxnStatus == "0")
                    {
                        transaction.TransactionStatus = "Payment Successed";
                        MemoryCache cache = MemoryCache.Default;
                        IssueDigitalVoucherRequestModel model = GetBody(Guid.Parse(txnRes.Msg.B2sTxnEndURLParam));
                        if (txnRes.Msg.MaskPan.StartsWith("4"))
                        {
                            model.PaymentMethod = "VISA";
                        }
                        if (txnRes.Msg.MaskPan.StartsWith("5"))
                        {
                            model.PaymentMethod = "MASTER";
                        }
                        model.Remarks = txnRes.Msg.MerchantTxnRef;
                        object res = await RequestHelper<IssueDigitalVoucherRequestModel>.Post(model, Constants.Urls.Vendor.IssueDigitalVoucher);
                        JObject obj = JObject.Parse(res.ToString());
                        if (Convert.ToBoolean(obj["success"]))
                        {
                            transaction.TransactionStatus = "Completed";
                            var issuedVouchers = obj["result"]["issuedVoucherLists"].Select(c => new { VoucherNo = c["voucherNo"].ToString(), VoucherTypeCode = c["voucherTypeCode"].ToString(), Type = c["type"].ToString() }).ToList();
                            var vouchers = context.Vouchers.Where(c => c.DigitalVoucherId.ToString() == transResponse.B2sTxnEndURLParam).ToList();
                            foreach (var voucher in vouchers)
                            {
                                voucher.VoucherNo = String.Join(";", issuedVouchers.Where(c => c.VoucherTypeCode == voucher.VoucherTypeCode).Select(c => c.VoucherNo).ToList());
                                voucher.VoucherType = issuedVouchers.Where(c => c.VoucherTypeCode == voucher.VoucherTypeCode).Select(c => c.Type).First();
                            }
                        }
                        else
                        {
                            transaction.TransactionStatus = "Voucher issued failed. Please contact us for further assistance.";
                        }
                    }
                    else
                    {
                        transaction.TransactionStatus = "Payment failed. Please try again.";
                    }
                }
                context.SaveChanges();
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        public TransactionStatus GetTransactionStatus(string digitalVoucherId)
        {
            Payment transaction = context.Transactions.Where(t => t.DigitalVoucherId.ToString() == digitalVoucherId).FirstOrDefault();
            var response = new TransactionStatus();
            if (transaction == null)
            {
                response.Status = string.Empty;
            }
            else
            {
                response.Status = transaction.TransactionStatus;
                if (response.Status == "Completed")
                {
                    response.Vouchers = new List<IssuedVoucher>();
                    var issuedVoucher = context.Vouchers.Where(c => c.DigitalVoucherId.ToString() == transaction.DigitalVoucherId.ToString()).ToList();
                    foreach (var item in issuedVoucher)
                    {
                        response.Vouchers.Add(new IssuedVoucher
                        {
                            VoucherTypeCode = item.VoucherTypeCode,
                            VoucherNo = item.VoucherNo.Split(';').ToList(),
                            Type = item.VoucherType
                        });
                    }
                }

            }
            return response;
        }

        public IssueDigitalVoucherRequestModel GetBody(Guid digitalVoucherId)
        {
            DigitalVoucher savedDigitalVoucher = context.DigitalVouchers.Where(d => d.Id == digitalVoucherId).FirstOrDefault();
            List<Entities.Voucher> savedVouchers = context.Vouchers.Where(d => d.DigitalVoucherId == digitalVoucherId).ToList();
            IssueDigitalVoucherRequestModel result = new IssueDigitalVoucherRequestModel()
            {
                CardNo = savedDigitalVoucher.CardNo,
                OutletCode = savedDigitalVoucher.OutletCode,
                PaymentMethod = savedDigitalVoucher.PaymentMethod,
                Src = savedDigitalVoucher.Src,
                TransactionType = savedDigitalVoucher.TransactionType,
                RetrieveIssuedVouchersList = true,
                Vouchers = new List<Models.RequestModels.Voucher>()
            };
            foreach (Entities.Voucher voucher in savedVouchers)
            {
                result.Vouchers.Add(new Models.RequestModels.Voucher { Qty = voucher.Qty, VoucherTypeCode = voucher.VoucherTypeCode });
            }
            return result;
        }
    }
}