# Production Deployment Guide

This guide covers deploying the NotesApp to production using:

- **Frontend**: Vercel (Free forever)
- **Backend (Spring Boot)**: Render (Free with sleep)
- **Database**: Neon PostgreSQL (Free forever, 0.5GB)
- **Collaboration Server**: Render (Free with sleep)

**Total Cost: $0/month** 🎉

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup (Neon PostgreSQL - Free Forever)](#database-setup-neon-postgresql---free-forever)
3. [Database Alternatives](#database-alternatives)
4. [Backend Deployment (Spring Boot on Render)](#backend-deployment-spring-boot-on-render)
5. [Collaboration Server Deployment (Hocuspocus on Render)](#collaboration-server-deployment-hocuspocus-on-render)
6. [Frontend Deployment (React on Vercel)](#frontend-deployment-react-on-vercel)
7. [Post-Deployment Configuration](#post-deployment-configuration)
8. [Environment Variables Reference](#environment-variables-reference)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- [ ] GitHub repository with your code
- [ ] Vercel account (https://vercel.com)
- [ ] Render account (https://render.com)
- [ ] Neon account (https://neon.tech)
- [ ] Google OAuth2 credentials (for OAuth login)
- [ ] Domain name (optional, for custom domains)

---

## Database Setup (Neon PostgreSQL - Free Forever)

Neon provides **free forever** serverless PostgreSQL with 0.5GB storage - perfect for small to medium apps!

### Step 1: Create Neon Account

1. Go to [Neon.tech](https://neon.tech)
2. Click **Sign Up** or **Get Started**
3. Sign up with GitHub, Google, or email
4. Verify your email if required

### Step 2: Create Database Project

1. After login, click **Create a project** or **New Project**
2. Configure the project:

   - **Project name**: `NotesApp` or `notesapp-production`
   - **Region**: Choose closest to your Render backend region (e.g., US East for `us-east-1`)
   - **PostgreSQL version**: 16 (latest stable)
   - **Compute size**: Keep default (free tier)

3. Click **Create Project**

### Step 3: Get Database Connection String

After creation, you'll see a connection details screen:

1. **Connection string format**: Select **JDBC** from the dropdown
2. Copy the connection string - it will look like:

```
jdbc:postgresql://ep-xxxxxxxx.us-east-2.aws.neon.tech/neondb?user=youruser&password=yourpassword&sslmode=require
```

**Important Notes**:

- ✅ This connection string is **external** (works from anywhere)
- ✅ Neon automatically includes SSL (`sslmode=require`)
- ✅ Free tier: **0.5GB storage**, 1 compute unit, autoscaling
- ✅ Database scales to zero when inactive (saves resources)
- 🔒 **Save this connection string securely** - you'll need it for Render

### Step 4: Create Database Tables (Optional)

Neon creates a default database called `neondb`. You have two options:

**Option A: Use default database** (Recommended)

- Keep the connection string as-is
- Spring Boot will auto-create tables via Hibernate

**Option B: Create custom database**

1. Go to **SQL Editor** in Neon dashboard
2. Run:
   ```sql
   CREATE DATABASE notesapp;
   ```
3. Update connection string to use `notesapp` instead of `neondb`

### Step 5: Test Connection (Optional)

You can test the connection in Neon's SQL Editor:

```sql
SELECT version();
```

Should show PostgreSQL version.

---

## Database Alternatives

If you prefer other options:

### Option 1: Render PostgreSQL

**Cost**: Free for 90 days, then $7/month

- More integrated with Render backend
- Internal networking (faster)
- ⚠️ **Not free forever**

**Setup**: [Render PostgreSQL Docs](https://render.com/docs/databases)

### Option 2: Supabase

**Cost**: Free forever (500MB)

- Includes auth, storage, realtime
- Smaller storage than Neon
- Great if you want extra features

**Setup**: [Supabase Docs](https://supabase.com/docs)

### Option 3: Vercel Postgres

**Cost**: Free hobby tier (256MB)

- Integrates with Vercel
- Very limited storage
- Good for small apps

**Setup**: [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)

### Option 4: Railway

**Cost**: $5/month credit (renews monthly)

- Can run MySQL or PostgreSQL
- No sleep on free tier
- Credit can run out with heavy usage

**Setup**: [Railway Docs](https://docs.railway.app/databases/postgresql)

**Recommended**: Stick with **Neon** for best free tier.

---

## Backend Deployment (Spring Boot on Render)

### Step 1: Prepare Backend for Production

1. Update `application.properties` to use environment variables:

```properties
# Database Configuration (Neon)
# The DATABASE_URL from Neon already includes username, password, and SSL settings
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DATABASE_USERNAME:}
spring.datasource.password=${DATABASE_PASSWORD:}
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# JWT Configuration (matches JwtUtil.java)
security.jwt.secret=${JWT_SECRET}
security.jwt.expiration-ms=3600000

# OAuth2 Configuration
spring.security.oauth2.client.registration.google.client-id=${GOOGLE_CLIENT_ID}
spring.security.oauth2.client.registration.google.client-secret=${GOOGLE_CLIENT_SECRET}
spring.security.oauth2.client.registration.google.redirect-uri=${OAUTH2_REDIRECT_URI:}
spring.security.oauth2.client.registration.google.scope=openid,email,profile

# Frontend URL (for CORS - matches CorsConfig.java)
app.frontend.url=${FRONTEND_URL:https://your-frontend.vercel.app}

# Server Configuration
server.port=${PORT:8080}
```

**Important Notes**:

- ✅ **No separate username/password needed** - Neon's JDBC URL includes them
- ✅ Your Neon URL format: `jdbc:postgresql://host/db?user=X&password=Y&sslmode=require`
- ❌ **Do NOT add** `spring.datasource.username` or `spring.datasource.password`
- 🔒 SSL is enforced via `sslmode=require` in the URL

2. **Create a Dockerfile** in the `notes/` directory (if not already present):

See the Dockerfile in your `notes/` folder. It uses a multi-stage build:

- **Stage 1**: Builds the app with Maven
- **Stage 2**: Runs the app with lightweight JRE (Alpine Linux)

This keeps the final image small (~200MB vs ~800MB).

### Step 2: Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure the service:

   - **Name**: `notesapp-backend`
   - **Environment**: `Docker`
   - **Region**: Choose closest to your Neon database region (e.g., US East)
   - **Branch**: `main` or your production branch
   - **Root Directory**: `notes`
   - **Dockerfile Path**: `notes/Dockerfile` (Render auto-detects)
   - **Plan**: Free tier (with sleep) or paid plan

5. Add environment variables (click **Environment**):

```
SPRING_PROFILES_ACTIVE=prod
DATABASE_URL=jdbc:postgresql://ep-xxxxxxxx.us-east-2.aws.neon.tech/neondb?user=youruser&password=yourpassword&sslmode=require
JWT_SECRET=<generate a secure 256-bit secret>
GOOGLE_CLIENT_ID=<your Google OAuth client ID>
GOOGLE_CLIENT_SECRET=<your Google OAuth client secret>
FRONTEND_URL=https://your-frontend.vercel.app
OAUTH2_REDIRECT_URI=https://your-backend.onrender.com/login/oauth2/code/google
```

**Important Notes**:

- `SPRING_PROFILES_ACTIVE=prod` - Activates production profile (uses application-prod.properties)
- Replace `DATABASE_URL` with your **actual Neon JDBC connection string** from earlier step
- Generate `JWT_SECRET`: `openssl rand -base64 64` (must be at least 32 characters)
- `FRONTEND_URL` - Your Vercel app URL (for CORS)
- `OAUTH2_REDIRECT_URI` - Must match your backend URL
- ⚠️ **Do NOT** add `DATABASE_USERNAME` or `DATABASE_PASSWORD` - they're already in the Neon JDBC URL

6. Click **Create Web Service**

### Step 3: Wait for Deployment

- Render will build the Docker image and deploy
- First deployment takes ~5-10 minutes (Docker build + Maven dependencies)
- Subsequent deployments are faster (Docker layer caching)
- Note the service URL: `https://notesapp-backend.onrender.com`

**Docker Build Process**:

1. Render detects Dockerfile in `notes/` directory
2. Builds image using multi-stage build
3. Runs container with environment variables
4. Container listens on port 8080 (or PORT env var)

**Optional - Test Docker Build Locally**:

```bash
# Navigate to notes directory
cd notes

# Build the Docker image
docker build -t notesapp-backend .

# Run locally (with environment variables)
docker run -p 8080:8080 \
  -e DATABASE_URL="jdbc:mysql://host.docker.internal:3306/notesapp" \
  -e DATABASE_USERNAME=root \
  -e DATABASE_PASSWORD=your_password \
  -e JWT_SECRET=your-secret \
  -e GOOGLE_CLIENT_ID=your-id \
  -e GOOGLE_CLIENT_SECRET=your-secret \
  -e FRONTEND_URL=http://localhost:5173 \
  notesapp-backend
```

---

## Collaboration Server Deployment (Hocuspocus on Render)

### Step 1: Deploy Hocuspocus Server

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure the service:

   - **Name**: `notesapp-collaboration`
   - **Environment**: `Node`
   - **Region**: Same as backend (for low latency)
   - **Branch**: `main`
   - **Root Directory**: `hocuspocus-server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free tier or paid plan

5. Add environment variables:

```
PORT=10000
BACKEND_URL=https://notesapp-backend.onrender.com
NODE_ENV=production
```

**Note**: Render uses port 10000 by default for Node.js services.

6. Click **Create Web Service**

### Step 2: Note WebSocket URL

After deployment, your WebSocket server will be available at:

```
wss://notesapp-collaboration.onrender.com
```

**Important**: Note this URL - you'll need it for the frontend configuration.

---

## Frontend Deployment (React on Vercel)

### Step 1: Prepare Frontend for Production

1. Update `frontend/.env.production`:

```env
VITE_API_URL=https://notesapp-backend.onrender.com
VITE_WEBSOCKET_URL=wss://notesapp-collaboration.onrender.com
```

2. Ensure your `vite.config.js` is configured correctly:

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    outDir: "dist",
    sourcemap: false, // Set to false for production
  },
});
```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI

1. Install Vercel CLI:

```bash
npm install -g vercel
```

2. Navigate to frontend directory:

```bash
cd frontend
```

3. Deploy:

```bash
vercel --prod
```

4. Follow the prompts and configure:
   - **Set up and deploy**: Y
   - **Which scope**: Select your account
   - **Link to existing project**: N (first time)
   - **Project name**: `notesapp`
   - **Directory**: `./`
   - **Override settings**: N

#### Option B: Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure project:

   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add environment variables:

```
VITE_API_URL=https://notesapp-backend.onrender.com
VITE_WEBSOCKET_URL=wss://notesapp-collaboration.onrender.com
```

6. Click **Deploy**

### Step 3: Note Frontend URL

After deployment, your app will be available at:

```
https://notesapp-<random-id>.vercel.app
```

Or use a custom domain (see Vercel settings).

---

## Post-Deployment Configuration

### Step 1: Update CORS on Backend

1. Go to Render Dashboard → **notesapp-backend** → **Environment**
2. Update `FRONTEND_URL` with your actual Vercel URL:

```
FRONTEND_URL=https://notesapp-<your-id>.vercel.app
```

3. Click **Save Changes** - This will trigger a redeploy

### Step 2: Update Google OAuth Redirect URIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Select your OAuth 2.0 Client ID
4. Add authorized redirect URIs:

```
https://notesapp-backend.onrender.com/login/oauth2/code/google
https://notesapp-<your-id>.vercel.app/login
```

5. Add authorized JavaScript origins:

```
https://notesapp-<your-id>.vercel.app
```

6. Click **Save**

### Step 3: Verify Deployments

Test the following:

1. **Database Connection**:

   - Check Render backend logs for successful database connection
   - Look for: `HikariPool-1 - Start completed`

2. **Frontend-Backend Communication**:

   - Open frontend URL
   - Check browser console for API errors
   - Try logging in

3. **Collaboration Server**:
   - Create a note
   - Check if WebSocket connects (browser DevTools → Network → WS)
   - Open same note in two browser tabs to test real-time sync

---

## Environment Variables Reference

### Backend (Render)

| Variable                 | Description                                       | Example                                                                           |
| ------------------------ | ------------------------------------------------- | --------------------------------------------------------------------------------- |
| `SPRING_PROFILES_ACTIVE` | Spring Boot profile (use "prod" for production)   | `prod`                                                                            |
| `DATABASE_URL`           | Neon PostgreSQL JDBC connection string (with SSL) | `jdbc:postgresql://ep-xxx.aws.neon.tech/neondb?user=X&password=Y&sslmode=require` |
| `JWT_SECRET`             | Secret for JWT token signing (256-bit)            | `openssl rand -base64 64`                                                         |
| `GOOGLE_CLIENT_ID`       | Google OAuth client ID                            | `123456789-abcdefg.apps.googleusercontent.com`                                    |
| `GOOGLE_CLIENT_SECRET`   | Google OAuth client secret                        | `GOCSPX-xxxxxxxxxxxxx`                                                            |
| `FRONTEND_URL`           | Frontend URL for CORS                             | `https://notesapp-xyz.vercel.app`                                                 |
| `OAUTH2_REDIRECT_URI`    | OAuth redirect URI                                | `https://notesapp-backend.onrender.com/login/oauth2/code/google`                  |

**Important**:

- ⚠️ Do NOT add `DATABASE_USERNAME` or `DATABASE_PASSWORD` - they are already included in Neon's JDBC URL
- ✅ The `DATABASE_URL` must include `sslmode=require` for Neon connections
- 🔒 All values contain sensitive data - never commit to Git

### Collaboration Server (Render)

| Variable      | Description                  | Example                        |
| ------------- | ---------------------------- | ------------------------------ |
| `PORT`        | Server port (Render default) | `10000`                        |
| `BACKEND_URL` | Backend API URL for auth     | `https://backend.onrender.com` |
| `NODE_ENV`    | Environment                  | `production`                   |

### Frontend (Vercel)

| Variable             | Description          | Example                        |
| -------------------- | -------------------- | ------------------------------ |
| `VITE_API_URL`       | Backend API base URL | `https://backend.onrender.com` |
| `VITE_WEBSOCKET_URL` | WebSocket server URL | `wss://collab.onrender.com`    |

---

## Troubleshooting

### Backend Won't Start

**Issue**: Application fails to start on Render

**Solutions**:

1. Check Render logs for errors
2. Verify `DATABASE_URL` is correct
3. Ensure Maven build succeeds
4. Check Java version (use Java 17 or 21)
5. Verify `application.properties` uses environment variables

**Add to Render environment**:

```
JAVA_VERSION=17
```

### Frontend Can't Connect to Backend

**Issue**: CORS errors or network failures

**Solutions**:

1. Verify `VITE_API_URL` in Vercel environment variables
2. Check `FRONTEND_URL` environment variable on Render backend matches your Vercel URL
3. Ensure backend is running (visit backend URL in browser)
4. Check browser console for exact error
5. Verify HTTPS is used (not HTTP)
6. Check `CorsConfig.java` is using `app.frontend.url` property

### WebSocket Connection Fails

**Issue**: Collaboration not working

**Solutions**:

1. Check `VITE_WEBSOCKET_URL` uses `wss://` (not `ws://`)
2. Verify Hocuspocus server is running
3. Check backend can be reached from Hocuspocus server
4. Test WebSocket in browser DevTools → Network → WS tab
5. Ensure firewall/proxy allows WebSocket connections

### Database Connection Issues

**Issue**: Can't connect to PostgreSQL

**Solutions**:

1. Verify **Neon JDBC connection string** is correct
2. Ensure `sslmode=require` is in the connection string
3. Check Neon database is active (go to Neon dashboard)
4. Verify username and password in connection string are correct
5. Test connection from Neon SQL Editor first
6. Check Render backend logs for specific error messages
7. Ensure DATABASE_URL environment variable is set correctly on Render

### OAuth Login Not Working

**Issue**: Google OAuth fails

**Solutions**:

1. Verify Google OAuth credentials in Render environment
2. Check redirect URIs in Google Console match backend URL
3. Ensure `OAUTH2_REDIRECT_URI` environment variable is set
4. Test with backend URL directly: `https://backend.onrender.com/oauth2/authorization/google`
5. Check backend logs for OAuth errors

### Free Tier Sleep Issues (Render)

**Issue**: Services take 30-60 seconds to wake up

**Solutions**:

1. Upgrade to paid plan for 24/7 uptime
2. Use a service like [UptimeRobot](https://uptimerobot.com/) to ping services every 5 minutes (keeps them awake)
3. Add a loading indicator on frontend for initial connection
4. Consider using Render's "Background Worker" for Hocuspocus if needed

---

## Production Checklist

Before going live, ensure:

- [ ] All environment variables are set correctly
- [ ] CORS is configured properly
- [ ] Google OAuth redirect URIs are updated
- [ ] Database backups are enabled (Render settings)
- [ ] SSL/HTTPS is enabled (automatic on Vercel/Render)
- [ ] Error monitoring is set up (optional: Sentry, LogRocket)
- [ ] All console.log statements removed (done!)
- [ ] Test authentication flow end-to-end
- [ ] Test real-time collaboration with multiple users
- [ ] Verify note CRUD operations work
- [ ] Check mobile responsiveness
- [ ] Test in different browsers (Chrome, Firefox, Safari)
- [ ] Review security settings (JWT expiration, CORS, etc.)

---

## Scaling Considerations

As your app grows:

1. **Database**: Upgrade Render PostgreSQL plan or migrate to managed PostgreSQL
2. **Backend**: Enable auto-scaling on Render or use load balancer
3. **Collaboration**: Consider dedicated WebSocket servers or Redis adapter for Yjs
4. **Frontend**: Vercel auto-scales; consider CDN for static assets
5. **Monitoring**: Add APM tools (New Relic, Datadog) for performance tracking

---

## Cost Estimation (Monthly)

### Option 1: Fully Free Forever ⭐ (Recommended)

Using Neon + Render Free Tier + Vercel:

- **Neon PostgreSQL**: $0 (Free forever, 0.5GB)
- **Render Backend**: $0 (Free with 15-min sleep)
- **Render Collaboration Server**: $0 (Free with 15-min sleep)
- **Vercel Frontend**: $0 (Free forever)
- **Total**: **$0/month** 🎉

**Limitations**:

- ⏱️ Backend services sleep after 15 minutes of inactivity (30-60s wake time)
- 💾 **0.5GB database storage** (sufficient for ~5,000-10,000 notes)
- 📊 Suitable for personal projects, demos, small apps

**Tip**: Use [UptimeRobot](https://uptimerobot.com/) (free) to ping services every 5 minutes to keep them awake!

---

### Option 2: Production Ready (No Sleep)

For apps with regular traffic:

- **Neon PostgreSQL**: $0 (Free forever, 0.5GB)
- **Render Backend (Starter)**: $7/month (24/7 uptime)
- **Render Collaboration (Starter)**: $7/month (24/7 uptime)
- **Vercel Hobby**: $0 (Free forever)
- **Total**: **$14/month**

**Benefits**:

- ✅ No sleep on backend services
- ✅ Faster response times
- ✅ Better user experience
- ✅ Still free database (upgrade to paid if you need more storage)

---

### Option 3: Production with Paid Database

For larger apps needing more storage:

- **Neon Launch Plan**: $19/month (10GB storage, more compute)
- **Render Backend (Starter)**: $7/month
- **Render Collaboration (Starter)**: $7/month
- **Vercel Pro**: $20/month (optional - better analytics)
- **Total**: **$33-53/month**

**Note**: For 100GB+ storage needs, consider Neon's Scale plan ($69/month) or other database providers.

---

### Comparison Table

| Service           | Free Forever        | Production (No Sleep) | Production (Large)      |
| ----------------- | ------------------- | --------------------- | ----------------------- |
| Database          | Neon (0.5GB) - $0   | Neon (0.5GB) - $0     | Neon Scale (10GB) - $19 |
| Backend           | Render (sleep) - $0 | Render Starter - $7   | Render Starter - $7     |
| Collaboration     | Render (sleep) - $0 | Render Starter - $7   | Render Starter - $7     |
| Frontend          | Vercel - $0         | Vercel - $0           | Vercel Pro - $20        |
| **Monthly Total** | **$0**              | **$14**               | **$33-53**              |

---

## Support and Resources

- **Neon Docs**: https://neon.tech/docs
- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Hocuspocus Docs**: https://tiptap.dev/hocuspocus
- **Spring Boot on Render**: https://render.com/docs/deploy-spring-boot

---

## Next Steps

1. Deploy database
2. Deploy backend
3. Deploy collaboration server
4. Deploy frontend
5. Test everything
6. Monitor logs for 24 hours
7. Set up monitoring and alerts
8. Consider custom domain

Good luck with your deployment!
