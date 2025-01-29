require("dotenv").config();
const jwtPassword = process.env.JWT_SECRETKEY;
const jwt = require("jsonwebtoken");

function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ msg: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const validToken = jwt.verify(token, jwtPassword);

    if (validToken) {
      req.user = validToken;
      next();
    } else {
      res.status(401).json({ msg: "Invalid Credentials" });
    }
  } catch (e) {
    console.log("Error occured during validation", e);
    res.status(401).json({ msg: "Unauthorized: Invalid or expired token" });
  }
}

module.exports = { authenticateUser };
