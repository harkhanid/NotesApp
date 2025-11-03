import { API_DOMAIN } from "../constants/constants.js";

const API_URL = `${API_DOMAIN}/api`;

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

const addNewNote = async (note) => {
  const response = await fetch(`${API_URL}/notes`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: note.title,
      content: note.content,
      tags: note.tags || [],
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create note: ${response.status}`);
  }

  return await response.json();
};

const updateNote = async (note) => {
  const response = await fetch(`${API_URL}/notes/${note.id}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: note.title,
      content: note.content,
      tags: note.tags || [],
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update note: ${response.status}`);
  }

  return await response.json();
};

const deleteNote = async (id) => {
  const response = await fetch(`${API_URL}/notes/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete note: ${response.status}`);
  }

  return { id };
};

const searchNotes = async (keyword) => {
  const response = await fetch(`${API_URL}/notes/search?keyword=${encodeURIComponent(keyword)}`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to search notes: ${response.status}`);
  }

  return await response.json();
};

const notesService = {
    getAllNotes,
    getTags,
    addNewNote,
    updateNote,
    deleteNote,
    searchNotes,
};

export default notesService;