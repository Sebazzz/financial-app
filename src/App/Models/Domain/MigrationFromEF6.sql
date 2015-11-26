SET NUMERIC_ROUNDABORT OFF
GO
SET ANSI_PADDING, ANSI_WARNINGS, CONCAT_NULL_YIELDS_NULL, ARITHABORT, QUOTED_IDENTIFIER, ANSI_NULLS ON
GO
PRINT N'Dropping foreign keys from [dbo].[AspNetUserClaims]'
GO
ALTER TABLE [dbo].[AspNetUserClaims] DROP CONSTRAINT [FK_dbo.AspNetUserClaims_dbo.AspNetUsers_UserId]
GO
PRINT N'Dropping foreign keys from [dbo].[AspNetUserLogins]'
GO
ALTER TABLE [dbo].[AspNetUserLogins] DROP CONSTRAINT [FK_dbo.AspNetUserLogins_dbo.AspNetUsers_UserId]
GO
PRINT N'Dropping foreign keys from [dbo].[AppUserTrustedUsers]'
GO
ALTER TABLE [dbo].[AppUserTrustedUsers] DROP CONSTRAINT [FK_dbo.AppUserTrustedUsers_dbo.AspNetUsers_SourceUser]
ALTER TABLE [dbo].[AppUserTrustedUsers] DROP CONSTRAINT [FK_dbo.AppUserTrustedUsers_dbo.AspNetUsers_TargetUser]
GO
PRINT N'Dropping foreign keys from [dbo].[AspNetUserRoles]'
GO
ALTER TABLE [dbo].[AspNetUserRoles] DROP CONSTRAINT [FK_dbo.AspNetUserRoles_dbo.AspNetUsers_UserId]
ALTER TABLE [dbo].[AspNetUserRoles] DROP CONSTRAINT [FK_dbo.AspNetUserRoles_dbo.AspNetRoles_RoleId]
GO
PRINT N'Dropping foreign keys from [dbo].[AspNetUsers]'
GO
ALTER TABLE [dbo].[AspNetUsers] DROP CONSTRAINT [FK_dbo.AspNetUsers_dbo.AppOwners_Group_Id]
GO
PRINT N'Dropping foreign keys from [dbo].[Categories]'
GO
ALTER TABLE [dbo].[Categories] DROP CONSTRAINT [FK_dbo.Categories_dbo.AppOwners_Owner_Id]
GO
PRINT N'Dropping foreign keys from [dbo].[SheetEntries]'
GO
ALTER TABLE [dbo].[SheetEntries] DROP CONSTRAINT [FK_dbo.SheetEntries_dbo.Sheets_Sheet_Id]
ALTER TABLE [dbo].[SheetEntries] DROP CONSTRAINT [FK_dbo.SheetEntries_dbo.Categories_Category_Id]
GO
PRINT N'Dropping foreign keys from [dbo].[Sheets]'
GO
ALTER TABLE [dbo].[Sheets] DROP CONSTRAINT [FK_dbo.Sheets_dbo.AppOwners_Owner_Id]
GO
PRINT N'Dropping constraints from [dbo].[AspNetUserClaims]'
GO
ALTER TABLE [dbo].[AspNetUserClaims] DROP CONSTRAINT [PK_dbo.AspNetUserClaims]
GO
PRINT N'Dropping constraints from [dbo].[AspNetUserLogins]'
GO
ALTER TABLE [dbo].[AspNetUserLogins] DROP CONSTRAINT [PK_dbo.AspNetUserLogins]
GO
PRINT N'Dropping constraints from [dbo].[AppUserTrustedUsers]'
GO
ALTER TABLE [dbo].[AppUserTrustedUsers] DROP CONSTRAINT [PK_dbo.AppUserTrustedUsers]
GO
PRINT N'Dropping constraints from [dbo].[AspNetUsers]'
GO
ALTER TABLE [dbo].[AspNetUsers] DROP CONSTRAINT [PK_dbo.AspNetUsers]
GO
PRINT N'Dropping constraints from [dbo].[AspNetUserRoles]'
GO
ALTER TABLE [dbo].[AspNetUserRoles] DROP CONSTRAINT [PK_dbo.AspNetUserRoles]
GO
PRINT N'Dropping constraints from [dbo].[Categories]'
GO
ALTER TABLE [dbo].[Categories] DROP CONSTRAINT [PK_dbo.Categories]
GO
PRINT N'Dropping constraints from [dbo].[Sheets]'
GO
ALTER TABLE [dbo].[Sheets] DROP CONSTRAINT [PK_dbo.Sheets]
GO
PRINT N'Dropping constraints from [dbo].[SheetEntries]'
GO
ALTER TABLE [dbo].[SheetEntries] DROP CONSTRAINT [PK_dbo.SheetEntries]
GO
--PRINT N'Dropping constraints from [dbo].[SheetEntries]'
--GO
--ALTER TABLE [dbo].[SheetEntries] DROP CONSTRAINT [DF__SheetEntr__SortO__3A4CA8FD]
--GO
PRINT N'Dropping constraints from [dbo].[AspNetRoles]'
GO
ALTER TABLE [dbo].[AspNetRoles] DROP CONSTRAINT [PK_dbo.AspNetRoles]
GO
PRINT N'Dropping constraints from [dbo].[AppOwners]'
GO
ALTER TABLE [dbo].[AppOwners] DROP CONSTRAINT [PK_dbo.AppOwners]
GO
PRINT N'Dropping index [IX_UserId] from [dbo].[AspNetUserClaims]'
GO
DROP INDEX [IX_UserId] ON [dbo].[AspNetUserClaims]
GO
PRINT N'Dropping index [IX_UserId] from [dbo].[AspNetUserLogins]'
GO
DROP INDEX [IX_UserId] ON [dbo].[AspNetUserLogins]
GO
PRINT N'Dropping index [IX_SourceUser] from [dbo].[AppUserTrustedUsers]'
GO
DROP INDEX [IX_SourceUser] ON [dbo].[AppUserTrustedUsers]
GO
PRINT N'Dropping index [IX_TargetUser] from [dbo].[AppUserTrustedUsers]'
GO
DROP INDEX [IX_TargetUser] ON [dbo].[AppUserTrustedUsers]
GO
PRINT N'Dropping index [UserNameIndex] from [dbo].[AspNetUsers]'
GO
DROP INDEX [UserNameIndex] ON [dbo].[AspNetUsers]
GO
PRINT N'Dropping index [IX_Group_Id] from [dbo].[AspNetUsers]'
GO
DROP INDEX [IX_Group_Id] ON [dbo].[AspNetUsers]
GO
PRINT N'Dropping index [IX_RoleId] from [dbo].[AspNetUserRoles]'
GO
DROP INDEX [IX_RoleId] ON [dbo].[AspNetUserRoles]
GO
PRINT N'Dropping index [IX_UserId] from [dbo].[AspNetUserRoles]'
GO
DROP INDEX [IX_UserId] ON [dbo].[AspNetUserRoles]
GO
PRINT N'Dropping index [IX_Owner_Id] from [dbo].[Categories]'
GO
DROP INDEX [IX_Owner_Id] ON [dbo].[Categories]
GO
PRINT N'Dropping index [IX_Owner_Id] from [dbo].[Sheets]'
GO
DROP INDEX [IX_Owner_Id] ON [dbo].[Sheets]
GO
PRINT N'Dropping index [IX_Category_Id] from [dbo].[SheetEntries]'
GO
DROP INDEX [IX_Category_Id] ON [dbo].[SheetEntries]
GO
PRINT N'Dropping index [IX_Sheet_Id] from [dbo].[SheetEntries]'
GO
DROP INDEX [IX_Sheet_Id] ON [dbo].[SheetEntries]
GO
PRINT N'Dropping index [RoleNameIndex] from [dbo].[AspNetRoles]'
GO
DROP INDEX [RoleNameIndex] ON [dbo].[AspNetRoles]
GO
EXEC sp_rename N'[dbo].[AppOwners]',N'AppOwner',N'OBJECT'
EXEC sp_rename N'[dbo].[Sheets]',N'Sheet',N'OBJECT'
EXEC sp_rename N'[dbo].[Categories]',N'Category',N'OBJECT'
EXEC sp_rename N'[dbo].[SheetEntries]',N'SheetEntry',N'OBJECT'
GO
PRINT N'Rebuilding [dbo].[AspNetUsers]'
GO
CREATE TABLE [dbo].[tmp_rg_xx_AspNetUsers]
(
[Id] [int] NOT NULL IDENTITY(1, 1),
[AccessFailedCount] [int] NOT NULL,
[ConcurrencyStamp] [nvarchar] (max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
[Email] [nvarchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
[EmailConfirmed] [bit] NOT NULL,
[GroupId] [int] NOT NULL,
[LockoutEnabled] [bit] NOT NULL,
[LockoutEnd] [datetimeoffset] NULL,
[NormalizedEmail] [nvarchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
[NormalizedUserName] [nvarchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
[PasswordHash] [nvarchar] (max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
[PhoneNumber] [nvarchar] (max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
[PhoneNumberConfirmed] [bit] NOT NULL,
[SecurityStamp] [nvarchar] (max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
[TwoFactorEnabled] [bit] NOT NULL,
[UserName] [nvarchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NULL
)
GO
SET IDENTITY_INSERT [dbo].[tmp_rg_xx_AspNetUsers] ON
GO
INSERT INTO [dbo].[tmp_rg_xx_AspNetUsers]([Id], [AccessFailedCount], [Email], [EmailConfirmed], [GroupId], [LockoutEnabled], [LockoutEnd], [PasswordHash], [PhoneNumber], [PhoneNumberConfirmed], [SecurityStamp], [TwoFactorEnabled], [UserName]) SELECT [Id], [AccessFailedCount], [Email], [EmailConfirmed], [Group_Id], [LockoutEnabled], [LockoutEndDateUtc], [PasswordHash], [PhoneNumber], [PhoneNumberConfirmed], [SecurityStamp], [TwoFactorEnabled], [UserName] FROM [dbo].[AspNetUsers]
GO
SET IDENTITY_INSERT [dbo].[tmp_rg_xx_AspNetUsers] OFF
GO
DECLARE @idVal BIGINT
SELECT @idVal = IDENT_CURRENT(N'[dbo].[AspNetUsers]')
IF @idVal IS NOT NULL
    DBCC CHECKIDENT(N'[dbo].[tmp_rg_xx_AspNetUsers]', RESEED, @idVal)
GO
DROP TABLE [dbo].[AspNetUsers]
GO
EXEC sp_rename N'[dbo].[tmp_rg_xx_AspNetUsers]', N'AspNetUsers'
GO
PRINT N'Creating primary key [PK_AppUser] on [dbo].[AspNetUsers]'
GO
ALTER TABLE [dbo].[AspNetUsers] ADD CONSTRAINT [PK_AppUser] PRIMARY KEY CLUSTERED  ([Id])
GO
PRINT N'Creating index [EmailIndex] on [dbo].[AspNetUsers]'
GO
CREATE NONCLUSTERED INDEX [EmailIndex] ON [dbo].[AspNetUsers] ([NormalizedEmail])
GO
PRINT N'Creating index [UserNameIndex] on [dbo].[AspNetUsers]'
GO
CREATE NONCLUSTERED INDEX [UserNameIndex] ON [dbo].[AspNetUsers] ([NormalizedUserName])
GO
PRINT N'Rebuilding [dbo].[AppUserTrustedUsers]'
GO
CREATE TABLE [dbo].[tmp_rg_xx_AppUserTrustedUsers]
(
[Id] [int] NOT NULL IDENTITY(1, 1),
[SourceUserId] [int] NULL,
[TargetUserId] [int] NULL
)
GO
INSERT INTO [dbo].[tmp_rg_xx_AppUserTrustedUsers]([SourceUserId], [TargetUserId]) SELECT [SourceUser], [TargetUser] FROM [dbo].[AppUserTrustedUsers]
GO
DROP TABLE [dbo].[AppUserTrustedUsers]
GO
EXEC sp_rename N'[dbo].[tmp_rg_xx_AppUserTrustedUsers]', N'AppUserTrustedUsers'
GO
PRINT N'Creating primary key [PK_AppUserTrustedUser] on [dbo].[AppUserTrustedUsers]'
GO
ALTER TABLE [dbo].[AppUserTrustedUsers] ADD CONSTRAINT [PK_AppUserTrustedUser] PRIMARY KEY CLUSTERED  ([Id])
GO
PRINT N'Rebuilding [dbo].[Sheet]'
GO
CREATE TABLE [dbo].[tmp_rg_xx_Sheet]
(
[Id] [int] NOT NULL IDENTITY(1, 1),
[CreateTimestamp] [datetime2] NOT NULL,
[Name] [nvarchar] (250) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
[OwnerId] [int] NOT NULL,
[Subject] [datetime2] NOT NULL,
[UpdateTimestamp] [datetime2] NOT NULL
)
GO
PRINT N'Creating [dbo].[CalculationOptions]'
GO
CREATE TABLE [dbo].[CalculationOptions]
(
[SheetId] [int] NOT NULL,
[BankAccountOffset] [decimal] (18, 2) NULL,
[SavingsAccountOffset] [decimal] (18, 2) NULL
)
GO
PRINT N'Creating primary key [PK_CalculationOptions] on [dbo].[CalculationOptions]'
GO
ALTER TABLE [dbo].[CalculationOptions] ADD CONSTRAINT [PK_CalculationOptions] PRIMARY KEY CLUSTERED  ([SheetId])
GO
PRINT N'Rebuilding CalculationOptions'
GO
INSERT INTO CalculationOptions (SheetId, BankAccountOffset, SavingsAccountOffset)
SELECT Id, CalculationOptions_BankAccountOffset, CalculationOptions_SavingsAccountOffset
FROM dbo.Sheet
GO
PRINT N'Rebuilding [dbo].[Sheet]'
GO
SET IDENTITY_INSERT [dbo].[tmp_rg_xx_Sheet] ON
GO
INSERT INTO [dbo].[tmp_rg_xx_Sheet]([Id], [CreateTimestamp], [Name], [OwnerId], [Subject], [UpdateTimestamp]) SELECT [Id], [CreateTimestamp], [Name], [Owner_Id], [Subject], [UpdateTimestamp] FROM [dbo].[Sheet]
GO
SET IDENTITY_INSERT [dbo].[tmp_rg_xx_Sheet] OFF
GO
DECLARE @idVal BIGINT
SELECT @idVal = IDENT_CURRENT(N'[dbo].[Sheet]')
IF @idVal IS NOT NULL
    DBCC CHECKIDENT(N'[dbo].[tmp_rg_xx_Sheet]', RESEED, @idVal)
GO
DROP TABLE [dbo].[Sheet]
GO
EXEC sp_rename N'[dbo].[tmp_rg_xx_Sheet]', N'Sheet'
GO
PRINT N'Creating primary key [PK_Sheet] on [dbo].[Sheet]'
GO
ALTER TABLE [dbo].[Sheet] ADD CONSTRAINT [PK_Sheet] PRIMARY KEY CLUSTERED  ([Id])
GO

PRINT N'Altering [dbo].[Category]'
GO
EXEC sp_rename N'[dbo].[Category].[Owner_Id]', N'OwnerId', 'COLUMN'
GO
PRINT N'Creating primary key [PK_Category] on [dbo].[Category]'
GO
ALTER TABLE [dbo].[Category] ADD CONSTRAINT [PK_Category] PRIMARY KEY CLUSTERED  ([Id])
GO
PRINT N'Altering [dbo].[AspNetRoles]'
GO
ALTER TABLE [dbo].[AspNetRoles] ADD
[ConcurrencyStamp] [nvarchar] (max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
[NormalizedName] [nvarchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NULL
GO
ALTER TABLE [dbo].[AspNetRoles] ALTER COLUMN [Name] [nvarchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NULL
GO
PRINT N'Creating primary key [PK_AppRole] on [dbo].[AspNetRoles]'
GO
ALTER TABLE [dbo].[AspNetRoles] ADD CONSTRAINT [PK_AppRole] PRIMARY KEY CLUSTERED  ([Id])
GO
PRINT N'Creating index [RoleNameIndex] on [dbo].[AspNetRoles]'
GO
CREATE NONCLUSTERED INDEX [RoleNameIndex] ON [dbo].[AspNetRoles] ([NormalizedName])
GO
PRINT N'Creating [dbo].[AspNetRoleClaims]'
GO
CREATE TABLE [dbo].[AspNetRoleClaims]
(
[Id] [int] NOT NULL IDENTITY(1, 1),
[ClaimType] [nvarchar] (max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
[ClaimValue] [nvarchar] (max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
[RoleId] [int] NOT NULL
)
GO
PRINT N'Creating primary key [PK_IdentityRoleClaim<int>] on [dbo].[AspNetRoleClaims]'
GO
ALTER TABLE [dbo].[AspNetRoleClaims] ADD CONSTRAINT [PK_IdentityRoleClaim<int>] PRIMARY KEY CLUSTERED  ([Id])
GO
PRINT N'Altering [dbo].[AspNetUserLogins]'
GO
ALTER TABLE [dbo].[AspNetUserLogins] ADD
[ProviderDisplayName] [nvarchar] (max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL
GO
ALTER TABLE [dbo].[AspNetUserLogins] ALTER COLUMN [LoginProvider] [nvarchar] (450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL
ALTER TABLE [dbo].[AspNetUserLogins] ALTER COLUMN [ProviderKey] [nvarchar] (450) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL
GO
PRINT N'Creating primary key [PK_IdentityUserLogin<int>] on [dbo].[AspNetUserLogins]'
GO
ALTER TABLE [dbo].[AspNetUserLogins] ADD CONSTRAINT [PK_IdentityUserLogin<int>] PRIMARY KEY CLUSTERED  ([LoginProvider], [ProviderKey])
GO
PRINT N'Rebuilding [dbo].[SheetEntry]'
GO
CREATE TABLE [dbo].[tmp_rg_xx_SheetEntry]
(
[Id] [int] NOT NULL IDENTITY(1, 1),
[Account] [int] NOT NULL,
[CategoryId] [int] NOT NULL,
[CreateTimestamp] [datetime2] NOT NULL,
[Delta] [decimal] (18, 2) NOT NULL,
[Remark] [nvarchar] (max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
[SheetId] [int] NOT NULL,
[SortOrder] [int] NOT NULL,
[Source] [nvarchar] (250) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
[UpdateTimestamp] [datetime2] NOT NULL
)
GO
SET IDENTITY_INSERT [dbo].[tmp_rg_xx_SheetEntry] ON
GO
INSERT INTO [dbo].[tmp_rg_xx_SheetEntry]([Id], [Account], [CategoryId], [CreateTimestamp], [Delta], [Remark], [SheetId], [SortOrder], [Source], [UpdateTimestamp]) SELECT [Id], [Account], [Category_Id], [CreateTimestamp], [Delta], [Remark], [Sheet_Id], [SortOrder], [Source], [UpdateTimestamp] FROM [dbo].[SheetEntry]
GO
SET IDENTITY_INSERT [dbo].[tmp_rg_xx_SheetEntry] OFF
GO
DECLARE @idVal BIGINT
SELECT @idVal = IDENT_CURRENT(N'[dbo].[SheetEntry]')
IF @idVal IS NOT NULL
    DBCC CHECKIDENT(N'[dbo].[tmp_rg_xx_SheetEntry]', RESEED, @idVal)
GO
DROP TABLE [dbo].[SheetEntry]
GO
EXEC sp_rename N'[dbo].[tmp_rg_xx_SheetEntry]', N'SheetEntry'
GO
PRINT N'Creating primary key [PK_SheetEntry] on [dbo].[SheetEntry]'
GO
ALTER TABLE [dbo].[SheetEntry] ADD CONSTRAINT [PK_SheetEntry] PRIMARY KEY CLUSTERED  ([Id])
GO
PRINT N'Creating [dbo].[__EFMigrationsHistory]'
GO
CREATE TABLE [dbo].[__EFMigrationsHistory]
(
[MigrationId] [nvarchar] (150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
[ProductVersion] [nvarchar] (32) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL
)
GO
PRINT N'Creating primary key [PK_HistoryRow] on [dbo].[__EFMigrationsHistory]'
GO
ALTER TABLE [dbo].[__EFMigrationsHistory] ADD CONSTRAINT [PK_HistoryRow] PRIMARY KEY CLUSTERED  ([MigrationId])
GO
PRINT N'Creating primary key [PK_IdentityUserClaim<int>] on [dbo].[AspNetUserClaims]'
GO
ALTER TABLE [dbo].[AspNetUserClaims] ADD CONSTRAINT [PK_IdentityUserClaim<int>] PRIMARY KEY CLUSTERED  ([Id])
GO
PRINT N'Creating primary key [PK_IdentityUserRole<int>] on [dbo].[AspNetUserRoles]'
GO
ALTER TABLE [dbo].[AspNetUserRoles] ADD CONSTRAINT [PK_IdentityUserRole<int>] PRIMARY KEY CLUSTERED  ([UserId], [RoleId])
GO
PRINT N'Creating primary key [PK_AppOwner] on [dbo].[AppOwner]'
GO
ALTER TABLE [dbo].[AppOwner] ADD CONSTRAINT [PK_AppOwner] PRIMARY KEY CLUSTERED  ([Id])
GO
PRINT N'Adding foreign keys to [dbo].[AspNetRoleClaims]'
GO
ALTER TABLE [dbo].[AspNetRoleClaims] ADD CONSTRAINT [FK_IdentityRoleClaim<int>_AppRole_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [dbo].[AspNetRoles] ([Id]) ON DELETE CASCADE
GO
PRINT N'Adding foreign keys to [dbo].[AspNetUserClaims]'
GO
ALTER TABLE [dbo].[AspNetUserClaims] ADD CONSTRAINT [FK_IdentityUserClaim<int>_AppUser_UserId] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE CASCADE
GO
PRINT N'Adding foreign keys to [dbo].[AspNetUserLogins]'
GO
ALTER TABLE [dbo].[AspNetUserLogins] ADD CONSTRAINT [FK_IdentityUserLogin<int>_AppUser_UserId] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE CASCADE
GO
PRINT N'Adding foreign keys to [dbo].[AppUserTrustedUsers]'
GO
ALTER TABLE [dbo].[AppUserTrustedUsers] ADD CONSTRAINT [FK_AppUserTrustedUser_AppUser_SourceUserId] FOREIGN KEY ([SourceUserId]) REFERENCES [dbo].[AspNetUsers] ([Id])
ALTER TABLE [dbo].[AppUserTrustedUsers] ADD CONSTRAINT [FK_AppUserTrustedUser_AppUser_TargetUserId] FOREIGN KEY ([TargetUserId]) REFERENCES [dbo].[AspNetUsers] ([Id])
GO
PRINT N'Adding foreign keys to [dbo].[AspNetUserRoles]'
GO
ALTER TABLE [dbo].[AspNetUserRoles] ADD CONSTRAINT [FK_IdentityUserRole<int>_AppUser_UserId] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE CASCADE
ALTER TABLE [dbo].[AspNetUserRoles] ADD CONSTRAINT [FK_IdentityUserRole<int>_AppRole_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [dbo].[AspNetRoles] ([Id]) ON DELETE CASCADE
GO
PRINT N'Adding foreign keys to [dbo].[AspNetUsers]'
GO
ALTER TABLE [dbo].[AspNetUsers] ADD CONSTRAINT [FK_AppUser_AppOwner_GroupId] FOREIGN KEY ([GroupId]) REFERENCES [dbo].[AppOwner] ([Id]) ON DELETE CASCADE
GO
PRINT N'Adding foreign keys to [dbo].[Category]'
GO
ALTER TABLE [dbo].[Category] ADD CONSTRAINT [FK_Category_AppOwner_OwnerId] FOREIGN KEY ([OwnerId]) REFERENCES [dbo].[AppOwner] ([Id]) ON DELETE CASCADE
GO
PRINT N'Adding foreign keys to [dbo].[CalculationOptions]'
GO
ALTER TABLE [dbo].[CalculationOptions] ADD CONSTRAINT [FK_CalculationOptions_Sheet_SheetId] FOREIGN KEY ([SheetId]) REFERENCES [dbo].[Sheet] ([Id]) ON DELETE CASCADE
GO
PRINT N'Adding foreign keys to [dbo].[SheetEntry]'
GO
ALTER TABLE [dbo].[SheetEntry] ADD CONSTRAINT [FK_SheetEntry_Sheet_SheetId] FOREIGN KEY ([SheetId]) REFERENCES [dbo].[Sheet] ([Id]) ON DELETE CASCADE
ALTER TABLE [dbo].[SheetEntry] ADD CONSTRAINT [FK_SheetEntry_Category_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [dbo].[Category] ([Id])
GO
PRINT N'Adding foreign keys to [dbo].[Sheet]'
GO
ALTER TABLE [dbo].[Sheet] ADD CONSTRAINT [FK_Sheet_AppOwner_OwnerId] FOREIGN KEY ([OwnerId]) REFERENCES [dbo].[AppOwner] ([Id]) ON DELETE CASCADE
GO
INSERT [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20151124220045_InitialCreate', N'7.0.0-rc1-16348')
GO
PRINT N'Fixing auth'
GO
UPDATE  [FinancialApp-aspnext].[dbo].[AspNetUsers]
  SET NormalizedUserName = LOWER(UserName),
      NormalizedEmail = LOWER(Email)