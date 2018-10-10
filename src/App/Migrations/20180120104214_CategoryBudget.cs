// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : 20180120104214_CategoryBudget.cs
//  Project         : App
// ******************************************************************************
using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace App.Migrations
{
    public partial class CategoryBudget : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                @"IF EXISTS (SELECT name FROM sysindexes WHERE name = 'IX_SheetEntryTag_TagId')
                    DROP INDEX [IX_SheetEntryTag_TagId] ON [dbo].[SheetEntryTag]"
            );

            migrationBuilder.AddColumn<decimal>(
                name: "MonthlyBudget",
                table: "Category",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SheetEntryTag_TagId_SheetEntryId",
                table: "SheetEntryTag",
                columns: new[] { "TagId", "SheetEntryId" },
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_SheetEntryTag_TagId_SheetEntryId",
                table: "SheetEntryTag");

            migrationBuilder.DropColumn(
                name: "MonthlyBudget",
                table: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_SheetEntryTag_TagId",
                table: "SheetEntryTag",
                column: "TagId");
        }
    }
}
