const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
    return res.status(400).json({
      message: "Query Validation errors",
      errors,
    });
  }
  req.query = result.data;
  next();
};
module.exports = validateQuery;
