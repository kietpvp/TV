# ASIA F&B native Android TV build (Windows 10/11, PowerShell 5.1+)
# Generates one installable release APK with embedded Hermes JS and resources.
# Does not install or alter anything on the TV.
[CmdletBinding()]
param([switch]$Recreate, [string]$BuildWorkspace)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$base = $PSScriptRoot
if (-not $BuildWorkspace) {
  $BuildWorkspace = Join-Path ([System.IO.Path]::GetPathRoot($base)) 'AsiaFB-build'
}
$workspace = $BuildWorkspace
$project = Join-Path $workspace 'AsiaFBTV'

function Require-Command($name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) { throw "Missing $name. Install Node.js 22 LTS and Android Studio first (see README-VI.md)." }
}
Require-Command 'node.exe'
Require-Command 'npm.cmd'
Require-Command 'npx.cmd'
# Prefer the JDK 17 provisioned by Gradle for this React Native template.
# Java 25 emits native-access warnings that this Android plugin treats as errors.
$jdkCache = Join-Path $env:USERPROFILE '.gradle\jdks'
if (Test-Path $jdkCache) {
  $jdk17 = Get-ChildItem -LiteralPath $jdkCache -Directory -Filter '*-17-*' |
    Where-Object { Test-Path (Join-Path $_.FullName 'bin\java.exe') } |
    Select-Object -First 1
  if ($jdk17) {
    $env:JAVA_HOME = $jdk17.FullName
    $env:Path = (Join-Path $env:JAVA_HOME 'bin') + ';' + $env:Path
    Write-Host "Using JDK 17: $env:JAVA_HOME" -ForegroundColor Cyan
  }
}
if (-not $env:ANDROID_HOME -and -not $env:ANDROID_SDK_ROOT) {
  $guess = Join-Path $env:LOCALAPPDATA 'Android\Sdk'
  if (Test-Path $guess) { $env:ANDROID_HOME = $guess; $env:ANDROID_SDK_ROOT = $guess }
}
if (-not $env:ANDROID_HOME -and -not $env:ANDROID_SDK_ROOT) {
  throw 'Android SDK missing. Install SDK with Android Studio; set ANDROID_HOME to its path.'
}

if ($Recreate -and (Test-Path $project)) {
  Write-Host 'Refusing to delete an existing work tree automatically.' -ForegroundColor Yellow
  throw 'To regenerate, manually rename build-work\AsiaFBTV then rerun.'
}
New-Item -ItemType Directory -Force -Path $workspace | Out-Null
if (-not (Test-Path (Join-Path $project 'android\gradlew.bat'))) {
  Push-Location $workspace
  try {
    Write-Host 'Initializing react-native-tvos 0.83 template; Internet is required for first build...' -ForegroundColor Cyan
    & npx.cmd --yes '@react-native-community/cli@20.1.0' init AsiaFBTV --template '@react-native-tvos/template-tv@0.83.0-0' --pm npm
    if ($LASTEXITCODE -ne 0) { throw 'Template initialization failed. Verify Internet, npm registry and Node 22.' }
  } finally { Pop-Location }
}
if (-not (Test-Path (Join-Path $project 'android\gradlew.bat'))) { throw 'Android Gradle wrapper was not generated.' }

Write-Host 'Copying native UI and approved brand images...' -ForegroundColor Cyan
Copy-Item -Force (Join-Path $base 'App.tsx') (Join-Path $project 'App.tsx')
Copy-Item -Force (Join-Path $base 'AppLibrary.tsx') (Join-Path $project 'AppLibrary.tsx')
$assetDest = Join-Path $project 'assets'
New-Item -ItemType Directory -Force -Path $assetDest | Out-Null
Copy-Item -Recurse -Force (Join-Path $base 'assets\*') $assetDest
& node.exe (Join-Path $base 'scripts\patch-android.js') $project
if ($LASTEXITCODE -ne 0) { throw 'Android native bridge patch failed.' }

# Use both ABIs: Xiaomi Google TV builds may use either 32-bit or 64-bit userspace.
$properties = Join-Path $project 'android\gradle.properties'
$props = Get-Content -Raw $properties
if ($props -match '(?m)^reactNativeArchitectures=') {
    $props = $props -replace '(?m)^reactNativeArchitectures=.*$', 'reactNativeArchitectures=armeabi-v7a,arm64-v8a,x86_64'
} else { $props += "`nreactNativeArchitectures=armeabi-v7a,arm64-v8a,x86_64`n" }
[System.IO.File]::WriteAllText($properties, $props)

Push-Location (Join-Path $project 'android')
try {
  Write-Host 'Building signed-for-testing standalone release APK (Metro server NOT required)...' -ForegroundColor Cyan
  & .\gradlew.bat --no-daemon --stacktrace assembleRelease
  if ($LASTEXITCODE -ne 0) { throw 'Gradle build failed; inspect the messages above.' }
} finally { Pop-Location }

$apk = Join-Path $project 'android\app\build\outputs\apk\release\app-release.apk'
if (-not (Test-Path $apk)) { throw "Build finished but missing APK at $apk" }
$out = Join-Path $base 'AsiaFB_TV_ReactNative_Test.apk'
Copy-Item -Force $apk $out
Write-Host "Success: $out" -ForegroundColor Green
Write-Host 'This is a test APK signed with the template debug key; not a Play Store production release.' -ForegroundColor Yellow
