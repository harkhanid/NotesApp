# Hocuspocus Collaboration Server

WebSocket server for real-time collaborative editing in NotesApp using Yjs and Hocuspocus.

## Installation

```bash
npm install
```

## Running the Server

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on **port 1234** by default (configurable via `PORT` environment variable).

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
PORT=1234
BACKEND_URL=http://localhost:8080
NODE_ENV=development
```

## Implementation Phases

### ✅ Phase 2: Basic WebSocket Sync (Current)
- [x] WebSocket server running on port 1234
- [x] Per-note document isolation
- [x] Real-time sync between clients
- [x] User awareness (presence indicators)
- [ ] **No authentication** (development only)

### 🔜 Phase 3: JWT Authentication (Next)
- [ ] Verify JWT tokens with Spring Boot backend
- [ ] Check user permissions (`isAllowedToEditNote`)
- [ ] Reject unauthorized connections
- [ ] Inject verified user identity

### 🔜 Phase 4: Database Persistence
- [ ] Load initial content from MySQL (Spring Boot)
- [ ] Save document changes to database
- [ ] Periodic snapshots (debounced saves)

## Testing Phase 2

1. Start the Hocuspocus server:
   ```bash
   npm run dev
   ```

2. Start the Spring Boot backend:
   ```bash
   cd ../notes
   ./mvnw spring-boot:run
   ```

3. Start the React frontend:
   ```bash
   cd ../frontend
   npm run dev
   ```

4. Open the app in **multiple browser tabs**

5. Login with the same user in both tabs

6. Open the same note in both tabs

7. Start typing in one tab - you should see:
   - Content syncing in real-time to the other tab
   - User cursors visible (with real usernames)
   - Console logs showing WebSocket connection status

## WebSocket URL

Frontend connects to: `ws://localhost:1234`

Room naming convention: `note-{noteId}` (e.g., `note-550e8400-e29b-41d4-a716-446655440000`)

## Logging

The server logs:
- ✅ Client connections
- ❌ Client disconnections
- 📄 Document loads
- 💾 Document updates
- 🔓 Authentication status (bypassed in Phase 2)

## Architecture

```
┌─────────────┐
│   Browser   │
│   Tab 1     │
└─────┬───────┘
      │ WebSocket
      │ ws://localhost:1234
      ▼
┌──────────────────┐     ┌─────────────────┐
│    Hocuspocus    │────▶│   Spring Boot   │
│    Server        │◀────│   Backend       │
│    (Port 1234)   │     │   (Port 8080)   │
└──────────────────┘     └─────────────────┘
      ▲                           │
      │ WebSocket                 │
┌─────┴───────┐                   ▼
│   Browser   │             ┌──────────┐
│   Tab 2     │             │  MySQL   │
└─────────────┘             └──────────┘
```

## Troubleshooting

### "WebSocket connection failed"
- Ensure Hocuspocus server is running (`npm run dev`)
- Check port 1234 is not in use: `lsof -i :1234`

### "Document not syncing"
- Open browser console (F12) and check for WebSocket errors
- Verify both tabs are using the same note ID
- Check Hocuspocus server logs for connection messages

### "Cannot find module '@hocuspocus/server'"
- Run `npm install` in the `hocuspocus-server` directory

## Next Steps

After verifying Phase 2 works:
1. Implement Phase 3: JWT authentication
2. Implement Phase 4: Database persistence
3. Deploy to production with proper security
