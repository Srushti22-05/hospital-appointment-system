import express from "express";
import {
  getAllDoctors,
  getAllUsers,
  updateDoctor,
} from "../controllers/userController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/doctors", getAllDoctors);
router.get("/all", protect, authorizeRoles("admin"), getAllUsers);
router.patch("/doctors/:id", protect, authorizeRoles("admin"), updateDoctor);

export default router;