require("dotenv").config();
const { default: mongoose } = require("mongoose");

const mongoURL = process.env.MONGO_URL;
mongoose
  .connect(mongoURL)
  .then(() => {
    console.log("Db successfully connected");
  })
  .catch((e) => {
    console.log("error in db connection phase", e);
  });

const userSchema = mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  todosId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Todo",
    },
  ],
});

const todoSchema = mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const users = mongoose.model("User", userSchema);
const todos = mongoose.model("Todo", todoSchema);

module.exports = { users, todos };
