const express = require("express");
const router = express.Router();
const categoryController = require("../controller/categories");
const multer = require("multer");
const { loginCheck, isAdmin } = require("../middleware/auth");

// Image Upload setting
// Image Upload setting
var storage = multer.memoryStorage();

const upload = multer({ storage: storage });

router.get("/all-category", categoryController.getAllCategory);
router.post(
  "/add-category",
  loginCheck,
  isAdmin,
  upload.single("cImage"),
  categoryController.postAddCategory
);
router.post("/edit-category", loginCheck, isAdmin, categoryController.postEditCategory);
router.post(
  "/delete-category",
  loginCheck,
  isAdmin,
  categoryController.getDeleteCategory
);

module.exports = router;
