import express from "express";
import {
  getUser,
  login,
  logout,
  register,
  newUpdateUser,
} from "../controller/userController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.get("/me", isAuthenticated, getUser);
// router.put("/update", isAuthenticated, newUpdateUser);
export default router;
