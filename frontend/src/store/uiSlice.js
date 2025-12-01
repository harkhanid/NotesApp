import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import preferencesService from "../Service/preferencesService";

const initialState = {
  selectedNoteId: null,
  filter: "MY_NOTES",
  searchQuery: "",
  selectedTag: "",
  status: "idle",
  font: "Sans Serif",
  theme: null,
  preferencesLoading: false,
  preferencesError: null,
};

export const fetchPreferencesAsync = createAsyncThunk(
  "ui/fetchPreferences",
  async (_, thunkAPI) => {
    try {
      const preferences = await preferencesService.getPreferences();
      return preferences;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const updatePreferencesAsync = createAsyncThunk(
  "ui/updatePreferences",
  async (preferences, thunkAPI) => {
    try {
      const updatedPreferences = await preferencesService.updatePreferences(preferences);
      return updatedPreferences;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const uiSlice = createSlice({
  name: "ui",
  initialState: initialState,
  reducers: {
    updateFilter: (state, action) => {
      const { filter } = action.payload;
      state.selectedTag = "";
      state.filter = filter;
    },
    setSearchNotes: (state, action) => {
      const { query } = action.payload;
      state.filter = "SEARCH";
      state.searchQuery = query;
    },
    selectTag: (state, action) => {
      const { tag } = action.payload;
      state.filter = "TAG";
      state.selectedTag = tag;
    },
    updateTheme: (state, action) => {
      const { theme } = action.payload;
      state.theme = theme;
    },
    updateFont: (state, action) => {
      const { font } = action.payload;
      state.font = font;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch preferences
      .addCase(fetchPreferencesAsync.pending, (state) => {
        state.preferencesLoading = true;
        state.preferencesError = null;
      })
      .addCase(fetchPreferencesAsync.fulfilled, (state, action) => {
        state.preferencesLoading = false;
        state.font = action.payload.font || "Sans Serif";
        state.theme = action.payload.theme || null;
      })
      .addCase(fetchPreferencesAsync.rejected, (state, action) => {
        state.preferencesLoading = false;
        state.preferencesError = action.payload;
      })
      // Update preferences
      .addCase(updatePreferencesAsync.pending, (state) => {
        state.preferencesLoading = true;
        state.preferencesError = null;
      })
      .addCase(updatePreferencesAsync.fulfilled, (state, action) => {
        state.preferencesLoading = false;
        state.font = action.payload.font || "Sans Serif";
        state.theme = action.payload.theme || null;
      })
      .addCase(updatePreferencesAsync.rejected, (state, action) => {
        state.preferencesLoading = false;
        state.preferencesError = action.payload;
      });
  },
});

export const {
  updateFilter,
  setSearchNotes,
  selectTag,
  updateFont,
  updateTheme,
} = uiSlice.actions;
export default uiSlice.reducer;
