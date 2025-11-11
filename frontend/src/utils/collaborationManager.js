/**
 * Collaboration Manager
 * Manages Yjs document instances and Hocuspocus providers per note
 */

import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';

// Hocuspocus server URL
const HOCUSPOCUS_URL = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:1234';

// Store active documents and providers
const activeDocuments = new Map();
const activeProviders = new Map();

/**
 * Get or create a Yjs document for a specific note
 * @param {string} noteId - The UUID of the note
 * @returns {Y.Doc} The Yjs document instance
 */
export const getOrCreateDocument = (noteId) => {
  if (!noteId) {
    throw new Error('noteId is required');
  }

  // Return existing document if already created
  if (activeDocuments.has(noteId)) {
    return activeDocuments.get(noteId);
  }

  // Create new Yjs document
  const ydoc = new Y.Doc();
  activeDocuments.set(noteId, ydoc);

  return ydoc;
};

/**
 * Get or create a Hocuspocus provider for a specific note
 * @param {string} noteId - The UUID of the note
 * @param {Y.Doc} ydoc - The Yjs document
 * @param {Object} user - User information { username, email, color }
 * @param {string} [token] - Optional JWT token for authentication (Phase 3)
 * @returns {HocuspocusProvider} The provider instance
 */
export const getOrCreateProvider = (noteId, ydoc, user, token = null) => {
  if (!noteId || !ydoc) {
    throw new Error('noteId and ydoc are required');
  }

  // IMPORTANT: Don't reuse providers - always create fresh ones with new tokens
  // This ensures authentication works properly
  if (activeProviders.has(noteId)) {
    console.log(`♻️ Cleaning up existing provider for ${noteId} before creating new one`);
    const oldProvider = activeProviders.get(noteId);
    oldProvider.destroy();
    activeProviders.delete(noteId);
  }

  // Create room name based on note ID (ensures per-note isolation)
  const roomName = `note-${noteId}`;

  // Use provided token (should be fetched from backend)
  const authToken = token;

  if (!authToken) {
    console.error('❌ No JWT token provided - authentication will fail');
    console.error('Token value:', authToken);
  } else {
    console.log('✅ JWT token provided for authentication');
    console.log('Token (first 20 chars):', authToken.substring(0, 20) + '...');
  }

  // Build WebSocket URL with token as query parameter
  // This is more reliable than using the token/parameters options
  const wsUrlWithToken = `${HOCUSPOCUS_URL}?token=${encodeURIComponent(authToken)}`;

  // Build provider options
  const providerOptions = {
    url: wsUrlWithToken, // URL with token in query string
    name: roomName,
    document: ydoc,
    // Disconnect when browser tab is not visible
    broadcast: true,
    // Timeout for connection
    timeout: 30000,
  };

  console.log('🔌 Creating Hocuspocus provider with config:', {
    url: wsUrlWithToken.substring(0, 50) + '...', // Don't log full token
    name: roomName,
    hasToken: !!authToken,
  });

  // Create Hocuspocus provider
  const provider = new HocuspocusProvider(providerOptions);

  // Set user data in awareness after provider is created
  if (provider.awareness) {
    const userData = {
      name: user?.username || user?.email || 'Anonymous',
      email: user?.email || '',
      color: user?.color || generateUserColor(user?.email),
    };
    console.log('👤 Setting awareness user data:', userData);
    provider.awareness.setLocalStateField('user', userData);

    // Debug: Log awareness changes
    provider.awareness.on('change', (changes) => {
      const states = Array.from(provider.awareness.getStates().values());
      console.log('👥 Awareness updated. Active users:', states.length);
      console.log('   Changes:', changes);
      console.log('   All states:', states);

      // Log each user
      states.forEach((state, index) => {
        console.log(`   User ${index + 1}:`, state.user);
      });
    });

    // Log initial awareness state
    setTimeout(() => {
      const states = Array.from(provider.awareness.getStates().values());
      console.log('📊 Initial awareness state:', states);
    }, 1000);
  }

  // Log connection events
  provider.on('status', (event) => {
    console.log(`Hocuspocus status for ${roomName}:`, event.status);
  });

  provider.on('synced', () => {
    console.log(`Document ${roomName} synced`);
  });

  provider.on('disconnect', () => {
    console.log(`Document ${roomName} disconnected`);
  });

  activeProviders.set(noteId, provider);

  return provider;
};

/**
 * Clean up document and provider for a specific note
 * Call this when switching notes or unmounting editor
 * @param {string} noteId - The UUID of the note
 */
export const cleanupDocument = (noteId) => {
  if (!noteId) return;

  // Destroy provider
  const provider = activeProviders.get(noteId);
  if (provider) {
    provider.destroy();
    activeProviders.delete(noteId);
  }

  // Destroy document
  const ydoc = activeDocuments.get(noteId);
  if (ydoc) {
    ydoc.destroy();
    activeDocuments.delete(noteId);
  }
};

/**
 * Clean up all active documents and providers
 * Call this on app unmount or logout
 */
export const cleanupAllDocuments = () => {
  // Destroy all providers
  activeProviders.forEach((provider) => {
    provider.destroy();
  });
  activeProviders.clear();

  // Destroy all documents
  activeDocuments.forEach((ydoc) => {
    ydoc.destroy();
  });
  activeDocuments.clear();
};

/**
 * Generate a consistent color for a user based on their email
 * @param {string} email - User email
 * @returns {string} Hex color code
 */
const generateUserColor = (email) => {
  if (!email) {
    // Random color for anonymous users
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  }

  // Generate color from email hash (consistent per user)
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Convert to hex color (use positive hash)
  const color = Math.abs(hash) % 16777215;
  return '#' + color.toString(16).padStart(6, '0');
};

/**
 * Get active user count for a note
 * @param {string} noteId - The UUID of the note
 * @returns {number} Number of active users
 */
export const getActiveUserCount = (noteId) => {
  const provider = activeProviders.get(noteId);
  if (!provider || !provider.awareness) return 0;

  return provider.awareness.getStates().size;
};

/**
 * Get list of active users for a note
 * @param {string} noteId - The UUID of the note
 * @returns {Array} Array of user objects
 */
export const getActiveUsers = (noteId) => {
  const provider = activeProviders.get(noteId);
  if (!provider || !provider.awareness) return [];

  const users = [];
  provider.awareness.getStates().forEach((state) => {
    if (state.user) {
      users.push(state.user);
    }
  });

  return users;
};
