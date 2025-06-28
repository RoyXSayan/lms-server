import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import getUserDetails from "../middlewares/getUserDetails.js"; // ⬅️ import it
import { isOwner } from "../middlewares/roleCheck.js";
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
} from "../controllers/ownerController.js";

const router = express.Router();

// Apply all three middlewares in order
router.use(isAuthenticated);     // Sets req.id
router.use(getUserDetails);      // Sets req.user
router.use(isOwner);             // Checks req.user.role

// Owner-only routes
router.get("/users", getAllUsers);
router.put("/users/:userId/role", updateUserRole);
router.delete("/users/:userId", deleteUser);

export default router;
