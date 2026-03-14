@echo off
setlocal EnableExtensions EnableDelayedExpansion
color 0B

set "REMOTE_NAME=origin"
set "REMOTE_URL=https://github.com/jervistuazon/jervisandhazel.git"
set "TARGET_BRANCH=main"

echo ============================================
echo        Sync Local Repo to GitHub
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

echo [INFO] Staging local changes...
git add -A
if errorlevel 1 (
    echo [ERROR] Failed to stage local changes.
    goto :end
)

git diff --cached --quiet
if errorlevel 1 (
    for /f "usebackq delims=" %%i in (`powershell -NoProfile -Command "Get-Date -Format 'yyyy-MM-dd HH:mm:ss'"`) do set "COMMIT_TIME=%%i"
    set "COMMIT_MSG=Sync local updates: !COMMIT_TIME!"

    echo [INFO] Creating commit "!COMMIT_MSG!"...
    git commit -m "!COMMIT_MSG!"
    if errorlevel 1 (
        echo [ERROR] Failed to create the commit.
        goto :end
    )
) else (
    echo [INFO] No new file changes to commit.
)

echo [INFO] Pushing local "%TARGET_BRANCH%" to GitHub...
git push -u %REMOTE_NAME% %TARGET_BRANCH%
if errorlevel 1 (
    echo.
    echo [WARN] Standard push failed.
    echo [WARN] This usually means GitHub has commits that your local branch does not.
    echo [WARN] If your desktop copy is the latest version, you can overwrite GitHub safely with force-with-lease.
    choice /C YN /N /M "Overwrite GitHub with local %TARGET_BRANCH%? [Y/N]: "
    if errorlevel 2 goto :push_failed

    echo [INFO] Force pushing local "%TARGET_BRANCH%" with lease protection...
    git push --force-with-lease -u %REMOTE_NAME% %TARGET_BRANCH%
    if errorlevel 1 (
        echo [ERROR] Force push failed.
        echo Run "git status" and "git log --oneline --decorate --graph -10" to inspect the repository state.
        goto :end
    )
)

echo.
echo ============================================
echo      GitHub Now Matches Your Local Repo
echo ============================================
goto :end

:push_failed
echo [INFO] Push cancelled. GitHub was not changed.
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
