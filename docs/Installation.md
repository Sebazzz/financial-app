# Financial App installation guide

This guide will help you in installation of the application. The application is a ASP.NET Core web application and will in the basis only require `libuv` and a SQL Server database server to get up and running.

**Note:** This installation guide covers very basic installation, just enough to get the application up and running. It does *not* cover installation of the application as a systemd or Windows Service, nor setting it up behind any reverse proxy. Please refer to [hosting as a Windows service](https://docs.microsoft.com/nl-nl/aspnet/core/hosting/windows-service), [hosting in Windows IIS](https://docs.microsoft.com/nl-nl/aspnet/core/publishing/iis?tabs=aspnetcore2x) or [hosting on Linux](https://docs.microsoft.com/nl-nl/aspnet/core/publishing/linuxproduction?tabs=aspnetcore2x) pages on the official Microsoft docs for more information.

## Getting a release
Download a release from the [releases](https://github.com/Sebazzz/financial-app/releases) tab. You may also [build the application from sources](Building-from-sources.md) if you like.

## Prequisites

To run the application you'Il need:

* A virtual machine or Azure website to deploy it to.
   * If using Windows, install on Windows Server 2012 or higher.
   * If using Linux, install on Ubuntu 16.x or higher.
* Microsoft SQL Server for the database. The free SQL Server Express also works.

On Ubuntu install `libuv`:

    sudo apt-get install libuv

## Installation
### Database set-up
Create an new empty database with a case insensitive collation (`SQL_Latin1_General_CP1_CI_AS` is preferred).

Execute the migration script on the created database.

### Application installation
Unpack the application on any location. Edit `appsettings.json` and alter the `ConnectionString` key to a connection string you use for connecting to the database of the previous step.

### Run
To run the application, simple run:

    ./App

The application will launch.