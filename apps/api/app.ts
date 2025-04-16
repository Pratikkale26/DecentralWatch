import express from "express";
import cors from "cors";
import websiteRoutes from "./routes/website";
import { errorMiddleware } from "./middleware/errorMiddleware";
import "dotenv/config";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/v1", websiteRoutes);

// Error handler
app.use(errorMiddleware);

export default app;
