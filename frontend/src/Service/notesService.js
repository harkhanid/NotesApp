import { MENU } from "../constants/constants.js";
import { API_DOMAIN } from "../constants/constants";
const NOTES_URL = API_DOMAIN + "/notes/";

// Method: Get all notes from local storage
// Input: selectedPage - page to filter notes
// Output format: [{id, title, content, tags, date, archived}, ...]

export const getAllNotes = async (selectedPage) => {
  const listNotes = JSON.parse(localStorage.getItem("notes") || "[]");
  const response = await fetch(NOTES_URL, {
    method: "GET",
    credentials: "include",
  });
  const jsonData = await response.json();
  return jsonData;
};

export const addNewNote = (note) => {
  const listNotes = JSON.parse(localStorage.getItem("notes") || "[]");
  listNotes.unshift(note);
  localStorage.setItem("notes", JSON.stringify(listNotes));
};

export const updateNote = (note) => {
  const listNotes = JSON.parse(localStorage.getItem("notes") || "[]");
  console.log(listNotes, note);
  const newNoteList = listNotes.map((n) => (n.id == note.id ? note : n));
  localStorage.setItem("notes", JSON.stringify(newNoteList));
};

export const getNote = (id) => {
  const listNotes = JSON.parse(localStorage.getItem("notes") || "[]");
  return listNotes.filter((note) => note.id == id);
};
