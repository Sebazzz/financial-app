# Financial App installation guide

This guide will help you in installation of the application. The application is a ASP.NET Core web application and will in the basis only require a SQL Server database server to get up and running.

**Note:** This installation guide covers very basic installation, just enough to get the application up and running. It does _not_ cover installation of the application as a systemd or Windows Service, nor setting it up behind any reverse proxy. Please refer to [hosting as a Windows service](https://docs.microsoft.com/nl-nl/aspnet/core/hosting/windows-service), [hosting in Windows IIS](https://docs.microsoft.com/nl-nl/aspnet/core/publishing/iis?tabs=aspnetcore2x) or [hosting on Linux](https://docs.microsoft.com/nl-nl/aspnet/core/publishing/linuxproduction?tabs=aspnetcore2x) pages on the official Microsoft docs for more information.

## Getting a release

Download a release from the [releases](https://github.com/Sebazzz/financial-app/releases) tab. You may also [build the application from sources](Building-from-sources.md) if you like.

## Prequisites

To run the application you'Il need:

-   A virtual machine or Azure website to deploy it to.
    -   If using Windows, install on Windows Server 2012 or higher.
    -   If using Linux, install on Ubuntu 16.x or higher.
-   Microsoft SQL Server for the database. The free SQL Server Express also works.
-   E-mail (SMTP) server if you want account recovery e-mails etc. to work

On Ubuntu install:

    sudo apt-get install libunwind8 liblttng-ust0 libcurl3 libssl1.0.0 libuuid1 libkrb5-3 zlib1g

In addition, for Ubuntu 16.x:

    sudo apt-get install libicu55

For Ubuntu 17.x:

    sudo apt-get install libicu57

For Ubuntu 18.x:

    sudo apt-get install libicu57

For QR code support in two-factor-authentication:

        sudo apt-get install libgdiplus
        cd /usr/lib
        sudo ln -s libgdiplus.so gdiplus.dll

## Installation

You can configure the application via environment variables or configuration files.

Settings are grouped per section, and consist of key-value pairs. In this documentation the section name is shown in the title of each configuration.

### Environment variables

Environment variables are more easier to configure, but usually also more insecure. The configurations shown below are environment variables (you can set them in bash by `export NAME=VALUE` and in Powershell via `$ENV:NAME = "VALUE"`).

Section parts and key-value pairs are concatenated by using two underscores. For instance with section `Server.Https` and setting `CertificatePath` becomes: `SERVER__HTTPS__CERTIFICATEPATH`.

### File-based configuration

Configuration files are searched on platform-specific paths:

-   Windows
    -   Common application data (usually `C:\ProgramData\financial-app\config.<extension>`)
-   Unix / Linux - excluding MacOS
    -   `/etc/financial-app/config.<extension>`

You can use either `.json` or `.ini` files to configure the application. Using both is not recommended.

#### INI files

INI files groups key-value pairs of the sections with a `[section:subsection]` header. Key-value pairs are simply `key=value`. It is probably the most human-editable file format.

For instance with section `Server.Https` and setting `CertificatePath` becomes:

    [Server:Https]
    CertificatePath=path

#### JSON files

JSON files follow a standard JSON file format. Each section is an nested object.

For instance with section `Server.Https` and setting `CertificatePath` becomes:

    {
       "Server": {
          "Https": {
              "CertificatePath": "path"
          }
       }
    }

### General configuration - `Server`

`BaseUrl`: Base URL used for mailing. If not set, auto-detection is attempted.

### HTTPS configuration - `Server.Https`

To use HTTPs, use the following environment variables:

`CertificatePath`: Path to pfx file.

`CertificatePassword`: Password for pfx file.

The server will automatically start on port 80 and 443.

### Logging configuration - `Logging.File`

To configure logging to a file:

`Path`: Path to log file.

`FileSizeLimitBytes`: Maximum size of log file in bytes. 0 for unlimited.

`MaxRollingFiles`: Maximum file rollover. 0 for unlimited.

### E-mail configuration - `Mail`

To configure e-mail settings your can use the following environment variables:

`Host`: SMTP host name.

`EnableSSL`: Enable SSL when connecting to SMTP `true`/`false`.

`Port`: SMTP port number.

`Username`: User name.

`Password`: Password.

`FromAddress`: Source e-mail address used for sending e-mail.

`FromDisplayName`: Display name to use and shown in repicient mailbox.

E-mail is optional, but is checked on startup. If you need to skip the startup test (because you won't or cannot use e-mail), use:

`SkipTest`: True or false. By default false.

### Database set-up - `Database`

Create an new empty database with a case insensitive collation (`SQL_Latin1_General_CP1_CI_AS` is preferred).

You can set the database settings as follows:

`Server`: Server name and instance.

`Database`: Database name.

`UserID`: User ID.

`Password`: Password.

`IntegratedSecurity`: Use integrated credentials. Cannot be combined with user id / password.

`Encrypt`: Database connection encryption enabled.

`ConnectionTimeout`: Connection timeout to SQL Server. Set to 0 for unlimited. Set to 60 seconds for cloud environments.

#### Advanced configuration

Set the connection string using:

`ConnectionString`: Connection string used to connection to the database. Usually: `Server=myserver;Integrated Security=true;Database=mydatabase;MultipleActiveResultSets=true`.

Options in the connection string will override manual "simple" configured options above.

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
