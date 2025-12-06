import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  getUserById,
  searchUsers,
  followUser,
  unfollowUser,
  checkFollowStatus
} from "../controllers/userController.js";

const router = express.Router();

// Toutes les routes sont protégées
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.get("/", protect, getAllUsers);
router.get("/search", protect, searchUsers);
router.get("/:id", protect, getUserById);
router.post("/:id/follow", protect, followUser);
router.post("/:id/unfollow", protect, unfollowUser);
router.get("/:id/follow-status", protect, checkFollowStatus);

export default router;