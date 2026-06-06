import { Router } from "express";
import { middlewareToProtect } from "../middlewares/authMidleware.js";
import {
    createblog,
    getBlogById,
    getMyBlogs,
    getPublicBlogs,
    updateBlog,
    toggleBlockController, // 👈 New Import
    deleteBlogController   // 👈 New Import
} from "../controller/Blogcontroller.js";
import multer from 'multer';

const blogRouter = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 🟢 Public & User Routes
blogRouter.post('/create', middlewareToProtect, upload.single('image'), createblog);
blogRouter.get('/my-blogs', middlewareToProtect, getMyBlogs);
blogRouter.get('/all', getPublicBlogs);

// 📸 Edit/Update Blog
blogRouter.put('/update/:id', middlewareToProtect, upload.single('image'), updateBlog);

// ==========================================
// ⚠️ ADMIN OPERATIONS (URL PREFIXES CORRECTED)
// ==========================================

// 🚫 TOGGLE BLOCK ROUTE (Bina extra /blog ke)
blogRouter.put('/toggle-block/:id', middlewareToProtect, toggleBlockController);

// 🗑️ DELETE ROUTE (Bina extra /blog ke)
blogRouter.delete('/delete/:id', middlewareToProtect, deleteBlogController);

blogRouter.get("/:id", getBlogById);

export default blogRouter;