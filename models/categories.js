const mongoose = require("mongoose");

/** Allowed values for category status. Use this when creating/updating categories. */
const CATEGORY_STATUS = Object.freeze({
  ACTIVE: "active",
  INACTIVE: "inactive",
});

const categorySchema = new mongoose.Schema(
  {
    cName: {
      type: String,
      required: true,
    },
    cDescription: {
      type: String,
      required: true,
    },
    cImage: {
      type: String,
    },
    cStatus: {
      type: String,
      required: true,
      enum: Object.values(CATEGORY_STATUS),
      message:
        "`{VALUE}` is not a valid category status. Use: active, inactive",
    },
  },
  { timestamps: true }
);

const categoryModel = mongoose.model("categories", categorySchema);
module.exports = categoryModel;
module.exports.CATEGORY_STATUS = CATEGORY_STATUS;
