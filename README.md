# Spotify Clone

Экзаменационный проект с фронтендом на React + Vite и бэкендом на Node.js + Express + Prisma + SQLite.

## Структура

- `frontend` - клиентская часть
- `backend` - серверная часть

## Запуск проекта

Откройте два терминала.

### 1. Запуск backend

```powershell
cd C:\spotify-clone\backend
npm install
npx prisma db push
npm run dev
```

Backend по умолчанию запускается на `http://localhost:5000`.

### 2. Запуск frontend

```powershell
cd C:\spotify-clone\frontend
npm install
npm run dev
```

Frontend запускается через Vite, обычно на `http://localhost:5173`.

## Основные возможности

- регистрация и вход
- автологин по refresh token
- загрузка собственных треков
- просмотр общих треков
- создание и сохранение плейлистов
- добавление треков в плейлист
- управление публичностью плейлистов и треков
- встроенный аудиоплеер

## Полезные команды

### Frontend

```powershell
cd C:\spotify-clone\frontend
npm run build
npm run lint
```

### Backend

```powershell
cd C:\spotify-clone\backend
npx prisma db push
node src/server.js
```
