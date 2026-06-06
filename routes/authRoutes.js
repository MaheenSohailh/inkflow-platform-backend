import { Router } from "express";
import { 
  forgotPswd, 
  profile, 
  resetPswd, 
  signin, 
  signUp, 
  updateProfileController, 
  changePassword 
} from "../controller/authController.js";
import { middlewareToProtect } from "../middlewares/authMidleware.js";

const router = Router(); // 1. Sabse pehle router initialize hoga

// Public Routes
router.post('/signup', signUp);
router.post('/signin', signin);
router.post("/forgot-pswd", forgotPswd);
router.post("/reset-pswd", resetPswd);

// Protected Routes (Inke liye login zaroori hai)
router.get("/profile", middlewareToProtect, profile);
router.put("/profile/update", middlewareToProtect, updateProfileController);
router.put("/change-password", middlewareToProtect, changePassword); // 🔥 Clean Change password route

export default router; // 2. Last me default export zaroori hai