$ErrorActionPreference =  [System.Management.Automation.ActionPreference]::Stop
$VerbosePreference = [System.Management.Automation.ActionPreference]::Continue


$Path = "src\App\node_modules\serviceworker-webpack-plugin\lib\index.js"

Write-Host "Patching serviceworker-webpack-plugin" -ForegroundColor Green

if (!(Test-Path $Path)) {
    Write-Error "Please restore node packages first. Cannot find [$Path]"
    Exit -1
}

$Content = Get-Content $Path

Write-Host "..."
$NewContent = $Content.Replace("var minify = (compiler.options.plugins || [])","var minify = require('uglifyjs-webpack-plugin') || (compiler.options.plugins || [])")

if ($Content -ieq $NewContent) {
    Write-Warning "File already patched or invalid version"
    Exit 0    
}

$NewContent | Set-Content $Path

Write-Host "Successfully patched $Path" -ForegroundColor Green