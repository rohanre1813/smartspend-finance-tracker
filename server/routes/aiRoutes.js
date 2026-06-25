import express from "express";
import { scanReceipt } from "../controllers/aiController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/scan-receipt", protect, scanReceipt);

export default router;