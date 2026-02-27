import type { Request, Response } from "express";
import User from "../models/userModels";
import { RegisterBody, type UserQuery } from "../validation/userSchema";
import { LoginBody } from "../validation/userSchema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
console.log(process.cwd());

// .select() , .lean() , sort(), limit/skip ; total count
const getUsers = async (req: Request, res: Response) => {
  try {
    const { search, role } = req.query as Record<string, string>;
    // from query page and limit comes as string so I will convert them to number
    const pageNum = Math.max(
      parseInt((req.query.page as string) ?? "1", 10) || 1,
      1,
    );
    const limitNum = Math.min(
      Math.max(parseInt((req.query.limit as string) ?? "5", 10) || 5, 1),
      100,
    );
    const filter: Record<string, any> = {};
    //Search name or email
    if (search?.trim()) {
      const term = search.trim();
      filter.$or = [
        { name: { $regex: term, $options: "i" } },
        { email: { $regex: term, $options: "i" } },
      ];
    }
    if (role) {
      filter.role = role;
    }
    const skip = (pageNum - 1) * limitNum;
    const [items, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 }) // last in first shown (using createdat)
        .skip(skip)
        .limit(limitNum) // select(-password) removed because it is already written in model
        .lean(), //fast read
      User.countDocuments(filter),
    ]);
    const pages = Math.ceil(total / limitNum);
    return res.status(200).json({
      items,
      page: pageNum,
      limit: limitNum,
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
    const { email, password } = req.body as LoginBody;
    const user = await User.findOne({ email }).select("+password"); // password will come but typescript might still think undefined so I will write down that case
    if (!user || !user.password) {
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ message: message });
  }
};
const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const user = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!user) {
      return res.status(404).json({ message: "user does not exist" });
    } else {
      return res.status(200).json(user);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(400).json({ message });
  }
};
const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "user does not exist" });
    } else {
      return res.status(200).json(user);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(400).json({ message });
  }
};
const generateToken = (id: string) => {
  const secret = process.env.JTW_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is missing");
  }
  return jwt.sign({ id }, secret, {
    expiresIn: "30d",
  });
};
const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "user does not exist" });
    }
    return res.status(200).json(user);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ message });
  }
};

export default {
  getUsers,
  registerUsers,
  loginUsers,
  updateUser,
  deleteUser,
  getUserById,
};
