import React, { useEffect, useState, useCallback, useRef } from "react";
import SettingIcon from "../../assets/images/icon-settings.svg?react";
import ArchiveIcon from "../../assets/images/icon-archive.svg?react";
import DeleteIcon from "../../assets/images/icon-delete.svg?react";
import TagIcon from "../../assets/images/icon-tag.svg?react";
import ClockIcon from "../../assets/images/icon-clock.svg?react";
import Editor from "../editor/Editor.jsx";
import { MENU } from "../../constants/constants.js";

import "./MainPage.css";
import InnerSideBar from "../innerSideBar/InnerSideBar.jsx";
const MainPage = ({selectedPage}) => {
  const [currentNote, setcurrentNote] = useState(null);
  const [content, setContent] = useState();
  const [title, setTitle] = useState({title:"",preTitle:""});

  useEffect(()=>{
    setFakeText();
    if(selectedPage == MENU.ALL_NOTES){
      setTitle({preTitle:"", title:selectedPage});
    }else if(selectedPage == MENU.ARCHIEVD_NOTES){
      setTitle({preTitle:"", title:selectedPage});
    }else{
      const splitText = selectedPage.split(":");
      if(splitText[0] == "Tag"){
        setTitle({preTitle:"Tag selected:", title:splitText[1]});
      }
    }
  },[selectedPage]);

  const setFakeText = () =>{
    const newNote = {
      id: uuidv4(),
      title:"",
      archiveFlag: false,
      tags:[],
      date: Date.now(),
      content:"<p>Your content go here</p>"
    }
    setcurrentNote(newNote);
  }

  const toggleArchive = () => {
    setcurrentNote(prev => {
      const updatedNote = { ...prev, archiveFlag: !prev.archiveFlag }
      setNotesList(list =>
        list.map(note =>
          note.id === updatedNote.id ? updatedNote : note
        )
      )
      return updatedNote
    })
  }

  const handleContentUpdate = (html) =>{
    console.log(html);
    setContent(html);
  }
  
  const NoteContent = () =>
  <>
    <h2>Note Title</h2>
    <div className="note-metadata preset-5 flow-content xxs-spacer">
      <div className="split">
        <div className="split metadata_key">
          <TagIcon className="icon"/>
          <p className="">Tags</p>
        </div>
        <p className="">{currentNote?.tags?.join(", ")}</p>
      </div>
      <div className="split">
        <div className="split metadata_key">
          <ClockIcon className="icon"/>
          <p className="">Created At</p>
          </div>
        <p className="">29 OCT 2025</p>
      </div>
    </div>
    <hr />
    
    <Editor initialContent={content} onUpdate={handleContentUpdate} />
    </>;
 
  return (
    <div className="main-page">
      <div className="main-page_header">
        <h2 className="header-title preset-1">{title.preTitle.length > 0 && <span className="pretitle">{title.preTitle}</span>}{title.title}</h2>
        <div className="header-tools split">        
          <input type="text" placeholder="Search by title, content or tags..." />
          <SettingIcon className="icon settings-icon" />
        </div>
      </div>
      <InnerSideBar selectedPage={selectedPage} setcurrentNote={setcurrentNote} currentNote={currentNote} />
      <div className="note-content flow-content">
        <div className="full-width"></div>
        {currentNote && <NoteContent />}
      </div>
      <div className="right-sidebar flow-content">
        <button className="btn full-width split preset-4" onClick={toggleArchive}><ArchiveIcon /><p>Archieve Note</p></button>
        <button className="btn full-width split preset-4"><DeleteIcon /><p>Delete Note</p></button>
      </div>
    </div>
  );
};

export default MainPage;
