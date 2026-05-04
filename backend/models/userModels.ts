import mongoose, { Schema, model, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "It is necessary to write your name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is necessary"],
      unique: true, //there has to be no identical emails
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is necesarry"],
      select: false, // By this until I write +password it will not be received
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    // Here will will save refreshSessions safely. plaintext here will not come
    refreshTokenHash: {
      // original refresh token will be save independently
      type: String,
      default: null, // refreshTokenHash is string or null
      select: false, // defaultly it does not have to return as password.
    },
  },
  {
    timestamps: true,
  },
);
/* indexes 1) role + createdAt => fast filter and sort (on enterprise use-case)
 * createdAt => fast sorting
 */
userSchema.index({ role: 1, createdAt: -1 });
userSchema.index({ createdAt: -1 });

export type UserDoc = InferSchemaType<typeof userSchema>; // like in zod here inferSchemaType creates type from userchema
const User = mongoose.models.User || model<UserDoc>("User", userSchema); //for solving this error OverwriteModelError: Cannot overwrite 'User' model once compiled.
export default User;
