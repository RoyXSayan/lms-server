import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { User } from "../models/user.model.js";

import {
  deleteMediaFromCloudinary,
  deleteVideoFromCloudinary,
  uploadMedia,
} from "../utils/cloudinary.js";

export const createCourse = async (req, res) => {
  try {
    const { courseTitle, category } = req.body;
    if (!courseTitle || !category) {
      return res.status(400).json({
        message: "Course title and category is required.",
      });
    }

    const course = await Course.create({
      courseTitle,
      category,
      creator: req.id,
    });

    return res.status(201).json({
      course,
      message: "Course created.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to create course",
    });
  }
};

export const searchCourse = async (req, res) => {
  try {
    const { query = "", categories = [], sortByPrice = "" } = req.query;

    //create search query
    const searchCriteria = {
      isPublished: true,
      $or: [
        { courseTitle: { $regex: query, $options: "i" } },
        { subTitle: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
    };

    //if categories are provided, add them to the search query
    if (categories.length > 0) {
      searchCriteria.category = { $in: categories };
    }

    //define sorting order
    const sortOptions = {};

    //if sortByPrice is provided, add it to the search query
    if (sortByPrice === "low") {
      sortOptions.coursePrice = 1; //sort by price in ascending order
    } else if (sortByPrice === "high") {
      sortOptions.coursePrice = -1; //sort by price in descending order
    }

    //find courses that match the search query
    let courses = await Course.find(searchCriteria)
      .populate({ path: "creator", select: "name photoURL" })
      .sort(sortOptions);

    return res.status(200).json({
      success: true,
      courses: courses || [],
    });
  } catch (error) {
    console.log(error);
  }
};

export const getPublishedCourse = async (_, res) => {
  try {
    const courses = await Course.find({ isPublished: true }).populate({
      path: "creator",
      select: "name photoURL",
    });
    if (!courses) {
      return res.status(404).json({
        message: "Course not found",
      });
    }
    return res.status(200).json({
      courses,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get published courses",
    });
  }
};

export const getCreatorCourses = async (req, res) => {
  try {
    const userId = req.id;
    const courses = await Course.find({ creator: userId });
    if (!courses) {
      return res.status(404).json({
        courses: [],
        message: "Course not found",
      });
    }
    return res.status(200).json({
      courses,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to create course",
    });
  }
};

export const editCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const {
      courseTitle,
      subTitle,
      description,
      category,
      courseLevel,
      coursePrice,
    } = req.body;
    const thumbnail = req.file;

    let course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: "Course not found!",
      });
    }
    let courseThumbnail;
    if (thumbnail) {
      if (course.courseThumbnail) {
        const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
        await deleteMediaFromCloudinary(publicId); // delete old image
      }
      // upload a thumbnail on clourdinary
      courseThumbnail = await uploadMedia(thumbnail.path);
    }

    const learningOutcomes = JSON.parse(req.body.learningOutcomes || "[]");
    const requirements = JSON.parse(req.body.requirements || "[]");
    const includes = JSON.parse(req.body.includes || "[]");

    const updateData = {
      courseTitle,
      subTitle,
      description,
      category,
      courseLevel,
      coursePrice,
      courseThumbnail: courseThumbnail?.secure_url,
      learningOutcomes,
      requirements,
      includes,
    };

    course = await Course.findByIdAndUpdate(courseId, updateData, {
      new: true,
    });

    return res.status(200).json({
      course,
      message: "Course updated successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to create course",
    });
  }
};

// Export a function called getCourseById that takes in a request and response object as parameters
export const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId).populate(
      "reviews.user",
      "name photoURL"
    );

    if (!course) {
      return res.status(404).json({
        message: "Course not found!",
      });
    }
    return res.status(200).json({
      course,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get course by id",
    });
  }
};

// lecture controller
export const createLecture = async (req, res) => {
  try {
    const { lectureTitle } = req.body;
    const { courseId } = req.params;

    if (!lectureTitle || !courseId) {
      return res.status(400).json({
        message: "Lecture title is required",
      });
    }

    // create lecture
    const lecture = await Lecture.create({ lectureTitle });

    const course = await Course.findById(courseId);
    if (course) {
      course.lectures.push(lecture._id);
      await course.save();
    }

    return res.status(201).json({
      lecture,
      message: "Lecture created successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to create lecture",
    });
  }
};

export const getCourseLecture = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).populate("lectures");
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }
    return res.status(200).json({
      lectures: course.lectures,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get lectures",
    });
  }
};

export const editLecture = async (req, res) => {
  try {
    const { lectureTitle, videoInfo, isPreviewFree } = req.body;

    const { courseId, lectureId } = req.params;
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found!",
      });
    }

    // update lecture
    if (lectureTitle) lecture.lectureTitle = lectureTitle;
    if (videoInfo?.videoUrl) lecture.videoUrl = videoInfo.videoUrl;
    if (videoInfo?.publicId) lecture.publicId = videoInfo.publicId;
    lecture.isPreviewFree = isPreviewFree;

    await lecture.save();

    // Ensure the course still has the lecture id if it was not aleardy added;
    const course = await Course.findById(courseId);
    if (course && !course.lectures.includes(lecture._id)) {
      course.lectures.push(lecture._id);
      await course.save();
    }
    return res.status(200).json({
      lecture,
      message: "Lecture updated successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to edit lectures",
    });
  }
};

export const removeLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const lecture = await Lecture.findByIdAndDelete(lectureId);
    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found!",
      });
    }
    // delete the lecture from couldinary as well
    if (lecture.publicId) {
      await deleteVideoFromCloudinary(lecture.publicId);
    }

    // Remove the lecture reference from the associated course
    await Course.updateOne(
      { lectures: lectureId }, // find the course that contains the lecture
      { $pull: { lectures: lectureId } } // Remove the lectures id from the lectures array
    );

    return res.status(200).json({
      message: "Lecture removed successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to remove lecture",
    });
  }
};

export const getLectureById = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found!",
      });
    }
    return res.status(200).json({
      lecture,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get lecture by id",
    });
  }
};

//publish unpublish course logic

export const togglePublishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { publish } = req.query; // true, false
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: "Course not found!",
      });
    }
    // publish status based on the query paramter
    course.isPublished = publish === "true";
    await course.save();

    const statusMessage = course.isPublished ? "Published" : "Unpublished";
    return res.status(200).json({
      message: `Course is ${statusMessage}`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to update status",
    });
  }
};

// POST: Submit a review for a course
export const submitReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res
        .status(400)
        .json({ message: "Rating and comment are required." });
    }

    const course = await Course.findById(courseId);
    console.log("reviews are:", course.reviews); // Now each review.user should be a full object

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const existingReviewIndex = course.reviews.findIndex(
      (r) => r.user.toString() === req.id
    );

    if (existingReviewIndex !== -1) {
      // ✅ SAFELY update fields without losing reference
      course.reviews[existingReviewIndex].rating = rating;
      course.reviews[existingReviewIndex].comment = comment;
    } else {
      // ✅ New review
      course.reviews.push({
        user: req.id,
        rating,
        comment,
      });
    }

    // Recalculate average rating
    const totalRating = course.reviews.reduce((sum, r) => sum + r.rating, 0);
    course.rating = (totalRating / course.reviews.length).toFixed(1);

    await course.save();

    return res.status(201).json({ message: "Review submitted successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to submit review." });
  }
};

// GET /api/v1/course/:courseId/detail-with-status
export const getCourseDetailWithStatus = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId)
      .populate("lectures")
      .populate("reviews.user", "name photoURL")
      .populate("creator", "name photoURL");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Get instructor details
    const instructorId = course.creator._id;

    const totalCourses = await Course.countDocuments({ creator: instructorId });
    const totalStudents = await CoursePurchase.countDocuments({
      courseId: {
        $in: await Course.find({ creator: instructorId }).distinct("_id"),
      },
      status: "completed",
    });

    const allReviews = await Course.find(
      { creator: instructorId },
      "reviews"
    ).lean();

    const totalReviews = allReviews.reduce(
      (sum, c) => sum + (c.reviews?.length || 0),
      0
    );

    const allRatings = allReviews.flatMap(
      (c) => c.reviews?.map((r) => r.rating) || []
    );

    const averageRating = allRatings.length
      ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1)
      : 0;

    const instructorUser = await User.findById(instructorId).lean();

    const extendCreator = {
      ...course.creator.toObject(),
      profession: instructorUser.profession || "Instructor",
      bio: instructorUser.bio || "This instructor has not provided a bio yet.",
      totalCourses,
      totalStudents,
      totalReviews,
      rating: averageRating,
    };

    // calculate the total duration of the course
    let totalDuration = 0;
    if (course.lectures && course.lectures.length > 0) {
      totalDuration = course.lectures.reduce(
        (sum, lec) => sum + (lec.duration || 0),
        0
      );
    }

    //optional : format it to hh:mm:ss
    const formatDuration = (minutes) => {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      const s = Math.floor((minutes * 60) % 60);
      return h > 0 ? `${h}h ${m}m` : `${s}s`;
    };

    const formattedDuration = formatDuration(totalDuration);

    const hasPurchased = await CoursePurchase.findOne({
      userId: req.id,
      courseId: courseId,
      status: "completed", // Optional: ensures only successful purchases are counted
    });

    return res.status(200).json({
      course: {
        ...course.toObject(),
        duration: formattedDuration,
        creator: extendCreator,
      },
      purchased: !!hasPurchased,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to fetch course details" });
  }
};
