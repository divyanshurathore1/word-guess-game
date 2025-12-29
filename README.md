# WordGuess - Multiplayer Word Game

A real-time multiplayer word guessing game similar to Scipher Taboo.

## 🎮 Game Rules
- Two teams (Red & Blue) compete over 12 rounds (6 per team)
- Each round lasts 80 seconds
- One player describes, teammates guess
- Words have different point values based on difficulty
- Team with the highest score wins!

## 🛠️ Tech Stack
- **Frontend**: Next.js 14, React, Tailwind CSS, Zustand
- **Backend**: Node.js, Express, Socket.IO
- **Database**: PostgreSQL (Prisma ORM)

---

## 📦 Quick Start (Local Development)

### 1. Install Dependencies

```bash
cd word-guess-game
npm install
```

### 2. Set Up Database

**Option A: Use Docker (Recommended)**
```bash
docker-compose up -d
```

**Option B: Use Supabase/Neon**
1. Create free account at https://supabase.com or https://neon.tech
2. Create new project
3. Copy the connection string
4. Update `apps/server/.env` with your DATABASE_URL

### 3. Initialize Database

```bash
cd apps/server
npx prisma db push
npm run db:seed
```

### 4. Run Development Servers

```bash
# From root directory - run both frontend & backend
npm run dev

# Or separately in different terminals:
npm run dev:server   # Backend on :3001
npm run dev:web      # Frontend on :3000
```

### 5. Open http://localhost:3000

---

## 🚀 Deployment

### Backend (Railway/Render)

1. Push code to GitHub
2. Go to https://railway.app or https://render.com
3. New Project → Deploy from GitHub
4. Select your repo, choose `apps/server` directory
5. Add environment variables:
   - `DATABASE_URL` 
   - `FRONTEND_URL` (your Vercel URL)
6. Deploy!

### Frontend (Vercel)

1. Import project to Vercel
2. Framework Preset: Next.js
3. Root Directory: `apps/web`
4. Environment Variables:
   - `NEXT_PUBLIC_SOCKET_URL` = Your backend URL
5. Deploy!

---

## 📁 Project Structure

```
word-guess-game/
├── apps/
│   ├── web/                 # Next.js frontend
│   │   ├── app/             # Pages (App Router)
│   │   ├── components/      # React components
│   │   └── lib/             # Socket client, store
│   │
│   └── server/              # Node.js backend
│       ├── src/
│       │   ├── socket/      # Socket.IO handlers
│       │   └── game/        # Game logic
│       └── prisma/          # Database schema & seeds
│
└── packages/
    └── shared/              # Shared types & events
```

---

## 🎯 Features

- [x] Room creation with shareable code
- [x] Team selection (Red/Blue)
- [x] Real-time game sync via WebSocket
- [x] Describer view with word grid
- [x] Guesser view with input
- [x] Spectator view for opposing team
- [x] Live timer with visual countdown
- [x] Contributions tracking
- [x] Round transitions
- [x] Final leaderboard & MVP
- [x] 300+ words with difficulty-based points

---

## 📝 License

MIT
