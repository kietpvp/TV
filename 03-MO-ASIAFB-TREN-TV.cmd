@echo off
setlocal
set "ASIAFB_ADB=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe"
if not exist "%ASIAFB_ADB%" (
  echo Android SDK platform-tools not found.
  pause
  exit /b 1
)
"%ASIAFB_ADB%" -s emulator-5554 shell am start -W -n com.asiafbtv/.MainActivity
if errorlevel 1 (
  echo Start Television emulator in Android Studio Device Manager, then try again.
  pause
  exit /b 1
)
