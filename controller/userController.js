const User = require("../models/userModels");

const getUsers = async (req, res) => {
  try {
    const allUsers = await User.find(); // it will give back all the users from db
    res.status(200).json(allUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const createUser = async (req, res) => {
  try {
    const newUser = await User.create(req.body); //simply writing create that's all all check goes to mongoose schema
    return res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!user) {
      return res.status(404).json({ message: "user does not exist" });
    } else {
      return res.status(200).json(user);
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
const deleteUser = async (req, res) => {
  try {
    const user = await findbyIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "user does not exist" });
    } else {
      return res.status(200).json(user);
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
module.exports = { getUsers, createUser, updateUser, deleteUser };
