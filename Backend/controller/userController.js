import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import User from "../models/userSchema.js";
import { v2 as cloudinary } from "cloudinary";
import { generateToken } from "../utils/jswTocken.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";

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
    user: {
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      about: user.about,
      portfolioURL: user.portfolioURL,
      githubLink: user.githubLink,
      linkedinLink: user.linkedinLink,
      facebookLink: user.facebookLink,
      twitterLink: user.twitterLink,
      instagramLink: user.instagramLink,
    },
    message: "Logged In Successfully",
    token,
  });
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  try {
    // Clear the authentication cookie
    res
      .status(200)
      .cookie("token", "", {
        httpOnly: true,
        expires: new Date(0), // Expire immediately
        secure: process.env.NODE_ENV === "production", // Secure in production
        // sameSite: "strict",
      })
      .json({
        success: true,
        message: "Logged out successfully",
      });
  } catch (error) {
    return next(new ErrorHandler("Logout failed. Try again!", 500));
  }
});

export const getUser = catchAsyncErrors(async (req, res, next) => {
  try {
    // ✅ Ensure user is authenticated (req.user is set by `isAuthenticated` middleware)
    if (!req.user) {
      return next(new ErrorHandler("User not authenticated!", 401));
    }

    // ✅ Fetch user details (excluding sensitive info like password)
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return next(new ErrorHandler("User not found!", 404));
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return next(new ErrorHandler("Error fetching user details!", 500));
  }
});

export const newUpdateUser = catchAsyncErrors(async (req, res, next) => {
  // ✅ Ensure user is authenticated
  if (!req.user) {
    return next(new ErrorHandler("User not authenticated!", 401));
  }

  // ✅ Prepare update data
  const newUserData = {
    fullName: req.body.fullName,
    email: req.body.email,
    phone: req.body.phone,
    about: req.body.about,
    portfolioURL: req.body.portfolioURL,
    githubLink: req.body.githubLink,
    linkedinLink: req.body.linkedinLink,
    facebookLink: req.body.facebookLink,
    twitterLink: req.body.twitterLink,
    instagramLink: req.body.instagramLink,
  };

  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new ErrorHandler("User not found!", 404));
  }

  // ✅ Update Avatar (if provided)
  if (req.files?.avatar) {
    if (user.avatar?.public_id) {
      await cloudinary.uploader.destroy(user.avatar.public_id); // Remove old avatar
    }

    const uploadedAvatar = await cloudinary.uploader.upload(
      req.files.avatar.tempFilePath,
      {
        folder: "AVATARS",
      }
    );

    newUserData.avatar = {
      public_id: uploadedAvatar.public_id,
      url: uploadedAvatar.secure_url,
    };
  }

  // ✅ Update Resume (if provided)
  if (req.files?.resume) {
    if (user.resume?.public_id) {
      await cloudinary.uploader.destroy(user.resume.public_id); // Remove old resume
    }

    const uploadedResume = await cloudinary.uploader.upload(
      req.files.resume.tempFilePath,
      {
        folder: "RESUME",
      }
    );

    newUserData.resume = {
      public_id: uploadedResume.public_id,
      url: uploadedResume.secure_url,
    };
  }

  // ✅ Update user in DB
  const updatedUser = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true, // Return updated document
    runValidators: true,
    useFindAndModify: false, // Validate updated fields
  });

  res.status(200).json({
    success: true,
    message: "User Updated Successfully",
    user,
  });
});

export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (!oldPassword || !newPassword || !confirmPassword) {
    return next(new ErrorHandler("Please Fill All Fields. ", 400));
  }
  // ✅ Find user in the database
  const user = await User.findById(req.user.id).select("+password");

  // ✅ Check if the old password is correct
  const isMatch = await user.matchPassword(oldPassword);
  if (!isMatch) {
    return next(new ErrorHandler("Old password is incorrect!", 400));
  }
  if (oldPassword === newPassword) {
    return next(
      new ErrorHandler("Old password and new password can't be the same!", 400)
    );
  }

  if (newPassword !== confirmPassword) {
    return next(new ErrorHandler("Confirm Password Does Not Match", 400));
  }

  user.password = newPassword;
  // ✅ Save the updated user
  await user.save();
  // ✅ Send response with the updated token
  res.status(200).json({
    success: true,
    message: "Password updated successfully!",
    token,
  });
});

// Writing This function to get user without login
export const getUserInfoForPortfolio = catchAsyncErrors(
  async (req, res, next) => {
    const id = "67a230142d8a2aa16a765a17";
    const user = await User.findById(id);
    res.status(200).json({
      success: true,
      user,
    });
  }
);

export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User Not Found", 404));
  }

  // Generate reset token
  const resetToken = user.getResetPasswordToken();

  // Save only after setting token fields
  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${process.env.DASHBOARD_URL}/password/reset/${resetToken}`;

  const message = `
    <h2>Hello ${user.fullName},</h2>
    <p>Click the link below to reset your password:</p>
    \n\n
    ${resetPasswordUrl}
    
    <h1> \n </h1>
    <a href="${resetPasswordUrl}" style="padding: 10px; background: blue; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
    <p>If you didn't request this, please ignore it.</p>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent To ${user.email} successfully!`,
    });
  } catch (error) {
    // Rollback reset token if email fails
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return next(new ErrorHandler(error.message, 500));
  }
});

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.params;
  // console.log("Params received:", req.params); // Using To debug Code
  // console.log("Reset Token:", token); // using to debugging code
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!token) {
    return next(new ErrorHandler("Reset token is required", 400));
  }

  if (!user) {
    return next(new ErrorHandler("Invalid or Expired Reset Token", 401));
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Passwords Do Not Match", 400));
  }

  // Update password and reset token fields before saving
  user.password = await req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  // Save only once after all updates
  await user.save();

  // Generate new token and send response
  generateToken(user, "Password Reset Successfully", 200, res);
});
