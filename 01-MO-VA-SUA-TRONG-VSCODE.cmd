@echo off
cd /d "%~dp0"
echo ASIA F^&B - Mo du an trong VS Code va giao dien HTML de chinh sua.
where code >nul 2>nul
if %errorlevel% equ 0 (start "" code "%cd%") else (echo Chua tim thay lenh code. Hay mo Visual Studio Code va chon File ^> Open Folder.)
start "" "%~dp0web\index.html"
echo Mo index.html de preview. Moi lan luu CSS/JS, bam Ctrl+R de xem thay doi.
pause
