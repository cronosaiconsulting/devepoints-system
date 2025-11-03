# DevePoints - Gamification & Loyalty System

A complete loyalty and rewards platform with coin expiration, referral system, and store functionality.

## Features

✅ **User Management**
- Registration with email/password
- JWT authentication
- Referral code system

✅ **Devecoin System**
- Earn coins through referrals
- Admin manual coin awards
- Automatic coin expiration tracking
- Transaction history

✅ **Referral Program**
- Unique referral codes per user
- Automatic rewards for referrer and referred
- Referral statistics dashboard

✅ **Store**
- Browse products (discounts, services)
- Purchase with Devecoins
- Order history

✅ **Admin Panel**
- User management
- Manual coin awards
- System statistics
- User search

## Tech Stack

**Backend:**
- Node.js + TypeScript
- Express.js
- PostgreSQL
- JWT authentication
- Zod validation

**Frontend:**
- React + TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios

**Deployment:**
- Docker & Docker Compose
- Ready for Railway, Render, or any Docker host

## Quick Start - Local Development

### Prerequisites
- Node.js 20+
- PostgreSQL 16+ (or use Docker)
- npm or yarn

### 1. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
```

### 2. Setup Database

```bash
# Start PostgreSQL (if using Docker)
docker run -d \
  --name devepoints-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=devepoints \
  -p 5432:5432 \
  postgres:16-alpine

# Run migrations
npm run migrate

# Seed initial data
npm run seed
```

### 3. Start Backend

```bash
npm run dev
# Backend runs on http://localhost:3000
```

### 4. Setup Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Default API URL is already configured
```

### 5. Start Frontend

```bash
npm run dev
# Frontend runs on http://localhost:5173
```

### 6. Login

**Admin:**
- Email: `admin@develand.com`
- Password: `admin123`

**Test User:**
- Email: `test@example.com`
- Password: `test123`

## Docker Deployment

### Local Docker Compose

```bash
# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Build and start all services
docker-compose up -d

# Run migrations
docker-compose exec backend npm run migrate

# Seed data
docker-compose exec backend npm run seed

# Access the app
# Frontend: http://localhost
# Backend API: http://localhost:3000
```

## Railway Deployment

### Option 1: Separate Services (Recommended)

1. **Create PostgreSQL Database:**
   - Go to Railway dashboard
   - Add New → Database → PostgreSQL
   - Copy the `DATABASE_URL`

2. **Deploy Backend:**
   - New → GitHub Repo → Select backend folder
   - Add environment variables:
     ```
     DATABASE_URL=<your-railway-postgres-url>
     JWT_SECRET=<generate-random-secret>
     NODE_ENV=production
     ```
   - Deploy will auto-run migrations

3. **Deploy Frontend:**
   - New → GitHub Repo → Select frontend folder
   - Add environment variable:
     ```
     VITE_API_URL=<your-backend-url>/api
     ```

### Option 2: Docker Compose on Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create new project
railway init

# Link to PostgreSQL
railway add

# Deploy
railway up
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### User
- `GET /api/user/balance` - Get current balance
- `GET /api/user/history` - Get transaction history
- `GET /api/user/expiring?days=30` - Get expiring coins
- `GET /api/user/referrals` - Get referral stats

### Store
- `GET /api/store/products` - List all products
- `POST /api/store/purchase` - Purchase product
- `GET /api/store/orders` - Get order history

### Admin (requires admin role)
- `POST /api/admin/award` - Award coins to user
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/search?q=query` - Search users
- `GET /api/admin/stats` - Get system statistics
- `POST /api/admin/products` - Create product
- `PATCH /api/admin/products/:id` - Update product

## Environment Variables

### Backend (.env)

```bash
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/devepoints
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
DEFAULT_COIN_EXPIRY_DAYS=180
REFERRAL_REWARD_COINS=100
REFERRED_USER_BONUS_COINS=50
ADMIN_EMAIL=admin@develand.com
ADMIN_PASSWORD=admin123
```

### Frontend (.env)

```bash
VITE_API_URL=http://localhost:3000/api
```

## Database Schema

**Tables:**
- `users` - User accounts
- `transactions` - Coin earn/spend history
- `products` - Store items
- `orders` - Purchase history
- `referrals` - Referral tracking

## WordPress Integration

### Embed via iframe:

```html
<iframe
  src="https://your-devepoints.railway.app"
  width="100%"
  height="800px"
  frameborder="0">
</iframe>
```

### Elementor Widget:
1. Add HTML widget
2. Paste iframe code
3. Adjust height as needed

## n8n Integration

Create webhook endpoint to trigger coin awards:

```javascript
// n8n HTTP Request Node
POST https://your-backend.railway.app/api/admin/award
Headers: { "Authorization": "Bearer <admin-jwt-token>" }
Body: {
  "userId": 123,
  "amount": 50,
  "description": "Completed task X",
  "expiryDays": 180
}
```

## Customization

### Change Coin Name
Search and replace "Devecoin" / "Devecoins" in frontend files.

### Adjust Expiry Settings
Modify `DEFAULT_COIN_EXPIRY_DAYS` in backend `.env`

### Add More Product Types
Update type enum in:
- `backend/src/types/index.ts`
- `backend/src/scripts/migrate.ts`

## Troubleshooting

**Database connection failed:**
- Check PostgreSQL is running
- Verify DATABASE_URL format
- Check firewall/network settings

**CORS errors:**
- Ensure frontend VITE_API_URL matches backend URL
- Check CORS settings in `backend/src/index.ts`

**Login fails:**
- Check JWT_SECRET is set
- Verify user credentials
- Check browser console for errors

## License

MIT License - Free to use and modify

## Support

For issues or questions, create an issue in the repository.
