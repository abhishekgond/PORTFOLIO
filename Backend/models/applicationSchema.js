import mongoose from "mongoose";

const softwareApplicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
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
  },
  { timestamps: true } // Adds createdAt & updatedAt fields automatically
);

const SoftwareApplication = mongoose.model(
  "SoftwareApplication",
  softwareApplicationSchema
);

export default SoftwareApplication;
