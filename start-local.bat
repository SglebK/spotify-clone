@echo off
setlocal

set "ROOT=%~dp0"

echo ============================================
echo   Spotify Clone - Local Start
echo ============================================
echo.

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm not found. Install Node.js first.
  pause
  exit /b 1
)

if not exist "%ROOT%backend\package.json" (
  echo [ERROR] backend\package.json not found.
  pause
  exit /b 1
)

if not exist "%ROOT%frontend\package.json" (
  echo [ERROR] frontend\package.json not found.
  pause
  exit /b 1
)

echo [1/4] Installing backend dependencies...
pushd "%ROOT%backend"
call npm install
if errorlevel 1 (
  echo [ERROR] backend npm install failed.
  popd
  pause
  exit /b 1
)

echo [2/4] Preparing backend Prisma files...
call npx prisma db push
if errorlevel 1 (
  echo [ERROR] prisma db push failed.
  popd
  pause
  exit /b 1
)

call npx prisma generate
if errorlevel 1 (
  echo [ERROR] prisma generate failed.
  popd
  pause
  exit /b 1
)
popd

echo [3/4] Installing frontend dependencies...
pushd "%ROOT%frontend"
call npm install
if errorlevel 1 (
  echo [ERROR] frontend npm install failed.
  popd
  pause
  exit /b 1
)
popd

echo [4/4] Starting backend and frontend in new windows...
start "Spotify Backend" cmd /k "cd /d ""%ROOT%backend"" && npm run dev"
start "Spotify Frontend" cmd /k "cd /d ""%ROOT%frontend"" && npm run dev"

echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Two new terminal windows were opened.
pause
