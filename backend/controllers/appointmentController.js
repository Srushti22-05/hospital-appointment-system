import mongoose from "mongoose";
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";

// Valid time slots: 09:00 AM to 04:30 PM, every 30 minutes
const VALID_SLOTS = [];
for (let h = 9; h < 17; h++) {
  for (const m of ["00", "30"]) {
    const hour12 = h > 12 ? h - 12 : h;
    const suffix = h >= 12 ? "PM" : "AM";
    VALID_SLOTS.push(`${String(hour12).padStart(2, "0")}:${m} ${suffix}`);
  }
}

// Book an appointment (Patient)
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;
    const patientId = req.user.id;

    if (!doctorId || !date || !time) {
      return res
        .status(400)
        .json({ message: "Doctor, date and time are required" });
    }

    if (!mongoose.isValidObjectId(doctorId)) {
      return res.status(400).json({ message: "Invalid doctor" });
    }

    if (!VALID_SLOTS.includes(time)) {
      return res
        .status(400)
        .json({ message: "Please choose a valid time slot" });
    }

    const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < today) {
      return res
        .status(400)
        .json({ message: "Please choose today or a future date" });
    }

    const doctor = await User.findOne({ _id: doctorId, role: "doctor" });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const alreadyBooked = await Appointment.findOne({
      doctor: doctorId,
      date,
      time,
      status: { $ne: "cancelled" },
    });
    if (alreadyBooked) {
      return res.status(409).json({
        message: "This slot is already booked. Please choose another.",
      });
    }

    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      date,
      time,
    });

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get logged-in patient's appointments
export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user.id })
      .populate("doctor", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get logged-in doctor's appointments
export const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.user.id })
      .populate("patient", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all appointments (Admin only)
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("doctor", "name email")
      .populate("patient", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update appointment status (Doctor only, own appointments)
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["confirmed", "cancelled", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctor: req.user.id,
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.status = status;
    await appointment.save();

    res.status(200).json({ message: "Status updated", appointment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Cancel own appointment (Patient only)
export const cancelMyAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patient: req.user.id,
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status === "completed") {
      return res.status(400).json({ message: "Completed appointments cannot be cancelled" });
    }

    appointment.status = "cancelled";
    await appointment.save();

    res.status(200).json({ message: "Appointment cancelled", appointment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};