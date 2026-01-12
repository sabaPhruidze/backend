//here we will import .dotenv in order to than use hidden Token, secret keys and port using process.env
require("dotenv").config();
// //let's install express in order to make the process of creating server easier
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Send only returns string");
});
app.get("/api/users/:id", (req, res) => {
  // let's change this and make dynamic
  const users = [
    { id: 1, name: "Kate", role: "Admin", age: 25 },
    { id: 2, name: "Nino", role: "User", age: 22 },
    { id: 3, name: "Anna", role: "Editor", age: 24 },
  ];
  const currentId = parseInt(req.params.id);
  const concreteUser = users.find((user) => user.id === currentId); // currently am not using typescript here
  if (!concreteUser) {
    res
      .status(404)
      .json({ message: `cannot find user with the id: ${currentId}` });
  }
  res.json(concreteUser); //We use not send but json for returning object and arrays
});
app.listen(port, () => {
  console.log(`Server: http://localhost:${port}`);
  console.log(`About:  http://localhost:${port}/api/users/1`);
});
