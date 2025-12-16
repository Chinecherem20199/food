const admin = (req, res, next) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied. Admin only." });
    }
    next();
  };
  
  export default admin;