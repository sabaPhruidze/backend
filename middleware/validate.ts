import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

type Target = "body" | "query" | "params";

export const validate =
  (schema: z.ZodSchema, target: Target = "body", label?: string) =>
  (req: Request, res: Response, next: NextFunction) => {
    //schema is registerSchema from userSchema at this moment passed through using routes futture
    // this result will return { success: true, data } or { success: false, error }
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      return res.status(400).json({
        message: label ?? `${target} validation errors`,
        errors: result.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
    }
    //{ success: true, data }
    (req as any)[target] = result.data; //Text will be trimmed , no additional fields and no additional check in controller anymore
    next();
  };
