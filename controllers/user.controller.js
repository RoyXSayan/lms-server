import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields", // please fill all fields
      });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists", // email already exists
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword });
    return res.status(201).json({
      success: true,
      message: "Account created Successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to Register", // internal server error
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields", // please fill all fields
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials", // invalid email
      });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials", // invalid password
      });
    }
    generateToken(res, user, `Welcome back ${user.name}`);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to Login", // internal server error
    });
  }
};

export const logout = (_, res) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      success: true,
      message: "Logged out successfully", // logged out successfully
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to Logout", // internal server error
    });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId)
      .select("-password")
      .populate("enrolledCourses");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found", // user not found
      });
    }
    return res.status(200).json({
      success: true,
      message: "User profile Updated successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to load User", // internal server error
    });
  }
};
export const updateProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { name } = req.body;
    const profilePhoto = req.file;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found", // user not found
      });
    }
    // extract the public id of the old image from the url if it is exists
    if (user.photoURL) {
      const publicId = user.photoURL.split("/").pop().split(".")[0]; //extract the public id from the url
      deleteMediaFromCloudinary(publicId); //delete the old image from cloudinary
    }

    // Upload new photo
    const cloudResponse = await uploadMedia(profilePhoto.path);
    const photoURL = cloudResponse.secure_url;

    const updatedData = { name, photoURL };
    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    }).select("-password");
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile", // internal server error
    });
  }
};

// get all users for owner dashboard
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

// Update user role - only for owner dashboard
export const updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role === "owner") {
      return res.status(400).json({ success: false, message: "Cannot change owner role" });
    }

    user.role = role;
    await user.save();

    return res.status(200).json({ success: true, message: "Role updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update role",
    });
  }
};

// Delete user - only for owner
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role === "owner") {
      return res.status(400).json({ success: false, message: "Cannot delete owner" });
    }

    await user.deleteOne();
    return res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};

// PATCH /api/v1/instructor/update-profile
export const updateInstructorProfile = async (req, res) => {
  try {
    const { profession, bio } = req.body;
    const user = await User.findById(req.id);

    //Allow if role is instructor or owner (but only editing self)

    if (!user || user.role !== 'instructor' && user.role !== "owner") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    user.profession = profession || user.profession;
    user.bio = bio || user.bio;

    await user.save();

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
