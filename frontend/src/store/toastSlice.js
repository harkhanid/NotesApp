import { createSlice } from "@reduxjs/toolkit";

const toastSlice = createSlice({
  name: "toast",
  initialState: {
    toasts: [], // Array of toast objects: { id, type, message }
  },
  reducers: {
    addToast: (state, action) => {
      const { type, message } = action.payload;
      const id = Date.now() + Math.random(); // Unique ID
      state.toasts.push({ id, type, message });
    },
    removeToast: (state, action) => {
      const { id } = action.payload;
      state.toasts = state.toasts.filter((toast) => toast.id !== id);
    },
  },
});

export const { addToast, removeToast } = toastSlice.actions;
export default toastSlice.reducer;
