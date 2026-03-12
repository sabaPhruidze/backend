import type { Request, Response } from "express";
import User from "../models/userModels";
import { RegisterBody } from "../validation/userSchema";
import { LoginBody } from "../validation/userSchema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../utils/token-util";
console.log(process.cwd());
type GetUsersQuery = {
  search?: string;
  role?: string;
  page?: string;
  limit?: string;
};

// .select() , .lean() , sort(), limit/skip ; total count
const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, role, page, limit } = req.query as GetUsersQuery;
    // from query page and limit comes as string so I will convert them to number
    const pageNum = Math.max(
      parseInt((req.query.page as string) ?? "1", 10) || 1,
      1,
    ); //it will be number or NAN and if NaN it will write ||1 | 10 means counting system, it is like standard | "1" means that if it is number bt -5 or less than 1 math.max writes the number that is above others
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
      // it will be faster by this way of searching both together
      User.find(filter)
        .sort({ createdAt: -1 }) // last in first shown (using createdat)
        .skip(skip)
        .limit(limitNum) // select(-password) removed because it is already written in model
        .lean(), //fast read
      User.countDocuments(filter), // this is for calculating pages ,how many documents are with the filter
    ]);
    const pages = Math.ceil(total / limitNum);
    res.status(200).json({
      items,
      page: pageNum,
      limit: limitNum,
      total,
      pages,
    });
    return;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ message: message });
    return;
  }
};

const registerUsers = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body as RegisterBody;

    const userExists = await User.findOne({ email }).lean(); // I only need to know if this email exist in database or not so I will use lean and it makes faster
    if (userExists) {
      // this is fast and easy check since it is in database we in advance stop
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
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as any).code === 11000 // wwhen 2 request comes togheter
    ) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ message });
  }
};
const loginUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as LoginBody;
    if (!email || !password) {
      res
        .status(400)
        .json({ status: "fail", message: "Email and password is necessary" });
      return;
    }
    const user = await User.findOne({ email }).select("+password"); // password will come but typescript might still think undefined so I will write down that case
    const invalidCreds = {
      status: "fail",
      message: "Wrong authentification data",
    };
    if (!user || !user.password) {
      res.status(401).json(invalidCreds);
      return;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json(invalidCreds);
      return;
    }

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());
    user.refreshToken = refreshToken; // this is a plain variant I will hash later
    await user.save();
    res.cookie("jwt", refreshToken, {
      httpOnly: true, // cookie can not be read by JS (For XSS)
      secure: process.env.NODE_ENV === "production", //only send on https
      sameSite: "strict", //CSRF issue solution
      maxAge: 7 * 24 * 60 * 60 * 1000, //will live 7 days
    });
    res.status(200).json({
      status: "success",
      accessToken,
    });
  } catch (error: unknown) {
    console.error("loginUsers error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};
const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const user = await User.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
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
  const secret = process.env.JWT_SECRET;
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
    const user = await User.findById(id).lean(); //added lean here as well
    if (!user) {
      return res.status(404).json({ message: "user does not exist" });
    }
    return res.status(200).json(user);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ message });
  }
};
const explainUsersQuery = async (req: Request, res: Response) => {
  try {
    // Added this in order to see if the mongodb really use indexes or not
    const role = req.query.role as string | undefined;
    const filter: Record<string, any> = {};
    if (role) filter.role = role;
    const plan = await User.find(filter)
      .sort({ createdAt: -1 })
      .limit(10)
      .explain("executionStats");
    return res.status(200).json(plan);
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
  explainUsersQuery,
};
