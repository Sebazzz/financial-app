Write-Host "Initializing..."
dnvm use clr-light
Set-Location App
Write-Host "Location: " $((Get-Location).Path)