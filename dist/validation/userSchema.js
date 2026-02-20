"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userQuerySchema = exports.userIdParamSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
// Receiving only name,email,password and strict() will not allow other fields such as (role , isAdmin...)
exports.registerSchema = zod_1.z
    .object({
    name: zod_1.z
        .string()
        .trim()
        .min(2, "Name is required")
        .max(30, "Name must be at most 30 characters"),
    email: zod_1.z
        .email("Invalid Email format")
        .trim()
        .max(50, "Email must be at most 50 characters"),
    password: zod_1.z
        .string("Password is required")
        .min(8, "Password must be at least 8 characters")
        .max(30, "Password must be at most 30 characters"),
})
    .strict();
exports.loginSchema = zod_1.z
    .object({
    email: zod_1.z.email("Invalid Email"),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
})
    .strict();
exports.userIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, "id is required"),
});
exports.userQuerySchema = zod_1.z
    .object({
    search: zod_1.z.string().trim().min(1).optional(),
    role: zod_1.z.enum(["user", "admin"]).optional(),
    page: zod_1.z.coerce
        .number()
        .int("it must be 1,2,3... not 2.5 , 344.24234234")
        .min(1)
        .optional(), // z.coerce.number() string to number
    limit: zod_1.z.coerce
        .number() // if string didn't turn into the number than zod by itself cause an error
        .int("it must be 1,2,3... not 2.5 , 344.24234234")
        .min(1)
        .max(100)
        .optional(), //int() X-2.5 O-2
})
    .strict(); // if there be a parameter that is not within schema it will not allow
