const mongoose = require("mongoose");
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "It is necessary to write your name"],
    },
    email: {
      type: String,
      required: [true, "Email is necessary"],
      unique: true, //there has to be no identical emails
    },
    password: {
      type: String,
      required: [true, "Password is necesarry"],
    },
    role: {
      type: String,
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("User", userSchema);
