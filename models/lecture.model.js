import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema(
  {
    lectureTitle: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
    },
    publicId: {
      type: String,
    },
    isPreview: {
      type: Boolean,
    },
    duration: Number,
  },
  {
    timestamps: true,
  }
);

export const Lecture = mongoose.model("Lecture", lectureSchema);
