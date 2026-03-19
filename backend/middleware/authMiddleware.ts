import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/userModels";

type JWTPayLoad = {
  id: string;
  type?: "access" | "refresh";
};
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "There is not token" });
  } //token must start with Bearer

  try {
    const token = auth.split(" ")[1];
    const accessSecret = process.env.JWT_ACCESS_SECRET;
    if (!accessSecret) {
      return res.status(500).json({ message: "JWT_ACCESS_SECRET is missing" });
    }

    const decoded = jwt.verify(token, accessSecret) as JWTPayLoad;
    if (decoded.type !== "access") {
      //e.x it is refresh
      return res.status(401).json({ message: "Invalid token type" });
    }
    const user = await User.findById(decoded.id).select("-password").lean(); // here added the lean
    if (!user) {
      return res.status(401).json({ message: "not authorized" });
    }
    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    return next();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    return res.status(401).json({ message: "not authorized" });
  }
};
