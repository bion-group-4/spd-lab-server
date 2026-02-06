const mongoose = require("mongoose");
const { DATABASE } = require("./config");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(DATABASE);
    console.log(
      `==============Mongodb Database Connected Successfully: ${conn.connection.host}==============`
    );
  } catch (err) {
    console.log("Database Not Connected !!!", err);
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose connection disconnected");
});

mongoose.connection.on("error", (err) => {
  console.log(`Mongoose connection error: ${err}`);
});

module.exports = connectDB;
