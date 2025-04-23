import { Router } from "express";
import { linkWallet } from "../controllers/userController";
import { authMiddleware } from "../middleware/middleware";

const router = Router();

router.post("/link-wallet", authMiddleware, linkWallet);

export default router;
