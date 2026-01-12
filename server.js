//@ts-check
//here we will import .dotenv in order to than use hidden Token, secret keys and port using process.env
require("dotenv").config();
// //let's install express in order to make the process of creating server easier
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Send only returns string");
});
app.get("/about", (req, res) => {
  const user = [
    { id: 1, name: "Saba" },
    { id: 2, name: "Tofu" },
  ];
  res.json(user); //We use not send but json for returning object and arrays
});
app.listen(port, () => {
  console.log(`Server: http://localhost:${port}`);
  console.log(`About:  http://localhost:${port}/about`);
});
