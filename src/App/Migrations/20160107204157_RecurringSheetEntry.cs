// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : 20160107204157_RecurringSheetEntry.cs
//  Project         : App
// ******************************************************************************
using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Metadata;

namespace App.Migrations
{
    public partial class RecurringSheetEntry : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(name: "FK_CalculationOptions_Sheet_SheetId", table: "CalculationOptions");
            migrationBuilder.DropForeignKey(name: "FK_Category_AppOwner_OwnerId", table: "Category");
            migrationBuilder.DropForeignKey(name: "FK_AppUser_AppOwner_GroupId", table: "AspNetUsers");
            migrationBuilder.DropForeignKey(name: "FK_Sheet_AppOwner_OwnerId", table: "Sheet");
            migrationBuilder.DropForeignKey(name: "FK_SheetEntry_Sheet_SheetId", table: "SheetEntry");
            migrationBuilder.DropForeignKey(name: "FK_IdentityRoleClaim<int>_AppRole_RoleId", table: "AspNetRoleClaims");
            migrationBuilder.DropForeignKey(name: "FK_IdentityUserClaim<int>_AppUser_UserId", table: "AspNetUserClaims");
            migrationBuilder.DropForeignKey(name: "FK_IdentityUserLogin<int>_AppUser_UserId", table: "AspNetUserLogins");
            migrationBuilder.DropForeignKey(name: "FK_IdentityUserRole<int>_AppRole_RoleId", table: "AspNetUserRoles");
            migrationBuilder.DropForeignKey(name: "FK_IdentityUserRole<int>_AppUser_UserId", table: "AspNetUserRoles");
            migrationBuilder.CreateTable(
                name: "RecurringSheetEntry",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Account = table.Column<int>(nullable: false),
                    CategoryId = table.Column<int>(nullable: false),
                    Delta = table.Column<decimal>(nullable: false),
                    OwnerId = table.Column<int>(nullable: false),
                    Remark = table.Column<string>(nullable: true),
                    SortOrder = table.Column<int>(nullable: false),
                    Source = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecurringSheetEntry", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RecurringSheetEntry_Category_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Category",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RecurringSheetEntry_AppOwner_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "AppOwner",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });
            migrationBuilder.CreateTable(
                name: "SheetRecurringSheetEntry",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    SheetId = table.Column<int>(nullable: false),
                    TemplateId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SheetRecurringSheetEntry", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SheetRecurringSheetEntry_Sheet_SheetId",
                        column: x => x.SheetId,
                        principalTable: "Sheet",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SheetRecurringSheetEntry_RecurringSheetEntry_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "RecurringSheetEntry",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });
            migrationBuilder.AddColumn<int>(
                name: "TemplateId",
                table: "SheetEntry",
                nullable: true);
            migrationBuilder.AddForeignKey(
                name: "FK_CalculationOptions_Sheet_SheetId",
                table: "CalculationOptions",
                column: "SheetId",
                principalTable: "Sheet",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
            migrationBuilder.AddForeignKey(
                name: "FK_Category_AppOwner_OwnerId",
                table: "Category",
                column: "OwnerId",
                principalTable: "AppOwner",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
            migrationBuilder.AddForeignKey(
                name: "FK_AppUser_AppOwner_GroupId",
                table: "AspNetUsers",
                column: "GroupId",
                principalTable: "AppOwner",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
            migrationBuilder.AddForeignKey(
                name: "FK_Sheet_AppOwner_OwnerId",
                table: "Sheet",
                column: "OwnerId",
                principalTable: "AppOwner",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
            migrationBuilder.AddForeignKey(
                name: "FK_SheetEntry_Sheet_SheetId",
                table: "SheetEntry",
                column: "SheetId",
                principalTable: "Sheet",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
            migrationBuilder.AddForeignKey(
                name: "FK_SheetEntry_RecurringSheetEntry_TemplateId",
                table: "SheetEntry",
                column: "TemplateId",
                principalTable: "RecurringSheetEntry",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
            migrationBuilder.AddForeignKey(
                name: "FK_IdentityRoleClaim<int>_AppRole_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId",
                principalTable: "AspNetRoles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
            migrationBuilder.AddForeignKey(
                name: "FK_IdentityUserClaim<int>_AppUser_UserId",
                table: "AspNetUserClaims",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
            migrationBuilder.AddForeignKey(
                name: "FK_IdentityUserLogin<int>_AppUser_UserId",
                table: "AspNetUserLogins",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
            migrationBuilder.AddForeignKey(
                name: "FK_IdentityUserRole<int>_AppRole_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId",
                principalTable: "AspNetRoles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
            migrationBuilder.AddForeignKey(
                name: "FK_IdentityUserRole<int>_AppUser_UserId",
                table: "AspNetUserRoles",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(name: "FK_CalculationOptions_Sheet_SheetId", table: "CalculationOptions");
            migrationBuilder.DropForeignKey(name: "FK_Category_AppOwner_OwnerId", table: "Category");
            migrationBuilder.DropForeignKey(name: "FK_AppUser_AppOwner_GroupId", table: "AspNetUsers");
            migrationBuilder.DropForeignKey(name: "FK_Sheet_AppOwner_OwnerId", table: "Sheet");
            migrationBuilder.DropForeignKey(name: "FK_SheetEntry_Sheet_SheetId", table: "SheetEntry");
            migrationBuilder.DropForeignKey(name: "FK_SheetEntry_RecurringSheetEntry_TemplateId", table: "SheetEntry");
            migrationBuilder.DropForeignKey(name: "FK_IdentityRoleClaim<int>_AppRole_RoleId", table: "AspNetRoleClaims");
            migrationBuilder.DropForeignKey(name: "FK_IdentityUserClaim<int>_AppUser_UserId", table: "AspNetUserClaims");
            migrationBuilder.DropForeignKey(name: "FK_IdentityUserLogin<int>_AppUser_UserId", table: "AspNetUserLogins");
            migrationBuilder.DropForeignKey(name: "FK_IdentityUserRole<int>_AppRole_RoleId", table: "AspNetUserRoles");
            migrationBuilder.DropForeignKey(name: "FK_IdentityUserRole<int>_AppUser_UserId", table: "AspNetUserRoles");
            migrationBuilder.DropColumn(name: "TemplateId", table: "SheetEntry");
            migrationBuilder.DropTable("SheetRecurringSheetEntry");
            migrationBuilder.DropTable("RecurringSheetEntry");
            migrationBuilder.AddForeignKey(
                name: "FK_CalculationOptions_Sheet_SheetId",
                table: "CalculationOptions",
                column: "SheetId",
                principalTable: "Sheet",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
            migrationBuilder.AddForeignKey(
                name: "FK_Category_AppOwner_OwnerId",
                table: "Category",
                column: "OwnerId",
                principalTable: "AppOwner",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
            migrationBuilder.AddForeignKey(
                name: "FK_AppUser_AppOwner_GroupId",
                table: "AspNetUsers",
                column: "GroupId",
                principalTable: "AppOwner",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
            migrationBuilder.AddForeignKey(
                name: "FK_Sheet_AppOwner_OwnerId",
                table: "Sheet",
                column: "OwnerId",
                principalTable: "AppOwner",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
            migrationBuilder.AddForeignKey(
                name: "FK_SheetEntry_Sheet_SheetId",
                table: "SheetEntry",
                column: "SheetId",
                principalTable: "Sheet",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
            migrationBuilder.AddForeignKey(
                name: "FK_IdentityRoleClaim<int>_AppRole_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId",
                principalTable: "AspNetRoles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
            migrationBuilder.AddForeignKey(
                name: "FK_IdentityUserClaim<int>_AppUser_UserId",
                table: "AspNetUserClaims",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
            migrationBuilder.AddForeignKey(
                name: "FK_IdentityUserLogin<int>_AppUser_UserId",
                table: "AspNetUserLogins",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
            migrationBuilder.AddForeignKey(
                name: "FK_IdentityUserRole<int>_AppRole_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId",
                principalTable: "AspNetRoles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
            migrationBuilder.AddForeignKey(
                name: "FK_IdentityUserRole<int>_AppUser_UserId",
                table: "AspNetUserRoles",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
