import express from "express";
import { chatbotMessage } from "../controllers/chatbotController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/message", protect, authorizeRoles("patient"), chatbotMessage);

export default router;