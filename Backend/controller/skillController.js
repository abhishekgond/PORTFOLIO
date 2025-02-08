import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import Skill from "../models/skillSchema.js";
import { v2 as cloudinary } from "cloudinary";
export const addSkill = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("skill image Required! ", 400));
  }
  const { image } = req.files;
  const { title, proficiency } = req.body;
  // const { url } = req.body;
  if (!title || !proficiency) {
    return next(new ErrorHandler("please Full Fill This form !", 400));
  }
  const cloudinary_Skill_Responce = await cloudinary.uploader.upload(
    image.tempFilePath,
    {
      folder: "PORTFOLIO_SKILLS",
    }
  );

  if (!cloudinary_Skill_Responce || cloudinary_Skill_Responce.error) {
    console.error(
      "Cloudinary Error:",
      cloudinary_Skill_Responce.error || "Unknown Cloudinary Error"
    );
  }
  const newskill = await Skill.create({
    title,
    proficiency,
    image: {
      public_id: cloudinary_Skill_Responce.public_id,
      url: cloudinary_Skill_Responce.secure_url,
    },
  });
  res.status(201).json({
    status: "success",
    message: "New skill added ",
    newskill,
  });
});
export const deleteSkill = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const skills = await Skill.findById(id);

  if (!skills) {
    return next(new ErrorHandler("Skill not found!", 404));
  }

  const imageId = skills.image?.public_id;
  if (!imageId) {
    return next(new ErrorHandler("No image found for this skill!", 400));
  }

  console.log("Deleting image with public_id:", imageId); // Debugging log

  // Delete the image from Cloudinary
  await cloudinary.uploader.destroy(imageId);

  // Delete the skill from the database
  await skills.deleteOne();

  res.status(200).json({
    status: "success",
    message: "Skill deleted successfully",
  });
});

export const updateSkill = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  let skills = await Skill.findById(id);

  if (!skills) {
    return next(new ErrorHandler("Skill not found!", 404));
  }
  const { proficiency } = req.body;
  skills = await Skill.findByIdAndUpdate(
    id,
    { proficiency },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  res.status(200).json({
    status: "success",
    message: "Skill updated successfully",
    skills,
  });
});
export const getAllSkill = catchAsyncErrors(async (req, res, next) => {
  const allSkills = await Skill.find();
  res.status(200).json({
    status: "success",
    message: "All Skills Found ",
    allSkills,
  });
});
