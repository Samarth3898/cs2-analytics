import express from "express";
import multer from "multer"
import fs from "fs"
import path from "path"
import uploadRouter from "./routes/upload-router.js"

const app = express();
const upload = multer({ dest: "uploads/" });

app.use("/cs2-analytics/upload", uploadRouter)

app.listen(3000, () => console.log("Server running on 3000"));

export default app
