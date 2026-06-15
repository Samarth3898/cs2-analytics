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

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const demoPath = path.resolve(req.file.path);
  console.log("Uploaded file path:", demoPath);

  const parserDir = path.resolve("../go-parser");

  const outputDir = path.resolve("./parsed-events");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const matchId = Date.now().toString();
  const fileName = `events-${matchId}.json`;
  const outputFile = path.join(outputDir, fileName);

  console.log("parserDir:", parserDir);
  console.log("parserDir exists:", fs.existsSync(parserDir));
  console.log(
    "main.go exists:",
    fs.existsSync(path.join(parserDir, "main.go")),
  );

  execFile(
    "C:\\Program Files\\Go\\bin\\go.exe",
    ["run", "main.go", demoPath, outputFile],
    {
      cwd: parserDir,
      maxBuffer: 1024 * 1024 * 500, // 500 MB
    },
    (error, stdout, stderr) => {
      // 🧹 cleanup uploaded demo file
      fs.unlink(demoPath, (err) => {
        if (err) console.error("File cleanup error:", err);
      });

      if (error) {
        console.error(error?.message);
        console.error(error?.code);

        return res.status(500).json({
          error: "Parsing failed",
          details: error.message,
        });
      }

      let parsed;

      try {
        parsed = JSON.parse(fs.readFileSync(outputFile, "utf8"));
      } catch (err) {
        console.error("Failed to read parser output:", err);

        return res.status(500).json({
          error: "Failed to read parser output",
        });
      }

      const { stats, events } = parsed;

      // console.log("Stats:", stats);
      // console.log("Events:", events);

      const { summary, topPlayers }: any = computeFights(events);
      console.log(topPlayers);

      console.log("About to send response");
      // ✅ Respond (you can also send file path if needed)
      res.json({
        message: "File processed successfully",
        matchId,
        summary,
        topPlayers,
      });

      console.log("Response sent");
    },
  );
};
