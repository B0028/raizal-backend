import { Router } from "express";
import { login, register } from "../controllers/authController.js";
import { validateRegister } from "../middlewares/validate.js";

const router = Router();

router.post("/register", validateRegister, register);
router.post("/login", login);

export default router;