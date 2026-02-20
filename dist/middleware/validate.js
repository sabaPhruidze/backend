"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validate = (schema, target = "body", label) => (req, res, next) => {
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
    req[target] = result.data; //Text will be trimmed , no additional fields and no additional check in controller anymore
    next();
};
exports.validate = validate;
