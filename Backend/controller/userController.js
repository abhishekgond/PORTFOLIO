import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import User from "../models/userSchema.js";
import { v2 as cloudinary } from "cloudinary";
import { generateToken } from "../utils/jswTocken.js";

export const register = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Please upload a file", 400));
  }
  const { avatar } = req.files;
  // console.log(avatar);
  const YourImage = await cloudinary.uploader.upload(avatar.tempFilePath, {
    folder: "AVATARS",
  });

  if (!YourImage || YourImage.error) {
    console.error(
      "Cloudinary Error:",
      YourImage.error || "Unknown Cloudinary Error"
    );
  }

  const { resume } = req.files;
  // console.log(resume);
  const YourResume = await cloudinary.uploader.upload(resume.tempFilePath, {
    folder: "Resume",
  });

  if (!YourResume || YourResume.error) {
    console.error(
      "Cloudinary Error:",
      YourResume.error || "Unknown Cloudinary Error"
    );
  }

  const {
    fullName,
    email,
    phone,
    about,
    password,
    portfolioURL,
    githubLink,
    linkedinLink,
    facebookLink,
    twitterLink,
    instagramLink,
  } = req.body;

  const user = await User.create({
    // FIXED: Using correct model name "User"
    fullName,
    email,
    phone,
    about,
    password,
    portfolioURL,
    githubLink,
    linkedinLink,
    facebookLink,
    twitterLink,
    instagramLink,
    avatar: {
      public_id: YourImage.public_id,
      url: YourImage.secure_url,
    },
    resume: {
      public_id: YourResume.public_id,
      url: YourResume.secure_url,
    },
  });

  generateToken(user, "User Registerd", 200, res);
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Email and password are required"));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid Email and Password!"));
  }

  const isPasswordMatch = await user.matchPassword(password);

  if (!isPasswordMatch) {
    return next(new ErrorHandler("Invalid Email and Password!"));
  }

  // Generate token using user method
  const token = user.generateJsonWebToken();

  res.status(200).json({
    success: true,
    message: "Logged In Successfully",
    token,
  });
});

