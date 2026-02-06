const { toTitleCase, validateEmail } = require("../utils");
const bcrypt = require("bcryptjs");
const userModel = require("../models/users");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/config");
const { STATUS, MSG } = require("../utils/http");
const { USER_ROLE } = require("../models/users");
class Auth {
  async isAdmin(req, res) {
    try {
      return res.status(STATUS.OK).json({ success: true });
    } catch (err) {
      console.log(err);
      return res
        .status(STATUS.SERVER_ERROR)
        .json({ error: MSG.INTERNAL_SERVER_ERROR });
    }
  }

  async allUser(req, res) {
    try {
      let allUser = await userModel.find({});
      return res.status(STATUS.OK).json({ users: allUser });
    } catch (err) {
      console.log(err);
      return res
        .status(STATUS.SERVER_ERROR)
        .json({ error: MSG.INTERNAL_SERVER_ERROR });
    }
  }

  /* User Registration/Signup controller  */
  async postSignup(req, res) {
    let { name, email, password, cPassword } = req.body;
    let error = {};
    if (!name || !email || !password || !cPassword) {
      error = {
        ...error,
        name: "Filed must not be empty",
        email: "Filed must not be empty",
        password: "Filed must not be empty",
        cPassword: "Filed must not be empty",
      };
      return res.status(STATUS.BAD_REQUEST).json({ error });
    }
    if (name.length < 3 || name.length > 25) {
      error = { ...error, name: "Name must be 3-25 charecter" };
      return res.status(STATUS.BAD_REQUEST).json({ error });
    } else {
      if (validateEmail(email)) {
        name = toTitleCase(name);
        if ((password.length > 255) | (password.length < 8)) {
          error = {
            ...error,
            password: "Password must be 8 charecter",
            name: "",
            email: "",
          };
          return res.status(STATUS.BAD_REQUEST).json({ error });
        } else {
          // If Email & Number exists in Database then:
          try {
            password = bcrypt.hashSync(password, 10);
            const data = await userModel.findOne({ email: email });
            if (data) {
              error = {
                ...error,
                password: "",
                name: "",
                email: "Email already exists",
              };
              return res.status(STATUS.CONFLICT).json({ error });
            } else {
              let newUser = new userModel({
                name,
                email,
                password,
                // ========= Here role 1 for admin signup role 0 for customer signup =========
                userRole: USER_ROLE.CUSTOMER, // Field Name change to userRole from role (0 for customer)
              });
              newUser
                .save()
                .then((data) => {
                  return res.status(STATUS.CREATED).json({
                    success: "Account create successfully. Please login",
                  });
                })
                .catch((err) => {
                  console.log(err);
                  return res
                    .status(STATUS.SERVER_ERROR)
                    .json({ error: "Failed to create account" });
                });
            }
          } catch (err) {
            console.log(err);
            return res
              .status(STATUS.SERVER_ERROR)
              .json({ error: MSG.INTERNAL_SERVER_ERROR });
          }
        }
      } else {
        error = {
          ...error,
          password: "",
          name: "",
          email: "Email is not valid",
        };
        return res.status(STATUS.BAD_REQUEST).json({ error });
      }
    }
  }

  /* User Login/Signin controller  */
  async postSignin(req, res) {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(STATUS.BAD_REQUEST).json({
        error: "Fields must not be empty",
      });
    }
    try {
      const data = await userModel.findOne({ email: email });
      if (!data) {
        return res.status(STATUS.UNAUTHORIZED).json({
          error: "Invalid email or password",
        });
      } else {
        const login = await bcrypt.compare(password, data.password);
        if (login) {
          const token = jwt.sign(
            { _id: data._id, userRole: data.userRole },
            JWT_SECRET
          );
          return res.status(STATUS.OK).json({
            token: token,
            user: { _id: data._id, userRole: data.userRole },
          });
        } else {
          return res.status(STATUS.UNAUTHORIZED).json({
            error: "Invalid email or password",
          });
        }
      }
    } catch (err) {
      console.log(err);
      return res
        .status(STATUS.SERVER_ERROR)
        .json({ error: MSG.INTERNAL_SERVER_ERROR });
    }
  }
}

const authController = new Auth();
module.exports = authController;
