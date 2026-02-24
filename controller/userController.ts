import type { Request, Response } from "express";
import User from "../models/userModels";
import { RegisterBody, type UserQuery } from "../validation/userSchema";
import bcrypt from "bcryptjs";
console.log(process.cwd());

const getUsers = async (req: Request, res: Response) => {
  try {
    const {
      search,
      role,
      page = 1,
      limit = 5,
    } = req.query as unknown as UserQuery;
    const filter: Record<string, any> = {}; //this type shuts the filter.$or and filter.role issue
    //in filter we add conditions what type of user we want
    if (search) {
      filter.$or = [
        // $or means search document where first or second option is true
        { name: { $regex: search, $options: "i" } }, //$regex means search according to search
        { email: { $regex: search, $options: "i" } }, //$options means in "i" case not to make case insensitive AaBb
      ];
    }
    if (role) {
      filter.role = role;
    } // 1. skip = (1-1)*5 so on first page will be 5 , than 2. skip = (2-1)*5 it will leave first five and will write on next page 6-10...
    const skip = (page - 1) * limit; // pagination means slice like pages
    const [items, total] = await Promise.all([
      // all together waits of finish both
      User.find(filter).skip(skip).limit(limit).select("-password"), // if - was not written than it will show only id and password but if added eveything will be shwon besides it
      User.countDocuments(filter),
    ]);
    const pages = Math.ceil(total / limit);
    return res.status(200).json({
      items,
      page,
      limit,
      total,
      pages,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ message: message });
  }
};

const registerUsers = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body as RegisterBody;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }
    //const salt = await bcrypt.genSalt(10);
    //const hashedPassword = await bcrypt.hash(password, salt);
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ message });
  }
};
const loginUsers = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(400)
        .json({ message: "Email or Password is not correct" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Email or Password is not correct" });
    }

    return res.status(200).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const updateUser = async (req: Request, res: Response) => {
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
const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findbyIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "user does not exist" });
    } else {
      return res.status(200).json(user);
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};
const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "user does not exist" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  registerUsers,
  loginUsers,
  updateUser,
  deleteUser,
  getUserById,
};
