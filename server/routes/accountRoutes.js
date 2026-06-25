import express from "express";
import {
  createAccount,
  getAccounts,
  getAccountById,
  updateAccount,
  setDefaultAccount,
  deleteAccount,
} from "../controllers/accountController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getAccounts);
router.post("/", createAccount);
router.get("/:id", getAccountById);
router.put("/:id", updateAccount);
router.patch("/:id/default", setDefaultAccount);
router.delete("/:id", deleteAccount);

export default router;