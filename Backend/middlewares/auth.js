import jwt from "jsonwebtoken";
import User from "../models/userSchema.js";
import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js"; // Ensure correct import

export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  // ✅ Debug: Log cookies & headers
  console.log("Cookies Received:", req.cookies);
  console.log("Authorization Header:", req.headers.authorization);

  // ✅ Extract token from Cookies or Authorization Header (Postman)
  let token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  console.log("Extracted Token:", token); // Debugging

  if (!token) {
    return next(
      new ErrorHandler("User Not Authenticated. Token Missing!", 401)
    );
  }

  try {
    // ✅ Verify JWT Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    console.log("Decoded JWT:", decoded); // Debugging

    // ✅ Find User in Database
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(
        new ErrorHandler("User Not Found. Please Register or Login Again!", 404)
      );
    }

    console.log("Authenticated User:", req.user); // Debugging

    next(); // ✅ Proceed if authentication succeeds
  } catch (error) {
    console.log("JWT Verification Error:", error); // Debugging
    return next(new ErrorHandler("Json Web Token Is Invalid. Try Again!", 401));
  }
});
