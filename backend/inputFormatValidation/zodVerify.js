const zod = require("zod");

const userInputFormatValidation = z.object({
  email: zod.string().email("Invalid email format"),
  password: zod.string.min(5, "Password must be at least 5 characters long"),
});

const courseInputFormatValidation = z.object({
  title: zod.string().min(5, "Title must be at least 5 characters long"),
  description: zod.string.min(
    10,
    "Description must be at least 10 characters long"
  ),
});

module.exports = { userInputFormatValidation, courseInputFormatValidation };
