import jwt from "jsonwebtoken";
import User from "../models/userModels";

//short time token 15minutes
export const generateAccessToken = (userId: string) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
    expiresIn: "15m",
  });
};
// long time token 7d
export const generateRefreshToken = (userId: string) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
};
