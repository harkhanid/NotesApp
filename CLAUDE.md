# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NotesApp is a full-stack note-taking application with a React frontend and Spring Boot backend. The app features user authentication (JWT and OAuth2), rich text editing with TipTap, tag management, and note sharing capabilities.

**Tech Stack:**
- Frontend: React 18 + Vite, Redux Toolkit, React Router, TipTap editor, Framer Motion
- Backend: Spring Boot 3.5.6, Spring Security, Spring Data JPA, MySQL
- Authentication: JWT tokens (stored in httpOnly cookies), OAuth2 (Google)

## Repository Structure

```
NotesApp/
├── frontend/          # React/Vite application
│   ├── src/
│   │   ├── components/    # UI components (Dashboard, Editor, LoginPage, etc.)
│   │   ├── store/         # Redux slices (notesSlice, uiSlice, authSlice)
│   │   ├── Service/       # API services (notesService, authService)
│   │   └── constants/     # App constants
├── notes/             # Spring Boot backend (primary backend)
│   ├── src/main/java/com/dharmikharkhani/notes/
│   │   ├── auth/          # Authentication logic (JWT, OAuth2, SecurityConfig)
│   │   ├── controller/    # REST controllers (NoteController)
│   │   ├── entity/        # JPA entities (Note, Tag)
│   │   ├── repository/    # Data repositories
│   │   ├── service/       # Business logic
│   │   └── dto/           # Data transfer objects
└── feathernotes/      # Legacy Gradle backend (ignore)
```

## Development Commands

### Frontend (Vite + React)
```bash
cd frontend
npm install              # Install dependencies
npm run dev              # Start dev server (default: http://localhost:5173)
npm run build            # Build for production
npm run lint             # Run ESLint
npm run preview          # Preview production build
```

### Backend (Spring Boot + Maven)
```bash
cd notes
./mvnw clean install     # Build project
./mvnw spring-boot:run   # Run backend server
./mvnw test              # Run tests
```

**Environment Variables Required:**
- `DATABASE_URL` - MySQL connection URL
- `DATABASE_USERNAME` - Database username
- `DATABASE_PASSWORD` - Database password
- `GOOGLE_CLIENT_ID` - Google OAuth2 client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth2 client secret
- `JWT_SECRET` - Secret key for JWT signing

## Architecture Overview

### Frontend State Management

The app uses Redux Toolkit with a normalized state structure:

- **notesSlice**: Manages notes with normalized state (`byId` object, `allIds` array). Notes are keyed by UUID. Handles async operations for CRUD and search.
- **uiSlice**: Manages UI state (theme, font preferences, sidebar visibility)
- **authSlice**: Manages authentication state (user info, auth status)

**Key Pattern**: Notes are stored in a normalized structure (`state.notes.byId[id]`) for efficient lookups and updates. The `allIds` array maintains ordering (most recently updated first).

### Backend Architecture

**Authentication Flow:**
1. JWT-based authentication with tokens stored in httpOnly cookies (secure, sameSite=None)
2. OAuth2 integration for Google login with stateless authorization request repository
3. JwtAuthFilter validates tokens on each request and sets Spring Security context
4. Session management is STATELESS - all state in JWT token

**Security Configuration** (`auth/config/SecurityConfig.java`):
- Custom JWT filter runs before UsernamePasswordAuthenticationFilter
- Public endpoints: `/api/auth/login`, `/api/auth/register`, OAuth2 paths
- All other endpoints require authentication
- CORS configured via CorsConfig

**Note Authorization** (`service/AuthorizationService.java`):
- Users can only access notes they own or notes shared with them
- Check `isAllowedToEditNote()` and `isAllowedToDeleteNote()` before mutations
- Note ownership stored via `Note.owner` (User entity)
- Sharing via Many-to-Many `Note.sharedWith` relationship

**Entity Relationships:**
- `Note` → `User` (ManyToOne owner relationship)
- `Note` → `Tag` (ManyToMany via `note_tags` join table)
- `Note` → `User` (ManyToMany via `note_shared_users` for sharing)

### Rich Text Editor

Uses **TipTap** (ProseMirror-based) for WYSIWYG editing:
- `Editor.jsx`: Main editor component with StarterKit extensions
- Content stored as HTML in database
- Editor updates trigger Redux actions via `onUpdate` callback
- Content syncs when `currentId` changes in Redux state

## Important Implementation Details

### Frontend-Backend Communication

**API Base URL**: Defined in `frontend/src/constants/constants.js`

**Authentication Pattern:**
```javascript
// Services use credentials: 'include' to send httpOnly cookies
fetch(url, {
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' }
})
```

**Note Search**: Currently implemented client-side in Redux (`searchNotesAsync` thunk). Backend has `/api/notes/search?keyword=` endpoint but frontend fetches all notes and filters locally.

### Known Patterns

1. **Optimistic Updates**: Frontend updates local state immediately, then syncs with backend via async thunks
2. **Temporary IDs**: New notes get `temp-{timestamp}` ID until backend responds with UUID
3. **CORS**: Backend configured for localhost development (check `CorsConfig.java`)
4. **Protected Routes**: `ProtectedRoute.jsx` checks auth state before rendering dashboard/settings

## Current Branch Status

Branch: `react-security-integration`

Modified files:
- `frontend/src/Service/notesService.js` - API service implementation
- `frontend/src/components/dashboard/Dashboard.jsx` - Main dashboard UI
- `frontend/src/store/notesSlice.js` - Notes Redux slice

Recent work focused on integrating frontend authentication with the backend JWT/OAuth2 system.