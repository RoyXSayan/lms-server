import { CoursePurchase } from "../models/coursePurchase.model.js";
import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js";

export const getOwnerAnalytics = async (req, res) => {
  try {
    const user = await User.findById(req.id);
    if (!user || user.role !== "owner") {
      return res.status(403).json({ message: "Access denied" });
    }

    const purchases = await CoursePurchase.find({
      status: "completed",
    }).populate({
      path: "courseId",
      populate: {
        path: "instructor",
        model: "User", // make sure this matches your User model name
        select: "name email",
      },
    });
    const instructors = await User.find({ role: "instructor" });

    const totalRevenue = purchases.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalSales = purchases.length;

    const revenueByMonth = {};
    const topCourses = {};
    const instructorRevenue = {};

    for (const purchase of purchases) {
      // Monthly Revenue
      const date = new Date(purchase.createdAt);
      const month = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      revenueByMonth[month] =
        (revenueByMonth[month] || 0) + (purchase.amount || 0);

      // Top Courses
      const courseTitle = purchase.courseId.courseTitle;
      topCourses[courseTitle] = (topCourses[courseTitle] || 0) + 1;

      // Instructor Revenue
      const instructor = purchase.courseId.instructor;

      if (instructor && instructor._id) {
        const instructorId = instructor._id.toString();
        const name = instructor.name;
        const email = instructor.email;

        if (!instructorRevenue[instructorId]) {
          instructorRevenue[instructorId] = {
            total: 0,
            name: name || "",
            email: email || "",
          };
        }
        instructorRevenue[instructorId].total += purchase.amount || 0;
      }
    }

    const sortedCourses = Object.entries(topCourses)
      .map(([title, count]) => ({ title, sales: count }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5); // top 5

    return res.status(200).json({
      totalRevenue,
      totalSales,
      revenueByMonth,
      topCourses: sortedCourses,
      totalInstructors: instructors.length,
      instructorRevenue,
    });
  } catch (err) {
    console.error("Owner analytics error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
