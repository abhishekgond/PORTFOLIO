import express from "express";
import {
  getUser,
  login,
  logout,
  register,
  newUpdateUser,
  updatePassword,
  getUserInfoForPortfolio,
  resetPassword,
  forgotPassword,
} from "../controller/userController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.get("/me", isAuthenticated, getUser);
router.put("/update/me", isAuthenticated, newUpdateUser);
router.put("/update/password", isAuthenticated, updatePassword);
router.get("/info", getUserInfoForPortfolio);
router.post("/password/forgot", forgotPassword);
router.put("/password/reset/:token", resetPassword);
//3:18
export default router;
