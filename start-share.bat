@echo off
setlocal

set "ROOT=%~dp0"

echo ============================================
echo   Spotify Clone - Share Demo Start
echo ============================================
echo.

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm not found. Install Node.js first.
  pause
  exit /b 1
)

where cloudflared >nul 2>nul
if errorlevel 1 (
  echo [ERROR] cloudflared not found.
  echo Install it first, for example:
  echo winget install Cloudflare.cloudflared
  pause
  exit /b 1
)

echo [1/6] Installing backend dependencies...
pushd "%ROOT%backend"
call npm install
if errorlevel 1 (
  echo [ERROR] backend npm install failed.
  popd
  pause
  exit /b 1
)

echo [2/6] Preparing backend Prisma files...
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

echo [3/6] Installing frontend dependencies...
pushd "%ROOT%frontend"
call npm install
if errorlevel 1 (
  echo [ERROR] frontend npm install failed.
  popd
  pause
  exit /b 1
)
popd

echo [4/6] Starting backend...
start "Spotify Backend" cmd /k "cd /d ""%ROOT%backend"" && npm run dev"

echo [5/6] Opening backend tunnel...
start "Spotify Backend Tunnel" cmd /k "cloudflared tunnel --url http://localhost:5000"

echo.
echo Wait until the "Spotify Backend Tunnel" window shows a URL like:
echo https://something-random.trycloudflare.com
echo.
set /p BACKEND_URL=Paste BACKEND tunnel URL here: 

if "%BACKEND_URL%"=="" (
  echo [ERROR] BACKEND URL is required.
  pause
  exit /b 1
)

echo [6/6] Starting frontend with external API URL...
start "Spotify Frontend" cmd /k "cd /d ""%ROOT%frontend"" && set ""VITE_API_URL=%BACKEND_URL%"" && npm run dev:share"
start "Spotify Frontend Tunnel" cmd /k "cloudflared tunnel --url http://localhost:5173"

echo.
echo Wait for the "Spotify Frontend Tunnel" window to show a URL.
echo Send that FRONTEND URL to other people.
echo.
echo Backend API URL: %BACKEND_URL%
pause
