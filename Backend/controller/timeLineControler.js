import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { timeLine } from "../models/timeLineSchema.js";

// Adding Time Line
export const addTimeLine = catchAsyncErrors(async (req, res, next) => {
  const { title, description, from, to } = req.body;
  const newTimeLine = await timeLine.create({
    title,
    description,
    timeLine: { from, to },
  });

  res.status(200).json({
    status: "success",
    message: "TimeLine Added ",
    newTimeLine,
    // 3:31
  });
}, 1000);

export const deleteTimeLine = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const timeLine_ = await timeLine.findById(id);
  if (!timeLine_) {
    return next(new ErrorHandler("Time Line not Find "), 404);
  }
  await timeLine_.deleteOne();
  res.status(200).json({
    status: "success",
    message: "TimeLine Deleted ",
  });
});

export const getTimeLine = catchAsyncErrors(async (req, res, next) => {
  const timeLine_ = await timeLine.find();
  res.status(200).json({
    status: "success",
    message: "TimeLine Found ",
    timeLine_,
    });
});
