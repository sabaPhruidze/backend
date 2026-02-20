import { z } from "zod";

// Receiving only name,email,password and strict() will not allow other fields such as (role , isAdmin...)
export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name is required")
      .max(30, "Name must be at most 30 characters"),
    email: z
      .email("Invalid Email format")
      .trim()
      .max(50, "Email must be at most 50 characters"),
    password: z
      .string("Password is required")
      .min(8, "Password must be at least 8 characters")
      .max(30, "Password must be at most 30 characters"),
  })
  .strict();
export const loginSchema = z
  .object({
    email: z.email("Invalid Email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  })
  .strict();
export const userIdParamSchema = z.object({
  id: z.string().min(1, "id is required"),
});
export const userQuerySchema = z
  .object({
    search: z.string().trim().min(1).optional(),
    role: z.enum(["user", "admin"]).optional(),
    page: z.coerce
      .number()
      .int("it must be 1,2,3... not 2.5 , 344.24234234")
      .min(1)
      .optional(), // z.coerce.number() string to number
    limit: z.coerce
      .number() // if string didn't turn into the number than zod by itself cause an error
      .int("it must be 1,2,3... not 2.5 , 344.24234234")
      .min(1)
      .max(100)
      .optional(), //int() X-2.5 O-2
  })
  .strict(); // if there be a parameter that is not within schema it will not allow
export type RegisterBody = z.infer<typeof registerSchema>;
export type LoginBody = z.infer<typeof loginSchema>;
export type USerIdParams = z.infer<typeof userIdParamSchema>;
export type UserQuery = z.infer<typeof userQuerySchema>;
