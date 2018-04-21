Param(
    [Switch] $LocalTesting
)

Set-Location $PSScriptRoot

$BuildDir = Join-Path $PSScriptRoot "build"
$ReplacementMap = @{ };

if ($LocalTesting -eq $true) {
    $ReplacementMap.Add("../wwwroot", "../../wwwroot")
} else {
    $ReplacementMap.Add("../wwwroot", "{base-url}")
}

Write-Host "Financial App - mail templates build script" -ForegroundColor Cyan
Write-Host "Building files in $PSScriptRoot to $BuildDir" -ForegroundColor Gray

# Clean output
Remove-Item $buildDir -Recurse -Force -Verbose -ErrorAction SilentlyContinue
New-Item $buildDir -ItemType Directory -Verbose | Out-Null

# Run Command and evaluate result
$Cmd = "mjml"
$Arguments = @("-o", $BuildDir, "-r", "*.mjml")

Write-Host $Cmd $Arguments -ForegroundColor Gray
& $Cmd $Arguments

if ($LASTEXITCODE -eq 0) {
    Write-Host "Success... postprocessing" -ForegroundColor Green
} else {
    Exit $LASTEXITCODE    
}

foreach ($Item in Get-ChildItem -Path $BuildDir) {
    Write-Host $Item.Name -ForegroundColor Gray

    $Content = Get-Content $Item.FullName -Raw

    foreach ($Key in $ReplacementMap.Keys) {
        $Replacement = $ReplacementMap[$Key]

        $Content = $Content -ireplace $Key,$Replacement
    }

    Set-Content $Item.FullName -Value $Content -Verbose
}

Write-Host "Done!" -ForegroundColor Green
