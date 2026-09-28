import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// Test protected route
router.get("/profile", protect, (req, res) => {
  res.status(200).json({
    message: "You accessed a protected route!",
    user: req.user,
  });
});

export default router;