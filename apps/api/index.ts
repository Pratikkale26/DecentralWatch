import express from "express";
import cors from "cors";
import { authMiddleware } from "./middleware/middleware";
import websiteRoutes from "./routes/websiteRoutes";
import userRoutes from "./routes/userRoutes";
import {scheduleWebsiteAutoDisable} from "./cron/autoDisableWebsites";
// import { payoutValidators } from "./cron/payout";
import { scheduleWebsiteAlert } from "./cron/websiteAlert";

const app = express();
app.use(express.json());

const allowedOrigins = [
  "https://watch.kalehub.com", 
  "http://localhost:3000",
  "https://uptora.xyz",
  "https://decentralwatch.xyz",
  "https://www.decentralwatch.xyz"
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Auto-disable expired websites
console.log("starting cron job")
scheduleWebsiteAutoDisable();
// payoutValidators();
scheduleWebsiteAlert();
console.log("started cron job")

// Routes
app.use("/api/v1", authMiddleware, websiteRoutes);
app.use("/api/v1", authMiddleware, userRoutes);

app.listen(8080, () => {
  console.log("Server running on port 8080");
});
