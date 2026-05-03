import { Request, Response, NextFunction } from "express";

export const restrictTo =
  (...allowedRoles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        status: "fail",
        message: "not authorized",
      });
    }
    if (!req.user.role || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to perform this action",
      });
    }
    return next();
  };

export const allowSelfOrAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return res.status(401).json({
      statu: "fail",
      message: "Not authorized",
    });
  }
  //   admin is allowed to do whatever he want's on user
  if (req.user.name === "admin") {
    return next();
  }
  // from route we receive the user id on which it act's
  const requestedUserId = req.params.id;
  // the id of an user which is logged in through token came turning into string
  const loggedInUserId = req.user._id.toString();
  if (loggedInUserId === requestedUserId) {
    return next();
  }
  return res.status(403).json({
    status: "fail",
    message: "You can only access your own account",
  });
};
