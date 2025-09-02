import Editor from '../editor/Editor';
import React, { useState } from 'react'

const Demio = () => {
  const [text, setText] = useState("this isn demo");
  const onchange = (html) =>{
    setText(html);
    console.log(html);
  }
  return (
   <Editor initialContent={text} onUpdate={onchange} />
  )
}

export default Demio