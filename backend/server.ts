// server.ts

// .env ფაილიდან env ცვლადების ჩატვირთვა
import "dotenv/config";

import assert from "assert";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import connectDB from "./config/db";
import fsRoutes from "./routes/fsRoutes";
import userRoutes from "./routes/userRoutes";

// -----------------------------
// კრიტიკული შეცდომების დაჭერა
// -----------------------------
process.on("uncaughtException", (err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error("Critical error, system must be shut down:", message);
  process.exit(1);
});

process.on("unhandledRejection", (err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error("Unhandled promise rejection:", message);
  process.exit(1);
});

// -----------------------------
// აუცილებელი ENV ცვლადების შემოწმება
// -----------------------------
assert(process.env.JWT_ACCESS_SECRET, "JWT_ACCESS_SECRET is required");
assert(process.env.JWT_REFRESH_SECRET, "JWT_REFRESH_SECRET is required");
assert(process.env.MONGO_URI, "MONGO_URI is required");

// -----------------------------
// აპის შექმნა
// -----------------------------
const app = express();
const port = Number(process.env.PORT) || 3000;

// -----------------------------
// DB კავშირის გაშვება
// -----------------------------
connectDB();

// -----------------------------
// თუ აპი reverse proxy-ს უკან მუშაობს
// secure cookie-ს სწორი მუშაობისთვის საჭიროა
// -----------------------------
app.set("trust proxy", 1);

// -----------------------------
// დაშვებული origin-ების სია
// CORS_ORIGIN შეგიძლია გქონდეს ასეთი:
// CORS_ORIGIN=http://localhost:5173,http://localhost:3000
// -----------------------------
const allowedOrigins = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// -----------------------------
// GLOBAL MIDDLEWARE-ები
// ძალიან მნიშვნელოვანია:
// ჯერ middleware-ები, მერე routes
// -----------------------------

// უსაფრთხოების სტანდარტული header-ები
app.use(helmet());

// CORS კონფიგურაცია
app.use(
  cors({
    origin: (origin, cb) => {
      // Thunder Client/Postman-ის დროს origin შეიძლება საერთოდ არ იყოს
      if (!origin) return cb(null, true);

      // whitelist შემოწმება
      if (allowedOrigins.includes(origin)) {
        return cb(null, true);
      }

      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true, // cookie-ს გასაგზავნად საჭიროა
  }),
);

// JSON body-ს წაკითხვა
app.use(express.json());

// Cookie-ს წაკითხვა req.cookies-დან
app.use(cookieParser());

// -----------------------------
// ROUTES
// ახლა უკვე req.body და req.cookies მზად არის
// -----------------------------
app.use("/api/users", userRoutes);
app.use("/api/fs", fsRoutes);

// სურვილისამებრ health route
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// -----------------------------
// Server start
// -----------------------------
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Users API: http://localhost:${port}/api/users`);
});
