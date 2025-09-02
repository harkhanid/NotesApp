import { MENU } from "../constants/constants.js";

export const getAllNotes = (selectedPage) => {
  const listNotes = JSON.parse(localStorage.getItem("notes") || "[]");
  if (listNotes.length == 0) return listNotes; //empty notes

  if (MENU.ALL_NOTES == selectedPage)
    return listNotes.filter((note) => !note.archived);
  if (MENU.ARCHIEVD_NOTES == selectedPage)
    return listNotes.filter((note) => note.archived);
  //checking for notes with tags
  return listNotes
    .filter((note) => note.tags.includes(selectedPage))
    .map(({ content, ...rest }) => rest);
};

export const addNewNote = (note) => {
  const listNotes = JSON.parse(localStorage.getItem("notes") || "[]");
  listNotes.unshift(note);
  localStorage.setItem("notes", JSON.stringify(listNotes));
};

export const updateNote = (note) => {
  const listNotes = JSON.parse(localStorage.getItem("notes") || "[]");
  const newNoteList = listNotes.map((n) => (n.id == note.id ? note : n));
  localStorage.setItem("notes", JSON.stringify(newNoteList));
};

export const getNote = (id) => {
  const listNotes = JSON.parse(localStorage.getItem("notes") || "[]");
  return listNotes.filter((note) => note.id == id);
};
