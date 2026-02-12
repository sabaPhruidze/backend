const { z } = require("zod");

const registerSchema = z.object({
  body: z.object({
    email: z.email("Wrong email format"),
    password: z.string().min(8, "Password must be at least 8 character"),
    age: z.number().min(18, "age must be at least 18"),
  }),
});

module.exports = { registerSchema };
