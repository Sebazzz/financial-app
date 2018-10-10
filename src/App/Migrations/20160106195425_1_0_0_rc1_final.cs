// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : 20160106195425_1_0_0_rc1_final.cs
//  Project         : App
// ******************************************************************************
using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

namespace App.Migrations
{
    public partial class _1_0_0_rc1_final : Migration
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
            migrationBuilder.DropForeignKey(name: "FK_IdentityRoleClaim<int>_AppRole_RoleId", table: "AspNetRoleClaims");
            migrationBuilder.DropForeignKey(name: "FK_IdentityUserClaim<int>_AppUser_UserId", table: "AspNetUserClaims");
            migrationBuilder.DropForeignKey(name: "FK_IdentityUserLogin<int>_AppUser_UserId", table: "AspNetUserLogins");
            migrationBuilder.DropForeignKey(name: "FK_IdentityUserRole<int>_AppRole_RoleId", table: "AspNetUserRoles");
            migrationBuilder.DropForeignKey(name: "FK_IdentityUserRole<int>_AppUser_UserId", table: "AspNetUserRoles");
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
