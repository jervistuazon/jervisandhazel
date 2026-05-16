@echo off
setlocal EnableExtensions
color 0A

cd /d "%~dp0"

echo ============================================
echo        Start Local Website Server
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not available in PATH.
    echo Install Node.js, then run this file again.
    goto :end
)

if not exist "local-server.js" (
    echo [ERROR] local-server.js was not found in this folder.
    echo Make sure this batch file is inside the website repo folder.
    goto :end
)

echo [INFO] Starting local website server...
echo [INFO] The site will open automatically in your browser.
echo [INFO] Keep this window open while testing locally.
echo [INFO] Press Ctrl+C in this window to stop the server.
echo.

node local-server.js --open

:end
echo.
echo Press any key to exit...
pause >nul
endlocal
