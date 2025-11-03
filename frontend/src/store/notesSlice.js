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

export const addAnoteAsync = createAsyncThunk(
  "notes/addAnoteAsync",
  async ({ note, tempId }, thunkAPI) => {
    try {
      const serverNote = await notesService.addNewNote(note);
      return { serverNote, tempId };
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message, tempId });
    }
  }
);

export const updateANoteAsync = createAsyncThunk(
  "notes/updateANoteAsync",
  async ({ note, previousNote }, thunkAPI) => {
    try {
      const updatedNote = await notesService.updateNote(note);
      return updatedNote;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message, previousNote });
    }
  }
);

export const deleteNoteAsync = createAsyncThunk(
  "notes/deleteNoteAsync",
  async ({ id, noteData }, thunkAPI) => {
    try {
      await notesService.deleteNote(id);
      return { id };
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message, id, noteData });
    }
  }
);

export const searchNotesAsync = createAsyncThunk(
  "notes/searchNotesAsync",
  async (query, thunkAPI) => {
    try {
      if (!query || query.length === 0) {
        return [];
      }
      const notes = await notesService.searchNotes(query);
      return notes.map((note) => note.id);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
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
        state.loading = false;
      })
      .addCase(fetchAllNotesAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllNotesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle addAnoteAsync - replace temp ID with server UUID
      .addCase(addAnoteAsync.fulfilled, (state, action) => {
        const { serverNote, tempId } = action.payload;
        // Remove temp note
        delete state.byId[tempId];
        state.allIds = state.allIds.filter((id) => id !== tempId);
        // Add server note
        state.byId[serverNote.id] = serverNote;
        state.allIds.unshift(serverNote.id);
        // Update current ID if it was the temp one
        if (state.currentId === tempId) {
          state.currentId = serverNote.id;
        }
      })
      .addCase(addAnoteAsync.rejected, (state, action) => {
        const { tempId } = action.payload;
        // Mark temp note as having error
        if (state.byId[tempId]) {
          state.byId[tempId].syncError = action.payload.error;
        }
        state.error = action.payload.error;
      })
      // Handle updateANoteAsync - rollback on error
      .addCase(updateANoteAsync.fulfilled, (state, action) => {
        const updatedNote = action.payload;
        state.byId[updatedNote.id] = updatedNote;
      })
      .addCase(updateANoteAsync.rejected, (state, action) => {
        const { previousNote } = action.payload;
        // Rollback to previous state
        if (previousNote) {
          state.byId[previousNote.id] = previousNote;
        }
        state.error = action.payload.error;
      })
      // Handle deleteNoteAsync - restore on error
      .addCase(deleteNoteAsync.fulfilled, () => {
        // Optimistic delete already handled, nothing to do here
      })
      .addCase(deleteNoteAsync.rejected, (state, action) => {
        const { id, noteData } = action.payload;
        // Restore the note if deletion failed
        if (noteData) {
          state.byId[id] = noteData;
          state.allIds.unshift(id);
        }
        state.error = action.payload.error;
      })
      // Handle searchNotesAsync
      .addCase(searchNotesAsync.fulfilled, (state, action) => {
        state.searchIds = action.payload;
      })
      .addCase(searchNotesAsync.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Handle getTagsAsync
      .addCase(getTagsAsync.fulfilled, (state, action) => {
        state.tags = action.payload;
      });
  },
});

export const { addAnote, deleteNote, updateNote, setCurrentNote } =
  notesSlice.actions;
export default notesSlice.reducer;
