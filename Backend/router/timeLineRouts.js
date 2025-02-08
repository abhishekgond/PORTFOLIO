import express from "express";
import {
  addTimeLine,
  deleteTimeLine,
  getTimeLine,
} from "../controller/timeLineControler.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();
router.post("/addTimeLine", isAuthenticated, addTimeLine);
router.delete("/deleteTimeLine/:id", isAuthenticated, deleteTimeLine);
router.get("/getTimeLine", getTimeLine);

export default router;
