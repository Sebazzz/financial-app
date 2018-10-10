// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : 20180427062904_WeeklyDigest.cs
//  Project         : App
// ******************************************************************************
using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace App.Migrations
{
    public partial class WeeklyDigest : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Preferences_EnableWeeklyDigest",
                table: "AspNetUsers",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastWeeklyDigestTimestamp",
                table: "AppOwner",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Preferences_EnableWeeklyDigest",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "LastWeeklyDigestTimestamp",
                table: "AppOwner");
        }
    }
}
