const { z } = require("zod");

// Receiving only name,email,password and strict() will not allow other fields such as (role , isAdmin...)
const registerSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(30, "Name must be at most 30 characters"),
  email: z
    .email("Invalid Email format")
    .trim()
    .max(50, "Email must be at most 50 characters"),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(30, "Password must be at most 30 characters"),
});
const loginSchema = z.object({
  email: z.email("Invalid Email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

module.exports = { registerSchema };
