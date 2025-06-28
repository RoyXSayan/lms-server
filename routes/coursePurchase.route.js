// routes/purchase.route.js
import express from "express";
import {
  getAllPurchasedCourse,
  getCourseDetailWithPurchaseStatus,
  getInstructorPurchases,
  simulateCoursePurchase,
} from "../controllers/coursePurchase.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

// ✅ Correct POST for dummy purchase
router.post(
  "/purchase/:courseId",
  isAuthenticated,
  simulateCoursePurchase
);

// ✅ ✅ Add this missing GET route
router.get(
  "/course/:courseId/detail-with-status",
  isAuthenticated,
  getCourseDetailWithPurchaseStatus
);

// ✅ All purchased courses
router.get("/", isAuthenticated,getAllPurchasedCourse);

// individual course purchase details
router.get("/instructor/dashboard", isAuthenticated, getInstructorPurchases);


export default router;
