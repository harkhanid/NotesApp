import React,{useState, useEffect} from 'react'
import { addNewNote} from "../../Service/notesService.js";
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentNote, addAnote } from "../../store/notesSlice.js";
import PlusIcon from "../../assets/images/icon-plus.svg?react";

import {motion, Reorder} from "framer-motion";
import "./InnerSideBar.css";

const InnerSideBar = () => {
  const dispatch  = useDispatch();
  const currentNoteId = useSelector((state)=> state.notes.currentId);
  const currentFilter = useSelector((state) => state.ui.filter);
  const allNotesList = useSelector((state)=> state.notes.allIds.map((id)=> state.notes.byId[id]));
  let notesList=[];
  let emptyMessage;

  switch(currentFilter){
    case "ALL":
      emptyMessage = "You don’t have any notes yet. Start a new note to capture your thoughts and ideas.";
      notesList = allNotesList.filter((note)=> !note.archiveFlag);
      break;
    case "ARCHIVED":
      emptyMessage="No notes have been archived yet. Move notes here for safekeeping, or create a new note.";
      notesList = allNotesList.filter((note)=> note.archiveFlag);
      console.log(allNotesList, notesList);
      break;
    default:
      emptyMessage="";
  }

  const createNewNote = () =>{
    const newNote = {
      title:"",
      archiveFlag: false,
      tags:[],
      date: Date.now(),
      content:""
    }
    const addNote = addAnote(newNote);
    dispatch(addNote);
    dispatch(setCurrentNote({id: addNote.payload.id}));

  }

  const selectNote = (id) =>{
    console.log("dispatching from onClick:" ,id);
    if(id != currentNoteId){
      dispatch(setCurrentNote({id:id}));
    }
  }

  const EmptyDialog = () => 
    <div className="note-item">
      <p className="preset-5">{emptyMessage}</p>
    </div>;

  console.log("Rendering innersidebar",  currentNoteId);

  return (
    <div className={`inner-sidebar ${currentNoteId == null ? "mobile-show" : "mobile-hide" }` } >
      <div className="notes-add">
        <button className="btn btn-primary full-width preset-4 center" onClick={createNewNote}><PlusIcon /> <span>Create new Note</span></button>
      </div>
      <div className="notes-list  xxs-spacer">
        { 
          notesList.length == 0 ? <EmptyDialog />:
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
        exit={{ opacity: 0, scale: 0.95 }} onClick={()=>{selectNote(note.id)}} className={`note-item flow-content xsm-spacer ${note.id== currentNoteId ?"selected":""}`}>
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
        }
            
      </div>
    </div>
  )
}
export default InnerSideBar