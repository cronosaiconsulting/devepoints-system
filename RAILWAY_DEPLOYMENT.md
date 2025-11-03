# Railway Deployment Guide

This guide will help you deploy the DevePoints system to Railway.

## Prerequisites

1. A [Railway account](https://railway.app/)
2. Your code in a Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### Step 1: Create a New Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Select your devepoints-system repository

### Step 2: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will automatically create a database and set the `DATABASE_URL` variable

### Step 3: Deploy Backend Service

1. Click **"+ New"** → **"GitHub Repo"**
2. Select your repository again
3. Click on the service settings (gear icon)
4. Set the following:
   - **Name**: `backend`
   - **Root Directory**: `backend`
   - **Build Command**: (auto-detected from nixpacks.toml)
   - **Start Command**: `npm start`

5. Add Environment Variables:
   ```
   NODE_ENV=production
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   DEFAULT_COIN_EXPIRY_DAYS=180
   REFERRAL_REWARD_COINS=100
   REFERRED_USER_BONUS_COINS=50
   ADMIN_EMAIL=admin@develand.com
   ADMIN_PASSWORD=admin123
   PORT=3000
   ```

6. Click **"Deploy"**

### Step 4: Deploy Frontend Service

1. Click **"+ New"** → **"GitHub Repo"**
2. Select your repository again
3. Click on the service settings (gear icon)
4. Set the following:
   - **Name**: `frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: (auto-detected from nixpacks.toml)
   - **Start Command**: `npx serve -s dist -l $PORT`

5. Add Environment Variables:
   ```
   VITE_API_URL=${{backend.RAILWAY_PUBLIC_DOMAIN}}
   ```
   Note: Replace with the actual backend URL after backend is deployed

6. Click **"Deploy"**

### Step 5: Configure Public Domains

1. For **backend** service:
   - Go to service Settings → Networking
   - Click **"Generate Domain"**
   - Copy the public URL (e.g., `https://backend-production-xxxx.up.railway.app`)

2. For **frontend** service:
   - Go to service Settings → Networking
   - Click **"Generate Domain"**
   - Copy the public URL (e.g., `https://frontend-production-xxxx.up.railway.app`)

3. Update frontend environment variable:
   - Go to frontend service → Variables
   - Update `VITE_API_URL` with the backend public URL
   - Redeploy frontend

### Step 6: Initialize Database

After the backend is deployed and running:

1. Go to backend service
2. Click on **"Deployments"** tab
3. Find the latest deployment
4. Click **"View Logs"**
5. The migration should run automatically during build

If migrations didn't run, you can connect via Railway's terminal:
```bash
npm run migrate
npm run seed
```

### Step 7: Verify Deployment

1. Visit your frontend URL
2. Try logging in with:
   - Admin: `admin@develand.com` / `admin123`
   - Test User: `test@example.com` / `test123`

## Alternative: Using Railway CLI

If you have Railway CLI installed locally, you can deploy from command line:

```bash
# Login to Railway
railway login

# Link to your project (or create new one)
railway link

# Add PostgreSQL
railway add

# Deploy backend
cd backend
railway up

# Deploy frontend
cd ../frontend
railway up
```

## Environment Variables Summary

### Backend Environment Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Auto-set by Railway |
| `JWT_SECRET` | Secret key for JWT tokens | `your-secret-key` |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `DEFAULT_COIN_EXPIRY_DAYS` | Coin expiration period | `180` |
| `REFERRAL_REWARD_COINS` | Coins for referrer | `100` |
| `REFERRED_USER_BONUS_COINS` | Coins for referred user | `50` |
| `ADMIN_EMAIL` | Admin email | `admin@develand.com` |
| `ADMIN_PASSWORD` | Admin password | `admin123` |
| `PORT` | Server port | `3000` |

### Frontend Environment Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://backend-xxx.railway.app` |

## Troubleshooting

### Backend won't start
- Check that `DATABASE_URL` is properly set
- Verify migrations ran successfully in build logs
- Check environment variables are set correctly

### Frontend can't connect to backend
- Verify `VITE_API_URL` points to correct backend URL
- Ensure backend has CORS configured for frontend domain
- Check backend service is running and accessible

### Database connection errors
- Verify PostgreSQL service is running
- Check `DATABASE_URL` format is correct
- Ensure backend can reach database (should work automatically in Railway)

## Monitoring

Railway provides:
- Real-time logs for each service
- Metrics (CPU, Memory, Network)
- Deployment history
- Automatic HTTPS certificates

Access these from your Railway dashboard for each service.

## Costs

Railway offers:
- Free tier with $5 monthly credit
- Pay-as-you-go pricing after free tier
- Estimated costs for this project: ~$10-20/month depending on usage

## Next Steps

1. Set up custom domain (optional)
2. Configure environment-specific variables
3. Set up monitoring alerts
4. Enable automatic deployments from GitHub
5. Configure staging environment
