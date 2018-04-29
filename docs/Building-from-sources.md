# Building Financial App from sources

If you like to build Financial App from sources, you can follow the instructions below.

## Prequisites

*   [.NET Core 2.0 SDK](https://www.microsoft.com/net/download/core).
*   [Node.js 6.10](https://www.microsoft.com/net/download/core) or higher (Node.js 8.x is supported too).
*   [Yarn 1.3.2](https://yarnpkg.com/en/docs/install) or higher
*   Powershell

Environment:

*   Ensure `yarn` and `node` are in your `PATH`.
*   Ensure `dotnet` is in your `PATH`.

For running the build script:

*   Ensure the Powershell execution policy is set to [**RemoteSigned**](https://technet.microsoft.com/en-us/library/ee176961.aspx).

## Check-out

Pull the sources from this repository's [home page](https://github.com/Sebazzz/financial-app).

## Building

Use the build script in the root to build the application:

    build

To create a deployment to one of the supported platforms:

    build -Target Publish

The results will be emitted in the `build/publish` folder. For additional supported command line parameters run:

    build -h

## Development

After you've build the application once you can start developing.

To develop, just run the application using `dotnet run`. The webpack development middleware will automatically compile and serve any frontend dependencies.

If you have not created a database yet, please run `build -Target Generation-MigrationScript` to generate a migration script and run it on a local database.

## Code style and linting

Code style and linting of TS/JS/JSON is enforced via TSLint and Prettier. If you have run `yarn`, prettier will be run as a pre-commit hook.

### Editors

Both Visual Studio and Visual Studio Code work well with the project.

Recommended extensions for Visual Studio:

*   ReSharper
*   TSLint
*   [Prettier](https://github.com/madskristensen/JavaScriptPrettier)

Recommende extensions for Visual Studio Code:

*   Editor support
    *   csharp
*   Code formatting and linting
    *   tslint
    *   vscode-prettier
    *   vscode-status-bar-format-toggle
*   Email template editing:
    *   vscode-mjml
    *   mjml-syntax
