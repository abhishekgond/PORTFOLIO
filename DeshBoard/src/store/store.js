import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slice/userSlice";

// Setup React-Redux
export const store = configureStore({
  reducer: {
    user: userReducer,
  },
});
