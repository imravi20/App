require("dotenv").config();
const express = require("express");
const app = express();
const { userRouter } = require("./router/user");
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("ok");
});

app.use("/users", userRouter);

// Catch-all handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ msg: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err); // Log the error to the console
  res.status(500).json({ msg: "Internal server error" });
});

app.listen(port, () => {
  console.log("server running");
});
