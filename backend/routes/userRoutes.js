import express from "express";
import {
  getAllDoctors,
  getAllUsers,
  updateDoctor,
  getDoctorRequests,
  updateDoctorApproval,
} from "../controllers/userController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/doctors", getAllDoctors);
router.get("/all", protect, authorizeRoles("admin"), getAllUsers);
router.patch("/doctors/:id", protect, authorizeRoles("admin"), updateDoctor);
router.get("/doctor-requests", protect, authorizeRoles("admin"), getDoctorRequests);
router.patch("/doctors/:id/approval", protect, authorizeRoles("admin"), updateDoctorApproval);

export default router;