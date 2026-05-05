import type { Request, Response } from "express";
import {
  REFRESH_COOKIE_NAME,
  getRefreshCookieOptions,
  getClearRefreshCookieOptions,
} from "../utils/cookie-options";
import jwt from "jsonwebtoken";
import User from "../models/userModels";
import {
  RegisterBody,
  LoginBody,
  UpdateUserBody,
  UserQuery,
} from "../validation/userSchema";
import {} from "../validation/userSchema";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from "../utils/token-util";
console.log(process.cwd());

// .select() , .lean() , sort(), limit/skip ; total count
const getUsers = async (req: Request, res: Response): Promise<Response> => {
  try {
    const queryData = req.validated?.query as UserQuery | undefined;
    if (!queryData)
      return res.status(400).json({ message: "Query data is missing" });
    const { search, role } = queryData;
    // useQuerySchema turn's it into number so page will be already number not string
    const pageNum = queryData.page ?? 1;
    const limitNum = queryData.limit ?? 5; //same here
    const filter: Record<string, any> = {};

    if (search?.trim()) {
      const term = search.trim();
      filter.$or = [
        { name: { $regex: term, $options: "i" } },
        { email: { $regex: term, $options: "i" } },
      ];
    }
    // role is laready checked user or admin
    if (role) {
      filter.role = role;
    }
    const skip = (pageNum - 1) * limitNum;
    const [items, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
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
    const registerData = req.validated?.body as RegisterBody | undefined;
    if (!registerData)
      return res.status(400).json({ message: "Register data is missing" });
    const { name, email, password } = registerData;
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

    return res.status(201).json({
      status: "success",
      message: "User registered succesfully",
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
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
    return res.status(500).json({ message });
  }
};
const loginUsers = async (req: Request, res: Response): Promise<Response> => {
  try {
    const loginData = req.validated?.body as LoginBody | undefined;
    if (!loginData)
      return res
        .status(400)
        .json({ status: "fail", message: "login data is missing" });
    const { email, password } = loginData;

    const user = await User.findOne({ email }).select("+password"); // password will come but typescript might still think undefined so I will write down that case
    const invalidCreds = {
      status: "fail",
      message: "Wrong authentification data",
    };
    if (!user || !user.password) {
      return res.status(401).json(invalidCreds);
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json(invalidCreds);
    }
    const userId = user._id.toString(); // mongoose id

    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);

    // real refresh token now will be hashed for db
    const hashedRefreshToken = hashToken(refreshToken);
    // in user document we only save hashed

    user.refreshTokenHash = hashedRefreshToken;
    //  in order to for real written in db this save is necessary
    await user.save();

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions());
    return res.status(200).json({
      status: "success",
      accessToken,
    });
  } catch (error: unknown) {
    console.error("loginUsers error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};
const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    // instead of req.body we will use already checked and validated body
    const updateData = req.validated?.body as UpdateUserBody | undefined;
    if (updateData)
      return res.status(400).json({ message: "Update data is mising" });
    // now only name and email will be sent in database
    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password -refreshTokenHash"); //response sensitive fields closed
    if (!user) return res.status(404).json({ message: "User does not exist" });
    return res.status(200).json(user);
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
const explainUsersQuery = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const queryData = req.validated?.query as UserQuery | undefined;
    if (!queryData)
      return res.status(400).json({ message: "Query data is missing" });
    // Added this in order to see if the mongodb really use indexes or not
    const { search, role } = queryData;

    const filter: Record<string, any> = {};
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
    const explanation = await User.find(filter).explain("executionStats");
    return res.status(200).json({
      filter,
      explanation,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ message });
  }
};
type RefreshTokenPayload = {
  id: string;
  type?: "access" | "refresh";
};
const refreshAccessToken = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const refreshToken = req.cookies?.refresh;
    if (!refreshToken) {
      return res.status(401).json({
        status: "fail",
        message: "Refresh token not found",
      });
    }
    const refreshSecret = process.env.JWT_REFRESH_SECRET;

    if (!refreshSecret) {
      return res.status(500).json({
        status: "error",
        message: "JWT_REFRESH_SECRET is missing",
      });
    }
    const cookieSameSite =
      (process.env.COOKIE_SAMESITE as "lax" | "strict" | "none" | undefined) ??
      "lax";
    //checking refresh token with it's secret signature
    const decoded = jwt.verify(
      refreshToken,
      refreshSecret,
    ) as RefreshTokenPayload;

    if (decoded.type !== "refresh") {
      return res.status(401).json({
        status: "fail",
        message: "Invalid token type",
      });
    }
    // brought user's relevant refreshTokenHash
    const user = await User.findById(decoded.id).select(
      "+refreshTokenHash -password",
    ); // in standard we have not selected refreshTokenHash so I wrote + as for password , it might forget that it does not have to bring so I added in case

    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "User not found",
      });
    }
    if (!user.refreshTokenHash) {
      return res.status(401).json({
        status: "fail",
        message: "Refresh token is not active",
      });
    }

    // real refresh token is hashed here (from cookie)
    const incomingRefreshTokenHash = hashToken(refreshToken);
    // here we will check refreshTokenHash with refreshToken
    // if hash does not mach this token must not be considered safe
    if (incomingRefreshTokenHash !== user.refreshTokenHash) {
      user.refreshTokenHash = null; //refresh session canceled
      await user.save();
      res.clearCookie(REFRESH_COOKIE_NAME, getClearRefreshCookieOptions());
      return res.status(401).json({
        status: "fail",
        message: "Refresh token reuse detected. Please log in again",
      });
    }
    // this time done no rotation yes so I will add access token return
    const newAccessToken = generateAccessToken(user._id.toString());
    // this time will ad refresh token as well
    const newRefreshToken = generateRefreshToken(user._id.toString());
    const newHashedRefreshToken = hashToken(newRefreshToken); // new refresh token hash
    user.refreshTokenHash = newHashedRefreshToken; // on db old hash changed by new
    await user.save(); // new hash is saved in real in db

    res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, getRefreshCookieOptions());
    // refresh endpoint only return's access token currently
    return res.status(200).json({
      status: "success",
      accessToken: newAccessToken,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.log("refreshAccessToken error: ", message);

    return res.status(401).json({
      status: "fail",
      message: "Invalid or expired refresh token",
    });
  }
};

// logout endpoint
const logout = async (req: Request, res: Response): Promise<Response> => {
  try {
    const cookieSameSite =
      (process.env.COOKIE_SAMESITE as "lax" | "strict" | "none" | undefined) ??
      "lax";
    // from procect middleware we know which user logs out
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        status: "fail",
        message: "Not authorized",
      });
    }
    // by this on logout saved db refresh token hash will become null
    await User.findByIdAndUpdate(userId, {
      $set: { refreshTokenHash: null },
    });
    // refresh cookie will be deleted from brower
    res.clearCookie(REFRESH_COOKIE_NAME, getClearRefreshCookieOptions());
    return res.status(200).json({
      status: "success",
      message: "Logged out succesfully",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({
      status: "error",
      message,
    });
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
  refreshAccessToken,
  logout,
};
