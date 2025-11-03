import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import notesService from "../Service/notesService";

const initialState = {
  byId: {},
  allIds: [],
  searchIds: [],
  currentId: null,
  tags: [],
  loading: false,
  error: null,
};

export const getTagsAsync = createAsyncThunk(
  "notes/getTags",
  async (_, thunkAPI) => {
    try {
      const response = await notesService.getTags();
      if (!response.ok) throw new Error("Failed to fetch tags.");
      return await response.json();
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const fetchAllNotesAsync = createAsyncThunk(
  "notes/fetchAllNotes",
  async (_, thunkAPI) => {
    try {
      const response = await notesService.getAllNotes();
      if (!response.ok) throw new Error("Failed to fetch notes.");
      return await response.json();
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// ... (keeping existing optimistic thunks and reducers as they are)
export const updateANoteAsync = createAsyncThunk(
  "notes/updateANoteAsync",
  async (note) => {
    return notesService.updateNote(note);
  }
);

export const addAnoteAsync = createAsyncThunk(
  "notes/addAnoteAsync",
  async (note) => {
    return notesService.addNewNote(note);
  }
);

export const searchNotesAsync = createAsyncThunk(
  "notes/searchNotesAsync",
  async (query) => {
    const allNotes = await notesService.getAllNotes();
    const notes = await allNotes.json();
    return notes
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
      delete state.byId[id];
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
      })
      .addCase(searchNotesAsync.fulfilled, (state, action) => {
        state.searchIds = action.payload;
      })
      .addCase(getTagsAsync.fulfilled, (state, action) => {
        state.tags = action.payload;
      });
  },
});

export const { addAnote, deleteNote, updateNote, setCurrentNote } =
  notesSlice.actions;
export default notesSlice.reducer;
