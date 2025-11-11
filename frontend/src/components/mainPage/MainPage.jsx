import React, { useEffect, useState, useRef } from "react";
import { updateNote,updateANoteAsync,setCurrentNote, searchNotesAsync, deleteNote, deleteNoteAsync, getTagsAsync, fetchAllNotesAsync } from "../../store/notesSlice.js";
import { updateFilter,selectTag, setSearchNotes } from "../../store/uiSlice.js";

import { useDispatch, useSelector } from "react-redux";
import InnerSideBar from "../innerSideBar/InnerSideBar.jsx";
import HeadingEditor from "../editor/HeadingEditor.jsx";
import Editor from "../editor/Editor.jsx";
import TagEditor from "../editor/TagEditor.jsx";
import SettingsBar from "../settingsBar/SettingsBar.jsx";
import ShareModal from "../shareModal/ShareModal.jsx";
import notesService from "../../Service/notesService.js";
import SettingIcon from "../../assets/images/icon-settings.svg?react";
import ArchiveIcon from "../../assets/images/icon-archive.svg?react";
import DeleteIcon from "../../assets/images/icon-delete.svg?react";
import TagIcon from "../../assets/images/icon-tag.svg?react";
import ClockIcon from "../../assets/images/icon-clock.svg?react";
import LeftArrowIcon from "../../assets/images/icon-arrow-left.svg?react";
import ShareIcon from "../../assets/images/icon-share.svg?react";

import "./MainPage.css";

const MainPage = () => {
  const dispatch = useDispatch();
  const currentFilter = useSelector((state) => state.ui.filter);
  const currentTag = useSelector((state)=> state.ui.selectedTag);
  const currentNoteId = useSelector((state)=> state.notes.currentId);
  const currentNote =  useSelector((state)=> currentNoteId == null ? null: state.notes.byId[currentNoteId]);
  const currentUser = useSelector((state) => state.auth.user);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  let title = "";
  const timeoutNoteUpdateRef = useRef(null);
  const timeoutSearchUpdateRef = useRef(null);
  const timeoutTagUpdateRef = useRef(null);

  let preTitle= "";
  let displayBackPanel = false;
  switch(currentFilter){
    case "ALL":
      title="All Notes"
      break;
    case "ARCHIVED":
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
    case "SETTINGS":
      title="Settings";
      break;
    default:
      title="";
  }
  console.log("Current Note:", currentFilter);
  /* Debounce Destroyer on unmounting */
  useEffect(()=>{
    return ()=>{
      if(timeoutNoteUpdateRef.current){
        clearTimeout(timeoutNoteUpdateRef.current);
      }
      if(timeoutTagUpdateRef.current){
        clearTimeout(timeoutTagUpdateRef.current);
      }
    }
  },[]);


  /* Debounced Content Updater */
  const handleContentUpdate = (html,id) => {
    if (!currentNote) return;
    if (timeoutNoteUpdateRef.current) {
      clearTimeout(timeoutNoteUpdateRef.current);
    }
    const previousNote = { ...currentNote };
    const updatedNote = { ...currentNote, content: html, id: id };
    timeoutNoteUpdateRef.current = setTimeout(() => {
      dispatch(updateNote(updatedNote));
      dispatch(updateANoteAsync({ note: updatedNote, previousNote }))
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
    const previousNote = { ...currentNote };
    const updatedNote = {...currentNote, archiveFlag: true};
    dispatch(updateNote(updatedNote));
    dispatch(updateANoteAsync({ note: updatedNote, previousNote }))
  }

  const updateTitle = (title) =>{
    const previousNote = { ...currentNote };
    const updatedNote = {...currentNote, title:title};
    dispatch(updateNote(updatedNote));
    dispatch(updateANoteAsync({ note: updatedNote, previousNote }))
  }

  const handleTagsUpdate = (tags) => {
    if (!currentNote) return;
    if (timeoutTagUpdateRef.current) {
      clearTimeout(timeoutTagUpdateRef.current);
    }
    // Optimistic update - update Redux state immediately
    const previousNote = { ...currentNote };
    const updatedNote = { ...currentNote, tags: tags };
    dispatch(updateNote(updatedNote));

    // Debounced API call
    timeoutTagUpdateRef.current = setTimeout(async () => {
      await dispatch(updateANoteAsync({ note: updatedNote, previousNote }));
      // Refresh tags list after updating note
      dispatch(getTagsAsync());
    }, 500);
  }

  const handleDelete = () => {
    if (!currentNote) return;
    const noteData = { ...currentNote };
    // Optimistic delete
    dispatch(deleteNote({ id: currentNoteId }));
    dispatch(setCurrentNote({ id: null }));
    // Background API call
    dispatch(deleteNoteAsync({ id: currentNoteId, noteData }));
  }

  const handleShare = async (emails) => {
    if (!currentNote) return;
    try {
      await notesService.shareNote(currentNoteId, emails);
      // Refresh the notes list to get updated sharedWith data
      dispatch(fetchAllNotesAsync());
    } catch (error) {
      console.error("Failed to share note:", error);
      throw error;
    }
  }

  const handleRemoveCollaborator = async (email) => {
    if (!currentNote) return;
    try {
      await notesService.removeCollaborator(currentNoteId, email);
      // Refresh the notes list to get updated sharedWith data
      dispatch(fetchAllNotesAsync());
    } catch (error) {
      console.error("Failed to remove collaborator:", error);
      throw error;
    }
  }

  
  

  return (
    <div className="main-page ">
      <div className={`main-page_header ${currentNoteId == null ? "" : "mobile-hide-flex" }`}>
        <div className={`tag-topbar mobile-topbar ${displayBackPanel? "" :"mobile-hide" }`}>
          <button className="btn-none goback-btn" onClick={()=>{dispatch(selectTag({tag:""}))}}><LeftArrowIcon /><span className="preset-5">Go Back</span></button>
        </div>
        <h2 className="header-title preset-1">{preTitle.length > 0 && <span className="pretitle">{preTitle}</span>}{title}</h2>
        {<div className={`header-tools split ${currentFilter == "SEARCH"? "": "mobile-hide" }`}>        
          <input type="text" placeholder="Search by title, content or tags..." onChange={handleKeyPress} />
          <SettingIcon onClick={()=>{dispatch(updateFilter({filter:"SETTINGS"}))}} className="icon settings-icon mobile-hide" />
        </div>}
      </div>
      {
        currentFilter == "SETTINGS" ? 
        <>
          <SettingsBar />
          
        </>:
        <>
          <InnerSideBar />
          <div className={`note-content flow-content ${currentNoteId == null ? "mobile-hide" : "" }` }>
            <div className={`mobile-topbar ${currentNoteId == null ? "mobile-hide" :"" }`}>
              <button className="btn-none goback-btn" onClick={()=>{dispatch(setCurrentNote({id:null}))}}><LeftArrowIcon /><span className="preset-5">Go Back</span></button>
              <div className="top-bar-right">
                <button className="btn-none" onClick={() => setIsShareModalOpen(true)}><ShareIcon /></button>
                <button className="btn-none" onClick={toggleArchive}><ArchiveIcon /></button>
                <button className="btn-none" onClick={handleDelete}><DeleteIcon /></button>
              </div>
            </div>
            {currentNote &&
            <>
              <HeadingEditor initialContent={currentNote.title} onUpdate={updateTitle} />
                <div className="note-metadata preset-5 flow-content xxs-spacer">
                  <div className="split">
                    <div className="split metadata_key">
                      <TagIcon className="icon"/>
                      <p className="">Tags</p>
                    </div>
                    <div className="tags-input-wrapper">
                      <TagEditor initialTags={currentNote.tags} onUpdate={handleTagsUpdate} />
                    </div>
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
                <Editor key={currentNoteId} initialContent={currentNote.content} onUpdate={handleContentUpdate} id={currentNoteId} currentUser={currentUser} />
            </>
            }
          </div>
        </>
      }
      {currentNoteId !== null && currentFilter !== "SETTINGS" && (
        <div className="right-sidebar flow-content">
          <button className="btn full-width split preset-4" onClick={() => setIsShareModalOpen(true)}><ShareIcon /><p>Share Note</p></button>
          <button className="btn full-width split preset-4" onClick={toggleArchive}><ArchiveIcon /><p>Archieve Note</p></button>
          <button className="btn full-width split preset-4" onClick={handleDelete}><DeleteIcon /><p>Delete Note</p></button>
        </div>
      )}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        note={currentNote}
        onShare={handleShare}
        onRemoveCollaborator={handleRemoveCollaborator}
      />
    </div>
  );
};

export default MainPage;
