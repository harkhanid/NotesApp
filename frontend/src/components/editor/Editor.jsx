import { useMemo, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, EditorContext } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';

import {
  getOrCreateDocument,
  getOrCreateProvider,
  cleanupDocument
} from '../../utils/collaborationManager';
import authService from '../../Service/authService';
import './Editor.css';

const AUTOSAVE_DELAY_MS = 2000;

/**
 * Collaborative rich text editor component with real-time sync
 * @param {Object} props
 * @param {string} props.initialContent - Initial HTML content
 * @param {Function} props.onUpdate - Callback for content updates (html, noteId)
 * @param {string} props.id - Note ID
 * @param {Object} props.currentUser - Current user object with username, email, color
 */
const Editor = ({ initialContent, onUpdate, id: noteId, currentUser }) => {
  const [isCollaborationReady, setIsCollaborationReady] = useState(false);
  const ydocRef = useRef(null);
  const providerRef = useRef(null);
  const syncHandlerRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  // Initialize collaboration when noteId changes
  useEffect(() => {
    if (!noteId) return;

    const initCollaboration = async () => {
      try {
        const token = await authService.getWebSocketToken();

        if (!token) {
          console.error('Failed to get WebSocket token - collaboration disabled');
          return;
        }

        const doc = getOrCreateDocument(noteId);
        const prov = getOrCreateProvider(noteId, doc, {
          username: currentUser?.username || currentUser?.email || 'Anonymous',
          email: currentUser?.email || '',
          color: currentUser?.color || generateUserColor(currentUser?.email),
        }, token);

        ydocRef.current = doc;
        providerRef.current = prov;

        // Wait for provider to sync before enabling collaboration features
        prov.on('synced', () => {
          setIsCollaborationReady(true);
        });
      } catch (error) {
        console.error('Failed to initialize collaboration:', error);
      }
    };

    initCollaboration();

    return () => {
      cleanupDocument(noteId);
      ydocRef.current = null;
      providerRef.current = null;
      setIsCollaborationReady(false);
    };
  }, [noteId, currentUser?.email, currentUser?.username]);

  const editor = useEditor({
    editable: true,
    onContentError: ({ disableCollaboration }) => {
      console.error('Collaboration error occurred');
      disableCollaboration();
    },
    onCreate: ({ editor: currentEditor }) => {
      // Set initial content if editor is empty
      if (initialContent && currentEditor.isEmpty) {
        currentEditor.commands.setContent(initialContent);
      }

      // Handle sync event for subsequent content loading
      if (providerRef.current) {
        syncHandlerRef.current = () => {
          if (currentEditor.isEmpty && initialContent) {
            currentEditor.commands.setContent(initialContent);
          }
        };
        providerRef.current.on('synced', syncHandlerRef.current);
      }
    },
    onUpdate: ({ editor: currentEditor }) => {
      // Clear previous autosave timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Debounced autosave to database
      saveTimeoutRef.current = setTimeout(async () => {
        const html = currentEditor.getHTML();

        try {
          if (onUpdate && noteId) {
            onUpdate(html, noteId);
          }
        } catch (error) {
          console.error('Autosave failed:', error);
        }
      }, AUTOSAVE_DELAY_MS);
    },
    onDestroy: () => {
      if (providerRef.current && syncHandlerRef.current) {
        providerRef.current.off('synced', syncHandlerRef.current);
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    },
    extensions: (() => {
      if (isCollaborationReady && ydocRef.current && providerRef.current) {
        return [
          StarterKit.configure({
            history: false, // Yjs handles undo/redo
          }),
          Collaboration.configure({
            document: ydocRef.current,
          }),
          CollaborationCursor.configure({
            provider: providerRef.current,
            user: {
              name: currentUser?.username || currentUser?.email || 'Anonymous',
              email: currentUser?.email || '',
              color: currentUser?.color || generateUserColor(currentUser?.email),
            }
          })
        ];
      }

      // Fallback to basic extensions when collaboration is not ready
      return [
        StarterKit.configure({
          history: false,
        }),
      ];
    })(),
  }, [isCollaborationReady]);

  const providerValue = useMemo(() => ({ editor }), [editor]);

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <EditorContext.Provider value={providerValue}>
      <EditorContent editor={editor} />
    </EditorContext.Provider>
  );
};

/**
 * Generate a consistent color from email using hash
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

export default Editor;
