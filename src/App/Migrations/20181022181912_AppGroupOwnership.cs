using Microsoft.EntityFrameworkCore.Migrations;

namespace App.Migrations
{
    public partial class AppGroupOwnership : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "HasOwnership",
                table: "AppUserAvailableGroup",
                nullable: false,
                defaultValue: false);


            migrationBuilder.Sql(@"
UPDATE ag
SET HasOwnership = IIF(usr.CurrentGroupId = ag.GroupId, 1, 0)
FROM dbo.AppUserAvailableGroup ag
INNER JOIN dbo.AspNetUsers usr ON usr.Id = ag.UserId
");

            migrationBuilder.AddColumn<int>(
                name: "GroupId",
                table: "AppUserTrustedUsers",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.Sql(@"
INSERT INTO [AppUserTrustedUsers] ([SourceUserId]
      ,[TargetUserId]
      ,[IsActive]
      ,[SecurityToken]
      ,[CreationDate]
      ,[GroupId])
SELECT ag.UserId,
	   tgtUsr.Id,
	   1,
	   NEWID(),
	   SYSDATETIME(),
	   ag.GroupId
FROM [AppUserAvailableGroup] ag
INNER JOIN [AppUserAvailableGroup] tgtUserGrp ON tgtUserGrp.GroupId = ag.GroupId AND tgtUserGrp.HasOwnership = 1
INNER JOIN [AspNetUsers] tgtUsr ON tgtUsr.Id = tgtUserGrp.UserId
WHERE ag.[HasOwnership] = 0
");

            migrationBuilder.CreateIndex(
                name: "IX_AppUserTrustedUsers_GroupId",
                table: "AppUserTrustedUsers",
                column: "GroupId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppUserTrustedUsers_AppOwner_GroupId",
                table: "AppUserTrustedUsers",
                column: "GroupId",
                principalTable: "AppOwner",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppUserTrustedUsers_AppOwner_GroupId",
                table: "AppUserTrustedUsers");

            migrationBuilder.DropIndex(
                name: "IX_AppUserTrustedUsers_GroupId",
                table: "AppUserTrustedUsers");

            migrationBuilder.DropColumn(
                name: "GroupId",
                table: "AppUserTrustedUsers");

            migrationBuilder.DropColumn(
                name: "HasOwnership",
                table: "AppUserAvailableGroup");
        }
    }
}
