const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

/** Allowed values for order status. Use when creating/updating orders. */
const ORDER_STATUS = Object.freeze({
  NOT_PROCESSED: "Not processed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
});

const orderSchema = new mongoose.Schema(
  {
    allProduct: [
      {
        id: { type: ObjectId, ref: "products" },
        quantitiy: Number,
      },
    ],
    user: {
      type: ObjectId,
      ref: "users",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
    },
    snap_token: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: ORDER_STATUS.NOT_PROCESSED,
      enum: {
        values: Object.values(ORDER_STATUS),
        message: "`{VALUE}` is not a valid order status.",
      },
    },
  },
  { timestamps: true }
);

const orderModel = mongoose.model("orders", orderSchema);
module.exports = orderModel;
module.exports.ORDER_STATUS = ORDER_STATUS;