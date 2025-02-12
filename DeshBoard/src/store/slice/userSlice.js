import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: {}, // Stores logged-in user details
    loading: false,
    isAuthenticated: false,
    error: null,
    message: null,
    isUpload: false,
  },
  reducers: {
    loginRequest(state) {
      state.loading = true;
      state.error = null;
      state.user = {};
      state.isAuthenticated = false;
    },
    loginSuccess(state, action) {
      state.loading = false;
      state.user = action.payload; // ✅ Store user in Redux
      state.error = null;
      state.isAuthenticated = true;
    },
    loginFaild(state, action) {
      state.loading = false;
      state.user = {}; // Clear user if login fails
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    loadUserRequest(state) {
      state.loading = true;
      state.error = null;
      state.user = {};
      state.isAuthenticated = false;
    },
    loadUserSuccess(state, action) {
      state.loading = false;
      state.user = action.payload; // ✅ Store user in Redux
      state.error = null;
      state.isAuthenticated = true;
    },
    loadUserFaild(state, action) {
      state.loading = false;
      state.user = {}; // Clear user if login fails
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    clearAllError(state) {
      state.error = null;
    },
  },
});

export const login = (email, password) => async (dispatch) => {
  dispatch(userSlice.actions.loginRequest());
  try {
    const response = await axios.post(
      "http://localhost:3000/api/v1/user/login",
      { email, password },
      { withCredentials: true, headers: { "Content-Type": "application/json" } }
    );

    console.log("Full API Response:", response); // ✅ Debugging full response

    const { data } = response;
    console.log("Extracted Data:", data); // ✅ Debugging extracted data

    if (data && data.user) {
      dispatch(userSlice.actions.loginSuccess(data.user));
      dispatch(userSlice.actions.clearAllError());
    } else {
      console.error("Unexpected API response format:", data);
      dispatch(userSlice.actions.loginFaild("Invalid response from server"));
    }
  } catch (err) {
    console.error("API Request Failed:", err);
    dispatch(
      userSlice.actions.loginFaild(
        err.response?.data?.message || "Login failed"
      )
    );
  }
};


export const getUser = () => async (dispatch) => {
  dispatch(userSlice.actions.loadUserRequest());
  try {
    const response = await axios.get(
      "http://localhost:3000/api/v1/user/me",
      { withCredentials: true}
    );
    dispatch(userSlice.actions.loadUserSuccess(response.user));
    dispatch(userSlice.actions.clearAllError());
  } catch (err) {
    dispatch(
      userSlice.actions.loadUserFaild(
        err.response?.data?.message || "Login failed"
      )
    );
  }
};




export const clearAllError = () => (dispatch) => {
  dispatch(userSlice.actions.clearAllError());
};

export default userSlice.reducer;
