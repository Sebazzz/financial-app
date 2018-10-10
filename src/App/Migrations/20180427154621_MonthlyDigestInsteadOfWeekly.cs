// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : 20180427154621_MonthlyDigestInsteadOfWeekly.cs
//  Project         : App
// ******************************************************************************
using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace App.Migrations
{
    public partial class MonthlyDigestInsteadOfWeekly : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Preferences_EnableWeeklyDigest",
                table: "AspNetUsers",
                newName: "Preferences_EnableMonthlyDigest");

            migrationBuilder.RenameColumn(
                name: "LastWeeklyDigestTimestamp",
                table: "AppOwner",
                newName: "LastMonthlyDigestTimestamp");

            migrationBuilder.Sql("UPDATE dbo.AspNetUsers SET Preferences_EnableMonthlyDigest = 1");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Preferences_EnableMonthlyDigest",
                table: "AspNetUsers",
                newName: "Preferences_EnableWeeklyDigest");

            migrationBuilder.RenameColumn(
                name: "LastMonthlyDigestTimestamp",
                table: "AppOwner",
                newName: "LastWeeklyDigestTimestamp");
        }
    }
}
