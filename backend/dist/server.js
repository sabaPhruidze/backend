"use strict";
// server.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// .env ფაილიდან env ცვლადების ჩატვირთვა
require("dotenv/config");
const assert_1 = __importDefault(require("assert"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const db_1 = __importDefault(require("./config/db"));
const fsRoutes_1 = __importDefault(require("./routes/fsRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
// -----------------------------
// კრიტიკული შეცდომების დაჭერა
// -----------------------------
process.on("uncaughtException", (err) => {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Critical error, system must be shut down:", message);
    process.exit(1);
});
process.on("unhandledRejection", (err) => {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Unhandled promise rejection:", message);
    process.exit(1);
});
// -----------------------------
// აუცილებელი ENV ცვლადების შემოწმება
// -----------------------------
(0, assert_1.default)(process.env.JWT_ACCESS_SECRET, "JWT_ACCESS_SECRET is required");
(0, assert_1.default)(process.env.JWT_REFRESH_SECRET, "JWT_REFRESH_SECRET is required");
(0, assert_1.default)(process.env.MONGO_URI, "MONGO_URI is required");
// -----------------------------
// აპის შექმნა
// -----------------------------
const app = (0, express_1.default)();
const port = Number(process.env.PORT) || 3000;
// -----------------------------
// DB კავშირის გაშვება
// -----------------------------
(0, db_1.default)();
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
app.use((0, helmet_1.default)());
// CORS კონფიგურაცია
app.use((0, cors_1.default)({
    origin: (origin, cb) => {
        // Thunder Client/Postman-ის დროს origin შეიძლება საერთოდ არ იყოს
        if (!origin)
            return cb(null, true);
        // whitelist შემოწმება
        if (allowedOrigins.includes(origin)) {
            return cb(null, true);
        }
        return cb(new Error("Not allowed by CORS"));
    },
    credentials: true, // cookie-ს გასაგზავნად საჭიროა
}));
// JSON body-ს წაკითხვა
app.use(express_1.default.json());
// Cookie-ს წაკითხვა req.cookies-დან
app.use((0, cookie_parser_1.default)());
// -----------------------------
// ROUTES
// ახლა უკვე req.body და req.cookies მზად არის
// -----------------------------
app.use("/api/users", userRoutes_1.default);
app.use("/api/fs", fsRoutes_1.default);
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
