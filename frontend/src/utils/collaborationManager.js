/**
 * Collaboration Manager
 * Manages Yjs document instances and Hocuspocus providers per note
 */

import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';

const HOCUSPOCUS_URL = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:1234';
const CONNECTION_TIMEOUT_MS = 30000;

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

  if (activeDocuments.has(noteId)) {
    return activeDocuments.get(noteId);
  }

  const ydoc = new Y.Doc();
  activeDocuments.set(noteId, ydoc);

  return ydoc;
};

/**
 * Get or create a Hocuspocus provider for a specific note
 * @param {string} noteId - The UUID of the note
 * @param {Y.Doc} ydoc - The Yjs document
 * @param {Object} user - User information { username, email, color }
 * @param {string} token - JWT token for authentication
 * @returns {HocuspocusProvider} The provider instance
 */
export const getOrCreateProvider = (noteId, ydoc, user, token) => {
  if (!noteId || !ydoc) {
    throw new Error('noteId and ydoc are required');
  }

  // Always create fresh providers to ensure authentication works properly
  if (activeProviders.has(noteId)) {
    const oldProvider = activeProviders.get(noteId);
    oldProvider.destroy();
    activeProviders.delete(noteId);
  }

  const roomName = `note-${noteId}`;
  const wsUrlWithToken = `${HOCUSPOCUS_URL}?token=${encodeURIComponent(token)}`;

  const provider = new HocuspocusProvider({
    url: wsUrlWithToken,
    name: roomName,
    document: ydoc,
    broadcast: true,
    timeout: CONNECTION_TIMEOUT_MS,
  });

  // Set user data in awareness
  if (provider.awareness) {
    provider.awareness.setLocalStateField('user', {
      name: user?.username || user?.email || 'Anonymous',
      email: user?.email || '',
      color: user?.color || generateUserColor(user?.email),
    });
  }

  activeProviders.set(noteId, provider);

  return provider;
};

/**
 * Clean up document and provider for a specific note
 * @param {string} noteId - The UUID of the note
 */
export const cleanupDocument = (noteId) => {
  if (!noteId) return;

  const provider = activeProviders.get(noteId);
  if (provider) {
    provider.destroy();
    activeProviders.delete(noteId);
  }

  const ydoc = activeDocuments.get(noteId);
  if (ydoc) {
    ydoc.destroy();
    activeDocuments.delete(noteId);
  }
};

/**
 * Clean up all active documents and providers
 */
export const cleanupAllDocuments = () => {
  activeProviders.forEach((provider) => {
    provider.destroy();
  });
  activeProviders.clear();

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
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  }

  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }

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
