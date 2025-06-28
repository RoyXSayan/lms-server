import { User } from "../models/userModel.js";

export const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

export const updateUserRole = async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!["student", "instructor"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.role = role;
  await user.save();
  res.json({ message: `User role updated to ${role}` });
};

export const deleteUser = async (req, res) => {
  const { userId } = req.params;

  if (req.user._id.toString() === userId) {
    return res.status(400).json({ message: "Cannot delete self" });
  }

  await User.findByIdAndDelete(userId);
  res.json({ message: "User deleted successfully" });
};
