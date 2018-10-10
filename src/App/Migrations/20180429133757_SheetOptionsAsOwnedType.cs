// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : 20180429133757_SheetOptionsAsOwnedType.cs
//  Project         : App
// ******************************************************************************
using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace App.Migrations
{
    public partial class SheetOptionsAsOwnedType : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "CalculationOptions_BankAccountOffset",
                table: "Sheet",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "CalculationOptions_SavingsAccountOffset",
                table: "Sheet",
                nullable: true);

            migrationBuilder.Sql(@"
                UPDATE sheet
                SET CalculationOptions_SavingsAccountOffset = calcOpts.SavingsAccountOffset,
                    CalculationOptions_BankAccountOffset = calcOpts.BankAccountOffset
                FROM dbo.Sheet sheet
                INNER JOIN dbo.CalculationOptions calcOpts ON calcOpts.SheetId = sheet.Id
            ");

            migrationBuilder.DropTable(
                name: "CalculationOptions");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CalculationOptions",
                columns: table => new
                {
                    SheetId = table.Column<int>(nullable: false),
                    BankAccountOffset = table.Column<decimal>(nullable: true),
                    SavingsAccountOffset = table.Column<decimal>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CalculationOptions", x => x.SheetId);
                    table.ForeignKey(
                        name: "FK_CalculationOptions_Sheet_SheetId",
                        column: x => x.SheetId,
                        principalTable: "Sheet",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.Sql(@"
                INSERT INTO CalculationOptions(SheetId, BankAccountOffset, SavingsAccountOffset)
                SELECT Id, CalculationOptions_BankAccountOffset, CalculationOptions_SavingsAccountOffset
                FROM dbo.Sheet
            ");

            migrationBuilder.DropColumn(
                name: "CalculationOptions_BankAccountOffset",
                table: "Sheet");

            migrationBuilder.DropColumn(
                name: "CalculationOptions_SavingsAccountOffset",
                table: "Sheet");
        }
    }
}
