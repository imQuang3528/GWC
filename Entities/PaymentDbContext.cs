using GreateRewardsService.Entities;
using System.Data.Entity;
using System.Data.Entity.ModelConfiguration.Conventions;

namespace GreateRewardsService
{
    public class PaymentDbContext : DbContext
    {
        public PaymentDbContext() : base("TransactionConnection")
        {
            Database.SetInitializer<PaymentDbContext>(new MigrateDatabaseToLatestVersion<PaymentDbContext, GreateRewardsService.Migrations.Configuration>());
        }

        public DbSet<Voucher> Vouchers { get; set; }
        public DbSet<DigitalVoucher> DigitalVouchers { get; set; }
        public DbSet<PaymentRequest> PaymentRequests { get; set; }
        public DbSet<PaymentResponse> PaymentResponses { get; set; }
        public DbSet<Payment> Transactions { get; set; }
        public DbSet<GameScore> GameScores { get; set; }
        public DbSet<GameScoreDetail> GameScoreDetails { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Conventions.Remove<PluralizingTableNameConvention>();
        }
    }
}