@echo off
setlocal enabledelayedexpansion

echo ===============================================
echo Checking System Requirements for Clang-to-WASM Build
echo ===============================================
echo.

REM Check for Git
echo Checking for Git...
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [X] Git is not installed or not in PATH
    echo     Download from: https://git-scm.com/download/win
) else (
    echo [✓] Git is installed
)

REM Check for CMake
echo Checking for CMake...
where cmake >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [X] CMake is not installed or not in PATH
    echo     Download from: https://cmake.org/download/
) else (
    echo [✓] CMake is installed
)

REM Check for MinGW/Make
echo Checking for MinGW/Make...
where mingw32-make >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [X] mingw32-make is not installed or not in PATH
    echo     Download MinGW from: https://www.mingw-w64.org/
) else (
    echo [✓] mingw32-make is installed
)

REM Check for Python (needed by Emscripten)
echo Checking for Python...
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [X] Python is not installed or not in PATH
    echo     Download from: https://www.python.org/downloads/
) else (
    echo [✓] Python is installed
)

REM Check available disk space
echo Checking available disk space...
for /f "tokens=3" %%a in ('dir %~dp0\ ^| findstr /C:"bytes free"') do set FREE_SPACE=%%a
set FREE_SPACE=%FREE_SPACE:,=%
if %FREE_SPACE% LSS 10000000000 (
    echo [X] Less than 10GB free disk space: %FREE_SPACE% bytes
    echo     At least 10GB recommended
) else (
    echo [✓] Sufficient disk space: %FREE_SPACE% bytes
)

REM Check RAM (approximation)
echo Checking available RAM...
for /f "tokens=4" %%a in ('systeminfo ^| find "Total Physical Memory"') do set RAM=%%a
set RAM=%RAM:,=%
if %RAM% LSS 8000 (
    echo [X] Less than 8GB RAM: %RAM% MB
    echo     At least 8GB recommended, 16GB preferred
) else (
    echo [✓] Sufficient RAM: %RAM% MB
)

echo.
echo ===============================================
echo If any component shows [X], please install it
echo before running the main compilation script.
echo ===============================================
echo.

pause
