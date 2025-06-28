import express from "express";
import { getOwnerAnalytics } from "../controllers/analytics.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.get("/owner", isAuthenticated, getOwnerAnalytics);

export default router;
