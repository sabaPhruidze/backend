//here we will import .dotenv in order to than use hidden Token, secret keys and port using process.env
require("dotenv").config();
// //let's install express in order to make the process of creating server easier
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); // middleware
app.get("/", (req, res) => {
  res.send("Send only returns string");
});
app.get("/api/users/:id", (req, res) => {
  // let's change this and make dynamic

  const currentId = parseInt(req.params.id);
  const concreteUser = users.find((user) => user.id === currentId); // currently am not using typescript here
  if (!concreteUser) {
    return res
      .status(404)
      .json({ message: `cannot find user with the id: ${currentId}` });
  }
  return res.json(concreteUser); //We use not send but json for returning object and arrays
});
app.get("/about", (req, res) => {
  const requestedAge = parseInt(req.query.age);
  if (requestedAge) {
    const filteredUser = users.filter((user) => user.age === requestedAge);
    return res.json(filteredUser);
  } else {
    return res.json(users);
  }
});
app.get("/api/users");
// in order to check Our CRUD does it function or not we I use vscode extenshion thunder client, now I will start the post method
app.post("/api/users");
app.put("/api/users/:id");
app.delete("/api/users/:id");
app.listen(port, () => {
  console.log(`Server: http://localhost:${port}/about?age=22`);
  console.log(`About:  http://localhost:${port}/api/users`);
});
// in order to install nodemon you must know that nodemon is a dev dependency, it will not be used when project starts so we have to install --save-dev by simply writing -D
