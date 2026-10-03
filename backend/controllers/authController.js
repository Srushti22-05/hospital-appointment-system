import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Register
export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      specialization,
      fees,
      qualification,
      licenseNumber,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    // Public registration se sirf patient ya doctor ban sakta hai (admin nahi)
    const safeRole = role === "doctor" ? "doctor" : "patient";
    const isDoctor = safeRole === "doctor";

    if (isDoctor && !qualification?.trim()) {
      return res.status(400).json({ message: "Qualification is required for doctors" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      name,
      email,
      password: hashedPassword,
      role: safeRole,
      // Doctor ko admin approval chahiye, patient seedha approved
      approvalStatus: isDoctor ? "pending" : "approved",
    };

    if (isDoctor) {
      userData.specialization = specialization;
      userData.fees = fees;
      userData.qualification = qualification.trim();
      if (licenseNumber?.trim()) userData.licenseNumber = licenseNumber.trim();
    }

    const user = await User.create(userData);

    res.status(201).json({
      message: isDoctor
        ? "Registration submitted. Your request has been sent to the admin for approval."
        : "User registered successfully",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Pending ya rejected doctor login nahi kar sakta
    // (purane doctors ke paas approvalStatus nahi hota, wo approved maane jaate hain)
    if (user.role === "doctor" && user.approvalStatus === "pending") {
      return res
        .status(403)
        .json({ message: "Your account is awaiting admin approval." });
    }
    if (user.role === "doctor" && user.approvalStatus === "rejected") {
      return res.status(403).json({
        message: `Your registration was rejected.${
          user.rejectionReason ? " Reason: " + user.rejectionReason : ""
        }`,
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};