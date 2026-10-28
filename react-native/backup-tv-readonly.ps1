# Does NOT modify TV; runs read-only adb diagnostics plus a screenshot.
[CmdletBinding()]
param([string]$Adb = 'adb.exe')
$ErrorActionPreference = 'Stop'
if (-not (Get-Command $Adb -ErrorAction SilentlyContinue)) { throw 'adb not found. Install Google Platform-Tools and add it to PATH.' }
$devices = & $Adb devices -l
Write-Host ($devices -join "`n")
if (($devices | Select-String 'device product:').Count -ne 1) {
  throw 'Exactly one authorized TV/device must be connected. Check adb devices -l.'
}
$folder = Join-Path $PSScriptRoot ('backup_readonly_' + (Get-Date -Format 'yyyyMMdd_HHmmss'))
New-Item -Path $folder -ItemType Directory | Out-Null
$commands = @{
  'properties.txt' = @('shell','getprop')
  'packages.txt'   = @('shell','pm','list','packages')
  'disabled.txt'   = @('shell','pm','list','packages','-d')
  'home.txt'       = @('shell','cmd','package','resolve-activity','--brief','-a','android.intent.action.MAIN','-c','android.intent.category.HOME')
  'audio.txt'      = @('shell','dumpsys','audio')
  'display.txt'    = @('shell','wm','size')
}
foreach ($k in $commands.Keys) {
  try { & $Adb @($commands[$k]) | Out-File -FilePath (Join-Path $folder $k) -Encoding utf8 }
  catch { Write-Warning "Unable to read $k: $_" }
}
& $Adb shell screencap -p /sdcard/Download/asiafb_before.png | Out-Null
& $Adb pull /sdcard/Download/asiafb_before.png (Join-Path $folder 'screenshot_before.png') | Out-Null
Write-Host "Read-only backup: $folder" -ForegroundColor Green
Write-Host 'Do not share backup publicly; it can contain device/network details.'
