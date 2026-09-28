import express from "express";
import {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  getAllAppointments,
  updateAppointmentStatus,
} from "../controllers/appointmentController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/book", protect, authorizeRoles("patient"), bookAppointment);
router.get("/my-appointments", protect, authorizeRoles("patient"), getMyAppointments);
router.get("/doctor-appointments", protect, authorizeRoles("doctor"), getDoctorAppointments);
router.get("/all", protect, authorizeRoles("admin"), getAllAppointments);
router.patch("/:id/status", protect, authorizeRoles("doctor"), updateAppointmentStatus);


export default router;