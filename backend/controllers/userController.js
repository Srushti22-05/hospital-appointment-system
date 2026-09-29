import User from "../models/User.js";

// Get all doctors
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" }).select("-password");
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a doctor's profile (Admin only)
export const updateDoctor = async (req, res) => {
  try {
    const { name, specialization, fees } = req.body;

    const doctor = await User.findOne({ _id: req.params.id, role: "doctor" });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    if (name !== undefined) doctor.name = name;
    if (specialization !== undefined) doctor.specialization = specialization;
    if (fees !== undefined) doctor.fees = fees;

    await doctor.save();

    res.status(200).json({
      message: "Doctor updated successfully",
      doctor: {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        fees: doctor.fees,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};