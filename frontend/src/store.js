import { configureStore } from "@reduxjs/toolkit";
import notesSliceReducer from "./store/notesSlice.js";
import uiSliceReducer from "./store/uiSlice.js";
import authReducer from "./store/authSlice.js";
import toastReducer from "./store/toastSlice.js";

const store = configureStore({
  reducer: {
    notes: notesSliceReducer,
    ui: uiSliceReducer,
    auth: authReducer,
    toast: toastReducer,
  },
});

export default store;
