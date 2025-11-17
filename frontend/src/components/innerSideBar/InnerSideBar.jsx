import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {motion, Reorder} from "framer-motion";

import PlusIcon from "../../assets/images/icon-plus.svg?react";
import TagIcon from "../../assets/images/icon-tag.svg?react";

import { setCurrentNote, addAnote, addAnoteAsync} from "../../store/notesSlice.js";
import { selectTag } from "../../store/uiSlice";

import "./InnerSideBar.css";


const InnerSideBar = () => {
  const dispatch  = useDispatch();
  const currentNoteId = useSelector((state)=> state.notes.currentId);
  const queryFromStore = useSelector((state)=> state.ui.searchQuery);
  const currentFilter = useSelector((state) => state.ui.filter);
  const allNotesList = useSelector((state)=> state.notes.allIds.map((id)=> state.notes.byId[id]));
  const searchIds = useSelector((state)=> state.notes.searchIds);
  const tagFromStore = useSelector((state)=> state.ui.selectedTag);
  const tags = useSelector((state)=> state.notes.tags);
  
  let notesList=[];
  let emptyMessage = "";
  let descritionMessage=null;

  switch(currentFilter){
    case "ALL":
      emptyMessage = "You don’t have any notes yet. Start a new note to capture your thoughts and ideas.";
      notesList = allNotesList.filter((note)=> !note.archiveFlag);
      break;
    case "ARCHIVED":
      emptyMessage="No notes have been archived yet. Move notes here for safekeeping, or create a new note.";
      descritionMessage= "All your archived notes are stored here. You can restore or delete them anytime.";
      notesList = allNotesList.filter((note)=> note.archiveFlag);
      break;
    case "SEARCH":
      if(queryFromStore.length > 0){
        if(searchIds.length == 0){
          emptyMessage = "No notes match your search criteria. Try adjusting your keywords or filters to find what you're looking for.";
        }else{
          descritionMessage= `Showing results for "${queryFromStore}"`;
        }
      }
      notesList = allNotesList.filter((note)=> searchIds.includes(note.id));
      break;
    case "TAG":
      if(tagFromStore.length > 0){
        notesList = allNotesList.filter((note)=> note.tags.includes(tagFromStore));
      }

    default:
      emptyMessage="";
  }

  // Auto-select first note on desktop when filter changes
  useEffect(() => {
    // Skip auto-selection for SETTINGS view
    if (currentFilter === "SETTINGS") return;

    // Check if we're on desktop view (768px is common mobile breakpoint)
    const isDesktop = window.innerWidth >= 768;

    if (isDesktop) {
      if (notesList.length > 0) {
        // Check if current note is in the filtered list
        const currentNoteInList = notesList.some(note => note.id === currentNoteId);

        // If current note is not in the filtered list (or no note selected), select first note
        if (!currentNoteInList) {
          dispatch(setCurrentNote({ id: notesList[0].id }));
        }
      } else {
        // No notes in the list, clear selection
        if (currentNoteId !== null) {
          dispatch(setCurrentNote({ id: null }));
        }
      }
    }
  }, [currentFilter, tagFromStore, searchIds, currentNoteId, dispatch]);

  const createNewNote = () =>{
    const newNote = {
      title:"",
      archiveFlag: false,
      tags:[],
      date: Date.now(),
      content:""
    }
    const addNote = addAnote(newNote);
    const tempId = addNote.payload.id;
    dispatch(addNote);
    dispatch(setCurrentNote({id: tempId}));
    dispatch(addAnoteAsync({ note: addNote.payload, tempId }));
  }
  const setTag = (tag)=>{
      dispatch(selectTag({tag}));
    }

  const selectNote = (id) =>{
    if(id != currentNoteId){
      dispatch(setCurrentNote({id:id}));
    }
  }

  return (
    <div className={`inner-sidebar ${currentNoteId == null ? "" : "mobile-hide" }` } >
      {tagFromStore.length == 0 && currentFilter == "TAG" &&
      <ul className="tags-list flow-content xxs-spacer">
        {
          tags.map((tag)=> <li key={tag}onClick={()=>{setTag(tag)}}  className={`tag-item sidebar-item`}><TagIcon className="tag-icon icon" /><span>{tag}</span></li>)
        }
      </ul>
      }
      <div className="notes-add">
        <button className="btn btn-primary full-width preset-4 center" onClick={createNewNote}><PlusIcon /> <span>Create new Note</span></button>
      </div>
      <div className="notes-list  xxs-spacer">
        { 
          notesList.length == 0 && emptyMessage.length > 0? 
          <div className="note-item">
            <p className="preset-5">{emptyMessage}</p>
          </div>:
          notesList.length > 0 && 
          <>
          <p className='preset-5'>{descritionMessage}</p>
          <Reorder.Group
            axis="y"
            values={notesList}
            onReorder={() => {}}
          >
            {notesList.map((note) => (   
              <Reorder.Item key={note.id} value={note}>      
                <motion.div layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }} onClick={()=>{selectNote(note.id)}} className={`note-item flow-content xsm-spacer ${note.id== currentNoteId ?"selected":""}`}
                >
                  <p className="preset-3">{note.title || "New Note"}</p>
                  <div className="note-tags split">
                    { note.tags.length == 0 ? <span className='preset-6 tags-placeholder'>No Tags</span>:
                      note.tags.map((tag) =>(
                        <span className="tag preset-6">{tag}</span>
                      ))
                    }
                    </div>
                  <p className="preset-6">{new Date(note.date).toLocaleDateString()}</p>
                </motion.div>
              </Reorder.Item>
              )
            )
            }
          </Reorder.Group>
          </>
        }
            
      </div>
    </div>
  )
}
export default InnerSideBar