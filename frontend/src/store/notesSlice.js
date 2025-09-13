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
};

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
      delete state.allIds[id];
    },
    setCurrentNote: (state, action) => {
      const { id } = action.payload;
      state.currentId = id;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAllNotesAsync.fulfilled, (state, action) => {
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
    });
  },
});

export const fetchAllNotesAsync = createAsyncThunk(
  "notes/fetchAllnotesAsync",
  async () => {
    return getAllNotes();
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

export const { addAnote, deleteNote, updateNote, setCurrentNote } =
  notesSlice.actions;
export default notesSlice.reducer;
