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
- `backend/.env` - demo-конфиг backend уже включен в репозиторий для быстрого запуска из GitHub zip
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

Важный момент:
- `backend/.env` уже лежит в репозитории специально для демонстрации и запуска на другом компьютере
- поэтому после скачивания zip не нужно отдельно создавать `.env` руками
- это demo-конфиг для локального запуска, а не production-секреты
- bat-файлы сначала устанавливают локальные зависимости проекта, чтобы не подтягивалась чужая Prisma 7 через `npx`

### 2. Запуск frontend

```powershell
cd C:\spotify-clone\frontend
npm install
npm run dev
```

Frontend запускается через Vite, обычно на `http://localhost:5173`.

### Быстрый запуск через `.bat`

Для удобства в корне проекта есть два файла:

- `start-local.bat` - поднимает backend и frontend локально
- `start-share.bat` - поднимает backend, frontend и помогает открыть проект наружу через `cloudflared`

#### Локальная проверка

Просто запустите:

```text
start-local.bat
```

Что делает файл:
- выполняет `npm install` в `backend`
- выполняет `npx prisma db push`
- выполняет `npx prisma generate`
- выполняет `npm install` в `frontend`
- открывает отдельное окно backend
- открывает отдельное окно frontend

#### Показ другим людям

Просто запустите:

```text
start-share.bat
```

Что делает файл:
- выполняет `npm install` в `backend`
- выполняет `npx prisma db push`
- выполняет `npx prisma generate`
- выполняет `npm install` в `frontend`
- запускает backend
- открывает туннель для backend
- просит вставить backend URL
- запускает frontend с этим `VITE_API_URL`
- открывает туннель для frontend

Важно:
- для `start-share.bat` должен быть установлен `cloudflared`
- если его нет, установите:

```powershell
winget install Cloudflare.cloudflared
```

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

Если вы запускаете проект через `start-share.bat`, этот URL нужно просто скопировать из окна `Spotify Backend Tunnel` и вставить в запрос bat-файла.

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

Если вы запускаете проект через `start-share.bat`, фронтенд-туннель тоже откроется автоматически в отдельном окне. Нужно дождаться ссылки в окне `Spotify Frontend Tunnel`.

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
- heart-кнопка в плеере открывает быстрое окно сохранения, как в Spotify-подобном сценарии
- сохранение текущего трека и очереди между перезагрузками
- редактирование треков и плейлистов
- управление публичностью треков и плейлистов
- скачивание текущего трека
- локальная страница `Обрезка аудио`, где файл не перехватывает основной плеер до ручного запуска фрагмента
- адаптация под телефон и планшет
- видимые admin-функции: бейдж в шапке, удаление треков и плейлистов через интерфейс

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
- Готовый backend-конфиг `backend/.env` тоже лежит в репозитории.
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
- если закрыть окно сохранения, трек всё равно уйдёт в `Любимые треки`
- списки библиотек обновляются не только по таймеру, но и после событий изменения

Адаптация и показ:
- проект адаптирован под desktop, tablet и phone-сценарий
- для показа есть `start-local.bat` и `start-share.bat`
- форма загрузки и мобильный layout поджаты под узкие экраны
- тёмная тема и системные полосы прокрутки визуально приглушены, чтобы интерфейс выглядел чище на демо

Админ:
- тестовый админ видит бейдж `Админ` в шапке
- в `Все треки` админ может удалять треки через модальное окно
- в `Все плейлисты` админ может удалять плейлисты через экран деталей

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
