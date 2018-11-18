using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace App.Migrations
{
    public partial class LastViewedSinceInfo : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SheetLastVisitedMarker",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    SheetId = table.Column<int>(nullable: false),
                    UserId = table.Column<int>(nullable: false),
                    LastVisitDate = table.Column<DateTime>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SheetLastVisitedMarker", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SheetLastVisitedMarker_Sheet_SheetId",
                        column: x => x.SheetId,
                        principalTable: "Sheet",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SheetLastVisitedMarker_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SheetLastVisitedMarker_SheetId",
                table: "SheetLastVisitedMarker",
                column: "SheetId");

            migrationBuilder.CreateIndex(
                name: "IX_SheetLastVisitedMarker_UserId",
                table: "SheetLastVisitedMarker",
                column: "UserId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SheetLastVisitedMarker");
        }
    }
}
