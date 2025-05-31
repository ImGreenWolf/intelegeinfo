@echo off
echo Starting TypeScript compiler...
cd
start cmd.exe /c npx tsc -b --watch

if %errorlevel% neq 0 (
    echo TypeScript compilation failed.
    pause
    exit /b %errorlevel%
)
start cmd.exe /c sass server/client/css:public/css -w
echo TypeScript compilation completed successfully.
echo Starting Node.js server...
call npx nodemon --ignore cache --inspect
if %errorlevel% neq 0 (
    echo Node.js server failed to start.
    pause
    exit /b %errorlevel%
)

call sass -w server/client/css:public/css