import Blog from "../models/Posts.js";
import User from "../models/User.js";

// 1. Existing function to get all blogs
export const getAdminBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({})
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: blogs.length,
      blogs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. New function for Dashboard Stats
export const getDashboardStats = async (req, res) => {
  try {
    // 1. Sirf Blogs count karein (User ko temporary hata dein)
    const totalBlogs = await Blog.countDocuments();

    // 2. Mock data for others
    const activeUsers = 0;
    const recentBlogs = [];

    res.status(200).json({
      success: true,
      totalBlogs,
      activeUsers,
      recentBlogs,
      revenue: 8450
    });
  } catch (error) {
    console.error("DEBUG ERROR:", error); // Error terminal mein dikhega
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}); // DB se saare users fetch karein
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
};

// //// delete user 
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting user" });
  }
};