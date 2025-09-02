import { useMemo,useEffect, useRef } from "react";
import { useEditor, EditorContent,EditorContext } from "@tiptap/react";
import { FloatingMenu, BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";

const Editor = ({initialContent, onUpdate}) => {
  const ref = useRef(0)
  
      useEffect(()=>{
        ref.current += 1;
        console.log("Rendering editor"+ ref.current)});

  const editor = useEditor({
    onUpdate: ({editor})=>{
      onUpdate(editor.getHTML());
    },
    extensions: [StarterKit],
    content: initialContent,
  });
 
  // useEffect(() => {
  //   if (editor) {
  //     editor.commands.setContent(`<p>${initialContent}</p>`);
  //   }
  // }, [noteId, editor]);

    // Memoize the provider value to avoid unnecessary re-renders
  const providerValue = useMemo(() => ({ editor }), [editor])

  return (
    <EditorContext.Provider value={providerValue}>
      <EditorContent editor={editor} />
    </EditorContext.Provider>
  );
};

export default Editor;
