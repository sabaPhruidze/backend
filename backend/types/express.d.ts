import type { Types } from "mongoose";
type ValidatedTarget = "body" | "params" | "query";
type ValidatedBag = Partial<Record<ValidatedTarget, unknown>>;
declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: Types.ObjectId;
        name?: string;
        email?: string;
        role?: string;
      };
      validated?: ValidatedBag;
    }
  }
}
export {};
