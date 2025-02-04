import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";

import {
  sendMessage,
  getAllMessages,
  deleteMessage,
} from "../controller/messageController.js";

const router = express.Router();

router.post("/send", sendMessage);
router.get("/getall", getAllMessages);
router.delete("/delete/:id", isAuthenticated, deleteMessage); // ✅ Ensure this has `:id`

export default router;
