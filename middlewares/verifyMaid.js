// NPM Packages
const jwt = require("jsonwebtoken");

//Model
const maid = require("../models/maid");

module.exports= async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token.trim(), process.env.JWT_SECRET);
      req.maid = await maid.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      console.error(error);
      res.status(401).send("Not authorized, token failed");
    }
  }
  if (!token) {
    res.status(401).send("Not authorized, no token");
  }
};
