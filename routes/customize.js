const express = require("express");
const router = express.Router();
const customizeController = require("../controller/customize");
const multer = require("multer");
const { loginCheck, isAdmin } = require("../middleware/auth");

var storage = multer.memoryStorage();

const upload = multer({ storage: storage });

router.get("/", customizeController.getImages);
router.post(
  "/",
  loginCheck,
  isAdmin,
  upload.single("image"),
  customizeController.uploadSlideImage
);
router.delete(
  "/:id",
  loginCheck,
  isAdmin,
  customizeController.deleteSlideImage
);
router.get("/dashboard", loginCheck, isAdmin, customizeController.getAllData);

module.exports = router;