import React,{useState, useEffect} from 'react'
import { getAllNotes, addNewNote, updateNote, getNote} from "../../Service/notesService.js";
import { MENU } from '../../constants/constants';
import { v4 as uuidv4 } from 'uuid';
const InnerSideBar = ({selectedPage, setcurrentNote, currentNote}) => {
  const [emptyMessage, setEmptyMessage] = useState("");
  const [notesList, setNotesList] = useState([]);
  useEffect(()=>{
    const listNotes= getAllNotes(selectedPage);
    setNotesList(listNotes);
    
    //setting the latest note as current note
    if(listNotes.length > 0){
      const current = getNote(listNotes[0].id)[0];
      setcurrentNote(current);
    }

    if(selectedPage == MENU.ALL_NOTES){
      setEmptyMessage("You don’t have any notes yet. Start a new note to capture your thoughts and ideas.");
    }else if(selectedPage == MENU.ARCHIEVD_NOTES){
      setEmptyMessage("No notes have been archived yet. Move notes here for safekeeping, or create a new note.")
    }
  },[selectedPage])


  const createNewNote = () =>{
    const newNote = {
      id: uuidv4(),
      title:"",
      archiveFlag: false,
      tags:[],
      date: Date.now(),
      content:"<p>Your content go here</p>"
    }
    setNotesList((prev)=>([newNote,...prev]));
    setcurrentNote(newNote);
    addNewNote(newNote);
  }

  const EmptyDialog = () => 
    <div className="note-item">
      <p className="preset-5">{emptyMessage}</p>
    </div>;


  return (
    <div className="inner-sidebar flow-content">
      <div className="notes-add">
        <button className="btn btn-primary full-width preset-4 center" onClick={createNewNote}>+ Create new Note</button>
      </div>
      <div className="notes-list flow-content xxs-spacer">
          { 
            notesList.length == 0 ? <EmptyDialog />:
            notesList.map((note)=> (         
              <div key={note.id} className={`note-item flow-content xsm-spacer ${note.id== currentNote?.id ?"selected":""}`}>
                <p className="preset-3">{note.title || "Untitled Note"}</p>
                {note.tags.length > 0 && 
                <div className="note-tags split">
                  {
                    note.tags.map((tag) =>(
                      <span className="tag preset-6">{tag}</span>
                    ))
                  }
                  </div>}
                <p className="preset-6">29 OCT 2025</p>
              </div>
              )
            )
          }
      </div>
    </div>
  )
}

export default InnerSideBar