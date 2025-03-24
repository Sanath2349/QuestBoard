import { createSlice } from "@reduxjs/toolkit";

// Load initial state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem("authState");
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("Failed to load state from localStorage:", err);
    return undefined;
  }
};

// Use loadState to initialize the state
const initialState = loadState() || {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
      localStorage.setItem("authState", JSON.stringify(state));
    },
    loginSuccess(state, action) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      localStorage.setItem("authState", JSON.stringify(state));
    },
    loginFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
      localStorage.setItem("authState", JSON.stringify(state));
    },
    registerStart(state) {
      state.loading = true;
      state.error = null;
      localStorage.setItem("authState", JSON.stringify(state));
    },
    registerSuccess(state, action) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      localStorage.setItem("authState", JSON.stringify(state));
    },
    registerFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
      localStorage.setItem("authState", JSON.stringify(state));
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem("authState");
    },
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem("authState", JSON.stringify(state));
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logout,
  updateUser,
} = authSlice.actions;

export default authSlice.reducer;