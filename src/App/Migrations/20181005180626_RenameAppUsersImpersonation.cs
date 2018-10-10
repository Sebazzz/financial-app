// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : 20181005180626_RenameAppUsersImpersonation.cs
//  Project         : App
// ******************************************************************************
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
