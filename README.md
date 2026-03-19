# Spotify Clone

Экзаменационный проект с фронтендом на React + Vite и бэкендом на Node.js + Express + Prisma + SQLite.

## Стек технологий

- Frontend: `React 19`, `Vite`, `React Router`, `Axios`, `CSS Modules`
- Backend: `Node.js`, `Express`
- База данных: `SQLite`
- ORM: `Prisma`
- Аутентификация: `JWT access token + refresh token`
- Работа с файлами: `Multer`
- Хеширование паролей: `bcrypt`

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
npx prisma generate
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
- поиск по трекам и плейлистам из разных разделов
- страница `Главная`, `Все треки`, `Все плейлисты`, `Premium`, `Справка`
- создание и сохранение плейлистов
- добавление треков в очередь, в любимые и в существующие плейлисты
- быстрое создание нового плейлиста прямо из модального окна сохранения
- редактирование своих треков и плейлистов
- управление публичностью плейлистов и треков
- скачивание текущего трека из плеера
- демо-треки для быстрого показа проекта
- адаптация под телефон и планшет
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
npx prisma generate
npm run seed:demo
node src/server.js
```

## Демо-данные

Чтобы заполнить каталог тестовыми треками:

```powershell
cd C:\spotify-clone\backend
npm run seed:demo
```

Команда добавляет несколько публичных демо-треков `Тест 1`, `Тест 2` и так далее без дублей.

## Как это работает

- `frontend` показывает страницы приложения, управляет очередью плеера и отправляет запросы на API.
- `backend` хранит пользователей, треки, плейлисты и связи между ними.
- `Prisma + SQLite` отвечают за локальную базу данных.
- загрузка музыки и обложек проходит через `Multer`, а файлы раздаются из `/uploads`.
- кнопка сохранения в плейлист использует единый кастомный выборщик как в карточке трека, так и в плеере.
