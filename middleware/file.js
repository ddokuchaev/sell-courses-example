const multer = require("multer"); //работа с файлами (загрузка)
const path = require("path");

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "images");
  },
  filename(req, file, cb) {
    cb(
      null,
      path.normalize(
        new Date().toISOString().replace(/[^a-z0-9 ,.?!]/gi, "") +
          "-" +
          file.originalname
      )
    );
  }
});

const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

module.exports = multer({
  storage: storage,
  fileFilter: fileFilter
});
