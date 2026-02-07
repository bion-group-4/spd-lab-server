const express = require("express");
const router = express.Router();
const paymentController = require("../controller/payment");

router.post("/payment/process-payment", (req, res) =>
  paymentController.processPayment(req, res)
);

module.exports = router;