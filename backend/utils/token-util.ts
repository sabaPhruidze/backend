import jwt from "jsonwebtoken";
import crypto from "crypto";

//short time token 15minutes
export const generateAccessToken = (userId: string) => {
  return jwt.sign(
    { id: userId, type: "access" }, // payload type addedd
    process.env.JWT_ACCESS_SECRET as string,
    {
      expiresIn: "15m",
    },
  );
};
// long time token 7d
export const generateRefreshToken = (userId: string) => {
  return jwt.sign(
    { id: userId, type: "refresh" },
    process.env.JWT_REFRESH_SECRET as string,
    {
      expiresIn: "7d",
    },
  );
};
// This function makes real token hashed in order not to savve plain token there
export const hashToken = (token: string) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
