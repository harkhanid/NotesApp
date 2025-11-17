# Production Deployment Guide

This guide covers deploying the NotesApp to production using:

- **Frontend**: Vercel
- **Backend (Spring Boot)**: Render
- **Database**: PostgreSQL on
  Render
- **Collaboration Server**: Render

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup (PostgreSQL on Render)](#database-setup-postgresql-on-render)
3. [Backend Deployment (Spring Boot on Render)](#backend-deployment-spring-boot-on-render)
4. [Collaboration Server Deployment (Hocuspocus on Render)](#collaboration-server-deployment-hocuspocus-on-render)
5. [Frontend Deployment (React on Vercel)](#frontend-deployment-react-on-vercel)
6. [Post-Deployment Configuration](#post-deployment-configuration)
7. [Environment Variables Reference](#environment-variables-reference)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- [ ] GitHub repository with your code
- [ ] Vercel account (https://vercel.com)
- [ ] Render account (https://render.com)
- [ ] Google OAuth2 credentials (for OAuth login)
- [ ] Domain name (optional, for custom domains)

---

## Database Setup (PostgreSQL on Render)

### Step 1: Create PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New** → **PostgreSQL**
3. Configure the database:

   - **Name**: `notesapp-db`
   - **Database**: `notesapp`
   - **User**: (auto-generated)
   - **Region**: Choose closest to your users
   - **PostgreSQL Version**: 15 or latest
   - **Plan**: Free tier or paid plan

4. Click **Create Database**

### Step 2: Note Database Credentials

After creation, you'll see:

- **Internal Database URL**: Use this for backend (same network, faster)
- **External Database URL**: Format: `postgres://user:password@host:port/database`

Copy the **Internal Database URL** - you'll need it for the backend configuration.

**Example**:

```
postgres://notesapp_user:xxxxxxxxxxxxx@dpg-xxxxx-a/notesapp_db
```

---

## Backend Deployment (Spring Boot on Render)

### Step 1: Prepare Backend for Production

1. Update `application.properties` to use environment variables:

```properties
# Database Configuration
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DATABASE_USERNAME:}
spring.datasource.password=${DATABASE_PASSWORD:}
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# JWT Configuration
jwt.secret=${JWT_SECRET}
jwt.expiration=86400000

# OAuth2 Configuration
spring.security.oauth2.client.registration.google.client-id=${GOOGLE_CLIENT_ID}
spring.security.oauth2.client.registration.google.client-secret=${GOOGLE_CLIENT_SECRET}
spring.security.oauth2.client.registration.google.redirect-uri=${OAUTH2_REDIRECT_URI:https://your-backend-url.onrender.com/login/oauth2/code/google}

# CORS Configuration
cors.allowed.origins=${CORS_ALLOWED_ORIGINS:https://your-frontend.vercel.app}

# Server Configuration
server.port=${PORT:8080}
```

2. Create `render.yaml` in the project root (optional, for infrastructure as code):

```yaml
services:
  - type: web
    name: notesapp-backend
    env: java
    buildCommand: cd notes && ./mvnw clean install -DskipTests
    startCommand: cd notes && java -jar target/notes-*.jar
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: notesapp-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: JAVA_OPTS
        value: "-Xmx512m"
```

### Step 2: Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure the service:

   - **Name**: `notesapp-backend`
   - **Environment**: `Java`
   - **Region**: Same as database
   - **Branch**: `main` or your production branch
   - **Root Directory**: `notes`
   - **Build Command**: `./mvnw clean install -DskipTests`
   - **Start Command**: `java -jar target/notes-*.jar`
   - **Plan**: Free tier or paid plan

5. Add environment variables (click **Environment**):

```
DATABASE_URL=<paste Internal Database URL from Step 1>
JWT_SECRET=<generate a secure 256-bit secret, e.g., use: openssl rand -base64 64>
GOOGLE_CLIENT_ID=<your Google OAuth client ID>
GOOGLE_CLIENT_SECRET=<your Google OAuth client secret>
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
OAUTH2_REDIRECT_URI=https://your-backend.onrender.com/login/oauth2/code/google
```

**Important**: After first deployment, update `CORS_ALLOWED_ORIGINS` with your actual Vercel frontend URL.

6. Click **Create Web Service**

### Step 3: Wait for Deployment

- Render will build and deploy your backend
- First deployment takes ~5-10 minutes
- Note the service URL: `https://notesapp-backend.onrender.com`

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
2. Update `CORS_ALLOWED_ORIGINS` with your Vercel URL:

```
CORS_ALLOWED_ORIGINS=https://notesapp-<your-id>.vercel.app
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

| Variable               | Description                            | Example                                                 |
| ---------------------- | -------------------------------------- | ------------------------------------------------------- |
| `DATABASE_URL`         | PostgreSQL connection string           | `postgres://user:pass@host/db`                          |
| `JWT_SECRET`           | Secret for JWT token signing (256-bit) | `openssl rand -base64 64`                               |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID                 | `xxxxx.apps.googleusercontent.com`                      |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret             | `GOCSPX-xxxxx`                                          |
| `CORS_ALLOWED_ORIGINS` | Frontend URL for CORS                  | `https://app.vercel.app`                                |
| `OAUTH2_REDIRECT_URI`  | OAuth redirect URI                     | `https://backend.onrender.com/login/oauth2/code/google` |

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
2. Check `CORS_ALLOWED_ORIGINS` on backend includes frontend URL
3. Ensure backend is running (visit backend URL in browser)
4. Check browser console for exact error
5. Verify HTTPS is used (not HTTP)

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

1. Use **Internal Database URL** (faster, more reliable)
2. Verify database is in same region as backend
3. Check database is active on Render
4. Ensure connection string format is correct
5. Check Render database logs

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

**Free Tier** (Development/Testing):

- Render PostgreSQL Free: $0
- Render Web Services (2): $0 (with sleep)
- Vercel Hobby: $0
- **Total**: $0/month

**Recommended Production** (Small Scale):

- Render PostgreSQL Starter: $7/month
- Render Backend (Starter): $7/month
- Render Collaboration (Starter): $7/month
- Vercel Pro: $20/month (optional)
- **Total**: ~$21-41/month

---

## Support and Resources

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
