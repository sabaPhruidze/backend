"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//here we will import .dotenv in order to than use hidden Token, secret keys and port using process.env
require("dotenv/config");
const assert_1 = __importDefault(require("assert"));
// //let's install express in order to make the process of creating server easier
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./config/db"));
const fsRoutes_1 = __importDefault(require("./routes/fsRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
//testing how the uncaughtExpection and unhandled rejection works
process.on("uncaughtException", (err) => {
    const message = err instanceof Error ? err.message : String(err);
    console.error("critical error, system must be shut down", message);
    process.exit(1);
});
process.on("unhandledRejection", (err) => {
    const message = err instanceof Error ? err.message : String(err);
    console.error("unhandled promise rejection", message);
    process.exit(1);
});
(0, db_1.default)();
const app = (0, express_1.default)();
const port = process.env.PORT;
(0, assert_1.default)(process.env.JWT_ACCESS_SECRET, "JWT_ACCESS_SECRET IS IMPORTANT");
(0, assert_1.default)(process.env.JWT_REFRESH_SECRET, "JWT_REFRESH_SECRET IS IMPORTANT");
// if reverse proxy/https ,cookie secure work correctly
app.set("trust proxy", 1);
// api default for security standard's
app.use((0, helmet_1.default)());
// CORS : allow only my front-end domain + cookie send right
const allowedOrigins = (process.env.CORS_ORIGIN ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, cb) => {
        //thunderClient sometimes does not have origin
        if (!origin)
            return cb(null, true);
        // whitelist
        if (allowedOrigins.includes(origin))
            return cb(null, true);
        return cb(new Error("Not allowed by CORS"));
    },
    credentials: true, //for httpOnly cookie refresh flow
}));
app.use(express_1.default.json());
// cookie read from req.cookies
app.use((0, cookie_parser_1.default)());
app.use("/api/users", userRoutes_1.default);
app.use("/api/fs", fsRoutes_1.default);
app.listen(port, () => {
    console.log(`Server: http://localhost:${port}/about?age=22`);
    console.log(`About:  http://localhost:${port}/api/users`);
});
// in order to install nodemon you must know that nodemon is a dev dependency, it will not be used when project starts so we have to install --save-dev by simply writing -D
