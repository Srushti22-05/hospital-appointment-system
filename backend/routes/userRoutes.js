import express from "express";
import { getAllDoctors, getAllUsers } from "../controllers/userController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/doctors", getAllDoctors);
router.get("/all", protect, authorizeRoles("admin"), getAllUsers);

export default router;