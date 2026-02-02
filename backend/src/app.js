import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import complaintRoutes from "./routes/complaint.routes.js";
import sentimentRoutes from "./routes/sentiment.routes.js";
import staffRoutes from "./routes/staff.routes.js";
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/sentiment", sentimentRoutes);
app.use("/api/staff", staffRoutes);
export default app;
