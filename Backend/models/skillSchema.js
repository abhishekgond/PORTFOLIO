import mongoose from "mongoose";

const newSkills = new mongoose.Schema({
  title: {
    type: String,
  },
  proficiency: {
    type: Number,
  },
  image: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
});
export const newskills = mongoose.model("newskills", newSkills);
export default newskills;
