import { Router } from "express";
import { uploadFile } from "../controllers/upload.js";
import multer from "multer";
const upload = multer({ dest: "uploads/" });

const router = Router();

router.post(
  "/",
  upload.single("file"),
  async (req, res, next): Promise<any> => {
    try {
      await uploadFile(req, res, next);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
