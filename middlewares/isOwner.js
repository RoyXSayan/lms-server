const isOwner = (req, res, next) => {
  if (req.user?.role !== "owner") {
    return res.status(403).json({ success: false, message: "Owner access only" });
  }
  next();
};

export default isOwner;
