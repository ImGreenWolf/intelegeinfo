@echo off
echo Starting TypeScript compiler...
cd
call npx tsc

if %errorlevel% neq 0 (
    echo TypeScript compilation failed.
    pause
    exit /b %errorlevel%
)
echo TypeScript compilation completed successfully.
echo Starting Node.js server...
call pm2 reload all
if %errorlevel% neq 0 (
    echo Node.js server failed to start.
    pause
    exit /b %errorlevel%
)

exit /b 0
exit