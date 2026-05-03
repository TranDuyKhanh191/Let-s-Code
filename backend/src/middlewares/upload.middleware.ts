import multer from "multer";

const allowed = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "video/mp4",
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed"
];

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("File type không được phép!"));
    }
    cb(null, true);
  }
});
