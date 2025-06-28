import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    courseTitle: {
      type: String,
      required: true,
    },
    subTitle: {
      type: String,
    },
    description: {
      type: String,
    },
    category: {
      type: String,
      required: true,
    },
    courseLevel: {
      type: String,
      enum: ["Beginner", "Medium", "Advance"],
    },
    coursePrice: {
      type: Number,
    },
    courseThumbnail: {
      type: String,
    },
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lectures: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lecture",
      },
    ],
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },
    learningOutcomes: {
      //What you'll learn from this course
      type: [String],
      default: [],
    },
    requirements: {
      // Course prerequisites
      type: [String],
      default: [],
    },
    includes: {
      // This course includes
      type: [String],
      default: [],
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
      },
    ],
    rating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Course = mongoose.model("Course", courseSchema);
