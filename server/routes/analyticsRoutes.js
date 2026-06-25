import express from "express";
import {
  getDashboardStats,
  getCategoryStats,
  getMonthlyStats,
  getBudgetStats,
} from "../controllers/analyticsController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, getDashboardStats);
router.get("/categories", protect, getCategoryStats);
router.get("/monthly", protect, getMonthlyStats);
router.get("/budget", protect, getBudgetStats);

export default router;