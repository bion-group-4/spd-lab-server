const express = require("express");
const router = express.Router();
const customizeController = require("../controller/customize");
const multer = require("multer");
const { loginCheck, isAdmin } = require("../middleware/auth");

var storage = multer.memoryStorage();

const upload = multer({ storage: storage });

router.get("/get-slide-image", customizeController.getImages);
router.post("/delete-slide-image", loginCheck, isAdmin, customizeController.deleteSlideImage);
router.post(
  "/upload-slide-image",
  loginCheck,
  isAdmin,
  upload.single("image"),
  customizeController.uploadSlideImage
);
router.post("/dashboard-data", loginCheck, isAdmin, customizeController.getAllData);

module.exports = router;
