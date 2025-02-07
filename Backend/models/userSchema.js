import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto"; // core module import
// Define the schema
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Please enter your name"],
      maxlength: [100, "Name cannot be longer than 100 characters"],
    },
    phone: {
      type: String,
      required: [true, "Please enter your phone number"],
      unique: true,
      match: [/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number"], // E.164 format
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      match: [
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
        "Please enter a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minlength: [8, "Password must be at least 8 characters long"],
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      ],
      select: false, // Exclude password from query results
    },
    avatar: {
      public_id: { type: String, required: true, default: null },
      url: { type: String, required: true, default: null },
    },
    resume: {
      public_id: { type: String, required: true, default: null },
      url: { type: String, required: true, default: null },
    },
    portfolioURL: {
      type: String,
      required: [true, "Please enter your portfolio URL"],
      match: [
        /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+(\/\S*)?$/,
        "Please enter a valid URL",
      ],
    },
    about: {
      type: String,
      required: true,
      default: "This user has not added any information about themselves yet.",
      maxlength: [500, "About section cannot be more than 500 characters"],
    },
    githubLink: { type: String, default: "" },
    linkedinLink: { type: String, default: "" },
    facebookLink: { type: String, default: "" },
    twitterLink: { type: String, default: "" },
    instagramLink: { type: String, default: "" },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpire: { type: Date, default: null },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Hash the user's password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate JWT token
userSchema.methods.generateJsonWebToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

// Hide password field in responses
userSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.password;
    return ret;
  },
});

userSchema.set("toObject", {
  transform: function (doc, ret) {
    delete ret.password;
    return ret;
  },
});

userSchema.methods.getResetPasswordToken =  function () {
  // ✅ Generate a random token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // ✅ Hash the token and store it in the database
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  // ✅ Set expiration time (15 minutes)
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  // ✅ Return the plain token (not the hashed one)
  return resetToken;
};


// Create the model
const User = mongoose.model("User", userSchema);

export default User;
