import { useMemo, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, EditorContext } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'

import {
  getOrCreateDocument,
  getOrCreateProvider,
  cleanupDocument
} from '../../utils/collaborationManager';
import authService from '../../Service/authService';
import './Editor.css';

const Editor = ({ initialContent, onUpdate, id: noteId, currentUser }) => {
  const [isCollaborationReady, setIsCollaborationReady] = useState(false);
  const ydocRef = useRef(null);
  const providerRef = useRef(null);
  const syncHandlerRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  // Initialize collaboration ONCE per noteId
  useEffect(() => {
    if (!noteId) return;

    const initCollaboration = async () => {
      console.log('🔧 Initializing collaboration for note:', noteId);

      // Fetch JWT token for WebSocket authentication
      const token = await authService.getWebSocketToken();

      if (!token) {
        console.error('❌ Failed to get WebSocket token - collaboration disabled');
        return;
      }

      // Create Yjs document and provider with token
      const doc = getOrCreateDocument(noteId);
      const prov = getOrCreateProvider(noteId, doc, {
        username: currentUser?.username || currentUser?.email || 'Anonymous',
        email: currentUser?.email || '',
        color: currentUser?.color || generateUserColor(currentUser?.email),
      }, token); // Pass token to provider

      ydocRef.current = doc;
      providerRef.current = prov;

      // Wait for provider to connect and sync before initializing editor
      // This ensures the awareness and collaboration are ready
      prov.on('synced', () => {
        console.log('✅ Provider synced - collaboration fully ready');
        setIsCollaborationReady(true);
      });

      prov.on('status', ({ status }) => {
        console.log('📡 Provider status:', status);
        if (status === 'connected') {
          console.log('🔗 Provider connected to server');
        }
      });
    };

    initCollaboration();

    // Cleanup on unmount or note change
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
      console.log('📝 Editor created');
      console.log('📝 Extensions loaded:', currentEditor.extensionManager.extensions.map(e => e.name));

      const hasCursor = currentEditor.extensionManager.extensions.some(e => e.name === 'collaborationCursor');
      console.log('🖱️ CollaborationCursor extension loaded:', hasCursor);

      if (initialContent && currentEditor.isEmpty) {
        console.log('📄 Setting initial content on create');
        currentEditor.commands.setContent(initialContent);
      }

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
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Debounce save - wait 2 seconds after last change
      saveTimeoutRef.current = setTimeout(async () => {
        const html = currentEditor.getHTML();
        console.log('💾 Autosaving note to database...', { noteId });

        try {
          if (onUpdate && noteId) {
            onUpdate(html, noteId);
            console.log('✅ Autosave successful');
          } else {
            console.error('❌ Cannot autosave: missing noteId or onUpdate callback');
          }
        } catch (error) {
          console.error('❌ Autosave failed:', error);
        }
      }, 2000); // 2 second debounce
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
        const cursorConfig = {
          provider: providerRef.current,
          user: {
            name: currentUser?.username || currentUser?.email || 'Anonymous',
            email: currentUser?.email || '',
            color: currentUser?.color || generateUserColor(currentUser?.email),
          }
        };
        return [
          StarterKit.configure({
            history: false, // Yjs handles undo/redo
          }),
          Collaboration.configure({
            document: ydocRef.current,
          }),
          CollaborationCursor.configure(cursorConfig)
        ];
      } else {
        console.log('⚠️ Collaboration not ready - loading basic extensions only');
        return [
          StarterKit.configure({
            history: false,
          }),
        ];
      }
    })(),
  }, [isCollaborationReady]); // Recreate editor when collaboration is ready

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

// Helper function to generate consistent color from email
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
