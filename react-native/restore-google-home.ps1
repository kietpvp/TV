# Restore Google TV Home on the Xiaomi TV without uninstalling ASIA F&B TV.
[CmdletBinding()]
param(
  [string]$Serial = '192.168.26.112:5555',
  [string]$Adb = 'adb.exe'
)
$ErrorActionPreference = 'Stop'
if (-not (Get-Command $Adb -ErrorAction SilentlyContinue)) {
  $portableAdb = Join-Path ([System.IO.Path]::GetPathRoot($PSScriptRoot)) 'AndroidBuildTools\sdk\platform-tools\adb.exe'
  if (Test-Path -LiteralPath $portableAdb) { $Adb = $portableAdb }
  else { throw 'adb.exe not found. Specify -Adb with the Android Platform-Tools path.' }
}
& $Adb -s $Serial shell pm enable --user 0 com.google.android.apps.tv.launcherx
if ($LASTEXITCODE -ne 0) { throw 'Could not enable Google TV Home.' }
& $Adb -s $Serial shell pm enable --user 0 com.google.android.tungsten.setupwraith
if ($LASTEXITCODE -ne 0) { throw 'Could not enable Google TV Home recovery.' }
& $Adb -s $Serial shell cmd package set-home-activity --user 0 com.google.android.apps.tv.launcherx/.home.HomeActivity
if ($LASTEXITCODE -ne 0) { throw 'Could not restore Google TV Home.' }
& $Adb -s $Serial shell input keyevent KEYCODE_HOME
if ($LASTEXITCODE -ne 0) { throw 'Could not open Home.' }
Write-Host 'Google TV Home restored. ASIA F&B TV remains installed.'
