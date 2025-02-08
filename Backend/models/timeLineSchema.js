import mongoose from "mongoose";

const timeLineSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title Required "],
  },
  description: {
    type: String,
    required: [true, "Description Required "],
  },
  timeLine: {
    from:{
      type:String,
      required:[true,"startind  Date Required"],
    },
    to: String,
  },
});

export const timeLine = mongoose.model("timeLine", timeLineSchema);
export default timeLine;
