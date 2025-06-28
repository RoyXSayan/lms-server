// middlewares/getUserDetails.js
import { User } from "../models/user.model.js";

const getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found", success: false });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("getUserDetails Error:", error);
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

export default getUserDetails;
