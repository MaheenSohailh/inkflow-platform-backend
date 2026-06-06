import { deleteImg, uploadImg } from "../config/cloud.js";
import Blog from "../models/Posts.js";

// ==========================================
// [ICON: Globe] PUBLIC & USER CONTROLLERS
// ==========================================

// 1. CREATE BLOG
const createblog = async (req, res) => {
  try {
    const { title, content, isPaid, price } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Image required' });
    }

    const uploaData = await uploadImg(req.file);
    if (!uploaData) {
      return res.status(400).json({
        status: false,
        message: "Error in uploading image asset"
      });
    }

    const isPaidBoolean = isPaid === 'true' || isPaid === true;

    let data = {
      title,
      content,
      author: req.user._id,
      image: uploaData.secure_url,
      public_id: uploaData.public_id,
      isPaid: isPaidBoolean,
      price: isPaidBoolean ? Number(price) : 0
    };

    const blog = await Blog.create(data);

    res.status(201).json({
      status: true,
      message: 'Blog created successfully',
      blog: blog
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// 2. UPDATE BLOG
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, isPaid, price } = req.body;

    let blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Requested blog asset not found" });
    }

    const isPaidBoolean = isPaid === 'true' || isPaid === true;

    let updatedData = {
      title,
      content,
      isPaid: isPaidBoolean,
      price: isPaidBoolean ? Number(price) : 0
    };

    if (req.file) {
      if (blog.public_id) {
        await deleteImg(blog.public_id);
      }

      const newUploadData = await uploadImg(req.file);
      if (!newUploadData) {
        return res.status(400).json({ success: false, message: "Error in updating image asset" });
      }

      updatedData.image = newUploadData.secure_url;
      updatedData.public_id = newUploadData.public_id;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(id, updatedData, { new: true });

    res.status(200).json({
      success: true,
      message: "Blog record updated successfully",
      blog: updatedBlog
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. GET MY BLOGS (Dashboard)
const getMyBlogs = async (req, res) => {
  try {
    const userId = req.user._id;

    const blogs = await Blog.find({ author: userId })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: blogs.length,
      message: "User dashboard metrics synchronized successfully",
      blogs: blogs
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to compile user blogs",
      error: error.message
    });
  }
};

// 4. GET BLOG BY ID
const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id).populate("author", "name email");

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Target blog post could not be resolved"
      });
    }

    return res.status(200).json({
      success: true,
      blog
    });

  } catch (error) {
    console.error("System Log - Error in getBlogById:", error);

    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        message: "Malformed Blog Identifier format"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server execution failure"
    });
  }
};

// 5. GET PUBLIC BLOGS (Home page)
const getPublicBlogs = async (req, res) => {
  try {
    const query = { isBlocked: false };

    const blogs = await Blog.find(query)
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

// ==========================================
// [ICON: ShieldAlert] ADMIN EXCLUSIVE CONTROLLERS
// ==========================================

// 6. TOGGLE BLOCK STATUS
const toggleBlockController = async (req, res) => {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Target document not found" });
    }

    blog.isBlocked = isBlocked;
    await blog.save();

    res.status(200).json({
      success: true,
      message: `Content access policy altered to: ${isBlocked ? "Suspended" : "Active"}`,
      blog
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. PERMANENT SYSTEM DELETE
const deleteBlogController = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Target document metadata not resolved" });
    }

    if (blog.public_id) {
      await deleteImg(blog.public_id);
    }

    await Blog.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Data record and related cloud assets permanently expunged"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Named exports block synchronized with router layers
export {
  createblog,
  updateBlog,
  getMyBlogs,
  getBlogById,
  getPublicBlogs,
  toggleBlockController,
  deleteBlogController
};