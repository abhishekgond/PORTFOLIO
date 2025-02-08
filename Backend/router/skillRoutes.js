import express from "express";
import {
  addSkill,
  deleteSkill,
  getAllSkill,
  updateSkill,
} from "../controller/skillController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();
router.post("/addSkill", isAuthenticated, addSkill);
router.delete("/deleteSkill/:id", isAuthenticated, deleteSkill);
router.get("/getAllSkill", getAllSkill);
router.put("/updateskill/:id", isAuthenticated, updateSkill);

export default router;
