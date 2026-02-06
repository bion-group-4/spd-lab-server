const express = require("express");
const router = express.Router();
const usersController = require("../controller/users");
const { loginCheck, isAdmin } = require("../middleware/auth");

router.get("/", loginCheck, isAdmin, usersController.getAllUser);
router.post("/", loginCheck, isAdmin, usersController.postAddUser);

router.put("/:id", loginCheck, usersController.postEditUser);
router.delete("/:id", loginCheck, isAdmin, usersController.getDeleteUser);

router.put("/:id/password", loginCheck, usersController.changePassword);
router.get("/:id", loginCheck, usersController.getSingleUser);

module.exports = router;
