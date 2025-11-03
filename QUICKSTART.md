# 🚀 Quick Start Guide

## Fastest Way to Test Locally (5 minutes)

### Step 1: Clone & Setup Environment

```bash
cd devepoints-system

# Backend
cd backend
cp .env.example .env
cd ..

# Frontend
cd frontend
cp .env.example .env
cd ..
```

### Step 2: Start with Docker Compose

```bash
# Start all services (PostgreSQL + Backend + Frontend)
docker-compose up -d

# Wait 30 seconds for PostgreSQL to initialize...

# Run database migrations
docker-compose exec backend npm run migrate

# Seed initial data (admin user, test user, products)
docker-compose exec backend npm run seed
```

### Step 3: Access the Application

Open your browser to: **http://localhost**

**Login Credentials:**
- **Admin:** `admin@develand.com` / `admin123`
- **Test User:** `test@example.com` / `test123`

### Step 4: Test Features

1. **Login as admin** → Go to Admin Panel → Award coins to test user
2. **Logout** → Login as test user → Check dashboard
3. **Go to Referrals** → Copy referral link
4. **Register new user** with referral code → Both get bonus coins!
5. **Go to Store** → Purchase something
6. **Check Dashboard** → See expiring coins warning

---

## Deploy to Railway (10 minutes)

### Option 1: Using Railway PostgreSQL

1. **Create Railway Account:** https://railway.app

2. **Create New Project:**
   ```bash
   railway login
   railway init
   ```

3. **Add PostgreSQL:**
   - Railway Dashboard → Add Service → PostgreSQL
   - Copy the connection string

4. **Deploy Backend:**
   ```bash
   cd backend
   railway up
   ```
   - Add environment variables in Railway dashboard:
     - `DATABASE_URL` = (your Railway PostgreSQL URL)
     - `JWT_SECRET` = (generate random: `openssl rand -hex 32`)
     - `NODE_ENV` = `production`

5. **Run Migrations:**
   ```bash
   railway run npm run migrate
   railway run npm run seed
   ```

6. **Deploy Frontend:**
   ```bash
   cd ../frontend
   railway up
   ```
   - Add environment variable:
     - `VITE_API_URL` = `https://your-backend-url.railway.app/api`

7. **Done!** Access your app at the Railway frontend URL

### Option 2: Use Your Existing PostgreSQL

If you already have PostgreSQL on Railway:

1. Get your DATABASE_URL from Railway dashboard
2. Update `backend/.env` with that URL
3. Follow steps 4-7 above

---

## Development Mode (No Docker)

### Prerequisites
- Node.js 20+
- PostgreSQL running locally

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your local PostgreSQL URL
npm run migrate
npm run seed
npm run dev
```

Backend runs on: http://localhost:3000

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:5173

---

## Testing the Referral System

1. **Login as test@example.com**
2. Go to **Referrals** page
3. Copy your referral link (e.g., `http://localhost/register?ref=ABC123`)
4. **Logout**
5. **Open referral link** in browser
6. **Register new account**
7. Both users receive bonus coins automatically! 🎉

---

## Customization Quick Tips

### Change "Devecoin" to your brand name:
```bash
# In frontend directory
find ./src -type f -exec sed -i 's/Devecoin/YourCoin/g' {} +
find ./src -type f -exec sed -i 's/DevePoints/YourBrand/g' {} +
```

### Adjust rewards:
Edit `backend/.env`:
```
REFERRAL_REWARD_COINS=200          # Coins for referrer
REFERRED_USER_BONUS_COINS=100      # Coins for new user
DEFAULT_COIN_EXPIRY_DAYS=365       # Coins valid for 1 year
```

### Add more products:
Login as admin → (future: admin product management)
Or directly in database:
```sql
INSERT INTO products (name, description, price, type)
VALUES ('My Product', 'Description', 1000, 'service');
```

---

## Troubleshooting

**Port already in use:**
```bash
docker-compose down
# Change ports in docker-compose.yml
```

**Database migration failed:**
```bash
docker-compose exec backend npm run migrate
```

**Frontend can't connect to backend:**
- Check `frontend/.env` has correct `VITE_API_URL`
- Check backend is running: `curl http://localhost:3000/health`

**Need to reset everything:**
```bash
docker-compose down -v  # Removes volumes (deletes data)
docker-compose up -d
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed
```

---

## Next Steps

- [ ] Connect to your WordPress via iframe
- [ ] Setup n8n webhooks for automated coin awards
- [ ] Customize branding and colors
- [ ] Add custom products
- [ ] Configure email notifications (future feature)
- [ ] Setup backup for PostgreSQL database
- [ ] Configure SSL/HTTPS for production

---

**Need help?** Check the full [README.md](README.md) or create an issue!
