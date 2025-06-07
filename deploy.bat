@echo off

echo 🚀 Starting ClassPDF deployment to Surge.sh...

REM Check if surge is installed
where surge >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Surge is not installed. Installing now...
    npm install -g surge
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Failed to install Surge. Please run: npm install -g surge
        pause
        exit /b 1
    )
)

REM Check if we're in the right directory
if not exist "index.html" (
    echo ❌ Error: index.html not found. Please run this script from the ClassPDF directory.
    pause
    exit /b 1
)

echo ✅ Surge is installed and ready
echo 📁 Current directory: %CD%
echo.

REM Deploy with surge
echo 🌍 Deploying to Surge.sh...
surge

echo.
echo 🎉 Deployment complete!
echo.
echo 📋 Next steps:
echo    • Test your site in a browser
echo    • Try creating teacher and student accounts
echo    • Upload a PDF as a teacher
echo    • View assignments as a student
echo.
echo 🔧 To update your site:
echo    • Make changes to your files
echo    • Run 'surge' again from this directory
echo.
echo 🗑️  To remove your site:
echo    • Run 'surge teardown [your-domain].surge.sh'
echo.
pause 