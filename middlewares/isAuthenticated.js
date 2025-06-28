import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        message: "You are not authenticated",
        success: false,
      });
    }
    // Verify token
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    if (!decode) {
      return res.status(401).json({
        message: "Invalid token",
        success: false,
      });
    }

    const user = await User.findById(decode.userId);

    if (!user) {
      return res.status(401).json({
        message: "User Not Found",
        success: false,
      });
    }

    req.id = user._id;
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

export default isAuthenticated;
