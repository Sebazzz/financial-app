// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : 20171213215601_SheetEntryTagging.cs
//  Project         : App
// ******************************************************************************
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace App.Migrations
{
    public partial class SheetEntryTagging : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    UserId = table.Column<int>(nullable: false),
                    LoginProvider = table.Column<string>(nullable: false),
                    Name = table.Column<string>(nullable: false),
                    Value = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tag",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Description = table.Column<string>(nullable: true),
                    HexColorCode = table.Column<string>(maxLength: 6, nullable: true),
                    IsInactive = table.Column<bool>(nullable: false),
                    Name = table.Column<string>(nullable: true),
                    OwnerId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tag", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tag_AppOwner_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "AppOwner",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SheetEntryTag",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    SheetEntryId = table.Column<int>(nullable: false),
                    TagId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SheetEntryTag", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SheetEntryTag_SheetEntry_SheetEntryId",
                        column: x => x.SheetEntryId,
                        principalTable: "SheetEntry",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SheetEntryTag_Tag_TagId",
                        column: x => x.TagId,
                        principalTable: "Tag",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.NoAction);
                    table.UniqueConstraint("UX_SheetEntryTag", x => new {x.TagId, x.SheetEntryId});
                });

           
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                table: "AspNetRoleClaims");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                table: "AspNetUserClaims");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                table: "AspNetUserLogins");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                table: "AspNetUserRoles");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                table: "AspNetUserRoles");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_AppOwner_GroupId",
                table: "AspNetUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_CalculationOptions_Sheet_SheetId",
                table: "CalculationOptions");

            migrationBuilder.DropForeignKey(
                name: "FK_Category_AppOwner_OwnerId",
                table: "Category");

            migrationBuilder.DropForeignKey(
                name: "FK_RecurringSheetEntry_Category_CategoryId",
                table: "RecurringSheetEntry");

            migrationBuilder.DropForeignKey(
                name: "FK_RecurringSheetEntry_AppOwner_OwnerId",
                table: "RecurringSheetEntry");

            migrationBuilder.DropForeignKey(
                name: "FK_Sheet_AppOwner_OwnerId",
                table: "Sheet");

            migrationBuilder.DropForeignKey(
                name: "FK_SheetEntry_Category_CategoryId",
                table: "SheetEntry");

            migrationBuilder.DropForeignKey(
                name: "FK_SheetEntry_Sheet_SheetId",
                table: "SheetEntry");

            migrationBuilder.DropForeignKey(
                name: "FK_SheetEntry_RecurringSheetEntry_TemplateId",
                table: "SheetEntry");

            migrationBuilder.DropForeignKey(
                name: "FK_SheetRecurringSheetEntry_Sheet_SheetId",
                table: "SheetRecurringSheetEntry");

            migrationBuilder.DropForeignKey(
                name: "FK_SheetRecurringSheetEntry_RecurringSheetEntry_TemplateId",
                table: "SheetRecurringSheetEntry");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens");

            migrationBuilder.DropTable(
                name: "SheetEntryTag");

            migrationBuilder.DropTable(
                name: "Tag");

            migrationBuilder.DropPrimaryKey(
                name: "PK_SheetRecurringSheetEntry",
                table: "SheetRecurringSheetEntry");

            migrationBuilder.DropIndex(
                name: "IX_SheetRecurringSheetEntry_SheetId",
                table: "SheetRecurringSheetEntry");

            migrationBuilder.DropIndex(
                name: "IX_SheetRecurringSheetEntry_TemplateId",
                table: "SheetRecurringSheetEntry");

            migrationBuilder.DropPrimaryKey(
                name: "PK_SheetEntry",
                table: "SheetEntry");

            migrationBuilder.DropIndex(
                name: "IX_SheetEntry_CategoryId",
                table: "SheetEntry");

            migrationBuilder.DropIndex(
                name: "IX_SheetEntry_SheetId",
                table: "SheetEntry");

            migrationBuilder.DropIndex(
                name: "IX_SheetEntry_TemplateId",
                table: "SheetEntry");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Sheet",
                table: "Sheet");

            migrationBuilder.DropIndex(
                name: "IX_Sheet_OwnerId",
                table: "Sheet");

            migrationBuilder.DropPrimaryKey(
                name: "PK_RecurringSheetEntry",
                table: "RecurringSheetEntry");

            migrationBuilder.DropIndex(
                name: "IX_RecurringSheetEntry_CategoryId",
                table: "RecurringSheetEntry");

            migrationBuilder.DropIndex(
                name: "IX_RecurringSheetEntry_OwnerId",
                table: "RecurringSheetEntry");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Category",
                table: "Category");

            migrationBuilder.DropIndex(
                name: "IX_Category_OwnerId",
                table: "Category");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CalculationOptions",
                table: "CalculationOptions");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_GroupId",
                table: "AspNetUsers");

            migrationBuilder.DropIndex(
                name: "UserNameIndex",
                table: "AspNetUsers");

            migrationBuilder.DropIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles");

            migrationBuilder.DropIndex(
                name: "IX_AppUserTrustedUsers_SourceUserId",
                table: "AppUserTrustedUsers");

            migrationBuilder.DropIndex(
                name: "IX_AppUserTrustedUsers_TargetUserId",
                table: "AppUserTrustedUsers");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AppOwner",
                table: "AppOwner");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUserRoles_RoleId",
                table: "AspNetUserRoles");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUserLogins_UserId",
                table: "AspNetUserLogins");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUserClaims_UserId",
                table: "AspNetUserClaims");

            migrationBuilder.DropIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                table: "AspNetRoleClaims");

            migrationBuilder.RenameTable(
                name: "SheetRecurringSheetEntry",
                newName: "App.Models.Domain.SheetRecurringSheetEntry");

            migrationBuilder.RenameTable(
                name: "SheetEntry",
                newName: "App.Models.Domain.SheetEntry");

            migrationBuilder.RenameTable(
                name: "Sheet",
                newName: "App.Models.Domain.Sheet");

            migrationBuilder.RenameTable(
                name: "RecurringSheetEntry",
                newName: "App.Models.Domain.RecurringSheetEntry");

            migrationBuilder.RenameTable(
                name: "Category",
                newName: "App.Models.Domain.Category");

            migrationBuilder.RenameTable(
                name: "CalculationOptions",
                newName: "App.Models.Domain.CalculationOptions");

            migrationBuilder.RenameTable(
                name: "AppOwner",
                newName: "App.Models.Domain.AppOwner");

            migrationBuilder.AddPrimaryKey(
                name: "PK_App.Models.Domain.SheetRecurringSheetEntry",
                table: "App.Models.Domain.SheetRecurringSheetEntry",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_App.Models.Domain.SheetEntry",
                table: "App.Models.Domain.SheetEntry",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_App.Models.Domain.Sheet",
                table: "App.Models.Domain.Sheet",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_App.Models.Domain.RecurringSheetEntry",
                table: "App.Models.Domain.RecurringSheetEntry",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_App.Models.Domain.Category",
                table: "App.Models.Domain.Category",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_App.Models.Domain.CalculationOptions",
                table: "App.Models.Domain.CalculationOptions",
                column: "SheetId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_App.Models.Domain.AppOwner",
                table: "App.Models.Domain.AppOwner",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "AspNetUsers",
                column: "NormalizedUserName");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "NormalizedName");

            migrationBuilder.AddForeignKey(
                name: "FK_App.Models.Domain.CalculationOptions_App.Models.Domain.Sheet_SheetId",
                table: "App.Models.Domain.CalculationOptions",
                column: "SheetId",
                principalTable: "App.Models.Domain.Sheet",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_App.Models.Domain.Category_App.Models.Domain.AppOwner_OwnerId",
                table: "App.Models.Domain.Category",
                column: "OwnerId",
                principalTable: "App.Models.Domain.AppOwner",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_App.Models.Domain.RecurringSheetEntry_App.Models.Domain.Category_CategoryId",
                table: "App.Models.Domain.RecurringSheetEntry",
                column: "CategoryId",
                principalTable: "App.Models.Domain.Category",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_App.Models.Domain.RecurringSheetEntry_App.Models.Domain.AppOwner_OwnerId",
                table: "App.Models.Domain.RecurringSheetEntry",
                column: "OwnerId",
                principalTable: "App.Models.Domain.AppOwner",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_App.Models.Domain.Sheet_App.Models.Domain.AppOwner_OwnerId",
                table: "App.Models.Domain.Sheet",
                column: "OwnerId",
                principalTable: "App.Models.Domain.AppOwner",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_App.Models.Domain.SheetEntry_App.Models.Domain.Category_CategoryId",
                table: "App.Models.Domain.SheetEntry",
                column: "CategoryId",
                principalTable: "App.Models.Domain.Category",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_App.Models.Domain.SheetEntry_App.Models.Domain.Sheet_SheetId",
                table: "App.Models.Domain.SheetEntry",
                column: "SheetId",
                principalTable: "App.Models.Domain.Sheet",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_App.Models.Domain.SheetEntry_App.Models.Domain.RecurringSheetEntry_TemplateId",
                table: "App.Models.Domain.SheetEntry",
                column: "TemplateId",
                principalTable: "App.Models.Domain.RecurringSheetEntry",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_App.Models.Domain.SheetRecurringSheetEntry_App.Models.Domain.Sheet_SheetId",
                table: "App.Models.Domain.SheetRecurringSheetEntry",
                column: "SheetId",
                principalTable: "App.Models.Domain.Sheet",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_App.Models.Domain.SheetRecurringSheetEntry_App.Models.Domain.RecurringSheetEntry_TemplateId",
                table: "App.Models.Domain.SheetRecurringSheetEntry",
                column: "TemplateId",
                principalTable: "App.Models.Domain.RecurringSheetEntry",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId",
                principalTable: "AspNetRoles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                table: "AspNetUserClaims",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                table: "AspNetUserLogins",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId",
                principalTable: "AspNetRoles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                table: "AspNetUserRoles",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_App.Models.Domain.AppOwner_GroupId",
                table: "AspNetUsers",
                column: "GroupId",
                principalTable: "App.Models.Domain.AppOwner",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
