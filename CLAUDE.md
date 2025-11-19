# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NotesApp is a full-stack note-taking application with a React frontend, Spring Boot backend, and real-time collaboration server. The app features user authentication (JWT and OAuth2), rich text editing with TipTap, real-time collaborative editing, tag management, and note sharing capabilities.

**Tech Stack:**
- Frontend: React 18 + Vite, Redux Toolkit, React Router, TipTap editor with Collaboration extensions, Framer Motion
- Backend: Spring Boot 3.5.6, Spring Security, Spring Data JPA, MySQL
- Collaboration Server: Hocuspocus (Yjs-based WebSocket server) for real-time collaborative editing
- Authentication: JWT tokens (stored in httpOnly cookies), OAuth2 (Google)

## Repository Structure

```
NotesApp/
├── frontend/          # React/Vite application
│   ├── src/
│   │   ├── components/    # UI components (Dashboard, Editor, LoginPage, etc.)
│   │   ├── store/         # Redux slices (notesSlice, uiSlice, authSlice)
│   │   ├── Service/       # API services (notesService, authService)
│   │   ├── utils/         # Utility modules (collaborationManager.js)
│   │   └── constants/     # App constants
├── notes/             # Spring Boot backend (primary backend)
│   ├── src/main/java/com/dharmikharkhani/notes/
│   │   ├── auth/          # Authentication logic (JWT, OAuth2, SecurityConfig)
│   │   ├── controller/    # REST controllers (NoteController)
│   │   ├── entity/        # JPA entities (Note, Tag)
│   │   ├── repository/    # Data repositories
│   │   ├── service/       # Business logic
│   │   └── dto/           # Data transfer objects
├── hocuspocus-server/ # Real-time collaboration WebSocket server
│   ├── server.js          # Hocuspocus server with JWT authentication
│   └── package.json       # Dependencies (@hocuspocus/server, axios, dotenv)
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

### Collaboration Server (Hocuspocus + Node.js)
```bash
cd hocuspocus-server
npm install              # Install dependencies
npm start                # Run production server
npm run dev              # Run with auto-reload (dev mode)
```

**Environment Variables (optional, with defaults):**
- `PORT` - WebSocket server port (default: 1234)
- `BACKEND_URL` - Spring Boot backend URL for auth verification (default: http://localhost:8080)

**Frontend Environment Variables:**
- `VITE_WEBSOCKET_URL` - WebSocket server URL (default: ws://localhost:1234)

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

Uses **TipTap** (ProseMirror-based) for WYSIWYG editing with real-time collaboration:
- `Editor.jsx`: Main editor component with StarterKit, Collaboration, and CollaborationCursor extensions
- Content stored as HTML in database
- Editor updates trigger Redux actions via `onUpdate` callback with autosave (2 second delay)
- Content syncs when `currentId` changes in Redux state
- Real-time collaboration via Yjs CRDT and Hocuspocus WebSocket provider

### Real-Time Collaboration Architecture

**Collaboration Stack:**
- **Yjs**: CRDT library for conflict-free concurrent editing
- **Hocuspocus**: WebSocket server for syncing Yjs documents
- **TipTap Collaboration Extensions**: Integrate Yjs with the editor

**Flow:**
1. Frontend requests WebSocket token from backend (`/api/auth/ws-token`)
2. `collaborationManager.js` creates Yjs document and Hocuspocus provider per note
3. Provider connects to `hocuspocus-server` with JWT token in query params
4. Server validates token via backend endpoint (`/api/notes/collaboration/verify`)
5. Backend checks user authorization to access the note
6. Once authenticated, users can see each other's cursors and edits in real-time
7. Frontend handles persistence via autosave (collaboration server is stateless)

**Key Components:**
- `collaborationManager.js`: Manages Yjs documents and Hocuspocus providers per note
- `hocuspocus-server/server.js`: WebSocket server with JWT authentication hooks
- `Editor.jsx`: Initializes collaboration when note is opened, cleans up on unmount
- Backend endpoints: Verify user authorization before allowing WebSocket connection

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
5. **Collaboration Lifecycle**: Each note has its own Yjs document and WebSocket provider, created when note is opened and destroyed when closed/unmounted
6. **Stateless Collaboration**: Hocuspocus server does not persist data - all persistence handled by frontend autosave to Spring Boot backend
7. **Per-Note Authorization**: Backend verifies user has access to specific note before allowing WebSocket connection

## Current Branch Status

Branch: `KAN-10-poc-collabration`

Modified files:
- `frontend/src/App.jsx` - Application routing
- `frontend/src/components/editor/Editor.jsx` - Collaborative editor with Yjs integration
- `frontend/src/utils/collaborationManager.js` - Manages Yjs documents and providers
- `hocuspocus-server/server.js` - WebSocket collaboration server
- `notes/src/main/java/com/dharmikharkhani/notes/auth/config/SecurityConfig.java` - Security configuration
- `notes/src/main/java/com/dharmikharkhani/notes/entity/Note.java` - Note entity

Recent work focused on implementing real-time collaborative editing with Yjs/Hocuspocus.