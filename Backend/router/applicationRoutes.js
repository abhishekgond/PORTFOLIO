import express from "express";
import {
  addApplication,
  deleteApplication,
  getApplication,
} from "../controller/applicationController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();
router.post("/addApplication", isAuthenticated, addApplication);
router.delete("/deleteApplication/:id", isAuthenticated, deleteApplication);
router.get("/getApplication", getApplication);

export default router;
