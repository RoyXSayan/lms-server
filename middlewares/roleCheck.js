export const isOwner = (req, res, next) => {
  if (req.user.role !== "instructor" && req.user.role !== "owner") {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};
