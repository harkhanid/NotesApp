import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getAllNotes,
  updateNote as UpdateNoteLocalStorage,
  addNewNote as addNoteLocalStorage,
} from "../Service/notesService";
const initialState = {
  byId: {},
  allIds: [],
  searchIds: [],
  currentId: null,
  tags: ["Cooking", "Fitness"],
};

export const fetchAllNotesAsync = createAsyncThunk(
  "notes/fetchAllnotesAsync",
  async () => {
    return getAllNotes();
  }
);

export const searchNotesAsync = createAsyncThunk(
  "notes/searchNotesAsync",
  async (query) => {
    console.log("Searching for:", query);
    const allNotes = getAllNotes();
    return allNotes
      .filter((note) => {
        if (!query || query.length == 0) return false;
        const q = query.toLowerCase();
        return (
          note.title.toLowerCase().includes(q) ||
          note.content.toLowerCase().includes(q) ||
          note.tags.some((tag) => tag.toLowerCase().includes(q))
        );
      })
      .map((note) => note.id);
  }
);

export const updateANoteAsync = createAsyncThunk(
  "notes/updateANoteAsync",
  async (note) => {
    return UpdateNoteLocalStorage(note);
  }
);

export const addAnoteAsync = createAsyncThunk(
  "notes/addAnoteAsync",
  async (note) => {
    return addNoteLocalStorage(note);
  }
);

export const notesSlice = createSlice({
  name: "notes",
  initialState: initialState,
  reducers: {
    addAnote: {
      reducer: (state, action) => {
        const { id } = action.payload;
        state.byId[id] = action.payload;
        state.allIds.unshift(id);
      },
      prepare: (note) => {
        return {
          payload: { ...note, id: "temp-" + Date.now() },
        };
      },
    },
    updateNote: (state, action) => {
      const { id } = action.payload;
      state.byId[id] = action.payload;
      state.allIds = state.allIds.filter((nid) => nid != id);
      state.allIds.unshift(id);
    },
    deleteNote: (state, action) => {
      const { id } = action.payload;
      state.allIds = state.allIds.filter((nid) => nid != id);
    },
    setCurrentNote: (state, action) => {
      const { id } = action.payload;
      state.currentId = id;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllNotesAsync.fulfilled, (state, action) => {
        const notes = action.payload;
        state.byId = {};
        state.allIds = [];
        notes.forEach((note) => {
          state.byId[note.id] = note;
          state.allIds.push(note.id);
        });
        // if (notes.length > 0 && state.currentId == null) {
        //   state.currentId = notes[0].id;
        // }
      })
      .addCase(searchNotesAsync.fulfilled, (state, action) => {
        const searchIds = action.payload;
        state.searchIds = searchIds;
      });
  },
});

export const { addAnote, deleteNote, updateNote, setCurrentNote } =
  notesSlice.actions;
export default notesSlice.reducer;
