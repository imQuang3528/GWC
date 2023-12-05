namespace GreateRewardsService.Entities
{
    public class DatabaseInitializer //: MigrateDatabaseToLatestVersion<PaymentDbContext, Configuration>
    {
        //private DbMigrator dbMigrator;
        //public DatabaseInitializer()
        //{

        //}
        //public override void InitializeDatabase(PaymentDbContext context)
        //{
        //    context.Database.CreateIfNotExists();
        //    dbMigrator = new DbMigrator(new Configuration(), context);
        //    dbMigrator.Configuration.AutomaticMigrationDataLossAllowed = true;
        //    dbMigrator.Configuration.AutomaticMigrationsEnabled = true;

        //    System.Data.Entity.Infrastructure.DbConnectionInfo targetDb = dbMigrator.Configuration.TargetDatabase;

        //    System.Collections.Generic.IEnumerable<string> pending = dbMigrator.GetPendingMigrations();
        //    System.Collections.Generic.IEnumerable<string> local = dbMigrator.GetLocalMigrations();
        //    System.Collections.Generic.IEnumerable<string> database = dbMigrator.GetDatabaseMigrations();


        //    System.Console.WriteLine(pending.Count());
        //    System.Console.WriteLine(local.Count());
        //    System.Console.WriteLine(database.Count());
        //    foreach (string item in pending)
        //    {
        //        try
        //        {
        //            dbMigrator.Update(item);
        //        }
        //        catch (Exception ex)
        //        {
        //            Console.WriteLine(ex.InnerException);
        //        }
        //    }
        //}
    }
}