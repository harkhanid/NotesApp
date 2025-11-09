import { useMemo,useEffect, useRef } from "react";
import { useEditor, EditorContent,EditorContext } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'

import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { WebrtcProvider } from "y-webrtc";

const ydoc = new Y.Doc();
const provider = new WebrtcProvider('my-document', ydoc);



const Editor = ({initialContent, onUpdate, id}) => {

  const editor = useEditor({
    onContentError: ({disableCollaboration}) =>{
      disableCollaboration()
    },
    onCreate: ({editor: currentEdtor}) => {
      provider.on('synced', (event) => {
        if (currentEditor.isEmpty) {
          currentEdtor.commands.setContent(initialContent);
        }
      });
    },
    extensions: [StarterKit,
    Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCursor.configure({
        provider: provider,
        user: {
          name: 'User ' + Math.floor(Math.random() * 100),
          color: '#' + Math.floor(Math.random()*16777215).toString(16),
        },     
      })],
  });
 
  useEffect(() => {
    if(editor){
      if(initialContent !== editor.getText()){
        editor.commands.setContent(initialContent)      
      }
    }
  }, [id, editor])

  const providerValue = useMemo(() => ({ editor }), [editor])

  return (
    <EditorContext.Provider value={providerValue}>
      <EditorContent editor={editor} />
    </EditorContext.Provider>
  );
};

export default Editor;
