@echo off
echo Starting Financial Adviser Application...
echo.

REM Check if Poetry is installed
where poetry >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Error: Poetry is not installed or not in PATH
    echo Please install Poetry from https://python-poetry.org/docs/#installation
    pause
    exit /b 1
)

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Install dependencies if not already installed
echo Checking and installing dependencies...
call npm run install:all

REM Start the application
echo.
echo Starting both backend and frontend servers...
echo Backend will run on: http://localhost:8000
echo Frontend will run on: http://localhost:5173
echo.
echo Press Ctrl+C to stop both servers
echo.

npm run dev:all