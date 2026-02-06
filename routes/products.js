const express = require("express");
const router = express.Router();
const productController = require("../controller/products");
const multer = require("multer");
const { loginCheck, canManageInventory } = require("../middleware/auth");

var storage = multer.memoryStorage();

const upload = multer({ storage: storage });

router.get("/", productController.getAllProduct);

router.post(
  "/",
  loginCheck,
  canManageInventory,
  upload.any(),
  productController.postAddProduct
);

router.put(
  "/:id",
  loginCheck,
  canManageInventory,
  upload.any(),
  productController.postEditProduct
);
router.delete(
  "/:id",
  loginCheck,
  canManageInventory,
  productController.getDeleteProduct
);

router.post("/wish", productController.getWishProduct);
router.post("/cart", productController.getCartProduct);

router.post("/:id/reviews", productController.postAddReview);
router.delete("/:productId/reviews/:reviewId", productController.deleteReview);

router.get("/:id", productController.getSingleProduct);

module.exports = router;
