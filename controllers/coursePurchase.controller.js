// controllers/purchase.controller.js
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js";

export const simulateCoursePurchase = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if already purchased
    const existingPurchase = await CoursePurchase.findOne({ courseId, userId });
    if (existingPurchase && existingPurchase.status === "completed") {
      return res
        .status(400)
        .json({ message: "You already purchased this course." });
    }

    // Simulate fake payment
    const fakePaymentId = `FAKE_PAYMENT_${Date.now()}`;

    const purchase = await CoursePurchase.create({
      courseId,
      userId,
      amount: course.coursePrice || 0,
      status: "completed",
      paymentId: fakePaymentId,
    });

    // Push user to enrolledStudents if not already enrolled
    if (!course.enrolledStudents.includes(userId)) {
      course.enrolledStudents.push(userId);
      await course.save();
    }

    // Add course to user's enrolledCourses if not already there
    const user = await User.findById(userId);
    if (!user.enrolledCourses.includes(courseId)) {
      user.enrolledCourses.push(courseId);
      await user.save();
    }

    return res.status(200).json({
      message: "Payment successful. You are now enrolled!",
      purchase,
    });
  } catch (error) {
    console.error("Payment error:", error);
    return res.status(500).json({ message: "Payment failed" });
  }
};

export const getCourseDetailWithPurchaseStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;
    const course = await Course.findById(courseId)
      .populate({ path: "creator" })
      .populate({ path: "lectures" });

    const purchased = await CoursePurchase.findOne({ userId, courseId });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    return res.status(200).json({
      course,
      purchased: !!purchased, // Check if the user has purchased the course
    });
  } catch (error) {
    console.error("Error getting course details:", error);
    return res.status(500).json({ message: "Error getting course details" });
  }
};

export const getAllPurchasedCourse = async (_, res) => {
  try {
    const purchasedCourse = await CoursePurchase.find({
      status: "completed",
    }).populate("courseId");
    if (!purchasedCourse) {
      return res.status(404).json({
        purchasedCourse: [],
      });
    }
    return res.status(200).json({
      purchasedCourse,
    });
  } catch (error) {
    console.log(error);
  }
};


export const getInstructorPurchases = async (req, res) => {
  try {
    const user = await User.findById(req.id); // req.id is set from auth middleware

    if (!user || (user.role !== "instructor" && user.role !== "owner")) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Find courses created by this instructor
    const coursesByInstructor = await Course.find({ creator: user._id }).select("_id");

    const courseIds = coursesByInstructor.map((course) => course._id);

    // Find purchases related only to this instructor's courses
    const purchases = await CoursePurchase.find({
      courseId: { $in: courseIds },
      status: "completed",
    }).populate("courseId", "courseTitle coursePrice");

    res.status(200).json({ purchasedCourse: purchases });
  } catch (error) {
    console.error("Error in getInstructorPurchases:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
