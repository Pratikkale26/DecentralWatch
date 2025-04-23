import { Router } from "express";
import { createWebsite, getWebsiteStatus, getAllWebsites, disableWebsite } from "../controllers/websiteController";

const router = Router();

router.post("/website", createWebsite);
router.get("/website/status", getWebsiteStatus);
router.get("/websites", getAllWebsites);
router.delete("/website/:websiteId", disableWebsite);

export default router;
