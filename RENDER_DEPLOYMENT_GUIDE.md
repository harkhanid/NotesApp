# Render Free Tier - Professional Deployment Guide

## The Render Free Tier "Feature"

Render's free tier automatically **spins down** (sleeps) your backend after **15 minutes of inactivity**. When a recruiter/HR visits your app:

1. **First request** → Triggers backend wake-up (takes 50-90 seconds)
2. **Shows loading screen** → Professional message explaining the delay
3. **Backend wakes** → App loads normally
4. **Subsequent requests** → Instant (backend stays awake for 15 min)

## ✅ Solution Implemented: Startup Loading Screen

We've implemented a **smart loading screen** that:
- ✅ Detects when Render backend is sleeping
- ✅ Shows professional message explaining the delay
- ✅ Polls every 3 seconds until backend is ready
- ✅ Automatically transitions to the app when ready
- ✅ Makes it clear this is a **hosting limitation**, not a bug

### What Recruiters/HR Will See:

```
┌─────────────────────────────────┐
│          [Notes Logo]           │
│                                 │
│  Waking up the server...        │
│  Free tier servers sleep        │
│  after inactivity               │
│                                 │
│  This will take ~60 seconds     │
│  on first visit                 │
│                                 │
│        [Loading Spinner]        │
└─────────────────────────────────┘
```

**This communicates:**
- ✅ You understand the limitation
- ✅ You've handled it professionally
- ✅ It's not a bug, it's a hosting choice
- ✅ You care about user experience

---

## Production Deployment Checklist

### **1. Backend (Render)**

**Environment Variables Required:**
```bash
# Database
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# JWT
JWT_SECRET=your-production-secret-minimum-256-bits-long

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email (Gmail)
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password  # NOT regular password!

# URLs
FRONTEND_URL=https://your-frontend.vercel.app
COLLABORATION_URL=https://your-collab-server.onrender.com

# Profile
SPRING_PROFILES_ACTIVE=prod
```

**Important Notes:**
- ✅ Use Gmail **App Password**, not regular password
- ✅ Enable 2FA in Gmail before generating app password
- ✅ Make sure `FRONTEND_URL` has NO trailing slash
- ✅ Use PostgreSQL (not MySQL) on Render

---

### **2. Frontend (Vercel)**

**Environment Variables Required:**
```bash
VITE_API_URL=https://your-backend.onrender.com
```

**Important:**
- ✅ NO trailing slash on backend URL
- ✅ Must use HTTPS (both frontend and backend)

---

### **3. Google OAuth Setup**

Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

**Add BOTH redirect URIs:**
```
http://localhost:8080/login/oauth2/code/google          # Local dev
https://your-backend.onrender.com/login/oauth2/code/google  # Production
```

**Important:**
- ✅ Use exact backend URL (not frontend)
- ✅ Path must be `/login/oauth2/code/google`
- ✅ No trailing slash

---

## Testing the Startup Screen

### **Local Testing:**
1. Stop your backend server
2. Open frontend: `http://localhost:5173`
3. You should see the startup loading screen
4. Start backend
5. Screen should disappear and show login

### **Production Testing:**
1. Wait 15+ minutes (let Render spin down)
2. Visit your app
3. You'll see the startup screen for ~60 seconds
4. Backend wakes up
5. App loads normally

---

## Common Production Issues & Fixes

### **Issue 1: Infinite Loading Screen**

**Symptoms:**
- Loading screen never goes away
- Console shows network errors

**Fixes:**
```bash
# Check these:
1. Is backend actually deployed and running?
2. Is VITE_API_URL correct in frontend?
3. Is FRONTEND_URL correct in backend?
4. Check Render logs for startup errors
```

---

### **Issue 2: OAuth "redirect_uri_mismatch"**

**Symptoms:**
- Google shows error after login
- Says redirect URI doesn't match

**Fix:**
```bash
# In Google Cloud Console, add EXACT URL:
https://your-backend-url.onrender.com/login/oauth2/code/google

# Common mistakes:
❌ Using frontend URL (wrong!)
❌ Missing /login/oauth2/code/google path
❌ Using http instead of https
✅ Exact backend URL with full path
```

---

### **Issue 3: Email Not Sending**

**Symptoms:**
- Users don't receive verification emails
- Backend logs show auth errors

**Fix:**
```bash
# 1. Gmail App Password Setup:
- Go to Google Account Settings
- Security → 2-Step Verification (ENABLE THIS!)
- Search "App passwords"
- Generate password for "Mail"
- Copy 16-character password
- Use as SMTP_PASSWORD

# 2. Verify environment variables:
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # App password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

---

### **Issue 4: Cookies Not Being Set**

**Symptoms:**
- Login works but immediately logs out
- Browser shows no cookies

**Fix:**
```bash
# Both must use HTTPS in production:
Frontend: https://your-app.vercel.app
Backend:  https://your-api.onrender.com

# Check browser console for:
- CORS errors
- SameSite cookie warnings
- Secure cookie warnings
```

---

## Render Free Tier Limitations

**What to Tell Recruiters/HR:**

> "This app is hosted on Render's free tier, which automatically spins down the backend after 15 minutes of inactivity. The first request wakes up the server (~60 seconds). I've implemented a professional loading screen to communicate this limitation to users."

**Shows you:**
- ✅ Understand hosting limitations
- ✅ Can work within constraints
- ✅ Care about user experience
- ✅ Communicate technical decisions clearly

---

## Upgrading from Free Tier (Optional)

If you want to avoid the cold start delay:

**Option 1: Render Paid Plan ($7/month)**
- Zero downtime
- Instant response
- Better for demos

**Option 2: Keep Pinging Service**
- Use UptimeRobot (free) to ping every 14 minutes
- Keeps backend awake
- Hacky but works

**Option 3: Alternative Hosting**
- Railway (free tier with credits)
- Fly.io (free tier available)
- Heroku (no free tier anymore)

---

## Monitoring & Debugging

### **View Render Logs:**
```bash
Render Dashboard → Your Service → Logs Tab
```

### **Look for:**
```bash
# Good signs:
✅ "Started NotesApplication"
✅ "Tomcat started on port 8080"
✅ "Database connection successful"

# Bad signs:
❌ 535 Authentication failed (email)
❌ redirect_uri_mismatch (OAuth)
❌ Connection timeout (database)
❌ Cookie warnings (HTTPS issue)
```

### **Frontend Debugging:**
```javascript
// Browser Console
// Should see:
"Backend appears to be starting..."  // When sleeping
"Backend is ready"                   // When awake

// Check Network tab:
- Request to /actuator/health
- Should see polls every 3 seconds
- Eventually gets 200 OK
```

---

## Final Deployment Steps

**1. Deploy Backend to Render:**
```bash
1. Connect GitHub repo
2. Set environment variables
3. Deploy
4. Copy backend URL
```

**2. Deploy Frontend to Vercel:**
```bash
1. Connect GitHub repo
2. Set VITE_API_URL to backend URL
3. Deploy
4. Copy frontend URL
```

**3. Update Backend with Frontend URL:**
```bash
1. Go to Render dashboard
2. Update FRONTEND_URL environment variable
3. Redeploy backend
```

**4. Test:**
```bash
1. Visit frontend URL
2. Should see startup screen (first visit)
3. After ~60 seconds, should see login page
4. Create account → check email
5. Try OAuth login
6. Everything should work!
```

---

## Support & Issues

If you encounter issues:

1. **Check Render Logs** - Most issues show up here
2. **Check Browser Console** - Frontend errors
3. **Check Network Tab** - API call failures
4. **Verify Environment Variables** - Most common issue

**Common Fix: Redeploy**
- Many issues are fixed by redeploying
- Render sometimes needs a kick

**Common Fix: Check URLs**
- No trailing slashes
- HTTPS in production
- Exact matches

---

## Success Metrics

**Your app is working correctly if:**
- ✅ First visit shows startup screen (~60s)
- ✅ Login works
- ✅ Email verification sends
- ✅ OAuth login works
- ✅ Cookies persist
- ✅ Dashboard loads after login
- ✅ Notes CRUD works
- ✅ Subsequent visits are instant (within 15 min)

**You're ready for recruiters! 🚀**
