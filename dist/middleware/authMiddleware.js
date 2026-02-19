const jwt = require("jsonwebtoken");
const User = require("../models/userModels");
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization?.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");
            return next();
        }
        catch (error) {
            console.error(error);
            return res.status(401).json({ message: "not authorized" });
        }
    }
    return res.status(401).json({ message: "There is no token" });
};
module.exports = { protect };
