import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import Text from "@tiptap/extension-text";
import { Document } from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Placeholder from "@tiptap/extension-placeholder";
import { Extension } from '@tiptap/core';

// Single-line document with paragraph
const SingleLineDocument = Document.extend({
  content: 'paragraph',
});

// Extension to handle comma input explicitly
const CommaSupport = Extension.create({
  name: 'commaSupport',

  addKeyboardShortcuts() {
    return {
      ',': () => {
        // Insert comma character
        this.editor.commands.insertContent(',');
        return true;
      },
      'Enter': () => {
        // Block Enter key
        return true;
      },
    };
  },
});

const TagEditor = ({ initialTags, onUpdate }) => {
  // Convert tags array to CSV string for display
  const tagsToCSV = (tags) => {
    return Array.isArray(tags) ? tags.join(", ") : "";
  };

  // Parse CSV string to tags array
  const csvToTags = (csvString) => {
    if (!csvString || csvString.trim() === "") return [];

    return csvString
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  };

  const editor = useEditor({
    extensions: [
      SingleLineDocument,
      Paragraph,
      Text,
      Placeholder.configure({
        placeholder: "Add tags (comma separated)...",
      }),
      CommaSupport,
    ],
    content: tagsToCSV(initialTags ),
    onBlur: ({ editor }) => {
      // Only parse and update when user stops editing
      const csvText = editor.getText();
      const tagsArray = csvToTags(csvText);
      onUpdate(tagsArray);
    },
  });

  useEffect(() => {
    if (editor) {
      const currentCSV = tagsToCSV(initialTags);
      const editorText = editor.getText();

      // Only update if the content has actually changed
      if (currentCSV !== editorText) {
        editor.commands.setContent(currentCSV);
      }
    }
  }, [initialTags, editor]);

  return <EditorContent editor={editor} />;
};

export default TagEditor;
