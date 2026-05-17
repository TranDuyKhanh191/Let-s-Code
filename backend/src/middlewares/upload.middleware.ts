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
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/") ||
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/zip" ||
      file.mimetype === "application/x-zip-compressed" ||
      file.mimetype === "application/vnd.ms-powerpoint" ||
      file.mimetype === "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ) {
      return cb(null, true);
    }
    return cb(new Error(`File type không được phép! (${file.mimetype})`));
  }
});
