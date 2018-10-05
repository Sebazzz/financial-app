using Microsoft.EntityFrameworkCore.Migrations;

namespace App.Migrations
{
    public partial class RenameAppUsersImpersonation : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("UPDATE dbo.AppUserTrustedUsers SET SourceUserId = TargetUserId, TargetUserId = SourceUserId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
