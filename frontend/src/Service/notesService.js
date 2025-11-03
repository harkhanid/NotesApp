const API_URL = "http://localhost:8080/api";

const getAllNotes = () => {
  return fetch(`${API_URL}/notes`, {
    method: "GET",
    credentials: "include",
  });
};

const getTags = () => {
  return fetch(`${API_URL}/tags`, {
    method: "GET",
    credentials: "include",
  });
};

const addNewNote = (note) => {
  const listNotes = JSON.parse(localStorage.getItem("notes") || "[]");
  listNotes.unshift(note);
  localStorage.setItem("notes", JSON.stringify(listNotes));
};

const updateNote = (note) => {
  const listNotes = JSON.parse(localStorage.getItem("notes") || "[]");
  console.log(listNotes, note);
  const newNoteList = listNotes.map((n) => (n.id == note.id ? note : n));
  localStorage.setItem("notes", JSON.stringify(newNoteList));
};

const getNote = (id) => {
  const listNotes = JSON.parse(localStorage.getItem("notes") || "[]");
  return listNotes.filter((note) => note.id == id);
};

const notesService = {
    getAllNotes,
    getTags,
    addNewNote,
    updateNote,
    getNote,
};

export default notesService;