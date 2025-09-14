import React, { useEffect, useState, useRef } from "react";
import { updateNote,updateANoteAsync,setCurrentNote, searchNotesAsync } from "../../store/notesSlice.js";
import { selectTag, setSearchNotes } from "../../store/uiSlice.js";
import { useDispatch, useSelector } from "react-redux";
import InnerSideBar from "../innerSideBar/InnerSideBar.jsx";
import HeadingEditor from "../editor/HeadingEditor.jsx";
import Editor from "../editor/Editor.jsx";

import SettingIcon from "../../assets/images/icon-settings.svg?react";
import ArchiveIcon from "../../assets/images/icon-archive.svg?react";
import DeleteIcon from "../../assets/images/icon-delete.svg?react";
import TagIcon from "../../assets/images/icon-tag.svg?react";
import ClockIcon from "../../assets/images/icon-clock.svg?react";
import LeftArrowIcon from "../../assets/images/icon-arrow-left.svg?react";

import "./MainPage.css";

const MainPage = () => {
  const dispatch = useDispatch();
  const currentFilter = useSelector((state) => state.ui.filter);
  const currentTag = useSelector((state)=> state.ui.selectedTag);
  const currentNoteId = useSelector((state)=> state.notes.currentId);
  const currentNote =  useSelector((state)=> currentNoteId == null ? null: state.notes.byId[currentNoteId]);
  let title = "";
  const timeoutNoteUpdateRef = useRef(null);
  const timeoutSearchUpdateRef = useRef(null);


  let preTitle= "";
  let displayBackPanel = false;
  switch(currentFilter){
    case "ALL":
      title="All Notes"
      break;
    case "ARCHIVED":
      console.log("Setting title to archived");
      title="Archived Notes"
      break;
    case "SEARCH":
      title="Search";
      break;
    case "TAG":
      if(currentTag.length > 0){
        displayBackPanel = true;
        preTitle="Notes tagged:";
        title=currentTag;
      }else{
        displayBackPanel = false;
        title="Tags";
      }
      break;
    default:
      title="";
  }

  /* Debounce Destoyer on unmounting */
  useEffect(()=>{
    return ()=>{
      if(timeoutNoteUpdateRef.current){
        clearTimeout(timeoutNoteUpdateRef.current);
        clearTimeout(timeoutNoteUpdateRef.current);
      }
    }
  },[]);


  /* Debounced Content Updater */
  const handleContentUpdate = (html,id) => {
    if (!currentNote) return;
    if (timeoutNoteUpdateRef.current) {
      clearTimeout(timeoutNoteUpdateRef.current);
    }
    timeoutNoteUpdateRef.current = setTimeout(() => {
      dispatch(updateNote({ ...currentNote, content: html, id: id }));
      dispatch(updateANoteAsync({ ...currentNote, content: html, id: id }))
    }, 1000); 
  };

 const handleKeyPress = (e) => {
  const value = e.target.value;
  dispatch(setSearchNotes({ query: value }));
  if (timeoutSearchUpdateRef.current) {
    clearTimeout(timeoutSearchUpdateRef.current);
  }
  timeoutSearchUpdateRef.current = setTimeout(() => {
    dispatch(searchNotesAsync(value)); // use fresh input
  }, 300);
};
  
  const toggleArchive = () => {
    dispatch(updateNote({...currentNote, archiveFlag: true}));
    dispatch(updateANoteAsync({ ...currentNote, archiveFlag: true }))

  }

  const updateTitle = (title) =>{
    dispatch(updateNote({...currentNote, title:title}));
    dispatch(updateANoteAsync({ ...currentNote, title:title }))
}

  
  

  return (
    <div className="main-page ">
      <div className={`main-page_header ${currentNoteId == null ? "mobile-show" : "mobile-hide" }`}>
        <div className={`tag-topbar mobile-topbar ${displayBackPanel? "" :"mobile-hide" }`}>
          <button className="btn-none goback-btn" onClick={()=>{dispatch(selectTag({tag:""}))}}><LeftArrowIcon /><span className="preset-5">Go Back</span></button>
        </div>
        <h2 className="header-title preset-1">{preTitle.length > 0 && <span className="pretitle">{preTitle}</span>}{title}</h2>
        {<div className={`header-tools split ${currentFilter == "SEARCH"? "mobile-show": "mobile-hide" }`}>        
          <input type="text" placeholder="Search by title, content or tags..." onChange={handleKeyPress} />
          <SettingIcon className="icon settings-icon mobile-hide" />
        </div>}
      </div>
      <InnerSideBar />
      <div className={`note-content flow-content ${currentNoteId == null ? "mobile-hide" : "mobile-show" }` }>
        <div className={`mobile-topbar ${currentNoteId == null ? "mobile-hide" :"" }`}>

          <button className="btn-none goback-btn" onClick={()=>{dispatch(setCurrentNote({id:null}))}}><LeftArrowIcon /><span className="preset-5">Go Back</span></button>
          <div className="top-bar-right">
            <button className="btn-none" onClick={toggleArchive}><ArchiveIcon /></button>
            <button className="btn-none"><DeleteIcon /></button>
          </div>
        </div>
        {/* <div className="full-width"></div> */}
        {currentNote && <>
        <HeadingEditor initialContent={currentNote.title} onUpdate={updateTitle} />
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
    
    <Editor initialContent={currentNote.content} onUpdate={handleContentUpdate} id={currentNoteId}/>
    </>}
      </div>
      <div className="right-sidebar flow-content">
        <button className="btn full-width split preset-4" onClick={toggleArchive}><ArchiveIcon /><p>Archieve Note</p></button>
        <button className="btn full-width split preset-4"><DeleteIcon /><p>Delete Note</p></button>
      </div>
    </div>
  );
};

export default MainPage;
