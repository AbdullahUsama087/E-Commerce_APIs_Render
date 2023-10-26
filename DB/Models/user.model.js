import { Schema, model } from "mongoose"

import pkg from "bcrypt";
import systemRoles from "../../Src/Utils/systemRoles.js";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    address: [
      {
        type: String,
        required: true,
      },
    ],
    profilePic: {
      secure_url: String,
      public_id: String,
    },
    gender: {
      type: String,
      required: true,
      default: "Not Specified",
      enum: ["Male", "Female", "Not Specified"],
    },
    age: Number,
    status: {
      type: String,
      default: "Offline",
      enum: ["Offline", "Online"],
    },
    isConfirmed: {
      type: Boolean,
      required: true,
      default: false,
    },
    role: {
      type: String,
      default: systemRoles.USER,
      enum: [systemRoles.USER, systemRoles.ADMIN, systemRoles.SUPER_ADMIN],
    },
    token: String,
    forgetCode: String,
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

//=================  HOOKS ===================
/***************** Hash Password **************/
userSchema.pre("save", function (next, hash) {
  this.password = pkg.hashSync(this.password, +process.env.SALT_ROUNDS);
  next();
});

const userModel = model("User", userSchema);

export default userModel;
