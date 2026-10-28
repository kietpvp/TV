[CmdletBinding()]
param([string]$Adb = 'adb.exe')
$ErrorActionPreference='Stop'
$identifier = Join-Path $PSScriptRoot 'ASIAFB_APP_ID.txt'
if (-not (Test-Path $identifier)) {throw 'Build project first to determine applicationId.'}
$id = (Get-Content $identifier -Raw).Trim()
Write-Host "Target package: $id"
$answer = Read-Host 'Uninstall this test app (does not alter other apps)? Type YES'
if ($answer -cne 'YES') {exit}
& $Adb uninstall $id
if ($LASTEXITCODE -ne 0) {throw 'Uninstall failed.'}
Write-Host 'Removed the test app.'
