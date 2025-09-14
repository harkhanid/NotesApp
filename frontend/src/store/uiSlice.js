import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedNoteId: null,
  filter: "ALL",
  searchQuery: "",
  selectedTag: "",
  status: "idle",
};

export const uiSlice = createSlice({
  name: "ui",
  initialState: initialState,
  reducers: {
    updateFilter: (state, action) => {
      const { filter } = action.payload;
      if (filter != "TAG") {
        state.selectedTag = "";
      }
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
  },
});

export const { updateFilter, setSearchNotes, selectTag } = uiSlice.actions;
export default uiSlice.reducer;
