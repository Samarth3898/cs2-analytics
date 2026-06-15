import express from "express";
import uploadRouter from "./routes/upload-router.js";
import cors from "cors";

const app = express();

app.use(cors());

app.use("/cs2-analytics/upload", uploadRouter);

export default app;
