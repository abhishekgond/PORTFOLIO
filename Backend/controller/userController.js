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

// Update User Controler
export const newUpdateUser = catchAsyncErrors(async (req, res, next) => {
  try {
    // ✅ Ensure user is authenticated
    if (!req.user) {
      return next(new ErrorHandler("User not authenticated!", 401));
    }

    const { name, email, password } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new ErrorHandler("User not found!", 404));
    }

    // ✅ Update user details if provided
    if (name) user.name = name;
    if (email) user.email = email;

    // ✅ Update password securely if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // ✅ Handle avatar upload (If provided)
    if (req.files?.avatar) {
      const avatarUpload = await cloudinary.v2.uploader.upload(
        req.files.avatar.tempFilePath,
        {
          folder: "avatars",
        }
      );

      user.avatar = {
        public_id: avatarUpload.public_id,
        url: avatarUpload.secure_url,
      };
    }

    // ✅ Handle resume upload (If provided)
    if (req.files?.resume) {
      const resumeUpload = await cloudinary.v2.uploader.upload(
        req.files.resume.tempFilePath,
        {
          folder: "resumes",
        }
      );

      user.resume = {
        public_id: resumeUpload.public_id,
        url: resumeUpload.secure_url,
      };
    }

    await user.save(); // ✅ Save changes

    res.status(200).json({
      success: true,
      message: "User details updated successfully!",
      user: {
        name: user.name,
        email: user.email,
        avatar: user.avatar?.url,
        resume: user.resume?.url,
      },
    });
  } catch (error) {
    return next(new ErrorHandler("Error updating user details!", 500));
  }
});

// export const newUpdateUser = catchAsyncErrors(async (req, res, next) => {
//   // ✅ Ensure user is authenticated
//   if (!req.user) {
//     return next(new ErrorHandler("User not authenticated!", 401));
//   }

//   // ✅ Prepare update data
//   const newUserData = {
//     fullName: req.body.fullName,
//     email: req.body.email,
//     phone: req.body.phone,
//     about: req.body.about,
//     portfolioURL: req.body.portfolioURL,
//     githubLink: req.body.githubLink,
//     linkedinLink: req.body.linkedinLink,
//     facebookLink: req.body.facebookLink,
//     twitterLink: req.body.twitterLink,
//     instagramLink: req.body.instagramLink,
//   };

//   const user = await User.findById(req.user.id);
//   if (!user) {
//     return next(new ErrorHandler("User not found!", 404));
//   }

//   // ✅ Update Avatar (if provided)
//   if (req.files?.avatar) {
//     if (user.avatar?.public_id) {
//       await cloudinary.uploader.destroy(user.avatar.public_id); // Remove old avatar
//     }

//     const uploadedAvatar = await cloudinary.uploader.upload(req.files.avatar.tempFilePath, {
//       folder: "AVATARS",
//     });

//     newUserData.avatar = {
//       public_id: uploadedAvatar.public_id,
//       url: uploadedAvatar.secure_url,
//     };
//   }

//   // ✅ Update Resume (if provided)
//   if (req.files?.resume) {
//     if (user.resume?.public_id) {
//       await cloudinary.uploader.destroy(user.resume.public_id); // Remove old resume
//     }

//     const uploadedResume = await cloudinary.uploader.upload(req.files.resume.tempFilePath, {
//       folder: "RESUME",
//     });

//     newUserData.resume = {
//       public_id: uploadedResume.public_id,
//       url: uploadedResume.secure_url,
//     };
//   }

//   // ✅ Update user in DB
//   const updatedUser = await User.findByIdAndUpdate(req.user.id, newUserData, {
//     new: true, // Return updated document
//     runValidators: true,
//     useFindAndModify: false, // Validate updated fields
//   });

//   res.status(200).json({
//     success: true,
//     message: "User Updated Successfully",
//     user: updatedUser,
//   });
// });
