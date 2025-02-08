import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: String,
  description: String,
  startDate: Date,
  endDate: Date,
  getRepoLink: String,
  ProjectLink: String,
  Technologies: String,
  stack: String,
  deployed: String,
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

export const Project = mongoose.model("Project", projectSchema);
export default Project;
