# 🎵 Spotify Clone — Full-Stack E-Commerce & Streaming Web App

[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

A comprehensive, full-stack music streaming web application built with **React 19** and **Node.js/Express**. This application features secure JWT dual-token authentication, full CRUD media management, custom audio playback controls, persistent player state, responsive design, and administrative controls.

---

## 🛠️ Tech Stack & Architecture

### **Frontend**
* **Framework:** React 19 + Vite (for instant HMR and optimized builds)
* **Routing:** React Router v6+
* **Styling:** CSS Modules (scoped styles, responsive layout, custom dark theme)
* **Code Quality:** ESLint

### **Backend**
* **Runtime:** Node.js + Express.js
* **Database & ORM:** SQLite via Prisma ORM
* **Authentication:** Dual-token strategy (`JWT Access Token` + `Refresh Token` session recovery)
* **Media Handling:** Multer for local audio and cover image file uploads
* **Security:** `bcrypt` for password hashing

---

## ✨ Feature Breakdown

| Domain | Description |
| :--- | :--- |
| **Authentication & Auth State** | User registration, login, auto-session renewal using refresh tokens, and role-based route guards. |
| **Media Player** | Full-featured player with queue management, track history (previous/next), loop modes, playback speed, mute, and state persistence via `localStorage`. |
| **Library & Playlists** | Create/edit custom playlists, manage public/private visibility, add/remove tracks, and dedicated "Liked Songs" library. |
| **Catalog & Discovery** | Instant multi-parameter search, filtering, and sorting (by title, date, genre, and visibility). |
| **Audio Processing** | Integrated client-side audio trimmer tool that isolates audio playback during editing. |
| **Admin Panel** | Visible administrative privileges (Admin badge, global deletion overrides for tracks and playlists). |
| **Responsiveness** | Mobile-first layout adaptations for smartphones, tablets, and desktop displays. |

---

## 📂 Project Structure


```

spotify-clone/
├── frontend/                  # React client application
│   ├── src/
│   │   ├── components/        # Player, Navigation, Header, Footers
│   │   ├── pages/             # Route-level views (Home, Library, Trim, Admin)
│   │   └── styles/            # CSS Modules & global theme variables
│   └── package.json
│
├── backend/                   # Node.js Express server
│   ├── prisma/                # Prisma schema & SQLite database (dev.db)
│   ├── src/                   # REST API controllers, middleware, routes
│   ├── uploads/               # Static storage for audio files & cover art
│   ├── .env                   # Local development demo setup
│   └── package.json
│
├── start-local.bat            # Automated local dev setup script
└── start-share.bat            # Tunnel deployment script (Cloudflare)

```

---

## ⚡ Quick Start

### Prerequisites
* **Node.js** (v18.0 or higher)
* **npm** (v9.0 or higher)

### Option 1: One-Click Startup (Windows)
Double-click `start-local.bat` in the root directory. This script automatically handles dependency installations, runs Prisma database migrations, and boots both frontend and backend servers in isolated terminal windows.

---

### Option 2: Manual Terminal Setup

#### 1. Start the Backend Server

```bash
cd backend
npm install
npx prisma db push
npx prisma generate
npm run dev

```

> The REST API server will run at `http://localhost:5000`.

#### 2. Start the Frontend Application

Open a second terminal window:

```bash
cd frontend
npm install
npm run dev

```

> The React client will run at `http://localhost:5173`.

---

## 🔐 Demo Credentials & Seed Data

The project comes pre-seeded with sample users, playlists, tracks, and audio files ready for evaluation.

* **Admin User:** `admin@spotify.local`
* **Password:** `demo12345`

To reset or re-seed the SQLite database with clean mock data at any time, run:

```bash
cd backend
npm run seed:full

```

---

## 🌐 Remote Sharing & Tunneling (Cloudflare)

To expose your local instance to external users or mobile testing devices without deploying to a cloud host, use the included tunneling automation.

### Using `start-share.bat`

1. Ensure **Cloudflare Tunnel** (`cloudflared`) is installed:
```powershell
winget install Cloudflare.cloudflared

```


2. Run `start-share.bat`.
3. Copy the generated Backend Cloudflare URL into the prompt.
4. Share the generated Frontend Cloudflare URL with remote evaluators.

### Manual Tunneling Configuration

1. **Launch Local Servers:**
```powershell
# Terminal 1: Backend Tunnel
cloudflared tunnel --url http://localhost:5000

```


*Note down the generated tunnel URL (e.g., `https://random-backend.trycloudflare.com`).*
2. **Launch Frontend with Dynamic API URL:**
```powershell
# Terminal 2: Frontend Server
cd frontend
$env:VITE_API_URL="[https://random-backend.trycloudflare.com](https://random-backend.trycloudflare.com)"
npm run dev:share

```


3. **Expose Frontend:**
```powershell
# Terminal 3: Frontend Tunnel
cloudflared tunnel --url http://localhost:5173

```


*Share the generated frontend URL with end-users.*

---

## 🗄️ Database Schema Overview

The SQLite database managed by **Prisma ORM** comprises four primary models:

* **`User`**: Manages auth identities, hashed credentials, timezone preferences, and roles (`ADMIN` / `USER`).
* **`Track`**: Stores metadata, audio file paths, cover image paths, and visibility state (`PUBLIC` / `PRIVATE`).
* **`Playlist`**: Holds playlist metadata, cover images, visibility flags, and "Favorites" status.
* **`PlaylistTrack`**: Join table configuring dynamic track ordering within playlists.

---

## 📄 License

This project is open-source and available under the [MIT License](https://www.google.com/search?q=LICENSE).
