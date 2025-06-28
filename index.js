import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./database/db.js";
import userRoute from "./routes/user.route.js";
import courseRoute from "./routes/course.route.js";
import mediaRoute from "./routes/media.route.js";
import purchaseRoutes from "./routes/coursePurchase.route.js";
import courseProgressRoute from "./routes/courseProgress.route.js";
import analyticsRoutes from "./routes/analytics.route.js";

dotenv.config({});

// call database connection here
connectDB();

const app = express();

const PORT = process.env.PORT || 3000;

//default middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", " https://coregyan.netlify.app"],
    credentials: true,
  })
);

//apis
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/", purchaseRoutes);
app.use("/api/v1/progress", courseProgressRoute);
app.use("/api/v1/analytics", analyticsRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
