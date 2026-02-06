const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/config");
const userModel = require("../models/users");
const { USER_ROLE } = require("../models/users");

exports.loginCheck = (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token) {
      return res.json({ error: "Access denied, no token provided" });
    }
    token = token.replace("Bearer ", "");
    const decode = jwt.verify(token, JWT_SECRET);
    req.userDetails = decode;
    next();
  } catch (err) {
    res.json({
      error: "You must be logged in",
    });
  }
};

exports.isAuth = (req, res, next) => {
  const { loggedInUserId } = req.body;
  if (
    !loggedInUserId ||
    !req.userDetails._id ||
    loggedInUserId !== req.userDetails._id
  ) {
    return res.status(403).json({ error: "You are not authenticated" });
  }
  next();
};

/** Any non-customer (super, inventory, or store admin). Use for general admin routes. */
exports.isAdmin = async (req, res, next) => {
  try {
    const reqUser = await userModel.findById(req.userDetails._id);
    if (!reqUser || reqUser.userRole === USER_ROLE.CUSTOMER) {
      return res.status(403).json({ error: "Access denied" });
    }
    req.requester = reqUser; // for use in requireStoreAccess, etc.
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error checking admin privileges" });
  }
};

/** Only SUPER_ADMIN (e.g. view all user data, manage all stores). */
exports.isSuperAdmin = async (req, res, next) => {
  try {
    const reqUser = await userModel.findById(req.userDetails._id);
    if (!reqUser || reqUser.userRole !== USER_ROLE.SUPER_ADMIN) {
      return res
        .status(403)
        .json({ error: "Access denied. Super admin only." });
    }
    req.requester = reqUser;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error checking admin privileges" });
  }
};

/** SUPER_ADMIN or INVENTORY_ADMIN (manage products, categories, stock). */
exports.canManageInventory = async (req, res, next) => {
  try {
    const reqUser = await userModel.findById(req.userDetails._id);
    const allowed = [USER_ROLE.SUPER_ADMIN, USER_ROLE.INVENTORY_ADMIN];
    if (!reqUser || !allowed.includes(reqUser.userRole)) {
      return res
        .status(403)
        .json({ error: "Access denied. Inventory admin only." });
    }
    req.requester = reqUser;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error checking admin privileges" });
  }
};

/**
 * SUPER_ADMIN or STORE_ADMIN for the given store.
 * Expects storeId in req.params.storeId, req.body.storeId, or req.body.store.
 */
exports.requireStoreAccess = async (req, res, next) => {
  try {
    const reqUser = await userModel.findById(req.userDetails._id);
    if (!reqUser) {
      return res.status(403).json({ error: "Access denied" });
    }
    if (reqUser.userRole === USER_ROLE.SUPER_ADMIN) {
      req.requester = reqUser;
      return next();
    }
    const storeId = req.params.storeId || req.body.storeId || req.body.store;
    if (reqUser.userRole === USER_ROLE.STORE_ADMIN && reqUser.storeId) {
      if (storeId && String(reqUser.storeId) !== String(storeId)) {
        return res.status(403).json({ error: "Access denied to this store." });
      }
      req.requester = reqUser;
      return next();
    }
    return res
      .status(403)
      .json({ error: "Access denied. Store access required." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error checking store access" });
  }
};
