import express from "express";
import cors from "cors";

// Auth + Users + Permissions
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import permissionRoutes from "./routes/permission.routes";

// Core structure: Program / Course / Lesson
import programRoutes from "./routes/program.routes";
import courseRoutes from "./routes/course.routes";
import lessonRoutes from "./routes/lesson.routes";

// Content Modules
import objectiveRoutes from "./routes/objectives.routes";
import modelRoutes from "./routes/model.routes";
import preparationRoutes from "./routes/preparation.routes";
import buildRoutes from "./routes/build.routes";
import attachmentRoutes from "./routes/attachment.routes";
import challengeRoutes from "./routes/challenge.routes";
import quizRoutes from "./routes/quiz.routes";
import lessonContentRoutes from "./routes/lessonContent.routes";
import lessonMediaRoutes from "./routes/lessonMedia.routes";

// Media
import mediaRoutes from "./routes/media.routes";

// Lesson Utilities
import lessonOrderRoutes from "./routes/lessonOrder.routes";
import lessonStatusRoutes from "./routes/lessonStatus.routes";
import lessonAggregatorRoutes from "./routes/lessonAggregator.routes";

// Admin tools
import dashboardRoutes from "./routes/dashboard.routes";
import logsRoutes from "./routes/logs.routes";

const app = express();
app.use(cors());

app.use(express.json());

// ====================== AUTH ======================
app.use("/auth", authRoutes);

// ====================== RBAC ======================
app.use("/api/permissions", permissionRoutes);
app.use("/api/users", userRoutes);

// ====================== PROGRAM STRUCTURE ======================
app.use("/api/programs", programRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);

// ====================== CONTENT MODULES ======================
app.use("/api/lessons/objectives", objectiveRoutes);
app.use("/api/lessons/models", modelRoutes);
app.use("/api/lessons/preparations", preparationRoutes);
app.use("/api/lessons/builds", buildRoutes);
app.use("/api/lessons/attachments", attachmentRoutes);
app.use("/api/lessons/challenges", challengeRoutes);
app.use("/api/lessons/quizzes", quizRoutes);
app.use("/api/lessons/lessonContents", lessonContentRoutes);
app.use("/api/lessons/lessonMedia", lessonMediaRoutes);

// ====================== MEDIA ======================
app.use("/api/media", mediaRoutes);

// ====================== LESSON EXTRA ======================
app.use("/api/lessonOrders", lessonOrderRoutes);
app.use("/api/lessonStatus", lessonStatusRoutes);
app.use("/api/lessonAggregator", lessonAggregatorRoutes);

// ====================== ADMIN TOOLS ======================
app.use("/admin/dashboard", dashboardRoutes);
app.use("/admin/logs", logsRoutes);

// ====================== SERVER ======================
app.listen(3000, () => console.log("Server chạy port 3000"));
