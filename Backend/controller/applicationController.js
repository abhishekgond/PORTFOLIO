import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import SoftwareApplication from "../models/applicationSchema.js";
import { v2 as cloudinary } from "cloudinary";

export const addApplication = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Application icon Required! ", 400));
  }
  const { image } = req.files;
  const { name } = req.body;
  const { url } = req.body;
  if (!name) {
    return next(new ErrorHandler("Application name is required!", 400));
  }

  const cloudinary_ApplicationResponce = await cloudinary.uploader.upload(
    image.tempFilePath,
    {
      folder: "APPLICATION_IMAGE",
    }
  );

  if (!cloudinary_ApplicationResponce || cloudinary_ApplicationResponce.error) {
    console.error(
      "Cloudinary Error:",
      cloudinary_ApplicationResponce.error || "Unknown Cloudinary Error"
    );
  }
  const newApplication = await SoftwareApplication.create({
    name,
    image: {
      public_id: cloudinary_ApplicationResponce.public_id,
      url: cloudinary_ApplicationResponce.secure_url,
    },
  });
  res.status(201).json({
    status: "success",
    message: "New Application added ",
    newApplication,
  });
});

export const deleteApplication = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const application = await SoftwareApplication.findById(id);
  if (!application) {
    return next(new ErrorHandler("Application not found!", 404));
  }
  const imageId = application.image.public_id;
  await cloudinary.uploader.destroy(imageId);
  await application.deleteOne();
  res.status(200).json({
    status: "success",
    message: "Application deleted successfully",
  });
});

export const getApplication = catchAsyncErrors(async (req, res, next) => {
  const application = await SoftwareApplication.find();
  res.status(200).json({
    status: "success",
    message: "TimeLine Found ",
    application,
  });
});
