const userModel = require("../models/users");
const { USER_ROLE, USER_STATUS } = require("../models/users");
const bcrypt = require("bcryptjs");
const { STATUS, MSG } = require("../utils/http");

/** Fields only admins can read or write. Non-admins get a safe subset. */
const CONFIDENTIAL_USER_FIELDS = [
  "verified",
  "status",
  "userRole",
  "storeId",
  "secretKey",
  "history",
];

/** Returns a plain object with only non-confidential fields (and no password). */
function toSafeUser(doc) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  CONFIDENTIAL_USER_FIELDS.forEach((key) => delete obj[key]);
  delete obj.password;
  return obj;
}

function isAdmin(req) {
  return req.userDetails && req.userDetails.userRole !== USER_ROLE.CUSTOMER;
}

class User {
  async getAllUser(req, res) {
    try {
      const Users = await userModel
        .find({})
        .select(
          "name email userRole storeId phoneNumber userImage verified status createdAt"
        )
        .sort({ _id: -1 });
      return res.status(STATUS.OK).json({ Users: Users || [] });
    } catch (err) {
      console.log(err);
      return res
        .status(STATUS.SERVER_ERROR)
        .json({ error: "Failed to fetch users" });
    }
  }

  async getSingleUser(req, res) {
    const uId = req.params.id || req.body.uId;
    if (!uId) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ error: "User id is required" });
    }
    const requesterId = req.userDetails && String(req.userDetails._id);
    if (!isAdmin(req) && requesterId !== String(uId)) {
      return res.status(STATUS.FORBIDDEN).json({
        error:
          "You can only view your own profile. Confidential data is admin-only.",
      });
    }
    try {
      const User = await userModel.findById(uId);
      if (!User) {
        return res.status(STATUS.NOT_FOUND).json({ error: "User not found" });
      }
      if (isAdmin(req)) {
        const userObj = User.toObject ? User.toObject() : User;
        delete userObj.password;
        return res.status(STATUS.OK).json({ User: userObj });
      }
      return res.status(STATUS.OK).json({ User: toSafeUser(User) });
    } catch (err) {
      console.log(err);
      return res
        .status(STATUS.SERVER_ERROR)
        .json({ error: "Failed to fetch user" });
    }
  }

  async postAddUser(req, res) {
    const { name, email, password, userRole, phoneNumber } = req.body;
    if (!name || !email || !password || userRole === undefined) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ message: MSG.REQUIRED_FIELDS });
    }
    const role = Number(userRole);
    const allowedRoles = [
      USER_ROLE.CUSTOMER,
      USER_ROLE.SUPER_ADMIN,
      USER_ROLE.INVENTORY_ADMIN,
      USER_ROLE.STORE_ADMIN,
    ];
    if (!allowedRoles.includes(role)) {
      return res.status(STATUS.BAD_REQUEST).json({
        error:
          "userRole must be 0 (customer), 1 (super_admin), 2 (inventory_admin), or 3 (store_admin).",
      });
    }
    const storeId = req.body.storeId || null;
    if (role === USER_ROLE.STORE_ADMIN && !storeId) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ error: "storeId is required when creating a store admin." });
    }
    try {
      const existing = await userModel.findOne({ email: email.trim() });
      if (existing) {
        return res
          .status(STATUS.CONFLICT)
          .json({ error: "User with this email already exists" });
      }
      const hashedPassword = bcrypt.hashSync(password, 10);
      const newUser = new userModel({
        name: name.trim(),
        email: email.trim(),
        password: hashedPassword,
        userRole: role,
        ...(phoneNumber != null && { phoneNumber }),
        ...(storeId && { storeId }),
      });
      await newUser.save();
      return res
        .status(STATUS.CREATED)
        .json({ success: "User created successfully" });
    } catch (err) {
      console.log(err);
      return res
        .status(STATUS.SERVER_ERROR)
        .json({ error: "Failed to create user" });
    }
  }

  async postEditUser(req, res) {
    const uId = req.params.id || req.body.uId;
    const {
      name,
      email,
      phoneNumber,
      userImage,
      userRole,
      storeId,
      verified,
      status,
    } = req.body;
    if (!uId) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ error: "User id is required" });
    }
    const requesterId = req.userDetails && String(req.userDetails._id);
    const editingSelf = requesterId === String(uId);
    const admin = isAdmin(req);

    if (!admin && !editingSelf) {
      return res
        .status(STATUS.FORBIDDEN)
        .json({ error: "You can only edit your own profile." });
    }

    const confidentialPayload = [
      userRole !== undefined,
      storeId !== undefined,
      verified !== undefined,
      status !== undefined,
    ].some(Boolean);
    if (!admin && confidentialPayload) {
      return res.status(STATUS.FORBIDDEN).json({
        error: "Only admins can update verified, status, userRole, or storeId.",
      });
    }

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber;
    if (userImage !== undefined) updates.userImage = userImage;
    if (email !== undefined) {
      const trimmed = email.trim();
      const existing = await userModel.findOne({
        email: trimmed,
        _id: { $ne: uId },
      });
      if (existing) {
        return res
          .status(STATUS.CONFLICT)
          .json({ error: "Another user already has this email" });
      }
      updates.email = trimmed;
    }

    if (admin) {
      if (verified !== undefined) updates.verified = Boolean(verified);
      if (status !== undefined) {
        const validStatuses = Object.values(USER_STATUS);
        if (!validStatuses.includes(status)) {
          return res.status(STATUS.BAD_REQUEST).json({
            error: `status must be one of: ${validStatuses.join(", ")}`,
          });
        }
        updates.status = status;
      }
      if (userRole !== undefined) {
        const role = Number(userRole);
        if (![0, 1, 2, 3].includes(role)) {
          return res
            .status(STATUS.BAD_REQUEST)
            .json({ error: "userRole must be 0, 1, 2, or 3." });
        }
        updates.userRole = role;
        if (role !== USER_ROLE.STORE_ADMIN) updates.storeId = null;
      }
      if (storeId !== undefined) updates.storeId = storeId || null;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(STATUS.BAD_REQUEST).json({
        error:
          "Provide at least one field to update. Admins may also use: userRole, storeId, verified, status.",
      });
    }
    try {
      const currentUser = await userModel.findByIdAndUpdate(
        uId,
        { ...updates, updatedAt: Date.now() },
        { new: true }
      );
      if (!currentUser) {
        return res.status(STATUS.NOT_FOUND).json({ error: "User not found" });
      }
      const responseUser = admin
        ? (() => {
            const o = currentUser.toObject
              ? currentUser.toObject()
              : currentUser;
            delete o.password;
            return o;
          })()
        : toSafeUser(currentUser);
      return res
        .status(STATUS.OK)
        .json({ success: "User updated successfully", user: responseUser });
    } catch (err) {
      console.log(err);
      return res
        .status(STATUS.SERVER_ERROR)
        .json({ error: "Failed to update user" });
    }
  }

  async getDeleteUser(req, res) {
    const uId = req.params.id || req.body.uId;
    const { status } = req.body;
    if (!uId || !status) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ message: "User id and status are required" });
    }
    const validStatuses = Object.values(USER_STATUS);
    if (!validStatuses.includes(status)) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ error: `status must be one of: ${validStatuses.join(", ")}` });
    }
    try {
      const currentUser = await userModel.findByIdAndUpdate(uId, {
        status,
        updatedAt: Date.now(),
      });
      if (currentUser) {
        return res
          .status(STATUS.OK)
          .json({ success: "User updated successfully" });
      }
      return res.status(STATUS.NOT_FOUND).json({ error: "User not found" });
    } catch (err) {
      console.log(err);
      return res
        .status(STATUS.SERVER_ERROR)
        .json({ error: "Failed to update user" });
    }
  }

  async changePassword(req, res) {
    const uId = req.params.id || req.body.uId;
    let { oldPassword, newPassword } = req.body;
    if (!uId || !oldPassword || !newPassword) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ message: MSG.REQUIRED_FIELDS });
    } else {
      const data = await userModel.findOne({ _id: uId });
      if (!data) {
        return res.status(STATUS.NOT_FOUND).json({
          error: "Invalid user",
        });
      } else {
        const oldPassCheck = await bcrypt.compare(oldPassword, data.password);
        if (oldPassCheck) {
          newPassword = bcrypt.hashSync(newPassword, 10);
          try {
            let passChange = await userModel.findByIdAndUpdate(uId, {
              password: newPassword,
            });
            if (passChange) {
              return res
                .status(STATUS.OK)
                .json({ success: "Password updated successfully" });
            }
            return res
              .status(STATUS.SERVER_ERROR)
              .json({ error: "Failed to update password" });
          } catch (err) {
            console.log(err);
            return res
              .status(STATUS.SERVER_ERROR)
              .json({ error: "Failed to update password" });
          }
        } else {
          return res.status(STATUS.BAD_REQUEST).json({
            error: "Your old password is wrong!!",
          });
        }
      }
    }
  }
}

const usersController = new User();
module.exports = usersController;
