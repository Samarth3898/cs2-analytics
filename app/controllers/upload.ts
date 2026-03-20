import type { Request, Response, NextFunction } from "express";
import path from "node:path";
import fs from "node:fs";
import { execFile } from "node:child_process";
import { computeFights } from "../services/analytics/fights.service.js";

export const uploadFile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log("req.file:", req.file);
  console.log("req.body:", req.body);

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const demoPath = path.resolve(req.file.path);
  console.log("Uploaded file path:", demoPath);

  execFile(
    "go",
    ["run", "main.go", demoPath],
    { cwd: "./go-parser" },
    (error, stdout, stderr) => {
      // 🧹 cleanup uploaded demo file
      fs.unlink(demoPath, (err) => {
        if (err) console.error("File cleanup error:", err);
      });

      if (error) {
        console.error("Go error:", stderr);
        return res.status(500).json({ error: "Parsing failed" });
      }

      let parsed;

      try {
        parsed = JSON.parse(stdout);
      } catch (err) {
        console.error("Invalid JSON from Go:", stdout);
        return res.status(500).json({ error: "Invalid parser output" });
      }

      const { stats, events } = parsed;

      console.log("Stats:", stats);
      console.log("Events:", events);

      const fights: any = computeFights(events)
      // 📁 Create output directory if not exists
      const outputDir = path.resolve("./parsed-events");
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
      }

      // 📝 Create unique filename
      const fileName = `events-${Date.now()}.json`;
      const filePath = path.join(outputDir, fileName);

      // 💾 Write events JSON to file
      fs.writeFile(filePath, JSON.stringify(events, null, 2), (err) => {
        if (err) {
          console.error("Error writing events file:", err);
        } else {
          console.log("Events saved to:", filePath);
        }
      });

      // ✅ Respond (you can also send file path if needed)
      res.json({
        message: "File processed successfully",
        stats,
        eventsFile: fileName,
      });
    },
  );
};