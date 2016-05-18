using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using App.Models.Domain;

namespace App.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20160107204157_RecurringSheetEntry")]
    partial class RecurringSheetEntry
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
            modelBuilder
                .HasAnnotation("ProductVersion", "7.0.0-rc1-16348")
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("App.Models.Domain.AppOwner", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Name")
                        .IsRequired();

                    b.HasKey("Id");
                });

            modelBuilder.Entity("App.Models.Domain.CalculationOptions", b =>
                {
                    b.Property<int>("SheetId");

                    b.Property<decimal?>("BankAccountOffset");

                    b.Property<decimal?>("SavingsAccountOffset");

                    b.HasKey("SheetId");
                });

            modelBuilder.Entity("App.Models.Domain.Category", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Description");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasAnnotation("MaxLength", 250);

                    b.Property<int?>("OwnerId")
                        .IsRequired();

                    b.HasKey("Id");
                });

            modelBuilder.Entity("App.Models.Domain.Identity.AppRole", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("ConcurrencyStamp")
                        .IsConcurrencyToken();

                    b.Property<string>("Name")
                        .HasAnnotation("MaxLength", 256);

                    b.Property<string>("NormalizedName")
                        .HasAnnotation("MaxLength", 256);

                    b.HasKey("Id");

                    b.HasIndex("NormalizedName")
                        .HasAnnotation("Relational:Name", "RoleNameIndex");

                    b.HasAnnotation("Relational:TableName", "AspNetRoles");
                });

            modelBuilder.Entity("App.Models.Domain.Identity.AppUser", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("AccessFailedCount");

                    b.Property<string>("ConcurrencyStamp")
                        .IsConcurrencyToken();

                    b.Property<string>("Email")
                        .HasAnnotation("MaxLength", 256);

                    b.Property<bool>("EmailConfirmed");

                    b.Property<int?>("GroupId")
                        .IsRequired();

                    b.Property<bool>("LockoutEnabled");

                    b.Property<DateTimeOffset?>("LockoutEnd");

                    b.Property<string>("NormalizedEmail")
                        .HasAnnotation("MaxLength", 256);

                    b.Property<string>("NormalizedUserName")
                        .HasAnnotation("MaxLength", 256);

                    b.Property<string>("PasswordHash");

                    b.Property<string>("PhoneNumber");

                    b.Property<bool>("PhoneNumberConfirmed");

                    b.Property<string>("SecurityStamp");

                    b.Property<bool>("TwoFactorEnabled");

                    b.Property<string>("UserName")
                        .HasAnnotation("MaxLength", 256);

                    b.HasKey("Id");

                    b.HasIndex("NormalizedEmail")
                        .HasAnnotation("Relational:Name", "EmailIndex");

                    b.HasIndex("NormalizedUserName")
                        .HasAnnotation("Relational:Name", "UserNameIndex");

                    b.HasAnnotation("Relational:TableName", "AspNetUsers");
                });

            modelBuilder.Entity("App.Models.Domain.Identity.AppUserTrustedUser", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int?>("SourceUserId");

                    b.Property<int?>("TargetUserId");

                    b.HasKey("Id");

                    b.HasAnnotation("Relational:TableName", "AppUserTrustedUsers");
                });

            modelBuilder.Entity("App.Models.Domain.RecurringSheetEntry", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("Account");

                    b.Property<int?>("CategoryId")
                        .IsRequired();

                    b.Property<decimal>("Delta");

                    b.Property<int?>("OwnerId")
                        .IsRequired();

                    b.Property<string>("Remark");

                    b.Property<int>("SortOrder");

                    b.Property<string>("Source")
                        .HasAnnotation("MaxLength", 250);

                    b.HasKey("Id");
                });

            modelBuilder.Entity("App.Models.Domain.Sheet", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<DateTime>("CreateTimestamp");

                    b.Property<string>("Name")
                        .HasAnnotation("MaxLength", 250);

                    b.Property<int?>("OwnerId")
                        .IsRequired();

                    b.Property<DateTime>("Subject");

                    b.Property<DateTime>("UpdateTimestamp");

                    b.HasKey("Id");
                });

            modelBuilder.Entity("App.Models.Domain.SheetEntry", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("Account");

                    b.Property<int?>("CategoryId")
                        .IsRequired();

                    b.Property<DateTime>("CreateTimestamp");

                    b.Property<decimal>("Delta");

                    b.Property<string>("Remark");

                    b.Property<int?>("SheetId")
                        .IsRequired();

                    b.Property<int>("SortOrder");

                    b.Property<string>("Source")
                        .HasAnnotation("MaxLength", 250);

                    b.Property<int?>("TemplateId");

                    b.Property<DateTime>("UpdateTimestamp");

                    b.HasKey("Id");
                });

            modelBuilder.Entity("App.Models.Domain.SheetRecurringSheetEntry", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int?>("SheetId")
                        .IsRequired();

                    b.Property<int?>("TemplateId")
                        .IsRequired();

                    b.HasKey("Id");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityRoleClaim<int>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("ClaimType");

                    b.Property<string>("ClaimValue");

                    b.Property<int>("RoleId");

                    b.HasKey("Id");

                    b.HasAnnotation("Relational:TableName", "AspNetRoleClaims");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityUserClaim<int>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("ClaimType");

                    b.Property<string>("ClaimValue");

                    b.Property<int>("UserId");

                    b.HasKey("Id");

                    b.HasAnnotation("Relational:TableName", "AspNetUserClaims");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityUserLogin<int>", b =>
                {
                    b.Property<string>("LoginProvider");

                    b.Property<string>("ProviderKey");

                    b.Property<string>("ProviderDisplayName");

                    b.Property<int>("UserId");

                    b.HasKey("LoginProvider", "ProviderKey");

                    b.HasAnnotation("Relational:TableName", "AspNetUserLogins");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityUserRole<int>", b =>
                {
                    b.Property<int>("UserId");

                    b.Property<int>("RoleId");

                    b.HasKey("UserId", "RoleId");

                    b.HasAnnotation("Relational:TableName", "AspNetUserRoles");
                });

            modelBuilder.Entity("App.Models.Domain.CalculationOptions", b =>
                {
                    b.HasOne("App.Models.Domain.Sheet")
                        .WithOne()
                        .HasForeignKey("App.Models.Domain.CalculationOptions", "SheetId");
                });

            modelBuilder.Entity("App.Models.Domain.Category", b =>
                {
                    b.HasOne("App.Models.Domain.AppOwner")
                        .WithMany()
                        .HasForeignKey("OwnerId");
                });

            modelBuilder.Entity("App.Models.Domain.Identity.AppUser", b =>
                {
                    b.HasOne("App.Models.Domain.AppOwner")
                        .WithMany()
                        .HasForeignKey("GroupId");
                });

            modelBuilder.Entity("App.Models.Domain.Identity.AppUserTrustedUser", b =>
                {
                    b.HasOne("App.Models.Domain.Identity.AppUser")
                        .WithMany()
                        .HasForeignKey("SourceUserId");

                    b.HasOne("App.Models.Domain.Identity.AppUser")
                        .WithMany()
                        .HasForeignKey("TargetUserId");
                });

            modelBuilder.Entity("App.Models.Domain.RecurringSheetEntry", b =>
                {
                    b.HasOne("App.Models.Domain.Category")
                        .WithMany()
                        .HasForeignKey("CategoryId");

                    b.HasOne("App.Models.Domain.AppOwner")
                        .WithMany()
                        .HasForeignKey("OwnerId");
                });

            modelBuilder.Entity("App.Models.Domain.Sheet", b =>
                {
                    b.HasOne("App.Models.Domain.AppOwner")
                        .WithMany()
                        .HasForeignKey("OwnerId");
                });

            modelBuilder.Entity("App.Models.Domain.SheetEntry", b =>
                {
                    b.HasOne("App.Models.Domain.Category")
                        .WithMany()
                        .HasForeignKey("CategoryId");

                    b.HasOne("App.Models.Domain.Sheet")
                        .WithMany()
                        .HasForeignKey("SheetId");

                    b.HasOne("App.Models.Domain.RecurringSheetEntry")
                        .WithMany()
                        .HasForeignKey("TemplateId");
                });

            modelBuilder.Entity("App.Models.Domain.SheetRecurringSheetEntry", b =>
                {
                    b.HasOne("App.Models.Domain.Sheet")
                        .WithMany()
                        .HasForeignKey("SheetId");

                    b.HasOne("App.Models.Domain.RecurringSheetEntry")
                        .WithMany()
                        .HasForeignKey("TemplateId");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityRoleClaim<int>", b =>
                {
                    b.HasOne("App.Models.Domain.Identity.AppRole")
                        .WithMany()
                        .HasForeignKey("RoleId");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityUserClaim<int>", b =>
                {
                    b.HasOne("App.Models.Domain.Identity.AppUser")
                        .WithMany()
                        .HasForeignKey("UserId");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityUserLogin<int>", b =>
                {
                    b.HasOne("App.Models.Domain.Identity.AppUser")
                        .WithMany()
                        .HasForeignKey("UserId");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityUserRole<int>", b =>
                {
                    b.HasOne("App.Models.Domain.Identity.AppRole")
                        .WithMany()
                        .HasForeignKey("RoleId");

                    b.HasOne("App.Models.Domain.Identity.AppUser")
                        .WithMany()
                        .HasForeignKey("UserId");
                });
        }
    }
}
