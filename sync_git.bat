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

echo [INFO] Fetching latest changes from remote...
git fetch origin main
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Failed to fetch the latest changes from GitHub.
    echo Check your internet connection and repository permissions.
    goto :end
)

echo [INFO] Switching to main branch...
git branch -M main

git ls-remote --exit-code --heads origin main >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [INFO] Rebasing local changes on top of origin/main...
    git pull --rebase origin main
    if %ERRORLEVEL% neq 0 (
        echo.
        echo [ERROR] Rebase failed. Resolve any conflicts, then run:
        echo         git rebase --continue
        echo or cancel it with:
        echo         git rebase --abort
        goto :end
    )
)

echo [INFO] Pushing changes to remote repository (main branch)...
git push -u origin main

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Failed to push changes to the remote repository.
    echo The remote may have moved again after fetch, or your push was rejected.
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
