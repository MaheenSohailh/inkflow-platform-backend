import User from '../models/User.js';
import _sendEmail from '../utils/Email.js';
import { signInToken } from '../utils/token.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // 🔥 Password hash karne ke liye import kiya

// 1. SIGN UP CONTROLLER
export const signUp = async (req, res) => {
  try {
    const { email, password, role, adminSecretKey } = req.body;

    // 🔥 SECURITY CHECK: Agar koi admin banna chahta hai
    if (role === 'admin') {
      const SYSTEM_SECRET = "03190322055bts7"; // Yeh code sirf aapko pata hoga

      if (adminSecretKey !== SYSTEM_SECRET) {
        return res.status(403).json({
          success: false,
          message: "❌ Invalid Secret Key! You are not authorized to create an admin account."
        });
      }
    }

    // Check if user already exists
    const isExist = await User.findOne({ email });
    if (isExist) {
      return res.status(400).json({
        success: false,
        message: 'Email already Registered!'
      });
    }

    // Naya user create karein
    const user = await User.create(req.body);
    const token = signInToken(user);

    let userWithoutPswd = user.toObject();
    delete userWithoutPswd.password;

    return res.status(201).json({
      message: 'User created successfully',
      success: true,
      token,
      user: userWithoutPswd
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Signup failed'
    });
  }
};

// 2. SIGN IN CONTROLLER
export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePswd(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials"
      });
    }

    let userWithoutPswd = user.toObject();
    delete userWithoutPswd.password;

    const token = signInToken(user);

    return res.status(200).json({
      message: 'SignIn successfully!',
      success: true,
      token,
      user: userWithoutPswd
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'SignIn failed'
    });
  }
};

// 3. FORGOT PASSWORD CONTROLLER
export const forgotPswd = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Reset password token
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const redirectLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await _sendEmail({
      to: user.email,
      subject: 'Reset Password',
      html: `
        <div style="width: 90%; margin: 0 auto;">
          <h1>Reset Password</h1>
          <p>Click here to reset password : <a style="color: green; text-decoration: none;" href="${redirectLink}">Reset</a></p>
        </div>
      `
    });

    return res.status(200).json({
      success: true,
      message: 'Password reset Email sent successfully'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Email send failed'
    });
  }
};

// 4. RESET PASSWORD CONTROLLER
export const resetPswd = async (req, res) => {
  const { password, token } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user.password = password;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Password reset failed',
      error: error.message
    });
  }
};

// 5. GET PROFILE (Fetch data from MongoDB - Single Declaration)
export const profile = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found!" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// 6. UPDATE PROFILE (Sirf Name aur Bio update hoga, no pictures!)
export const updateProfileController = async (req, res) => {
  try {
    const { name, bio } = req.body;
    const userId = req.user._id || req.user.id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { name, bio } },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found!" });
    }

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update failed", error: error.message });
  }
};

// 7. CHANGE PASSWORD CONTROLLER (Fixed & Validated)
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user._id || req.user.id;

    // 1. Fetch user from database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found!" });
    }

    // 2. Compare old password
    const isMatch = await user.comparePswd(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Incorrect current password!" });
    }

    // 3. Hash the new password
    const salt = await bcrypt.genSalt(12);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // 4. Update the password
    await User.findByIdAndUpdate(userId, {
      $set: { password: hashedNewPassword }
    });

    return res.status(200).json({ success: true, message: "Password updated successfully!" });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: "An error occurred while updating the password.", 
      error: error.message 
    });
  }
};