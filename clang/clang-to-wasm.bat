@echo off
setlocal enabledelayedexpansion

echo ===============================================
echo Clang to WebAssembly Compilation Script
echo ===============================================
echo.

REM Set working directory to script location
cd /d "%~dp0"

REM Create directories
if not exist "deps" mkdir deps
if not exist "build" mkdir build

REM Check for required tools
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Git is not installed or not in PATH.
    echo Please install Git from https://git-scm.com/download/win
    goto :error
)

where cmake >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: CMake is not installed or not in PATH.
    echo Please install CMake from https://cmake.org/download/
    goto :error
)

REM Step 1: Get Emscripten SDK
echo [1/5] Setting up Emscripten SDK...
cd deps
if not exist "emsdk" (
    git clone https://github.com/emscripten-core/emsdk.git
    if %ERRORLEVEL% NEQ 0 goto :error
)

cd emsdk
call emsdk install latest
if %ERRORLEVEL% NEQ 0 goto :error

call emsdk activate latest
if %ERRORLEVEL% NEQ 0 goto :error

REM Set up Emscripten environment variables - with full path to ensure it's found
call "%CD%\emsdk_env.bat"
if %ERRORLEVEL% NEQ 0 goto :error

REM Store Emscripten environment paths
set EM_PATH=%CD%
cd ../..

REM Step 2: Get LLVM/Clang source
echo.
echo [2/5] Downloading LLVM/Clang source...
cd deps
if not exist "llvm-project" (
    git clone https://github.com/llvm/llvm-project.git
    if %ERRORLEVEL% NEQ 0 goto :error
    echo LLVM/Clang source downloaded successfully.
) else (
    echo LLVM/Clang source already exists. Skipping download.
)
cd ..

REM Step 3: Configure LLVM/Clang build
echo.
echo [3/5] Configuring LLVM/Clang build...
if not exist "build\llvm" mkdir build\llvm
cd build\llvm

REM Use full path to emcmake
call "%EM_PATH%\upstream\emscripten\emcmake" cmake ..\..\deps\llvm-project\llvm ^
    -DLLVM_ENABLE_PROJECTS=clang ^
    -DCMAKE_BUILD_TYPE=MinSizeRel ^
    -DLLVM_TARGETS_TO_BUILD="WebAssembly" ^
    -DLLVM_DEFAULT_TARGET_TRIPLE=wasm32-unknown-emscripten ^
    -DLLVM_ENABLE_TERMINFO=OFF ^
    -DLLVM_ENABLE_THREADS=OFF ^
    -DLLVM_ENABLE_ZLIB=OFF ^
    -DLLVM_BUILD_EXAMPLES=OFF ^
    -DLLVM_INCLUDE_EXAMPLES=OFF ^
    -DLLVM_BUILD_TESTS=OFF ^
    -DLLVM_INCLUDE_TESTS=OFF

if %ERRORLEVEL% NEQ 0 goto :error
cd ..\..

REM Step 4: Build LLVM/Clang
echo.
echo [4/5] Building LLVM/Clang (this may take a long time)...
cd build\llvm

REM Use full path to emmake - and use mingw32-make instead of make for Windows
call "%EM_PATH%\upstream\emscripten\emmake" mingw32-make -j4 clang
if %ERRORLEVEL% NEQ 0 goto :error
cd ..\..

REM Step 5: Optimize and package for WebAssembly
echo.
echo [5/5] Optimizing and packaging Clang for WebAssembly...
cd build

REM First, create a JavaScript wrapper for Clang
call "%EM_PATH%\upstream\emscripten\emcc" -O3 -s WASM=1 ^
    -s ALLOW_MEMORY_GROWTH=1 ^
    -s INITIAL_MEMORY=256MB ^
    -s MAXIMUM_MEMORY=2GB ^
    -s EXPORTED_FUNCTIONS="['_main']" ^
    -s EXPORTED_RUNTIME_METHODS="['ccall', 'cwrap', 'FS']" ^
    -o clang.js ^
    llvm\bin\clang.js

if %ERRORLEVEL% NEQ 0 goto :error

echo.
echo ===============================================
echo Build completed successfully!
echo.
echo Output files are in the 'build' directory:
echo  - clang.js: JavaScript wrapper for Clang
echo  - clang.wasm: WebAssembly binary
echo ===============================================
echo.
echo To use these files in a web application:
echo  1. Copy clang.js and clang.wasm to your web project
echo  2. Include clang.js in your HTML:
echo     ^<script src="clang.js"^>^</script^>
echo  3. Use the Module API to interact with Clang
echo.
goto :end

:error
echo.
echo ERROR: An error occurred during the build process.
echo Please check the error messages above.
exit /b 1

:end
echo Build process completed.
exit /b 0
