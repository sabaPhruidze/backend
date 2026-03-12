import jwt from "jsonwebtoken";

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
