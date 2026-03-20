const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { DemoFile } = require("demofile");
const path = require("path");
const { execFile } = require("child_process");

const app = express();
const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("demo"), (req, res) => {
  const demoPath = path.resolve(req.file.path);

  console.log("Uploaded file path:", demoPath);

  execFile(
    "go",
    ["run", "main.go", demoPath],
    { cwd: "./go-parser" },
    (error, stdout, stderr) => {
      fs.unlinkSync(demoPath);

      if (error) {
        console.error("Go error:", stderr);
        return res.status(500).json({ error: "Parsing failed" });
      }

      const stats = JSON.parse(stdout);
      res.json(stats);
    },
  );
});

app.listen(3000, () => console.log("Server running on 3000"));
