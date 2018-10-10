// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : 20181005174355_AddAppUserSecurityTrustedToken.cs
//  Project         : App
// ******************************************************************************
using Microsoft.EntityFrameworkCore.Migrations;

namespace App.Migrations
{
    public partial class AddAppUserSecurityTrustedToken : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder) {
            migrationBuilder.Sql("DELETE FROM dbo.AppUserTrustedUsers WHERE SourceUserId IS NULL");

            // Backwards compat, especially for EF6 migrated databases (like my own, mumble mumble)
            migrationBuilder.Sql(@"
IF (OBJECT_ID('FK_AppUserTrustedUsers_AspNetUsers_SourceUserId', 'F') IS NOT NULL)
BEGIN
  ALTER TABLE dbo.AppUserTrustedUsers DROP CONSTRAINT FK_AppUserTrustedUsers_AspNetUsers_SourceUserId
END

IF (OBJECT_ID('FK_AppUserTrustedUsers_AspNetUsers_TargetUserId', 'F') IS NOT NULL)
BEGIN
  ALTER TABLE dbo.AppUserTrustedUsers DROP CONSTRAINT FK_AppUserTrustedUsers_AspNetUsers_TargetUserId
END

IF IndexProperty(Object_Id('AppUserTrustedUsers'), 'IX_AppUserTrustedUsers_SourceUserId', 'IndexId') IS NULL
BEGIN
    CREATE INDEX IX_AppUserTrustedUsers_SourceUserId ON dbo.AppUserTrustedUsers(SourceUserId)
END

IF IndexProperty(Object_Id('AppUserTrustedUsers'), 'IX_AppUserTrustedUsers_TargetUserId', 'IndexId') IS NULL
BEGIN
    CREATE INDEX IX_AppUserTrustedUsers_TargetUserId ON dbo.AppUserTrustedUsers(TargetUserId)
END
");

            migrationBuilder.AlterColumn<int>(
                name: "SourceUserId",
                table: "AppUserTrustedUsers",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "AppUserTrustedUsers",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "SecurityToken",
                table: "AppUserTrustedUsers",
                nullable: false,
                defaultValueSql: "NEWID()");

            migrationBuilder.AddForeignKey(
                name: "FK_AppUserTrustedUsers_AspNetUsers_SourceUserId",
                table: "AppUserTrustedUsers",
                column: "SourceUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AppUserTrustedUsers_AspNetUsers_TargetUserId",
                table: "AppUserTrustedUsers",
                column: "TargetUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppUserTrustedUsers_AspNetUsers_SourceUserId",
                table: "AppUserTrustedUsers");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "AppUserTrustedUsers");

            migrationBuilder.DropColumn(
                name: "SecurityToken",
                table: "AppUserTrustedUsers");

            migrationBuilder.AlterColumn<int>(
                name: "SourceUserId",
                table: "AppUserTrustedUsers",
                nullable: true,
                oldClrType: typeof(int));

            migrationBuilder.AddForeignKey(
                name: "FK_AppUserTrustedUsers_AspNetUsers_SourceUserId",
                table: "AppUserTrustedUsers",
                column: "SourceUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
