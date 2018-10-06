using Microsoft.EntityFrameworkCore.Migrations;

namespace App.Migrations
{
    public partial class AppContextSwitchPreference : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Preferences_GoToHomePageAfterContextSwitch",
                table: "AspNetUsers",
                nullable: false,
                defaultValue: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Preferences_GoToHomePageAfterContextSwitch",
                table: "AspNetUsers");
        }
    }
}
