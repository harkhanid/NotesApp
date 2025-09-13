import { useMemo,useEffect, useRef } from "react";
import { useEditor, EditorContent,EditorContext } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const Editor = ({initialContent, onUpdate, id}) => {

  const editor = useEditor({
    onUpdate: ({editor})=>{
      onUpdate(editor.getHTML(), id);
    },
    extensions: [StarterKit],
    content: initialContent,
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
