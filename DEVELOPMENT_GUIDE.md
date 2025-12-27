# Word Guess Game - Development Guide

## 📋 Current Implementation Status

### ✅ **Fully Implemented Features**

1. **Room Management**
   - ✅ Room creation with unique 6-character codes
   - ✅ Room joining via code
   - ✅ Player management (join/leave)
   - ✅ Host transfer when host leaves

2. **Team System**
   - ✅ Red and Blue teams
   - ✅ Players can join/leave teams
   - ✅ Minimum 2 players per team validation
   - ✅ Team score tracking

3. **Game Flow**
   - ✅ 12 rounds total (6 per team)
   - ✅ Alternating team turns
   - ✅ 80-second round duration
   - ✅ Automatic describer rotation within teams
   - ✅ Round transitions with countdown
   - ✅ Game start countdown

4. **Word System**
   - ✅ Database-backed word storage (Prisma + PostgreSQL)
   - ✅ Words with difficulty-based points (5-60 points)
   - ✅ 10 words per round (updated from 20)
   - ✅ Word distribution: 3 Easy, 4 Medium, 2 Hard, 1 Expert
   - ✅ Word reuse prevention per game
   - ✅ Case-insensitive word matching
   - ✅ Space-insensitive matching (handles "Czech Republic" vs "czechrepublic")

5. **Describer View**
   - ✅ Shows 10 words with points
   - ✅ Words highlight when guessed (blue background + checkmark)
   - ✅ Real-time word updates
   - ✅ Round score display
   - ✅ Timer countdown
   - ✅ Contributions tracking

6. **Guesser View**
   - ✅ Text input for guesses
   - ✅ Real-time guess submission
   - ✅ Guess history with correct/incorrect indicators
   - ✅ Round score display
   - ✅ Contributions leaderboard

7. **Spectator View**
   - ✅ View for opposing team members
   - ✅ Timer and round info
   - ✅ Score display

8. **Real-time Communication**
   - ✅ Socket.IO integration
   - ✅ Room state synchronization
   - ✅ Live timer updates
   - ✅ Guess result broadcasting
   - ✅ Word guessed events

9. **Game End**
   - ✅ Final scores
   - ✅ Winner determination
   - ✅ MVP calculation
   - ✅ Round history

10. **UI/UX**
    - ✅ Modern, responsive design
    - ✅ Team color theming
    - ✅ Smooth transitions
    - ✅ Mobile-friendly layout

---

## 🔧 Recent Changes Made

1. **Word Count Adjustment**
   - Changed `WORDS_PER_ROUND` from 20 to 10
   - Updated `WORD_DISTRIBUTION` to match:
     - Easy: 3 words
     - Medium: 4 words
     - Hard: 2 words
     - Expert: 1 word

---

## 🚀 Next Steps to Complete the Game

### **Priority 1: Database Setup**

1. **Set up PostgreSQL database**
   ```bash
   # Option A: Docker (Recommended for local dev)
   docker-compose up -d
   
   # Option B: Use Supabase/Neon (Free cloud PostgreSQL)
   # 1. Create account at https://supabase.com or https://neon.tech
   # 2. Create new project
   # 3. Copy connection string
   # 4. Add to apps/server/.env:
   #    DATABASE_URL="your-connection-string"
   ```

2. **Initialize database schema**
   ```bash
   cd apps/server
   npx prisma db push
   ```

3. **Seed the database with words**
   ```bash
   npm run db:seed
   ```
   This will populate the database with:
   - Default word pack (~150+ words)
   - Pop culture word pack (~50+ words)

### **Priority 2: Environment Configuration**

Create `apps/server/.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/wordguess"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

Create `apps/web/.env.local`:
```env
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
```

### **Priority 3: Testing the Game**

1. **Start the development servers**
   ```bash
   # From root directory
   npm run dev
   
   # Or separately:
   npm run dev:server  # Backend on :3001
   npm run dev:web      # Frontend on :3000
   ```

2. **Test the flow:**
   - Open http://localhost:3000
   - Create a room (host)
   - Open another browser/incognito window
   - Join the room with the code
   - Add players to teams
   - Start the game
   - Test guessing functionality
   - Verify word highlighting on describer screen

### **Priority 4: Potential Improvements**

1. **Word Matching Enhancements**
   - Currently: Case-insensitive, space-insensitive
   - Could add: Fuzzy matching for typos (optional)
   - Could add: Partial word matching (optional)

2. **UI Enhancements**
   - Add sound effects for correct guesses
   - Add animations for word highlighting
   - Improve mobile responsiveness
   - Add loading states

3. **Game Features**
   - Add word pack selection before game starts
   - Add custom word packs
   - Add game history/statistics
   - Add player avatars

4. **Error Handling**
   - Better error messages
   - Reconnection handling
   - Network error recovery

5. **Performance**
   - Optimize word loading
   - Add caching for word packs
   - Optimize socket event handling

---

## 🐛 Known Issues / Things to Verify

1. **Word Matching Edge Cases**
   - Test with words containing special characters
   - Test with multi-word phrases (e.g., "Czech Republic")
   - Verify normalization handles all cases

2. **Round Rotation**
   - Verify describer rotation works correctly
   - Test with teams of different sizes
   - Ensure rotation wraps correctly

3. **Timer Synchronization**
   - Verify timer stays in sync across all clients
   - Test with network delays
   - Handle client disconnections during rounds

4. **Database Connection**
   - Ensure Prisma client is properly initialized
   - Handle database connection errors gracefully
   - Add retry logic for database operations

---

## 📁 Project Structure

```
word-guess-game/
├── apps/
│   ├── server/              # Backend (Node.js + Express + Socket.IO)
│   │   ├── src/
│   │   │   ├── game/       # Game logic (RoomManager, WordManager)
│   │   │   ├── socket/     # Socket.IO event handlers
│   │   │   └── index.ts    # Express server setup
│   │   └── prisma/         # Database schema & seeds
│   │
│   └── web/                # Frontend (Next.js + React)
│       ├── app/            # Next.js pages (App Router)
│       ├── components/    # React components
│       └── lib/           # Socket client, state management
│
└── packages/
    └── shared/            # Shared types, events, constants
```

---

## 🔌 Socket Events Reference

### Client → Server
- `room:create` - Create new room
- `room:join` - Join existing room
- `room:leave` - Leave room
- `team:join` - Join a team
- `team:leave` - Leave current team
- `game:start` - Start the game (host only)
- `guess:submit` - Submit a word guess

### Server → Client
- `room:created` - Room created successfully
- `room:joined` - Successfully joined room
- `room:state` - Current room state
- `room:player-joined` - New player joined
- `room:player-left` - Player left
- `team:updated` - Team composition changed
- `game:starting` - Game starting countdown
- `round:starting` - Round transition screen
- `round:started` - Round has begun
- `words:assigned` - Words sent to describer
- `timer:tick` - Timer update (every second)
- `guess:result` - Result of a guess submission
- `word:guessed` - Word was correctly guessed
- `round:ended` - Round time expired
- `game:ended` - All rounds completed

---

## 🎮 Game Rules (Current Implementation)

1. **Setup**
   - Minimum 2 players per team
   - Host can start game when teams are ready

2. **Rounds**
   - 12 rounds total (6 per team)
   - Teams alternate turns
   - Each round lasts 80 seconds
   - Describer rotates automatically within team

3. **Scoring**
   - Points based on word difficulty (5-60 points)
   - Only correct guesses count
   - Points added to team score immediately

4. **Word Guessing**
   - Case-insensitive matching
   - Space-insensitive matching
   - Exact word match required
   - Already guessed words cannot be guessed again

5. **Winning**
   - Team with highest score after 12 rounds wins
   - MVP is player with most total points across all rounds

---

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Run both frontend and backend
npm run dev

# Run separately
npm run dev:server  # Backend only
npm run dev:web      # Frontend only

# Database commands
npm run db:push      # Push schema to database
npm run db:seed      # Seed database with words
npm run db:studio    # Open Prisma Studio (database GUI)

# Build for production
npm run build
```

---

## 📝 Notes

- The `game-engine.ts` file appears to be legacy code and is not currently used. The game logic is handled by `RoomManager` and `WordManager` classes.

- Word matching uses normalization: `word.toLowerCase().replace(/\s+/g, '').trim()` which handles:
  - Case differences: "ELEPHANT" = "elephant"
  - Spaces: "Czech Republic" = "czechrepublic"
  - Extra whitespace: "  elephant  " = "elephant"

- The describer view automatically highlights words when they're guessed (blue background + checkmark). This is handled by the `WordCard` component checking the `word.guessedBy` property.

---

## ✅ Checklist Before Deployment

- [ ] Database is set up and seeded
- [ ] Environment variables are configured
- [ ] Tested room creation and joining
- [ ] Tested team assignment
- [ ] Tested game flow (all 12 rounds)
- [ ] Tested word guessing and highlighting
- [ ] Tested timer synchronization
- [ ] Tested with multiple players
- [ ] Tested on mobile devices
- [ ] Error handling is robust
- [ ] Production environment variables set
- [ ] CORS configured for production frontend URL

---

## 🚢 Deployment

See the main `README.md` for deployment instructions to Railway/Render (backend) and Vercel (frontend).

---

**Last Updated:** After word count adjustment (20 → 10 words per round)

