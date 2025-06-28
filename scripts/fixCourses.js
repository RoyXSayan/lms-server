import mongoose from "mongoose";
import dotenv from "dotenv";
import { Course } from "../models/course.model.js";

dotenv.config(); // loads MONGO_URI from .env

const fixCourses = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const coursesToUpdate = await Course.find({ instructor: { $exists: false }, creator: { $exists: true } });

    for (const course of coursesToUpdate) {
      course.instructor = course.creator;
      await course.save();
      console.log(`🔧 Updated instructor for course: ${course.courseTitle}`);
    }

    console.log("🎉 All courses updated successfully");
    process.exit();
  } catch (err) {
    console.error("❌ Error updating courses:", err);
    process.exit(1);
  }
};

fixCourses();
