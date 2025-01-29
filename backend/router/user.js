require("dotenv").config();
const jwtPassword = process.env.JWT_SECRETKEY;
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { authenticateUser } = require("../middleware/middleware");
const {
  userInputFormatValidation,
  todoInputFormatValidation,
} = require("../inputFormatValidation/zodVerify");
const { users, todos } = require("../db/db");

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
    res.status(201).json({ msg: "User created" });
  } catch (e) {
    console.log("signup failed", e);
    res.status(500).json({ msg: "signup failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const inputFormatValidation = userInputFormatValidation.safeParse({
      email,
      password,
    });
    if (!inputFormatValidation.success) {
      return res.status(400).json({ msg: "Input format invalid" });
    }
    const existUser = await users.findOne({ email });
    if (!existUser) {
      return res.status(401).json({ msg: "Invalid Credentials" });
    }
    const passwordMatch = await bcrypt.compare(password, existUser.password);
    if (passwordMatch) {
      const token = jwt.sign({ userId: existUser._id }, jwtPassword, {
        expiresIn: "24h",
      });
      res.status(200).json({ msg: "Login successful", token });
    } else {
      return res.status(401).json({ msg: "Invalid Credentials" });
    }
  } catch (e) {
    console.log("login failed", e);
    res.status(500).json({ msg: "login failed" });
  }
});

router.get("/getTodos", authenticateUser, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ msg: "No todos found" });
    }
    const user = await users.findOne({ _id: req.user.userId });

    const todoss = await todos.find({ _id: { $in: user.todosId } });

    res.json({
      todoss,
    });
  } catch (e) {
    res.status(500).json({ msg: "Failed to fetch todos" });
  }
});

router.get("/getTodosById/:id", authenticateUser, async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ msg: "Todo ID is required" });
    }

    const todo = await todos.findOne({ _id: id });

    if (!todo) {
      return res.status(404).json({ msg: "Todo not found" });
    }
    // Security Check: Ensure the user owns the requested todo
    if (todo.userId.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ msg: "Unauthorized: You don't have access to this todo" });
    }

    res.json({ todo });
  } catch (e) {
    console.error("Error fetching todo by ID:", e);
    res.status(500).json({ msg: "Failed to fetch todo" });
  }
});

router.post("/addTodo", authenticateUser, async (req, res) => {
  try {
    const { title, description } = req.body;
    const inputFormatValidation = todoInputFormatValidation.safeParse({
      title,
      description,
    });
    if (!inputFormatValidation.success) {
      return res.status(400).json({ msg: "Input format invalid" });
    }
    const todo = await todos.create({
      title: title,
      description: description,
      userId: req.user.userId,
    });
    if (todo) {
      await users.updateOne(
        { _id: req.user.userId },
        {
          $push: {
            todosId: todo._id,
          },
        }
      );
      return res.status(201).json({ msg: "todo created" });
    }
    res.status(500).json({ msg: "Failed to create todo" });
  } catch (e) {
    console.error("Error in /addTodo:", e);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

module.exports = { userRouter: router };
