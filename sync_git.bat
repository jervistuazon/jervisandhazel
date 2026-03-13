@echo off
setlocal EnableExtensions
color 0B

set "REMOTE_NAME=origin"
set "REMOTE_URL=https://github.com/jervistuazon/jervisandhazel.git"
set "TARGET_BRANCH=main"
set "STATUS_FILE=%TEMP%\sync_git_status.txt"
set "STASH_NAME=sync_git_auto_stash"

echo ============================================
echo      Starting GitHub Synchronization
echo ============================================
echo.

where git >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Git is not installed or not in PATH.
    goto :end
)

if not exist ".git" (
    echo [INFO] Initializing new Git repository...
    git init
    if errorlevel 1 (
        echo [ERROR] Failed to initialize the Git repository.
        goto :end
    )
)

git rev-parse --is-inside-work-tree >nul 2>nul
if errorlevel 1 (
    echo [ERROR] This folder is not a valid Git working tree.
    goto :end
)

call :check_in_progress
if errorlevel 1 goto :end

git remote get-url %REMOTE_NAME% >nul 2>nul
if errorlevel 1 (
    echo [INFO] Adding remote repository...
    git remote add %REMOTE_NAME% %REMOTE_URL%
    if errorlevel 1 (
        echo [ERROR] Failed to add the remote repository.
        goto :end
    )
) else (
    git remote set-url %REMOTE_NAME% %REMOTE_URL% >nul 2>nul
    if errorlevel 1 (
        echo [ERROR] Failed to update the remote URL.
        goto :end
    )
)

set "CURRENT_BRANCH="
for /f "delims=" %%i in ('git symbolic-ref --quiet --short HEAD 2^>nul') do set "CURRENT_BRANCH=%%i"

if not defined CURRENT_BRANCH (
    echo [ERROR] Git is in a detached HEAD state.
    echo Resolve that state before running this sync script.
    goto :end
)

if /I not "%CURRENT_BRANCH%"=="%TARGET_BRANCH%" (
    echo [ERROR] Current branch is "%CURRENT_BRANCH%".
    echo This script only syncs the "%TARGET_BRANCH%" branch.
    echo Switch to "%TARGET_BRANCH%" first, then run the script again.
    goto :end
)

echo [INFO] Fetching latest changes from %REMOTE_NAME%/%TARGET_BRANCH%...
git fetch %REMOTE_NAME% %TARGET_BRANCH%
if errorlevel 1 (
    echo [ERROR] Failed to fetch the latest changes from GitHub.
    goto :end
)

set "STASH_CREATED="
git status --porcelain > "%STATUS_FILE%"
for %%A in ("%STATUS_FILE%") do set "STATUS_SIZE=%%~zA"

if not "%STATUS_SIZE%"=="0" (
    echo [INFO] Saving local changes temporarily...
    git stash push --include-untracked -m "%STASH_NAME%"
    if errorlevel 1 (
        echo [ERROR] Failed to temporarily stash local changes.
        del "%STATUS_FILE%" >nul 2>nul
        goto :end
    )
    set "STASH_CREATED=1"
)

git ls-remote --exit-code --heads %REMOTE_NAME% %TARGET_BRANCH% >nul 2>nul
if not errorlevel 1 (
    echo [INFO] Rebasing local "%TARGET_BRANCH%" on top of %REMOTE_NAME%/%TARGET_BRANCH%...
    git rebase %REMOTE_NAME%/%TARGET_BRANCH%
    if errorlevel 1 (
        echo [ERROR] Rebase failed.
        if defined STASH_CREATED echo Your local changes are still saved in the stash list.
        del "%STATUS_FILE%" >nul 2>nul
        echo Resolve the rebase, then run the script again.
        goto :end
    )
)

if defined STASH_CREATED (
    echo [INFO] Restoring local changes...
    git stash pop
    if errorlevel 1 (
        echo [ERROR] Restoring the stashed changes caused conflicts.
        echo Resolve the conflicts, then run the script again.
        del "%STATUS_FILE%" >nul 2>nul
        goto :end
    )
)

git status --porcelain > "%STATUS_FILE%"
for %%A in ("%STATUS_FILE%") do set "STATUS_SIZE=%%~zA"

if "%STATUS_SIZE%"=="0" (
    echo [INFO] No local changes to commit.
) else (
    for /f "usebackq delims=" %%i in (`powershell -NoProfile -Command "Get-Date -Format 'yyyy-MM-dd HH:mm:ss'"`) do set "COMMIT_TIME=%%i"
    set "COMMIT_MSG=Auto-sync: %COMMIT_TIME%"

    echo [INFO] Staging local changes...
    git add -A
    if errorlevel 1 (
        echo [ERROR] Failed to stage local changes.
        del "%STATUS_FILE%" >nul 2>nul
        goto :end
    )

    git diff --cached --quiet
    if errorlevel 1 (
        echo [INFO] Creating commit "%COMMIT_MSG%"...
        git commit -m "%COMMIT_MSG%"
        if errorlevel 1 (
            echo [ERROR] Failed to create the commit.
            del "%STATUS_FILE%" >nul 2>nul
            goto :end
        )
    ) else (
        echo [INFO] Nothing new to commit after staging.
    )
)

del "%STATUS_FILE%" >nul 2>nul

echo [INFO] Pushing "%TARGET_BRANCH%" to GitHub...
git push -u %REMOTE_NAME% %TARGET_BRANCH%
if errorlevel 1 (
    echo [ERROR] Push failed.
    echo Run "git status" to inspect the current repository state.
    goto :end
)

echo.
echo ============================================
echo     Synchronization Completed Successfully
echo ============================================

goto :end

:check_in_progress
if exist ".git\rebase-merge" goto :repo_busy
if exist ".git\rebase-apply" goto :repo_busy
if exist ".git\MERGE_HEAD" goto :repo_busy
if exist ".git\CHERRY_PICK_HEAD" goto :repo_busy
if exist ".git\REVERT_HEAD" goto :repo_busy
if exist ".git\BISECT_LOG" goto :repo_busy
exit /b 0

:repo_busy
echo [ERROR] Git already has an unfinished operation in progress.
echo Finish or abort the current rebase, merge, cherry-pick, or revert first.
exit /b 1

:end
echo.
echo Press any key to exit...
pause >nul
endlocal
