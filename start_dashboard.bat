@echo off
rem Starts the CSM Monitor dashboard: runs the Vite dev server and opens it in the browser.
rem Double-click this file or run it from a terminal. Close the window or press Ctrl+C to stop.
setlocal
title CSM Monitor
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
    echo Node.js was not found. Install it from https://nodejs.org and run this file again.
    goto :fail
)

if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 goto :fail
)

rem The app imports this generated file; build one if missing.
if not exist "src\data\dashboard_data.json" (
    echo Building src\data\dashboard_data.json...
    python scripts\build_dashboard_data.py
    if errorlevel 1 goto :fail
)

echo Starting CSM Monitor. Close this window or press Ctrl+C to stop it.
call npm run dev -- --open
if errorlevel 1 goto :fail
exit /b 0

:fail
rem Keep the window open so the error above stays readable when double-clicked.
echo.
pause
exit /b 1
