import { useMemo,useEffect, useRef } from "react";
import { useEditor, EditorContent,EditorContext } from "@tiptap/react";
import Text from "@tiptap/extension-text"
import Heading from '@tiptap/extension-heading';
import { Document } from '@tiptap/extension-document'


const CustomDocument = Document.extend({ content: "heading" });

const HeadingEditor = ({initialContent, onUpdate}) => {
  const editor = useEditor({
    onUpdate: ({editor})=>{
      onUpdate(editor.getText());
    },
    extensions: [CustomDocument,Text,Heading.configure({
      levels: [2],
    })],
    content: initialContent,
  });

  useEffect(() => {
    if(editor){
      if(initialContent !== editor.getText()){
        editor.commands.setContent(initialContent)      
      }else if (editor && initialContent == "") {
        editor.commands.focus("end") 
      }
    }
  }, [initialContent, editor])

  if (!editor) return null
  return (
      <EditorContent editor={editor} />
  );
};

export default HeadingEditor;

// import { useEditor, EditorContent } from "@tiptap/react"
// import { Document } from "@tiptap/extension-document"
// import Heading from "@tiptap/extension-heading"

// // Only allow a single heading node
// const CustomDocument = Document.extend({
//   content: "heading",
// })

// export default function HeadingEditor({ initialContent, onUpdate }) {
//   const editor = useEditor({
//     extensions: [
//       CustomDocument,
//       Text,
//       Heading.configure({
//         levels: [2], // only allow <h2>
//       }),
//     ],
//     content: initialContent || "<h2>Your title</h2>",
//     onUpdate: ({ editor }) => {
//       onUpdate?.(editor.getText()) // plain text output
//     },
//   })

//   if (!editor) return null

//   return (
//     <EditorContent
//       editor={editor}
//       className="focus:outline-none cursor-text"
//     />
//   )
// }