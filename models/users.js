const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

/**
 * User roles. Use when creating users or checking access.
 * - CUSTOMER: regular buyer
 * - SUPER_ADMIN: full access (user data, all stores, inventory, etc.)
 * - INVENTORY_ADMIN: manage products, categories, stock
 * - STORE_ADMIN: manage one store only (scope by storeId)
 * Existing data: role 1 (formerly ADMIN) is treated as SUPER_ADMIN — no migration needed.
 */
const USER_ROLE = Object.freeze({
  CUSTOMER: 0,
  SUPER_ADMIN: 1,
  INVENTORY_ADMIN: 2,
  STORE_ADMIN: 3,
  // Backward compatibility: treat "ADMIN" as SUPER_ADMIN
  /** @deprecated Use SUPER_ADMIN */
  ADMIN: 1,
});

/** User account status (e.g. for soft delete / block). */
const USER_STATUS = Object.freeze({
  ACTIVE: "active",
  BLOCKED: "blocked",
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 32,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      index: { unique: true },
      match: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
    },
    password: {
      type: String,
      required: true,
    },
    userRole: {
      type: Number,
      required: true,
      enum: {
        values: [0, 1, 2, 3],
        message:
          "`{VALUE}` is not a valid user role. Use: 0 (customer), 1 (super_admin), 2 (inventory_admin), 3 (store_admin).",
      },
    },
    /** Required when userRole is STORE_ADMIN (3). References stores collection when you add it. */
    storeId: {
      type: ObjectId,
      ref: "stores",
      default: null,
    },
    phoneNumber: {
      type: Number,
    },
    userImage: {
      type: String,
      default: "user.png",
    },
    verified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: USER_STATUS.ACTIVE,
      enum: {
        values: Object.values(USER_STATUS),
        message: "`{VALUE}` is not a valid user status. Use: active, blocked.",
      },
    },
    secretKey: {
      type: String,
      default: null,
    },
    history: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

const userModel = mongoose.model("users", userSchema);
module.exports = userModel;
module.exports.USER_ROLE = USER_ROLE;
module.exports.USER_STATUS = USER_STATUS;