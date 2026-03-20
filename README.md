# Spotify Clone

Экзаменационный музыкальный проект с фронтендом на React + Vite и бэкендом на Node.js + Express + Prisma + SQLite.

## Стек технологий

- Frontend: `React 19`, `Vite`, `React Router`, `CSS Modules`
- Backend: `Node.js`, `Express`
- База данных: `SQLite`
- ORM: `Prisma`
- Аутентификация: `JWT access token + refresh token`
- Работа с файлами: `Multer`
- Хеширование паролей: `bcrypt`
- Сборка и линт: `Vite build`, `ESLint`

## Структура

- `frontend` - клиентская часть
- `backend` - серверная часть
- `backend/prisma/dev.db` - готовая SQLite база, уже включена в репозиторий
- `backend/uploads` - локальные аудио и обложки, которые использует проект

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

## Временный показ другим людям

Для показа проекта на 1-2 дня удобнее всего запускать его у себя и открывать наружу через туннель.

Рекомендуемый сценарий:
1. запустить backend локально
2. открыть backend туннелем
3. запустить frontend с внешним `VITE_API_URL`
4. открыть frontend вторым туннелем
5. отправить людям ссылку только на frontend

### Команды для такого запуска

Backend:

```powershell
cd C:\spotify-clone\backend
npm run dev
```

Frontend:

```powershell
cd C:\spotify-clone\frontend
$env:VITE_API_URL="https://ВАШ-BACKEND-URL"
npm run dev:share
```

### Откуда брать `ВАШ-BACKEND-URL`

После запуска backend откройте его туннелем, например через `cloudflared`:

```powershell
cloudflared tunnel --url http://localhost:5000
```

В ответ `cloudflared` покажет ссылку вида:

```text
https://something-random.trycloudflare.com
```

Именно эта ссылка и будет вашим `ВАШ-BACKEND-URL`.

Пример:

```powershell
$env:VITE_API_URL="https://something-random.trycloudflare.com"
npm run dev:share
```

### Как получить ссылку на frontend

После запуска frontend откройте его вторым туннелем:

```powershell
cloudflared tunnel --url http://localhost:5173
```

`cloudflared` снова покажет ссылку вида:

```text
https://another-random.trycloudflare.com
```

Это и есть ссылка на сайт, которую нужно отправлять другим людям.

### Что отправлять другим людям

- отправляйте только ссылку на frontend
- backend-ссылку людям отправлять не нужно
- они просто открывают frontend URL в браузере
- ваш компьютер в этот момент должен быть включён, а backend, frontend и оба туннеля должны работать

Если нужно быстро переопределить API без перезапуска сборки, frontend также поддерживает параметр:

```text
https://ВАШ-FRONTEND-URL/?api=https://ВАШ-BACKEND-URL
```

Тогда API URL сохранится в `localStorage` браузера.

### Полный пример запуска

1. backend:

```powershell
cd C:\spotify-clone\backend
npm run dev
```

2. туннель для backend:

```powershell
cloudflared tunnel --url http://localhost:5000
```

3. frontend:

```powershell
cd C:\spotify-clone\frontend
$env:VITE_API_URL="https://ВАШ-BACKEND-URL"
npm run dev:share
```

4. туннель для frontend:

```powershell
cloudflared tunnel --url http://localhost:5173
```

5. отправьте людям frontend URL.

## Основные возможности

- регистрация и вход
- автоматическое восстановление сессии по refresh token
- загрузка своих треков с валидацией файла и обложки
- просмотр общего каталога треков
- поиск по трекам и плейлистам
- фильтрация и сортировка по названию, дате и типу треков
- страницы `Главная`, `Все треки`, `Все плейлисты`, `Мои треки`, `Мои плейлисты`, `Любимые`, `Premium`, `Справка`
- создание плейлистов и быстрое сохранение трека в плейлист
- отдельный плейлист `Любимые треки`
- встроенный плеер с очередью, предыдущим/следующим треком, repeat, speed и mute
- сохранение текущего трека и очереди между перезагрузками
- редактирование треков и плейлистов
- управление публичностью треков и плейлистов
- скачивание текущего трека
- адаптация под телефон и планшет
- админ может удалять публичные треки и плейлисты

## Полезные команды

### Frontend

```powershell
cd C:\spotify-clone\frontend
npm run build
npm run lint
npm run dev:share
```

### Backend

```powershell
cd C:\spotify-clone\backend
npx prisma db push
npx prisma generate
npm run seed:full
node src/server.js
```

## Демо-данные и база

- Готовая база `backend/prisma/dev.db` уже лежит в репозитории.
- В проекте уже есть заполненные тестовые пользователи, треки и плейлисты.
- Если нужно пересоздать данные:

```powershell
cd C:\spotify-clone\backend
npm run seed:full
```

Что создаёт `seed:full`:
- 1 админ-пользователя
- несколько demo-пользователей
- публичные и пользовательские треки
- demo-плейлисты
- связи треков с плейлистами

Тестовый админ:
- `admin@spotify.local`
- пароль: `demo12345`

## База данных

Используется `SQLite` через `Prisma`.

Основные сущности:
- `User` - пользователь, токены, таймзона, admin-роль
- `Track` - трек, исполнитель, ссылки на аудио и обложку, публичность
- `Playlist` - плейлист, описание, обложка, публичность, флаг избранного
- `PlaylistTrack` - связь между плейлистом и треком с порядком

База локальная, поэтому проект удобно запускать и показывать без отдельного PostgreSQL/MySQL сервера.

## Как работает проект

Frontend:
- React-приложение на Vite
- маршрутизация через `react-router-dom`
- UI разбит на layout: header, aside, navigator, footer
- текущий трек и очередь плеера хранятся на клиенте и восстанавливаются после перезагрузки
- приватные страницы закрыты через `PrivateRoute`

Backend:
- Express-сервер с REST API
- Prisma работает поверх SQLite
- JWT access token используется для обычных запросов
- refresh token обновляет сессию без повторного входа
- Multer принимает аудио и обложки
- `/uploads` раздаёт локальные файлы как статику

Работа с плейлистами и любимыми:
- heart в плеере открывает быстрое окно сохранения
- по умолчанию трек сохраняется в `Любимые треки`
- можно сразу выбрать другой плейлист или создать новый
- списки библиотек обновляются не только по таймеру, но и после событий изменения

## Что уже готово для сдачи

- рабочий frontend и backend
- локальная база с готовыми данными
- авторизация и refresh token
- загрузка, редактирование и удаление треков
- плейлисты и избранное
- плеер с очередью
- поиск, фильтрация и сортировка
- адаптивность
- админ-функции удаления
