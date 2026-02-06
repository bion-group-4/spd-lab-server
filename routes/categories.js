const express = require("express");
const router = express.Router();
const categoryController = require("../controller/categories");
const multer = require("multer");
const { loginCheck, isAdmin } = require("../middleware/auth");

// Image Upload setting
// Image Upload setting
var storage = multer.memoryStorage();

const upload = multer({ storage: storage });

router.get("/", categoryController.getAllCategory);
router.post(
  "/",
  loginCheck,
  isAdmin,
  upload.single("cImage"),
  categoryController.postAddCategory
);
router.put(
  "/:id",
  loginCheck,
  isAdmin,
  upload.single("cImage"),
  categoryController.postEditCategory
);
router.delete(
  "/:id",
  loginCheck,
  isAdmin,
  categoryController.getDeleteCategory
);

module.exports = router;
