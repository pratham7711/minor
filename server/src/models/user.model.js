import mongoose from "mongoose";
import modelOptions from "./model.options.js";
import crypto from "crypto"; //used for cryptographic functions like encryption and decryption

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    salt: {
      //salt is a random buffer or string used to encrypt or decrypt password
      type: String,
      required: true,
      select: false,
    },
    requests: {
      type: Array,
      default: [],
    },
    friends: {
      type: Array,
      default: [],
    },
  },
  modelOptions
);

userSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.password = crypto
    .pbkdf2Sync(
      password,
      this.salt,
      1000, //no. of iterations more iterations === more security
      64, //length of the key to be derived
      "sha512" //this is the digestion method used sha- secure hash algorithm 512-bytes
    )
    .toString("hex");
};

userSchema.methods.validPassword = function (password) {
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, "sha512")
    .toString("hex"); //hash is the decrypted password
  return this.password === hash; //checking if password is valid
};

const userModel = mongoose.model("user", userSchema);

export default userModel;
