import { Server } from '@hocuspocus/server';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 1234;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

const server = Server.configure({
  port: PORT,

  async onConnect(data) {
    const { documentName } = data;
    // Connection established - ready for collaboration
  },

  async onDisconnect(data) {
    const { documentName } = data;
    // Client disconnected
  },

  async onLoadDocument(data) {
    const { documentName } = data;
    // Return null to start with empty Yjs document
    // Frontend handles initial content loading
    return null;
  },

  async onStoreDocument(data) {
    const { documentName } = data;
    // Document updated - persistence handled by frontend autosave
  },

  async onAuthenticate(data) {
    const { requestParameters, documentName } = data;
    const token = requestParameters.get('token');
    const noteId = documentName.replace('note-', '');

    if (!token) {
      throw new Error('Authentication token required');
    }

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/notes/collaboration/verify`,
        { noteId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cookie': `token=${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      const { allowed, email, username } = response.data;

      if (!allowed) {
        throw new Error('Not authorized to access this document');
      }

      return {
        user: {
          id: email,
          name: username,
          email: email,
          token: token
        }
      };
    } catch (error) {
      throw new Error('Authentication failed');
    }
  },
});

server.listen(() => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║  Hocuspocus Server Running                        ║
║                                                   ║
║  Port: ${PORT}                                     ║
║  WebSocket: ws://localhost:${PORT}                 ║
║  Backend: ${BACKEND_URL}                           ║
║                                                   ║
║  Features:                                        ║
║  ✓ Real-time collaboration                        ║
║  ✓ JWT authentication                             ║
║  ✓ Per-note isolation                             ║
║  ✓ Awareness (cursors & presence)                 ║
╚═══════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down Hocuspocus server...');
  server.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down Hocuspocus server...');
  server.destroy();
  process.exit(0);
});
