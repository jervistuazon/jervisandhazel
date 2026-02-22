@echo off
setlocal
color 0B

:: ==============================================
:: GitHub Synchronization Script
:: ==============================================
:: This script safely stages, commits, and pushes 
:: changes to the designated remote repository.

echo ============================================
echo      Starting GitHub Synchronization
echo ============================================
echo.

:: 1. Check if git is installed
where git >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Git is not installed or not in PATH.
    echo Please install Git and try again.
    goto :end
)

:: 2. Check if the directory is a git repository
if not exist ".git" (
    echo [INFO] Initializing new Git repository...
    git init
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to initialize Git repository.
        goto :end
    )
    
    :: Set the remote URL
    echo [INFO] Adding remote repository...
    git remote add origin https://github.com/jervistuazon/jervisandhazel.git
)

:: Ensure the remote URL is correct (in case it was already a repo but with a different remote)
git remote set-url origin https://github.com/jervistuazon/jervisandhazel.git >nul 2>nul
if %ERRORLEVEL% neq 0 (
    :: If origin doesn't exist, this will fail silently and we add it
    git remote add origin https://github.com/jervistuazon/jervisandhazel.git
)

:: 3. Check for changes
git status --porcelain > nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to check git status.
    goto :end
)

:: Get the current date and time for the commit message (using PowerShell instead of WMIC)
for /f "usebackq tokens=*" %%i in (`powershell -NoProfile -Command "Get-Date -Format 'yyyy-MM-dd HH:mm:ss'"`) do set datetime=%%i
set "commit_msg=Auto-sync: %datetime%"

:: 4. Stage, Commit, and Push
echo [INFO] Staging all changes...
git add .

echo [INFO] Committing changes with message: "%commit_msg%"...
git commit -m "%commit_msg%"
if %ERRORLEVEL% neq 0 (
    echo [INFO] No new changes to commit.
)

echo [INFO] Pushing changes to remote repository (main branch)...
:: Ensure we are pushing to 'main'
git branch -M main
git push -u origin main

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Failed to push changes to the remote repository. 
    echo Please check your internet connection and GitHub permissions.
    goto :end
)

echo.
echo ============================================
echo     Synchronization Completed Successfully
echo ============================================

:end
echo.
echo Press any key to exit...
pause >nul
endlocal
