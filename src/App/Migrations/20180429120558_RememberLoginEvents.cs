// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : 20180429120558_RememberLoginEvents.cs
//  Project         : App
// ******************************************************************************
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace App.Migrations
{
    public partial class RememberLoginEvents : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Preferences_EnableLoginNotifications",
                table: "AspNetUsers",
                nullable: false,
                defaultValue: true);

            migrationBuilder.CreateTable(
                name: "AppUserLoginEvent",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    IPAddress = table.Column<string>(nullable: false),
                    Timestamp = table.Column<DateTime>(nullable: false),
                    UserAgent = table.Column<string>(maxLength: 4096, nullable: true),
                    UserId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppUserLoginEvent", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppUserLoginEvent_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppUserLoginEvent_UserId",
                table: "AppUserLoginEvent",
                column: "UserId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppUserLoginEvent");

            migrationBuilder.DropColumn(
                name: "Preferences_EnableLoginNotifications",
                table: "AspNetUsers");
        }
    }
}
