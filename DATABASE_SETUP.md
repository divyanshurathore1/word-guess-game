# Database Setup Guide

Since Docker is not installed, here are alternative ways to set up the PostgreSQL database:

## Option 1: Use Free Cloud PostgreSQL (Recommended - Easiest)

### Using Supabase (Recommended)

1. **Create a free account**
   - Go to https://supabase.com
   - Sign up for free (no credit card required)

2. **Create a new project**
   - Click "New Project"
   - Choose a name (e.g., "word-guess-game")
   - Set a database password (save this!)
   - Choose a region close to you
   - Wait ~2 minutes for setup

3. **Get your connection string**
   - Go to Project Settings → Database
   - Find "Connection string" → "URI"
   - Copy the connection string (looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`)

4. **Create `.env` file**
   ```bash
   cd apps/server
   ```
   
   Create a file named `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
   PORT=3001
   FRONTEND_URL="http://localhost:3000"
   ```
   
   Replace `[YOUR-PASSWORD]` with your actual password.

### Using Neon (Alternative)

1. **Create a free account**
   - Go to https://neon.tech
   - Sign up for free

2. **Create a new project**
   - Click "Create Project"
   - Choose a name
   - Copy the connection string

3. **Create `.env` file** (same as Supabase above)

---

## Option 2: Install Docker Desktop

### macOS

1. **Download Docker Desktop**
   - Go to https://www.docker.com/products/docker-desktop/
   - Download for Mac (Apple Silicon or Intel)
   - Install the `.dmg` file

2. **Start Docker Desktop**
   - Open Docker Desktop from Applications
   - Wait for it to start (whale icon in menu bar)

3. **Run docker-compose**
   ```bash
   # From project root
   docker-compose up -d
   ```

   Or if using newer Docker:
   ```bash
   docker compose up -d
   ```

4. **Create `.env` file**
   ```bash
   cd apps/server
   ```
   
   Create `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wordguess"
   PORT=3001
   FRONTEND_URL="http://localhost:3000"
   ```

---

## Option 3: Install PostgreSQL Locally (Advanced)

### macOS (using Homebrew)

```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL
brew services start postgresql@15

# Create database
createdb wordguess

# Create .env file
cd apps/server
```

Create `.env`:
```env
DATABASE_URL="postgresql://postgres@localhost:5432/wordguess"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

---

## After Setting Up Database

Once you have your `DATABASE_URL` configured:

1. **Initialize the database schema**
   ```bash
   cd apps/server
   npx prisma db push
   ```

2. **Seed the database with words**
   ```bash
   npm run db:seed
   ```

3. **Verify it worked**
   ```bash
   npm run db:studio
   ```
   This opens a web interface where you can see your words.

---

## Quick Start (Recommended: Supabase)

1. Sign up at https://supabase.com (2 minutes)
2. Create project → Get connection string
3. Create `apps/server/.env` with the connection string
4. Run `npx prisma db push`
5. Run `npm run db:seed`
6. Done! ✅

---

## Troubleshooting

### "Connection refused" error
- Check your `DATABASE_URL` is correct
- For Supabase/Neon: Make sure you replaced `[YOUR-PASSWORD]` with actual password
- For local: Make sure PostgreSQL is running

### "Schema not found" error
- Run `npx prisma db push` first
- Then run `npm run db:seed`

### "Module not found" errors
- Make sure you're in the `apps/server` directory
- Run `npm install` from the root directory first

