//here we will import .dotenv in order to than use hidden Token, secret keys and port using process.env
require("dotenv").config();
// //let's install express in order to make the process of creating server easier
const express = require("express");
const connectDB = require("./config/db");
const app = express();
const port = process.env.PORT || 3000;
const fsRoutes = require("./routes/fsRoutes");

connectDB();
app.use(express.json()); // middleware

const userRoutes = require("./routes/userRoutes");

app.use("/api/users", userRoutes);
app.use("/api/fs", fsRoutes);
app.listen(port, () => {
  console.log(`Server: http://localhost:${port}/about?age=22`);
  console.log(`About:  http://localhost:${port}/api/users`);
});
// in order to install nodemon you must know that nodemon is a dev dependency, it will not be used when project starts so we have to install --save-dev by simply writing -D
