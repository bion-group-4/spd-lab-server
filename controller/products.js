const productModel = require("../models/products");
const { uploadImage, deleteImage } = require("../utils/imageStorage");
const { STATUS, MSG } = require("../utils/http");

class Product {
  // Delete Image from uploads -> products folder
  static async deleteImages(images, mode) {
    for (var i = 0; i < images.length; i++) {
      let filename = "";
      if (mode == "file") {
        filename = images[i].filename;
      } else {
        filename = images[i];
      }
      try {
        await deleteImage(filename, "products");
      } catch (err) {
        console.log(err);
      }
    }
  }

  async getAllProduct(req, res) {
    try {
      let Products = await productModel
        .find({})
        .populate("pCategory", "_id cName")
        .sort({ _id: -1 });
      if (Products) {
        return res.status(STATUS.OK).json({ Products });
      }
      return res.status(STATUS.OK).json({ Products: [] });
    } catch (err) {
      console.log(err);
      return res
        .status(STATUS.SERVER_ERROR)
        .json({ error: "Failed to fetch products" });
    }
  }

  async postAddProduct(req, res) {
    let { pName, pDescription, pPrice, pQuantity, pCategory, pOffer, pStatus } =
      req.body;
    let images = req.files;
    // Validation
    if (
      !pName |
      !pDescription |
      !pPrice |
      !pQuantity |
      !pCategory |
      !pOffer |
      !pStatus
    ) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ error: MSG.REQUIRED_FIELDS });
    }
    // Validate Name and description
    else if (pName.length > 255 || pDescription.length > 3000) {
      return res.status(STATUS.BAD_REQUEST).json({
        error: "Name 255 & Description must not be 3000 charecter long",
      });
    }
    // Validate Images
    else if (images.length !== 2) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ error: "Must need to provide 2 images" });
    } else {
      try {
        let allImages = [];
        for (const img of images) {
          const filename = await uploadImage(img, "products");
          allImages.push(filename);
        }
        let newProduct = new productModel({
          pImages: allImages,
          pName,
          pDescription,
          pPrice,
          pQuantity,
          pCategory,
          pOffer,
          pStatus,
        });
        let save = await newProduct.save();
        if (save) {
          return res
            .status(STATUS.CREATED)
            .json({ success: "Product created successfully" });
        }
        return res
          .status(STATUS.SERVER_ERROR)
          .json({ error: "Failed to create product" });
      } catch (err) {
        console.log(err);
        return res
          .status(STATUS.SERVER_ERROR)
          .json({ error: "Failed to create product" });
      }
    }
  }

  async postEditProduct(req, res) {
    const pId = req.params.id || req.body.pId;
    let { pName, pDescription, pPrice, pQuantity, pCategory, pOffer, pStatus } =
      req.body;
    const editImages = req.files || [];

    if (!pId) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ error: "Product id is required" });
    }

    // Validate Update Images (either 0 or 2 images)
    if (editImages && editImages.length === 1) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ error: "Must need to provide 2 images" });
    }

    // Build partial update object (only update provided fields)
    let editData = {};
    if (pName !== undefined) editData.pName = pName;
    if (pDescription !== undefined) editData.pDescription = pDescription;
    if (pPrice !== undefined) editData.pPrice = pPrice;
    if (pQuantity !== undefined) editData.pQuantity = pQuantity;
    if (pCategory !== undefined) editData.pCategory = pCategory;
    if (pOffer !== undefined) editData.pOffer = pOffer;
    if (pStatus !== undefined) editData.pStatus = pStatus;

    // Validate Name and description only when provided
    if (
      (pName !== undefined && pName.length > 255) ||
      (pDescription !== undefined && pDescription.length > 3000)
    ) {
      return res.status(STATUS.BAD_REQUEST).json({
        error: "Name 255 & Description must not be 3000 charecter long",
      });
    }

    if (Object.keys(editData).length === 0 && editImages.length === 0) {
      return res.status(STATUS.BAD_REQUEST).json({
        error:
          "Provide at least one field to update (pName, pDescription, pPrice, pQuantity, pCategory, pOffer, pStatus) or upload 2 images",
      });
    }

    try {
      const existing = await productModel.findById(pId);
      if (!existing) {
        return res
          .status(STATUS.NOT_FOUND)
          .json({ error: "Product not found" });
      }

      // If new images provided, upload them and delete old ones
      if (editImages.length === 2) {
        const allEditImages = [];
        for (const img of editImages) {
          const filename = await uploadImage(img, "products");
          allEditImages.push(filename);
        }
        editData.pImages = allEditImages;
        if (existing.pImages && existing.pImages.length) {
          Product.deleteImages(existing.pImages, "string");
        }
      }

      const editProduct = await productModel.findByIdAndUpdate(pId, editData, {
        new: true,
      });
      return res.status(STATUS.OK).json({
        success: "Product edit successfully",
        product: editProduct,
      });
    } catch (err) {
      console.log(err);
      return res
        .status(STATUS.SERVER_ERROR)
        .json({ error: "Failed to edit product" });
    }
  }

  async getDeleteProduct(req, res) {
    const pId = req.params.id || req.body.pId;
    if (!pId) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ error: MSG.REQUIRED_FIELDS });
    } else {
      try {
        let deleteProductObj = await productModel.findById(pId);
        let deleteProduct = await productModel.findByIdAndDelete(pId);
        if (deleteProduct) {
          // Delete Image from uploads -> products folder
          Product.deleteImages(deleteProductObj.pImages, "string");
          return res
            .status(STATUS.OK)
            .json({ success: "Product deleted successfully" });
        }
        return res
          .status(STATUS.NOT_FOUND)
          .json({ error: "Product not found" });
      } catch (err) {
        console.log(err);
        return res
          .status(STATUS.SERVER_ERROR)
          .json({ error: "Failed to delete product" });
      }
    }
  }

  async getSingleProduct(req, res) {
    const pId = req.params.id || req.body.pId;
    if (!pId) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ error: MSG.REQUIRED_FIELDS });
    } else {
      try {
        let singleProduct = await productModel
          .findById(pId)
          .populate("pCategory", "cName")
          .populate("pRatingsReviews.user", "name email userImage");
        if (singleProduct) {
          return res.status(STATUS.OK).json({ Product: singleProduct });
        }
        return res
          .status(STATUS.NOT_FOUND)
          .json({ error: "Product not found" });
      } catch (err) {
        console.log(err);
        return res
          .status(STATUS.SERVER_ERROR)
          .json({ error: "Failed to fetch product" });
      }
    }
  }

  async getProductByCategory(req, res) {
    let { catId } = req.body;
    if (!catId) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ error: MSG.REQUIRED_FIELDS });
    } else {
      try {
        let products = await productModel
          .find({ pCategory: catId })
          .populate("pCategory", "cName");
        if (products) {
          return res.status(STATUS.OK).json({ Products: products });
        }
      } catch (err) {
        console.log(err);
        return res
          .status(STATUS.SERVER_ERROR)
          .json({ error: "Search product wrong" });
      }
    }
  }

  async getProductByPrice(req, res) {
    let { price } = req.body;
    if (!price) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ error: MSG.REQUIRED_FIELDS });
    } else {
      try {
        let products = await productModel
          .find({ pPrice: { $lt: price } })
          .populate("pCategory", "cName")
          .sort({ pPrice: -1 });
        if (products) {
          return res.status(STATUS.OK).json({ Products: products });
        }
      } catch (err) {
        console.log(err);
        return res
          .status(STATUS.SERVER_ERROR)
          .json({ error: "Filter product wrong" });
      }
    }
  }

  async getWishProduct(req, res) {
    let { productArray } = req.body;
    if (!productArray) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ error: MSG.REQUIRED_FIELDS });
    } else {
      try {
        let wishProducts = await productModel.find({
          _id: { $in: productArray },
        });
        if (wishProducts) {
          return res.status(STATUS.OK).json({ Products: wishProducts });
        }
      } catch (err) {
        console.log(err);
        return res
          .status(STATUS.SERVER_ERROR)
          .json({ error: "Filter product wrong" });
      }
    }
  }

  async getCartProduct(req, res) {
    let { productArray } = req.body;
    if (!productArray) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ error: MSG.REQUIRED_FIELDS });
    } else {
      try {
        let cartProducts = await productModel.find({
          _id: { $in: productArray },
        });
        if (cartProducts) {
          return res.status(STATUS.OK).json({ Products: cartProducts });
        }
      } catch (err) {
        console.log(err);
        return res
          .status(STATUS.SERVER_ERROR)
          .json({ error: "Cart product wrong" });
      }
    }
  }

  async postAddReview(req, res) {
    const pId = req.params.id || req.body.pId;
    let { uId, rating, review } = req.body;
    if (!pId || !rating || !review || !uId) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ error: MSG.REQUIRED_FIELDS });
    } else {
      let checkReviewRatingExists = await productModel.findOne({ _id: pId });
      if (checkReviewRatingExists.pRatingsReviews.length > 0) {
        let alreadyReviewed = checkReviewRatingExists.pRatingsReviews.some(
          (item) => item.user == uId
        );
        if (alreadyReviewed) {
          return res
            .status(STATUS.CONFLICT)
            .json({ error: "Your already reviewd the product" });
        }
      }
      try {
        let newRatingReview = await productModel.findByIdAndUpdate(pId, {
          $push: {
            pRatingsReviews: {
              review: review,
              user: uId,
              rating: rating,
            },
          },
        });
        if (newRatingReview) {
          return res
            .status(STATUS.OK)
            .json({ success: "Thanks for your review" });
        }
        return res
          .status(STATUS.SERVER_ERROR)
          .json({ error: "Failed to add review" });
      } catch (err) {
        console.log(err);
        return res
          .status(STATUS.SERVER_ERROR)
          .json({ error: "Cart product wrong" });
      }
    }
  }

  async deleteReview(req, res) {
    const pId = req.params.productId || req.body.pId;
    const rId = req.params.reviewId || req.body.rId;
    if (!rId) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ message: MSG.REQUIRED_FIELDS });
    } else {
      try {
        let reviewDelete = await productModel.findByIdAndUpdate(pId, {
          $pull: { pRatingsReviews: { _id: rId } },
        });
        if (reviewDelete) {
          return res
            .status(STATUS.OK)
            .json({ success: "Your review is deleted" });
        }
        return res.status(STATUS.NOT_FOUND).json({ error: "Review not found" });
      } catch (err) {
        console.log(err);
        return res
          .status(STATUS.SERVER_ERROR)
          .json({ error: "Failed to delete review" });
      }
    }
  }
}

const productController = new Product();
module.exports = productController;
