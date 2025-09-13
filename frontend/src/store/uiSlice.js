import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedNoteId: null,
  filter: "ALL",
  searchQuery: "",
  status: "idle",
};

export const uiSlice = createSlice({
  name: "ui",
  initialState: initialState,
  reducers: {
    updateFilter: (state, action) => {
      const { filter } = action.payload;
      state.filter = filter;
    },
    searchNotes: (state, action) => {
      const { query } = action.payload;
      state.filter = "SEARCH";
      state.query = query;
    },
  },
});

export const { updateFilter, searchNotes } = uiSlice.actions;
export default uiSlice.reducer;
