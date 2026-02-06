const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

/** Allowed values for product status. Use when creating/updating products. */
const PRODUCT_STATUS = Object.freeze({
  ACTIVE: "active",
  INACTIVE: "inactive",
});

const productSchema = new mongoose.Schema(
  {
    pName: {
      type: String,
      required: true,
    },
    pDescription: {
      type: String,
      required: true,
    },
    pPrice: {
      type: Number,
      required: true,
    },
    pSold: {
      type: Number,
      default: 0,
    },
    pQuantity: {
      type: Number,
      default: 0,
    },
    pCategory: {
      type: ObjectId,
      ref: "categories",
    },
    pImages: {
      type: [String],
      required: true,
    },
    pOffer: {
      type: String,
      default: null,
    },
    pRatingsReviews: [
      {
        review: String,
        user: { type: ObjectId, ref: "users" },
        rating: String,
        createdAt: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
    pStatus: {
      type: String,
      required: true,
      enum: {
        values: Object.values(PRODUCT_STATUS),
        message:
          "`{VALUE}` is not a valid product status. Use: active, inactive.",
      },
    },
  },
  { timestamps: true }
);

const productModel = mongoose.model("products", productSchema);
module.exports = productModel;
module.exports.PRODUCT_STATUS = PRODUCT_STATUS;