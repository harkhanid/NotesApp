import { configureStore } from "@reduxjs/toolkit";
import notesSliceReducer from "./store/notesSlice.js";
import uiSliceReducer from "./store/uiSlice.js";

const store = configureStore({
  reducer: {
    notes: notesSliceReducer,
    ui: uiSliceReducer,
  },
});

export default store;
