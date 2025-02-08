import express from "express";
import {
  addProject,
  deleteProject,
  getAllProject,
  updateProject,
} from "../controller/projectControler.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();
router.post("/addProject", isAuthenticated, addProject);
router.delete("/deleteProject/:id", isAuthenticated, deleteProject);
router.get("/getAllProject", getAllProject);
router.put("/updateProject/:id", isAuthenticated, updateProject);
router.get("/getSingleProject/:id", updateProject);

export default router;
