# 🚀 Deployment Checklist

## Pre-Deployment

### Local Testing
- [ ] Run `docker-compose up -d`
- [ ] Run migrations: `docker-compose exec backend npm run migrate`
- [ ] Run seed: `docker-compose exec backend npm run seed`
- [ ] Test login (admin & test user)
- [ ] Test referral flow (register with code)
- [ ] Test purchase in store
- [ ] Test admin panel (award coins)
- [ ] Verify expiring coins warning shows
- [ ] Check all pages load without errors

### Code Review
- [ ] Backend .env has all required variables
- [ ] Frontend .env has correct API_URL
- [ ] JWT_SECRET is changed from default
- [ ] ADMIN_PASSWORD is changed from default
- [ ] No sensitive data in git repository
- [ ] .gitignore includes .env files
- [ ] Database URL is correct format

---

## Railway Deployment

### Step 1: Setup Railway Project
- [ ] Create Railway account
- [ ] Install Railway CLI: `npm i -g @railway/cli`
- [ ] Login: `railway login`
- [ ] Create project: `railway init`

### Step 2: PostgreSQL Database
- [ ] Add PostgreSQL service in Railway dashboard
- [ ] Copy DATABASE_URL from Railway
- [ ] Test connection from local machine

### Step 3: Backend Deployment
- [ ] Create new service for backend
- [ ] Connect to GitHub repo (or use CLI)
- [ ] Set build command: `npm install && npm run build`
- [ ] Set start command: `npm start`
- [ ] Add environment variables:
  ```
  DATABASE_URL=<from-railway-postgres>
  JWT_SECRET=<generate-new-secret>
  NODE_ENV=production
  PORT=3000
  DEFAULT_COIN_EXPIRY_DAYS=180
  REFERRAL_REWARD_COINS=100
  REFERRED_USER_BONUS_COINS=50
  ADMIN_EMAIL=admin@develand.com
  ADMIN_PASSWORD=<change-this>
  ```
- [ ] Deploy backend
- [ ] Check logs for errors
- [ ] Run migrations: `railway run npm run migrate`
- [ ] Seed database: `railway run npm run seed`
- [ ] Test health endpoint: `https://backend-url.railway.app/health`

### Step 4: Frontend Deployment
- [ ] Create new service for frontend
- [ ] Connect to GitHub repo
- [ ] Add environment variable:
  ```
  VITE_API_URL=https://your-backend.railway.app/api
  ```
- [ ] Deploy frontend
- [ ] Check logs for errors
- [ ] Open frontend URL
- [ ] Test login
- [ ] Verify all API calls work

### Step 5: Testing in Production
- [ ] Register new user (no referral)
- [ ] Register another user with referral code
- [ ] Login as admin
- [ ] Award coins to user
- [ ] Login as user
- [ ] Check balance updated
- [ ] Purchase from store
- [ ] Verify transaction history
- [ ] Check expiring coins warning

---

## WordPress Integration

### Option 1: Iframe
- [ ] Add HTML block in WordPress
- [ ] Insert iframe code:
  ```html
  <iframe
    src="https://your-frontend.railway.app"
    width="100%"
    height="800px"
    frameborder="0"
    style="min-height: 800px;">
  </iframe>
  ```
- [ ] Test on mobile/desktop
- [ ] Adjust height as needed

### Option 2: Elementor
- [ ] Open page in Elementor
- [ ] Drag HTML widget
- [ ] Paste iframe code
- [ ] Preview
- [ ] Publish

### SSO Integration (Optional Advanced)
- [ ] Share JWT between WordPress and DevePoints
- [ ] Create WordPress plugin to auto-login
- [ ] (This is complex - start with iframe first)

---

## n8n Integration

### Setup Webhook
- [ ] Get admin JWT token:
  ```bash
  curl -X POST https://backend.railway.app/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@develand.com","password":"your-password"}'
  ```
- [ ] Save token securely

### Create n8n Workflow
- [ ] Add Webhook trigger node
- [ ] Add HTTP Request node:
  - Method: POST
  - URL: `https://backend.railway.app/api/admin/award`
  - Headers: `Authorization: Bearer <token>`
  - Body: JSON with userId, amount, description
- [ ] Test with sample user
- [ ] Activate workflow

---

## Security Checklist

- [ ] Change default admin password
- [ ] Generate strong JWT_SECRET (32+ chars)
- [ ] Enable Railway's automatic HTTPS
- [ ] Set secure CORS origins (not `*`)
- [ ] Add rate limiting (already included)
- [ ] Regular database backups configured
- [ ] Monitor error logs
- [ ] Set up uptime monitoring (UptimeRobot, etc.)

---

## Performance Optimization

- [ ] Enable Railway caching
- [ ] Add database connection pooling (already configured)
- [ ] Monitor database query performance
- [ ] Consider CDN for frontend (Cloudflare)
- [ ] Add database indexes (already included)

---

## Backup Strategy

### Database Backups
- [ ] Railway auto-backups enabled
- [ ] Manual backup script:
  ```bash
  railway run pg_dump $DATABASE_URL > backup.sql
  ```
- [ ] Store backups in separate location (S3, Drive, etc.)
- [ ] Test restore procedure

### Code Backups
- [ ] Git repository on GitHub/GitLab
- [ ] Regular commits
- [ ] Tag releases (v1.0, v1.1, etc.)

---

## Monitoring Setup

### Health Checks
- [ ] Set up UptimeRobot for `/health` endpoint
- [ ] Configure alerts (email/Slack)
- [ ] Monitor backend response time

### Error Tracking (Optional)
- [ ] Add Sentry.io for error tracking
- [ ] Configure alerts for critical errors
- [ ] Monitor error trends

### Analytics (Optional)
- [ ] Add Google Analytics to frontend
- [ ] Track user registrations
- [ ] Monitor store purchases
- [ ] Track referral conversions

---

## User Documentation

- [ ] Create user guide (how to earn coins)
- [ ] Document store products
- [ ] Explain referral system
- [ ] Add FAQ page
- [ ] Create tutorial video (optional)

---

## Maintenance Plan

### Weekly
- [ ] Check error logs
- [ ] Review new user registrations
- [ ] Monitor database size
- [ ] Check expiring coins

### Monthly
- [ ] Update dependencies: `npm outdated`
- [ ] Review security patches
- [ ] Database cleanup (old expired transactions)
- [ ] Backup verification

### Quarterly
- [ ] Review and update products
- [ ] Analyze referral statistics
- [ ] Optimize database queries
- [ ] User feedback survey

---

## Scaling Checklist (When You Grow)

- [ ] Upgrade Railway plan (if needed)
- [ ] Add Redis for caching
- [ ] Implement database read replicas
- [ ] Add load balancer
- [ ] Enable CDN
- [ ] Optimize images/assets
- [ ] Consider microservices architecture

---

## Rollback Plan

If something goes wrong:

1. **Revert to previous deployment:**
   ```bash
   railway rollback
   ```

2. **Restore database backup:**
   ```bash
   railway run psql $DATABASE_URL < backup.sql
   ```

3. **Check logs:**
   ```bash
   railway logs
   ```

---

## Go-Live Checklist

### Final Verification
- [ ] All tests passed
- [ ] Admin can login
- [ ] Users can register
- [ ] Referral system works
- [ ] Store purchases work
- [ ] Coins expire correctly
- [ ] Mobile responsive
- [ ] Cross-browser tested (Chrome, Firefox, Safari)

### Communication
- [ ] Announce to users
- [ ] Send referral instructions
- [ ] Share store catalog
- [ ] Provide support contact

### Day 1 Monitoring
- [ ] Watch error logs
- [ ] Monitor user registrations
- [ ] Check database performance
- [ ] Be available for support

---

## Success Criteria

✅ Users can register and login
✅ Referral system awards coins automatically
✅ Admin can award coins manually
✅ Users can purchase from store
✅ Coin expiration warnings display
✅ No critical errors in logs
✅ Response time < 500ms
✅ 99%+ uptime

---

**Ready to deploy?** Follow this checklist step by step!

**Need help?** Check [README.md](README.md) or [QUICKSTART.md](QUICKSTART.md)
