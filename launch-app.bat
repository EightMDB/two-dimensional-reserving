@echo off
title Two Dimensional Reserving - Launcher
echo ============================================
echo   Two Dimensional Reserving Desktop App
echo ============================================
echo.

REM Check if the executable exists
if exist "dist\Two Dimensional Reserving-win32-x64\Two Dimensional Reserving.exe" (
    echo [INFO] Launching desktop application...
    start "" "dist\Two Dimensional Reserving-win32-x64\Two Dimensional Reserving.exe"
    echo [SUCCESS] Application started successfully!
    echo.
    echo The desktop application is now running.
    echo You can close this window.
    timeout /t 3 >nul
) else (
    echo [ERROR] Application executable not found!
    echo.
    echo To build the desktop application:
    echo   1. Install Node.js dependencies: npm install
    echo   2. Build the application: npm run pack
    echo.
    echo Alternatively, you can run the web version:
    echo   - Open src\index.html in your web browser
    echo.
    pause
)