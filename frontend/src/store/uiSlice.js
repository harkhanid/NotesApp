import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedNoteId: null,
  filter: "MY_NOTES",
  searchQuery: "",
  selectedTag: "",
  status: "idle",
  theme: "Light Mode",
  font: "sans-serif",
};

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
});

export const {
  updateFilter,
  setSearchNotes,
  selectTag,
  updateFont,
  updateTheme,
} = uiSlice.actions;
export default uiSlice.reducer;
