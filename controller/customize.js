const categoryModel = require("../models/categories");
const productModel = require("../models/products");
const orderModel = require("../models/orders");
const userModel = require("../models/users");
const customizeModel = require("../models/customize");
const { uploadImage, deleteImage } = require("../utils/imageStorage");
const { STATUS, MSG } = require("../utils/http");

class Customize {
  async getImages(req, res) {
    try {
      let Images = await customizeModel.find({});
      if (Images) {
        return res.status(STATUS.OK).json({ Images });
      }
      return res.status(STATUS.OK).json({ Images: [] });
    } catch (err) {
      console.log(err);
      return res
        .status(STATUS.SERVER_ERROR)
        .json({ error: "Failed to fetch images" });
    }
  }

  async uploadSlideImage(req, res) {
    let image = req.file;
    if (!image) {
      return res.status(STATUS.BAD_REQUEST).json({ error: MSG.REQUIRED_FIELD });
    }
    try {
      const filename = await uploadImage(image, "customize");
      let newCustomzie = new customizeModel({
        slideImage: filename,
      });
      let save = await newCustomzie.save();
      if (save) {
        return res
          .status(STATUS.CREATED)
          .json({ success: "Image upload successfully" });
      }
      return res
        .status(STATUS.SERVER_ERROR)
        .json({ error: "Failed to upload image" });
    } catch (err) {
      console.log(err);
      return res
        .status(STATUS.SERVER_ERROR)
        .json({ error: "Failed to upload image" });
    }
  }

  async deleteSlideImage(req, res) {
    const id = req.params.id || req.body.id;
    if (!id) {
      return res.status(STATUS.BAD_REQUEST).json({ error: MSG.REQUIRED_FIELD });
    } else {
      try {
        let deletedSlideImage = await customizeModel.findById(id);
        let deleteImageResult = await customizeModel.findByIdAndDelete(id);
        if (deleteImageResult) {
          // Delete Image from Firebase
          await deleteImage(deletedSlideImage.slideImage, "customize");
          return res
            .status(STATUS.OK)
            .json({ success: "Image deleted successfully" });
        }
        return res.status(STATUS.NOT_FOUND).json({ error: "Image not found" });
      } catch (err) {
        console.log(err);
        return res
          .status(STATUS.SERVER_ERROR)
          .json({ error: "Failed to delete image" });
      }
    }
  }

  async getAllData(req, res) {
    try {
      let Categories = await categoryModel.countDocuments({});
      let Products = await productModel.countDocuments({});
      let Orders = await orderModel.countDocuments({});
      let Users = await userModel.countDocuments({});
      if (Categories && Products && Orders) {
        return res
          .status(STATUS.OK)
          .json({ Categories, Products, Orders, Users });
      }
    } catch (err) {
      console.log(err);
      return res
        .status(STATUS.SERVER_ERROR)
        .json({ error: "Failed to fetch dashboard data" });
    }
  }
}

const customizeController = new Customize();
module.exports = customizeController;
