const users = [
  { id: 1, name: "Kate", role: "Admin", age: 22 },
  { id: 2, name: "Nino", role: "User", age: 22 },
  { id: 3, name: "Anna", role: "Editor", age: 24 },
];

const getUsers = (req, res) => {
  res.json(users);
};
const createUsers = (req, res) => {
  const newUser = req.body; // in order this to work we need middleware app.use(express.json());
  if (!newUser.name) {
    return res.status(404).json({ message: "Name is necessary" });
  }
  newUser.id = users.length + 1; // since currently we do not use database , I will create id like this
  users.push(newUser);
  return res
    .status(201)
    .json({ message: "Succesfully added the user", user: users });
};

const changeUsers = (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ message: "User does not exist" });
  }
  if (!user.name) {
    return res.status(400).json({ message: "User name is necessary" });
  }
  user.name = req.body.name;
  if (user.role) {
    user.role = req.body.role;
  }
  if (user.age) {
    user.age = req.body.age;
  }
  return res.status(200).json({ message: "succesfully updated", user: user });
};
const deleteUsers = (req, res) => {
  const userId = parseInt(req.params.id);
  const findIndex = users.findIndex((u) => u.id === userId);
  if (findIndex === -1) {
    return res.status(404).json({ message: "User does not exit" });
  }
  const removeUser = users.splice(findIndex, 1);
  return res.json({
    message: "მომხმარებელი წარმატებით წაიშალა",
    user: removeUser,
  });
};
