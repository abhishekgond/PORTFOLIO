import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderName: {
    type: String,
    required: true,
    minLength: [2, "Subject Must Contains at least two character"],
  },
  subject: {
    type: String,
    required: true,
    minLength: [2, "message must Contains Atleast two character"],
  },
  message: {
    type: String,
    required: true,
    minLength: [2, "message must Contains Atleast two character"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Message = mongoose.model("Message", messageSchema);
export default Message;
