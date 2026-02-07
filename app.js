/*

================== Most Important ==================
* Issue 1 :
In uploads folder you need create 3 folder like bellow.
Folder structure will be like:
public -> uploads -> 1. products 2. customize 3. categories
*** Now This folder will automatically create when we run the server file

* Issue 2:
For admin signup just go to the auth
controller then newUser obj, you will
find a role field. role:1 for admin signup &
role: 0 or by default it for customer signup.
go user model and see the role field.

*/

const express = require("express");
const { PORT } = require("./config/config");
const app = express();
const mongoose = require("mongoose");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { STATUS, MSG } = require("./utils/http");

// Import Router
const authRouter = require("./routes/auth");
const categoryRouter = require("./routes/categories");
const productRouter = require("./routes/products");
const paymentRouter = require("./routes/payment");
const orderRouter = require("./routes/orders");
const usersRouter = require("./routes/users");
const customizeRouter = require("./routes/customize");
const connectDB = require("./config/db");

/* Create All Uploads Folder if not exists | For Uploading Images */
// setupUploadFolders();

// Database Connection
connectDB();

// Middleware
app.use(morgan("dev"));
app.use(cookieParser());
app.use(cors({
  origin: ["http://localhost:5173", "https://cuan-shop-client-app.onrender.com"],
  credentials: true
}));

// Session and Passport
const session = require("express-session");
const passport = require("passport");

app.use(session({
  secret: process.env.JWT_SECRET || 'supersecretkey',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
require("./config/passport")(passport);

app.get("/uploads/:folder/:file", (req, res) => {
  const { folder, file } = req.params;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (cloudName) {
    return res.redirect(
      `https://res.cloudinary.com/${cloudName}/image/upload/v1769427763/${folder}/${file}`
    );
  }
  res.status(STATUS.NOT_FOUND).send("File not found");
});

// app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Routes
app.use("/api", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/products", productRouter);
app.use("/api", paymentRouter);
app.use("/api/orders", orderRouter);
app.use("/api/customizes", customizeRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  // console.error(err.stack); // Optionally log stack trace

  if (err.name === "MulterError") {
    return res
      .status(STATUS.BAD_REQUEST)
      .json({ error: "Upload Error", message: err.message });
  }

  if (err.name === "CastError") {
    return res.status(STATUS.BAD_REQUEST).json({
      error: "Invalid ID",
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  if (err.code === 11000) {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    return res.status(STATUS.BAD_REQUEST).json({
      error: "Duplicate Field",
      message: `Duplicate field value: ${value}. Please use another value!`,
    });
  }

  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((val) => val.message);
    return res
      .status(STATUS.BAD_REQUEST)
      .json({ error: "Validation Error", message: errors });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(STATUS.UNAUTHORIZED).json({
      error: "Invalid Token",
      message: "Invalid token. Please log in again!",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(STATUS.UNAUTHORIZED).json({
      error: "Token Expired",
      message: "Your token has expired! Please log in again.",
    });
  }

  res.status(err.statusCode || STATUS.SERVER_ERROR).json({
    error: err.status || MSG.INTERNAL_SERVER_ERROR,
    message: err.message || "Something went wrong!",
  });
});

// Run Server
app.listen(PORT, () => {
  console.log("Server is running on ", PORT);
});
