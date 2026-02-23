//here we will import .dotenv in order to than use hidden Token, secret keys and port using process.env
import "dotenv/config";
import assert from "assert";
// //let's install express in order to make the process of creating server easier
import express from "express";
import connectDB from "./config/db";
import fsRoutes from "./routes/fsRoutes";
import userRoutes from "./routes/userRoutes";

//testing how the uncaughtExpection and unhandled rejection works
process.on("uncaughtException", (err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error("critical error, system must be shut down", message);
  process.exit(1);
});
process.on("unhandledRejection", (err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error("unhandled promise rejection", message);
  process.exit(1);
});

connectDB();
const app = express();
const port = process.env.PORT;
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/fs", fsRoutes);
assert(process.env.JWT_SECRET, "JWT_SECRET IS IMPORTANT");
app.listen(port, () => {
  console.log(`Server: http://localhost:${port}/about?age=22`);
  console.log(`About:  http://localhost:${port}/api/users`);
});
// in order to install nodemon you must know that nodemon is a dev dependency, it will not be used when project starts so we have to install --save-dev by simply writing -D
