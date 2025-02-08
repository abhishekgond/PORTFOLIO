import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import Project from "../models/projectSchema.js";
import { v2 as cloudinary } from "cloudinary";

export const addProject = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length == 0) {
    return next(new ErrorHandler("Please upload a ProjectImage ", 400));
  }
  const { image } = req.files;
  const {
    name,
    description,
    startDate,
    endDate,
    getRepoLink,
    ProjectLink,
    Technologies,
    stack,
    deployed,
  } = req.body;
  if (
    !name ||
    !description ||
    !startDate ||
    !endDate ||
    !getRepoLink ||
    !ProjectLink ||
    !Technologies ||
    !stack ||
    !deployed
  ) {
    return next(new ErrorHandler("Please fill all fields", 400));
  }
  const cloudinary_Project_Responce = await cloudinary.uploader.upload(
    image.tempFilePath,
    {
      folder: "PROJECT_IMAGE",
    }
  );
  if (!cloudinary_Project_Responce || cloudinary_Project_Responce.error) {
    console.error(
      "Cloudinary Error:",
      cloudinary_Project_Responce.error || "Unknown Cloudinary Error"
    );
    return next(new ErrorHandler("Failed to upload Project Image", 400));
  }
  const project = await Project.create({
    name,
    description,
    startDate,
    endDate,
    getRepoLink,
    ProjectLink,
    Technologies,
    stack,
    deployed,
    image: {
      public_id: cloudinary_Project_Responce.public_id,
      url: cloudinary_Project_Responce.secure_url,
    },
  });
  return res.status(201).json({
    success: true,
    data: project,
  });
});
export const deleteProject = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const project = await Project.findById(id);
  if (!project) {
    return next(new ErrorHandler("Application not found!", 404));
  }
  const imageId = project.image.public_id;
  await cloudinary.uploader.destroy(imageId);
  await project.deleteOne();
  res.status(200).json({
    status: "success",
    message: "Application deleted successfully",
  });
});
export const getAllProject = catchAsyncErrors(async (req, res, next) => {
  const project = await Project.find();
  res.status(200).json({
    status: "success",
    message: "All Project Finds",
    project,
  });
});
export const updateProject = catchAsyncErrors(async (req, res, next) => {
  const newProjectData = {
    name: req.body.name,
    description: req.body.description,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    getRepoLink: req.body.getRepoLink,
    ProjectLink: req.body.ProjectLink,
    Technologies: req.body.Technologies,
    stack: req.body.stack,
    deployed: req.body.deployed,
  };

  if (req.files && req.files.image) {
    const image = req.files.image;
    const project = await Project.findById(req.params.id);
    const projectImageId = project.image.public_id;
    await cloudinary.uploader.destroy(projectImageId);
    const newProjectImage = await cloudinary.uploader.upload(
      image.tempFilePath,
      {
        folder: "PORTFOLIO PROJECT IMAGES",
      }
    );
    newProjectData.image = {
      public_id: newProjectImage.public_id,
      url: newProjectImage.secure_url,
    };
  }
  const project = await Project.findByIdAndUpdate(
    req.params.id,
    newProjectData,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  return res.status(200).json({
    success: true,
    message: "Project Updated !",
    project,
  });
  // const newProject = await Project.create(req.body);
});
export const getSingleProject = catchAsyncErrors(async (req, res, next) => {
  const{id} = req.params;
  const project = await Project.findById(id);
  if(!project){
    return next(new ErrorHandler("Project Not Found!",404));
  }
  res.status(200).json({
    status: "success",
    project,
  });
});
