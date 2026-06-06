import { Router } from "express";
import { authorize, middlewareToProtect } from "../middlewares/authMidleware.js";
import {
    getAdminBlogs,
    getDashboardStats,
    getAllUsers, // <--- Yahan import karein
    deleteUser
} from "../controller/adminController.js";

const router = Router();

router.get('/blog/all', middlewareToProtect, authorize('admin'), getAdminBlogs);
router.get('/dashboard-stats', middlewareToProtect, authorize('admin'), getDashboardStats);

// Naya Users route yahan add karein
router.get('/users', middlewareToProtect, authorize('admin'), getAllUsers);

// / delete user 
router.delete('/users/:id', middlewareToProtect, authorize('admin'), deleteUser);

export default router;