import express from "express";
import {
  getUserProfile,
  login,
  logout,
  register,
  updateProfile,
  getAllUsers,
  updateUserRole,
  deleteUser,
  updateInstructorProfile,
} from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../utils/multer.js";
import { isOwner } from "../middlewares/roleCheck.js";

const router = express.Router();

//Public & Auth Routes
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/profile").get(isAuthenticated, getUserProfile);
router.route("/profile/update").put(isAuthenticated, upload.single("profilePhoto"), updateProfile);

//Owner-Only Routes🔒
router.route("/owner/users").get(isAuthenticated, isOwner, getAllUsers);
router.route("/owner/update-role").put(isAuthenticated, isOwner, updateUserRole);
router.route("/owner/delete/:id").delete(isAuthenticated, isOwner, deleteUser);

router.patch("/instructor/update-profile", isAuthenticated, updateInstructorProfile);


export default router;
