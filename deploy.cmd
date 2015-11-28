@if "%SCM_TRACE_LEVEL%" NEQ "4" @echo off

:: ----------------------
:: KUDU Deployment Script
:: Version: 0.2.2
:: ----------------------

:: Prerequisites
:: -------------

:: Verify node.js installed
where node 2>nul >nul
IF %ERRORLEVEL% NEQ 0 (
  echo Missing node.js executable, please install node.js, if already installed make sure it can be reached from current environment.
  goto error
)

:: Setup
:: -----

setlocal enabledelayedexpansion

SET ARTIFACTS=%~dp0%..\artifacts

IF NOT DEFINED DEPLOYMENT_SOURCE (
  SET DEPLOYMENT_SOURCE=%~dp0%.
)

IF NOT DEFINED DEPLOYMENT_TARGET (
  SET DEPLOYMENT_TARGET=%ARTIFACTS%\wwwroot
)

IF NOT DEFINED NEXT_MANIFEST_PATH (
  SET NEXT_MANIFEST_PATH=%ARTIFACTS%\manifest

  IF NOT DEFINED PREVIOUS_MANIFEST_PATH (
    SET PREVIOUS_MANIFEST_PATH=%ARTIFACTS%\manifest
  )
)

IF NOT DEFINED KUDU_SYNC_CMD (
  :: Install kudu sync
  echo Installing Kudu Sync
  call npm install kudusync -g --silent
  IF !ERRORLEVEL! NEQ 0 goto error

  :: Locally just running "kuduSync" would also work
  SET KUDU_SYNC_CMD=%appdata%\npm\kuduSync.cmd
)
IF NOT DEFINED DEPLOYMENT_TEMP (
  SET DEPLOYMENT_TEMP=%temp%\___deployTemp%random%
  SET CLEAN_LOCAL_DEPLOYMENT_TEMP=true
)

IF DEFINED CLEAN_LOCAL_DEPLOYMENT_TEMP (
  IF EXIST "%DEPLOYMENT_TEMP%" rd /s /q "%DEPLOYMENT_TEMP%"
  mkdir "%DEPLOYMENT_TEMP%"
)

IF NOT DEFINED MSBUILD_PATH (
  SET MSBUILD_PATH=%WINDIR%\Microsoft.NET\Framework\v4.0.30319\msbuild.exe
)
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
:: Deployment
:: ----------

echo Handling ASP.NET 5 Web Application deployment.

:: Remove wwwroot if deploying to default location
IF "%DEPLOYMENT_TARGET%" == "%WEBROOT_PATH%" (
    FOR /F %%i IN ("%DEPLOYMENT_TARGET%") DO IF "%%~nxi"=="wwwroot" (
    SET DEPLOYMENT_TARGET=%%~dpi
    )
)

:: Remove trailing slash if present
IF "%DEPLOYMENT_TARGET:~-1%"=="\" (
    SET DEPLOYMENT_TARGET=%DEPLOYMENT_TARGET:~0,-1%
)

:: 1. Install KRE
call :ExecuteCmd PowerShell -NoProfile -NoLogo -ExecutionPolicy unrestricted -Command "[System.Threading.Thread]::CurrentThread.CurrentCulture = ''; [System.Threading.Thread]::CurrentThread.CurrentUICulture = '';& '%SCM_KVM_PS_PATH%' %*" install %SCM_KRE_VERSION% -%SCM_KRE_ARCH% -runtime %SCM_KRE_CLR% %SCM_KVM_INSTALL_OPTIONS%
IF !ERRORLEVEL! NEQ 0 goto error

IF EXIST "%USERPROFILE%\.k\temp-set-envvars.cmd" (
  CALL "%USERPROFILE%\.k\temp-set-envvars.cmd"
  DEL "%USERPROFILE%\.k\temp-set-envvars.cmd"
)

:: 2. Run KPM Restore
call kpm restore "%DEPLOYMENT_SOURCE%" %SCM_KPM_RESTORE_OPTIONS%
IF !ERRORLEVEL! NEQ 0 goto error

:: 3. Run KPM Bundle
call kpm bundle "src\App\project.json" --runtime "%USERPROFILE%\.k\runtimes\KRE-%SCM_KRE_CLR%-win-%SCM_KRE_ARCH%.%SCM_KRE_VERSION%" --out "%DEPLOYMENT_TEMP%" %SCM_KPM_PACK_OPTIONS%
IF !ERRORLEVEL! NEQ 0 goto error

:: 4. KuduSync
call %KUDU_SYNC_CMD% -v 50 -f "%DEPLOYMENT_TEMP%" -t "%DEPLOYMENT_TARGET%" -n "%NEXT_MANIFEST_PATH%" -p "%PREVIOUS_MANIFEST_PATH%" -i ".git;.hg;.deployment;deploy.cmd"
IF !ERRORLEVEL! NEQ 0 goto error
)

::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
:: Post deployment stub
IF DEFINED POST_DEPLOYMENT_ACTION call "%POST_DEPLOYMENT_ACTION%"
IF !ERRORLEVEL! NEQ 0 goto error

goto end

:: Execute command routine that will echo out when error
:ExecuteCmd
setlocal
set _CMD_=%*
call %_CMD_%
if "%ERRORLEVEL%" NEQ "0" echo Failed exitCode=%ERRORLEVEL%, command=%_CMD_%
exit /b %ERRORLEVEL%

:error
endlocal
echo An error has occurred during web site deployment.
call :exitSetErrorLevel
call :exitFromFunction 2>nul

:exitSetErrorLevel
exit /b 1

:exitFromFunction
()

:end
endlocal
echo Finished successfully.
