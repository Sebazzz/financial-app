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

On Ubuntu install:

    sudo apt-get install libunwind8 liblttng-ust0 libcurl3 libssl1.0.0 libuuid1 libkrb5-3 zlib1g

In addition, for Ubuntu 16.x:

	sudo apt-get install libicu55

For Ubuntu 14.x:

	sudo apt-get install libicu52

For Ubuntu 17.x:

	sudo apt-get install libicu57

## Installation

### HTTPS configuration
To use HTTPs, use the following environment variables:

`HTTPS__CERTIFICATEPATH`: Path to pfx file.
`HTTPS__CERTIFICATEPASSWORD`: Password for pfx file.

The server will automatically start on port 80 and 443.

### Database set-up
Create an new empty database with a case insensitive collation (`SQL_Latin1_General_CP1_CI_AS` is preferred).

### Application installation
Unpack the application on any location, for instance `/opt/fa-app`.

Modify the connection string in `launch.conf`.

You can try out the application using:

    ./launch run

Install the application as a systemd service using:

    ./launch install

View other options:

    ./launch --help

### Run
To run the application after installation, simply run:

    ./launch start

The application will launch at the URL specified in `launch.conf`. 

You will be greeted with a setup wizard, in which you will be able to set-up an administrator user. 