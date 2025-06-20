import { Router } from "express";
import { getAllValidators, isValidator } from "../controllers/validatorController";

const router = Router();

// Validator routes
router.get("/validators", getAllValidators);
router.get("/is-validator", isValidator);

export default router;
