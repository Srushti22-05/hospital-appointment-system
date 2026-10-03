import User from "../models/User.js";

// Get all APPROVED doctors (patients ke "Find a Doctor" ke liye)
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({
      role: "doctor",
      approvalStatus: "approved",
    }).select("-password");
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

// Get doctor registration requests by status (Admin only)
// GET /api/users/doctor-requests?status=pending  (pending | approved | rejected)
export const getDoctorRequests = async (req, res) => {
  try {
    const status = req.query.status || "pending";

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const doctors = await User.find({
      role: "doctor",
      approvalStatus: status,
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Approve or reject a doctor (Admin only)
// PATCH /api/users/doctors/:id/approval   body: { status: "approved" | "rejected", reason }
export const updateDoctorApproval = async (req, res) => {
  try {
    const { status, reason } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be approved or rejected" });
    }

    const doctor = await User.findOne({ _id: req.params.id, role: "doctor" });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    doctor.approvalStatus = status;
    doctor.rejectionReason = status === "rejected" ? reason || "" : "";
    await doctor.save();

    res.status(200).json({
      message: `Doctor ${status} successfully`,
      doctor: {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        qualification: doctor.qualification,
        approvalStatus: doctor.approvalStatus,
        rejectionReason: doctor.rejectionReason,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a doctor's profile (Admin only)
export const updateDoctor = async (req, res) => {
  try {
    const { name, specialization, fees, qualification } = req.body;

    const doctor = await User.findOne({ _id: req.params.id, role: "doctor" });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    if (name !== undefined) doctor.name = name;
    if (specialization !== undefined) doctor.specialization = specialization;
    if (fees !== undefined) doctor.fees = fees;
    if (qualification !== undefined) doctor.qualification = qualification;

    await doctor.save();

    res.status(200).json({
      message: "Doctor updated successfully",
      doctor: {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        fees: doctor.fees,
        qualification: doctor.qualification,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};