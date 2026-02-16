const validate = (schema) => (req, res, next) => {
  //schema is registerSchema from userSchema at this moment passed through using routes futture
  // this result will return { success: true, data } or { success: false, error }
  const result = schema.safeParse(req.body);
  if (!result.success) {
    //{ success: false, error }
    const errors = result.error.issues.map((issue) => ({
      // sample [
      // { path: ["name"], message: "Name must be at least 2 characters", ... },
      // { path: ["email"], message: "Invalid email format", ... },
      // { path: ["password"], message: "Password must be at least 8 characters", ... }
      //]
      path: issue.path.join("."),
      message: issue.message,
    }));
    return res.status(400).json({
      message: "Validation Errors",
      errors,
    });
  }
  //{ success: true, data }
  req.body = result.data; //Text will be trimmed , no additional fields and no additional check in controller anymore
  next();
};
module.exports = validate;
