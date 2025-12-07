import apiClient, { api, API_URL } from "../utils/apiClient.js";

const getAllNotes = () => {
  return api.get(`${API_URL}/notes`);
};

const getTags = () => {
  return api.get(`${API_URL}/tags`);
};

const addNewNote = async (note) => {
  const response = await api.post(`${API_URL}/notes`, {
    title: note.title,
    content: note.content,
    tags: note.tags || [],
  });

  if (!response.ok) {
    throw new Error(`Failed to create note: ${response.status}`);
  }

  return await response.json();
};

const updateNote = async (note) => {
  const response = await api.put(`${API_URL}/notes/${note.id}`, {
    title: note.title,
    content: note.content,
    tags: note.tags || [],
  });

  if (!response.ok) {
    throw new Error(`Failed to update note: ${response.status}`);
  }

  return await response.json();
};

const deleteNote = async (id) => {
  const response = await api.delete(`${API_URL}/notes/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to delete note: ${response.status}`);
  }

  return { id };
};

const searchNotes = async (keyword) => {
  const response = await api.get(`${API_URL}/notes/search?keyword=${encodeURIComponent(keyword)}`);

  if (!response.ok) {
    throw new Error(`Failed to search notes: ${response.status}`);
  }

  return await response.json();
};

const shareNote = async (noteId, emails) => {
  const response = await api.post(`${API_URL}/notes/${noteId}/share`, { emails });

  if (!response.ok) {
    throw new Error(`Failed to share note: ${response.status}`);
  }

  return await response.json();
};

const removeCollaborator = async (noteId, email) => {
  const response = await api.delete(`${API_URL}/notes/${noteId}/collaborators/${encodeURIComponent(email)}`);

  if (!response.ok) {
    throw new Error(`Failed to remove collaborator: ${response.status}`);
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
    shareNote,
    removeCollaborator,
};

export default notesService;