const categoryModel = require("../models/categories");
const productModel = require("../models/products");
const orderModel = require("../models/orders");
const userModel = require("../models/users");
const customizeModel = require("../models/customize");
const { uploadImage, deleteImage } = require("../utils/imageStorage");

class Customize {
  async getImages(req, res) {
    try {
      let Images = await customizeModel.find({});
      if (Images) {
        return res.json({ Images });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async uploadSlideImage(req, res) {
    let image = req.file;
    if (!image) {
      return res.json({ error: "All field required" });
    }
    try {
      const filename = await uploadImage(image, "customize");
      let newCustomzie = new customizeModel({
        slideImage: filename,
      });
      let save = await newCustomzie.save();
      if (save) {
        return res.json({ success: "Image upload successfully" });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async deleteSlideImage(req, res) {
    let { id } = req.body;
    if (!id) {
      return res.json({ error: "All field required" });
    } else {
      try {
        let deletedSlideImage = await customizeModel.findById(id);
        let deleteImageResult = await customizeModel.findByIdAndDelete(id);
        if (deleteImageResult) {
          // Delete Image from Firebase
          await deleteImage(deletedSlideImage.slideImage, "customize");
          return res.json({ success: "Image deleted successfully" });
        }
      } catch (err) {
        console.log(err);
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
        return res.json({ Categories, Products, Orders, Users });
      }
    } catch (err) {
      console.log(err);
    }
  }
}

const customizeController = new Customize();
module.exports = customizeController;
