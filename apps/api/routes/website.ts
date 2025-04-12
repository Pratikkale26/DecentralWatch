import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  createWebsite,
  getWebsites,
  getWebsiteStatus,
  disableWebsite
} from "../controllers/websiteController";

const router = Router();

router.post("/website", authMiddleware, createWebsite);
router.get("/websites", authMiddleware, getWebsites);
router.get("/website/status", authMiddleware, getWebsiteStatus);
router.delete("/website/:websiteId", authMiddleware, disableWebsite);

export default router;
