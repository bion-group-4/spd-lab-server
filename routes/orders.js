const express = require("express");
const router = express.Router();
const ordersController = require("../controller/orders");
const { loginCheck, isAdmin } = require("../middleware/auth");

router.get("/", loginCheck, isAdmin, ordersController.getAllOrders);
router.get("/user/:id", loginCheck, ordersController.getOrderByUser);
router.post("/", loginCheck, ordersController.postCreateOrder);
router.put("/:id", loginCheck, isAdmin, ordersController.postUpdateOrder);
router.delete("/:id", loginCheck, isAdmin, ordersController.postDeleteOrder);

module.exports = router;