@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0build-windows.ps1"
if errorlevel 1 (
 echo.
 echo BUILD FAILED. See instructions in README-VI.md
 pause
 exit /b 1
)
echo.
echo BUILD SUCCESSFUL. APK is in this folder.
pause
