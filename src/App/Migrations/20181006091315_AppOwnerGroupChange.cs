// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : 20181006091315_AppOwnerGroupChange.cs
//  Project         : App
// ******************************************************************************
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace App.Migrations
{
    public partial class AppOwnerGroupChange : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Legacy EF6 converted database really is a mess
            migrationBuilder.Sql(@"
IF (OBJECT_ID('FK_AppUser_AppOwner_GroupId', 'F') IS NOT NULL)
BEGIN
    ALTER TABLE [dbo].[AspNetUsers] DROP CONSTRAINT [FK_AppUser_AppOwner_GroupId]

    ALTER TABLE [dbo].[AspNetUsers]  WITH CHECK ADD  CONSTRAINT [FK_AspNetUsers_AppOwner_GroupId] FOREIGN KEY([GroupId]) REFERENCES [dbo].[AppOwner] ([Id]) ON DELETE CASCADE

    ALTER TABLE [dbo].[AspNetUsers] CHECK CONSTRAINT [FK_AspNetUsers_AppOwner_GroupId]
END

IF IndexProperty(Object_Id('AspNetUsers'), 'IX_AspNetUsers_GroupId', 'IndexId') IS NULL
BEGIN
    CREATE INDEX IX_AspNetUsers_GroupId ON dbo.AspNetUsers(GroupId)
END
");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_AppOwner_GroupId",
                table: "AspNetUsers");

            migrationBuilder.RenameColumn(
                name: "GroupId",
                table: "AspNetUsers",
                newName: "CurrentGroupId");

            migrationBuilder.RenameIndex(
                name: "IX_AspNetUsers_GroupId",
                table: "AspNetUsers",
                newName: "IX_AspNetUsers_CurrentGroupId");

            migrationBuilder.CreateTable(
                name: "AppUserAvailableGroup",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    GroupId = table.Column<int>(nullable: false),
                    UserId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppUserAvailableGroup", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppUserAvailableGroup_AppOwner_GroupId",
                        column: x => x.GroupId,
                        principalTable: "AppOwner",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AppUserAvailableGroup_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppUserAvailableGroup_GroupId",
                table: "AppUserAvailableGroup",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_AppUserAvailableGroup_UserId",
                table: "AppUserAvailableGroup",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_AppOwner_CurrentGroupId",
                table: "AspNetUsers",
                column: "CurrentGroupId",
                principalTable: "AppOwner",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            // Convert impersonation to app groups
            migrationBuilder.Sql(@"
INSERT INTO dbo.AppUserAvailableGroup (GroupId, UserId)
SELECT DISTINCT q.GroupId, q.UserId
FROM (
    -- You are always part of your own group, of course
    SELECT u.CurrentGroupId AS GroupId, u.Id AS UserId
    FROM dbo.AspNetUsers u

    UNION ALL

    -- Impersonations [source can impersonate target]
    SELECT tgtUser.CurrentGroupId AS GroupId, srcUser.Id
    FROM dbo.AspNetUsers srcUser
    INNER JOIN AppUserTrustedUsers srcTrustedUser ON srcTrustedUser.SourceUserId = srcUser.Id
    INNER JOIN dbo.AspNetUsers tgtUser ON tgtUser.Id = srcTrustedUser.TargetUserId
) q
");

            migrationBuilder.Sql(@"
DELETE FROM dbo.AppUserTrustedUsers
");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_AppOwner_CurrentGroupId",
                table: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "AppUserAvailableGroup");

            migrationBuilder.RenameColumn(
                name: "CurrentGroupId",
                table: "AspNetUsers",
                newName: "GroupId");

            migrationBuilder.RenameIndex(
                name: "IX_AspNetUsers_CurrentGroupId",
                table: "AspNetUsers",
                newName: "IX_AspNetUsers_GroupId");

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_AppOwner_GroupId",
                table: "AspNetUsers",
                column: "GroupId",
                principalTable: "AppOwner",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
