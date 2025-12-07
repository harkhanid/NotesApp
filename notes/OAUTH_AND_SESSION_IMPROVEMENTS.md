# OAuth and Session Management Improvements

This document outlines the recent improvements made to OAuth authentication and session management.

## 1. OAuth Google Sign-In Implementation

### What Was Fixed

**Issues Identified:**
1. **Duplicate User Creation** - Users were being created twice during OAuth flow
2. **Email Conflict Handling** - No validation when OAuth email already has a regular account
3. **Missing Error Handling** - OAuth failures weren't communicated to users
4. **Wrong Redirect** - OAuth success redirected to `/home` instead of `/dashboard`

**Solution Implemented:**
- Removed duplicate user creation logic
- Added email conflict detection (blocks OAuth if regular account exists)
- Created `OAuth2AuthenticationFailureHandler` for better error messages
- Fixed redirect to `/dashboard`
- Added OAuth button handlers in frontend

### Files Modified

**Backend:**
- `CustomOAuth2UserService.java` - Email conflict validation
- `OAuth2AuthenticationSuccessHandler.java` - Removed duplicate creation, fixed redirect
- `OAuth2AuthenticationFailureHandler.java` - NEW - Error handler
- `SecurityConfig.java` - Wired failure handler

**Frontend:**
- `LoginPage.jsx` - Added OAuth button handler & error display
- `SignUpPage.jsx` - Added OAuth button handler

### How It Works

**Scenario 1: New OAuth User**
1. User clicks "Google" button
2. Redirected to Google OAuth consent screen
3. `CustomOAuth2UserService` creates new user with `provider="GOOGLE"` and `emailVerified=true`
4. `OAuth2AuthenticationSuccessHandler` creates welcome note
5. User redirected to `/dashboard` with JWT cookie

**Scenario 2: Email Conflict (Regular Account Exists)**
1. User clicks "Google" button
2. Redirected to Google OAuth consent screen
3. `CustomOAuth2UserService` detects existing LOCAL account
4. Throws exception: "An account with this email already exists..."
5. `OAuth2AuthenticationFailureHandler` redirects to `/login?error=...`
6. Frontend displays error toast

---

## 2. Global 401 Handler for Expired JWT

### The Problem

When JWT tokens expire, API calls return 401 but users remain on the dashboard, creating a confusing experience where searches and operations fail silently.

### Solution

Created a centralized API client that automatically handles 401 responses globally.

### Files Created/Modified

**New File:**
- `frontend/src/utils/apiClient.js` - Centralized fetch wrapper

**Updated Files:**
- `notesService.js` - All API calls now use apiClient
- `authService.js` - Authenticated endpoints use apiClient
- `preferencesService.js` - All calls use apiClient

### How It Works

When any API returns 401:
1. API client intercepts the 401 response
2. Dispatches `logout()` action to clear Redux state
3. Shows toast: "Your session has expired. Please login again."
4. Redirects to `/login` page
5. User is properly logged out and returned to login

### Usage Example

```javascript
// Old way
const response = await fetch(`${API_URL}/notes`, {
  method: "GET",
  credentials: "include",
});

// New way
import { api, API_URL } from "../utils/apiClient.js";

const response = await api.get(`${API_URL}/notes`);
// 401 handling is automatic!
```

---

## 3. Backend Startup Loading Screen (Render Free Tier)

### The Problem

On Render's free tier, the backend spins down after inactivity. When users visit the site, they see a generic "logging in..." message for 1-2 minutes while the backend starts up, which is confusing.

### Solution

Implemented smart backend startup detection with a friendly loading screen.

### Files Created

**New Files:**
- `frontend/src/components/common/StartupLoadingScreen.jsx` - Loading screen component
- `frontend/src/components/common/StartupLoadingScreen.css` - Styling
- `frontend/src/hooks/useBackendStartup.js` - Custom hook for backend status

**Modified Files:**
- `frontend/src/App.jsx` - Integrated startup detection

### How It Works

1. **On App Load:**
   - Checks backend health endpoint (`/actuator/health`)
   - If 503 or network error detected → backend is starting

2. **During Startup:**
   - Shows branded loading screen with message:
     - "Starting up the server..."
     - "This may take a minute on first load"
   - Polls backend every 3 seconds until ready

3. **When Ready:**
   - Hides loading screen
   - Proceeds with normal auth check
   - User sees login page

### Features

- **Smart Detection**: Checks actual backend status, not just timers
- **Auto-Retry**: Polls until backend is ready (max 20 retries)
- **Branded Experience**: Shows app logo and friendly message
- **Smooth Transition**: Fades out when ready

### Environment Variables

No new environment variables required. Uses existing:
- `VITE_API_URL` or defaults to `http://localhost:8080`

---

## Testing

### OAuth Testing

**Test 1: New User**
```bash
1. Visit http://localhost:5173/login
2. Click "Google" button
3. Complete OAuth flow
4. Should redirect to /dashboard
5. Should see welcome note
```

**Test 2: Email Conflict**
```bash
1. Create regular account with test@gmail.com
2. Log out
3. Try to sign in with Google using test@gmail.com
4. Should see error: "An account with this email already exists..."
```

### 401 Handler Testing

```bash
1. Login to app
2. Wait for JWT to expire (or manually delete token cookie)
3. Try to search notes or perform any action
4. Should see toast: "Your session has expired..."
5. Should redirect to /login
```

### Startup Screen Testing

**Local Testing (Simulate Startup):**
```bash
1. Stop backend server
2. Visit http://localhost:5173
3. Should see "Starting up the server..." screen
4. Start backend
5. Screen should disappear and show login page
```

**Render Testing:**
```bash
1. Wait for backend to sleep (14 days inactivity)
2. Visit your Render app URL
3. Should see startup screen
4. Wait ~60 seconds
5. Backend wakes up, screen disappears
```

---

## Configuration

### Google OAuth Setup

1. **Google Cloud Console**: https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URI:
   ```
   http://localhost:8080/login/oauth2/code/google
   ```
4. Set environment variables:
   ```bash
   export GOOGLE_CLIENT_ID=your-actual-client-id
   export GOOGLE_CLIENT_SECRET=your-actual-client-secret
   ```

### Backend Environment Variables

```bash
DATABASE_PASSWORD=demo_dev
JWT_SECRET=my-super-secret-jwt-key-for-development-only-min-256-bits
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

## Architecture Decisions

### Why Option B for Email Conflicts?

**Chosen**: Block OAuth if regular account exists

**Reasoning**:
- Security: Prevents account takeover via OAuth
- Simplicity: No complex account linking logic
- Clear UX: User knows exactly what to do

### Why Global 401 Handler?

**Benefits**:
- **DRY**: Single source of truth for auth errors
- **Consistency**: All endpoints behave the same way
- **Maintainability**: Easy to update logout behavior
- **User Experience**: Clear feedback when session expires

### Why Custom Startup Detection?

**Alternatives Considered**:
1. ❌ Simple timer (unreliable, could be too short or too long)
2. ❌ Always show loading (bad UX for returning users)
3. ✅ Health check polling (accurate, responsive)

---

## Future Improvements

### OAuth
- [ ] Add support for more OAuth providers (GitHub, Microsoft)
- [ ] Implement account linking (allow OAuth + password for same email)
- [ ] Add OAuth scope management

### Session Management
- [ ] Implement refresh tokens for seamless re-authentication
- [ ] Add "Remember me" functionality
- [ ] Implement session timeout warnings

### Startup Screen
- [ ] Add progress bar based on typical startup time
- [ ] Show backend logs/status for debugging
- [ ] Add retry button if startup fails

---

## Troubleshooting

### OAuth Issues

**Problem**: "redirect_uri_mismatch"
**Solution**: Verify redirect URI in Google Console exactly matches:
```
http://localhost:8080/login/oauth2/code/google
```

**Problem**: "deleted_client"
**Solution**: Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are valid

### 401 Handler Issues

**Problem**: Redirect loop
**Solution**: Check that login/register endpoints don't use `apiClient`

### Startup Screen Issues

**Problem**: Loading screen stuck forever
**Solution**:
1. Check backend is actually running
2. Verify `API_DOMAIN` is correct
3. Check browser console for errors
