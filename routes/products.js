const express = require("express");
const router = express.Router();
const productController = require("../controller/products");
const multer = require("multer");
const { loginCheck, isAdmin } = require("../middleware/auth");

var storage = multer.memoryStorage();

const upload = multer({ storage: storage });

router.get("/all-product", productController.getAllProduct);
router.post("/product-by-category", productController.getProductByCategory);
router.post("/product-by-price", productController.getProductByPrice);
router.post("/wish-product", productController.getWishProduct);
router.post("/cart-product", productController.getCartProduct);

router.post("/add-product", loginCheck, isAdmin, upload.any(), productController.postAddProduct);
router.post("/edit-product", loginCheck, isAdmin, upload.any(), productController.postEditProduct);
router.post("/delete-product", loginCheck, isAdmin, productController.getDeleteProduct);
router.post("/single-product", productController.getSingleProduct);

router.post("/add-review", productController.postAddReview);
router.post("/delete-review", productController.deleteReview);

module.exports = router;
