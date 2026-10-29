# Build the editable Android project in this directory. Does not install on TV.
[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$base = $PSScriptRoot
$portableTools = Join-Path ([System.IO.Path]::GetPathRoot($base)) 'AndroidBuildTools'
foreach ($command in @('node.exe', 'npm.cmd')) {
  if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
    throw "Missing $command. Install Node.js 22.11 or later."
  }
}
if (-not $env:JAVA_HOME -and (Test-Path (Join-Path $portableTools 'java'))) {
  $portableJdk = Get-ChildItem -LiteralPath (Join-Path $portableTools 'java') -Directory -Filter 'jdk-17*' |
    Where-Object { Test-Path (Join-Path $_.FullName 'bin\java.exe') } |
    Select-Object -First 1
  if ($portableJdk) {
    $env:JAVA_HOME = $portableJdk.FullName
    $env:Path = (Join-Path $env:JAVA_HOME 'bin') + ';' + $env:Path
  }
}
$jdkCache = Join-Path $env:USERPROFILE '.gradle\jdks'
if (Test-Path $jdkCache) {
  $jdk17 = Get-ChildItem -LiteralPath $jdkCache -Directory -Filter '*-17-*' |
    Where-Object { Test-Path (Join-Path $_.FullName 'bin\java.exe') } |
    Select-Object -First 1
  if ($jdk17) {
    $env:JAVA_HOME = $jdk17.FullName
    $env:Path = (Join-Path $env:JAVA_HOME 'bin') + ';' + $env:Path
  }
}
if (-not $env:ANDROID_HOME -and $env:ANDROID_SDK_ROOT) { $env:ANDROID_HOME = $env:ANDROID_SDK_ROOT }
if (-not $env:ANDROID_HOME) {
  $sdkGuess = Join-Path $env:LOCALAPPDATA 'Android\Sdk'
  if (Test-Path $sdkGuess) { $env:ANDROID_HOME = $sdkGuess }
}
if (-not $env:ANDROID_HOME -and (Test-Path (Join-Path $portableTools 'sdk\platform-tools'))) {
  $env:ANDROID_HOME = Join-Path $portableTools 'sdk'
}
if (-not $env:ANDROID_HOME) { throw 'Android SDK missing. Install Android Studio and set ANDROID_HOME.' }
Push-Location $base
try {
  if (-not (Test-Path 'node_modules\react-native\package.json')) {
    & npm.cmd ci
    if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed.' }
  }
  & npm.cmd run prepare:android
  if ($LASTEXITCODE -ne 0) { throw 'Gradle compatibility setup failed.' }
  & npm.cmd run typecheck
  if ($LASTEXITCODE -ne 0) { throw 'TypeScript check failed.' }
  Push-Location (Join-Path $base 'android')
  try {
    # Windows PowerShell 5.1 treats native stderr warnings as errors when logging.
    # Gradle's exit code determines whether the build actually failed.
    $previousErrorPreference = $ErrorActionPreference
    try {
      $ErrorActionPreference = 'Continue'
      & .\gradlew.bat --no-daemon --console=plain --max-workers=4 --stacktrace assembleRelease
      $gradleResult = $LASTEXITCODE
    } finally { $ErrorActionPreference = $previousErrorPreference }
    if ($gradleResult -ne 0) { throw 'Gradle build failed; inspect the log above.' }
  } finally { Pop-Location }
  $apk = Join-Path $base 'android\app\build\outputs\apk\release\app-release.apk'
  $output = Join-Path $base 'AsiaFB_TV_ReactNative_Test.apk'
  Copy-Item -LiteralPath $apk -Destination $output -Force
  Write-Host "Success: $output" -ForegroundColor Green
  Write-Host 'Internal test APK signed with the template debug key. Metro is not required.'
} finally { Pop-Location }
