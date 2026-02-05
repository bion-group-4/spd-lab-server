require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 5000,
  DATABASE: process.env.DATABASE,
  JWT_SECRET: process.env.JWT_SECRET || "SecretKey",
  MIDTRANS_SERVER_KEY: process.env.MIDTRANS_SERVER_KEY,
  MIDTRANS_CLIENT_KEY: process.env.MIDTRANS_CLIENT_KEY,
};
