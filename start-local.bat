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

echo [1/3] Preparing backend Prisma files...
pushd "%ROOT%backend"
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

echo [2/3] Starting backend in a new window...
start "Spotify Backend" cmd /k "cd /d ""%ROOT%backend"" && npm run dev"

echo [3/3] Starting frontend in a new window...
start "Spotify Frontend" cmd /k "cd /d ""%ROOT%frontend"" && npm run dev"

echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Two new terminal windows were opened.
pause

