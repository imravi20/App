require("dotenv").config();
const jwtPassword = process.env.JWT_SECRETKEY;
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { authenticateUser } = require("../middleware/middleware");
const {
  userInputFormatValidation,
} = require("../inputFormatValidation/zodVerify");
const { users } = require("../db/db");

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const isFormatValid = userInputFormatValidation.safeParse({
      email,
      password,
    });
    if (!isFormatValid.success) {
      return res.status(400).json({ msg: "Input format invalid" });
    }

    const existUser = await users.findOne({ email });
    if (existUser) {
      return res.status(409).json({ msg: "User already exist" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await users.create({ email, password: hashedPassword });
    const token = jwt.sign({ userId: user._id }, jwtPassword, {
      expiresIn: "24h",
    });
    res.status(201).json({ token: token });
  } catch (e) {
    console.log("signup failed", e);
    res.status(500).json({ msg: "signup failed" });
  }
});

router.post("/login", authenticateUser, (req, res) => {});

router.get("/getCourses", authenticateUser, (req, res) => {});

router.get("/getCourseById/:id", authenticateUser, (req, res) => {});

router.post("/addTodo", authenticateUser, (req, res) => {});
