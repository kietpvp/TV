[CmdletBinding()]
param([string]$Adb = 'adb.exe')
$ErrorActionPreference='Stop'
$apk = Join-Path $PSScriptRoot 'AsiaFB_TV_ReactNative_Test.apk'
if (-not (Test-Path $apk)) {throw 'APK not present. Run build-windows.cmd and wait for a successful build.'}
if (-not (Get-Command $Adb -ErrorAction SilentlyContinue)) {throw 'adb.exe not found; install Android Platform-Tools.'}
& $Adb devices -l
$answer = Read-Host 'Install the test APK on the connected TV? Type YES'
if ($answer -cne 'YES') {Write-Host 'Cancelled'; exit}
& $Adb install -r $apk
if ($LASTEXITCODE -ne 0) {throw 'adb install failed; inspect the TV for any permission prompts.'}
Write-Host 'Installed. Open ASIA F&B TV from the Apps section on Google TV.' -ForegroundColor Green
Write-Host 'No system apps disabled and no Home launcher changed.'
