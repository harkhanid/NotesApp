import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../Service/authService";

// Thunk for checking initial authentication status
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, thunkAPI) => {
    try {
      const response = await authService.checkAuthStatus();
      if (!response.ok) {
        throw new Error("User not authenticated");
      }
      const data = await response.json();
      return { user: data };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Thunk for logging in
export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, thunkAPI) => {
    try {
      const loginResponse = await authService.login(email, password);
      if (!loginResponse.ok) {
        throw new Error("Login failed");
      }
      // After successful login, fetch user profile
      const profileResponse = await authService.checkAuthStatus();
      if (!profileResponse.ok) {
        throw new Error("Failed to fetch profile after login");
      }
      const data = await profileResponse.json();
      return { user: data };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Thunk for logging out
export const logout = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  try {
    await authService.logout();
    return;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

const initialState = {
  isAuthenticated: false,
  user: null,
  loading: true, // Initial loading is true to handle the first checkAuth
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle checkAuth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        //Info: We don't set an error here to avoid showing errors on initial load
        //state.error = action.payload;
      })
      // Handle login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export default authSlice.reducer;
