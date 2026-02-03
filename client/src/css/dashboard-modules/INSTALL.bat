@echo off
echo ========================================
echo ParlourPro Dashboard CSS Installation
echo ========================================
echo.

set "SOURCE_DIR=%~dp0dashboard-css-modules"
set "TARGET_DIR=C:\Users\shrav\OneDrive\Documents\web design\ParlourPro\client\src\css\dashboard-modules"
set "MAIN_CSS=C:\Users\shrav\OneDrive\Documents\web design\ParlourPro\client\src\css\Dashboard.css"

echo Step 1: Creating dashboard-modules folder...
if not exist "%TARGET_DIR%" (
    mkdir "%TARGET_DIR%"
    echo ✓ Created dashboard-modules folder
) else (
    echo ✓ dashboard-modules folder already exists
)
echo.

echo Step 2: Copying CSS module files...
if exist "%SOURCE_DIR%" (
    xcopy /Y /I "%SOURCE_DIR%\*.css" "%TARGET_DIR%\"
    echo ✓ Copied all 22 CSS modules
) else (
    echo ✗ Source folder not found: %SOURCE_DIR%
    echo   Please make sure all module files are in the dashboard-css-modules folder
    pause
    exit /b 1
)
echo.

echo Step 3: Backing up existing Dashboard.css...
if exist "%MAIN_CSS%" (
    copy "%MAIN_CSS%" "%MAIN_CSS%.backup"
    echo ✓ Created backup: Dashboard.css.backup
)
echo.

echo Step 4: Installing new Dashboard.css...
copy /Y "%~dp0Dashboard.css" "%MAIN_CSS%"
echo ✓ Installed new modular Dashboard.css
echo.

echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Restart your development server
echo 2. Clear browser cache (Ctrl+Shift+Delete)
echo 3. Refresh your application
echo.
echo Your old Dashboard.css has been backed up as Dashboard.css.backup
echo.
pause
