import { Router } from "express";
import { linkWallet } from "../controllers/userController";
import { authMiddleware } from "../middleware/middleware";
import { getAllValidators, isValidator } from "../controllers/validatorController";

const router = Router();

router.post("/link-wallet", authMiddleware, linkWallet);

// Validator routes
router.get("/validators", getAllValidators);
router.get("/is-validator", isValidator);

export default router;
