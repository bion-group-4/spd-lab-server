const { toTitleCase } = require("../utils");
const categoryModel = require("../models/categories");
const { CATEGORY_STATUS } = require("../models/categories");
const { uploadImage, deleteImage } = require("../utils/imageStorage");
const { STATUS, MSG } = require("../utils/http");

class Category {
  async getAllCategory(req, res) {
    try {
      let Categories = await categoryModel.find({}).sort({ _id: -1 });
      if (Categories) {
        return res.status(STATUS.OK).json({ Categories });
      }
      return res.status(STATUS.OK).json({ Categories: [] });
    } catch (err) {
      console.log(err);
      return res
        .status(STATUS.SERVER_ERROR)
        .json({ error: "Failed to fetch categories" });
    }
  }

  async postAddCategory(req, res) {
    let { cName, cDescription, cStatus } = req.body;
    let cImage = req.file;

    if (!cName || !cDescription || !cStatus || !cImage) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ error: MSG.REQUIRED_FIELDS });
    } else {
      cName = toTitleCase(cName);
      try {
        let checkCategoryExists = await categoryModel.findOne({ cName: cName });
        if (checkCategoryExists) {
          return res
            .status(STATUS.CONFLICT)
            .json({ error: "Category already exists" });
        } else {
          // Upload to Firebase
          const filename = await uploadImage(cImage, "categories");
          let newCategory = new categoryModel({
            cName,
            cDescription,
            cStatus,
            cImage: filename,
          });
          await newCategory.save();
          return res
            .status(STATUS.CREATED)
            .json({ success: "Category created successfully" });
        }
      } catch (err) {
        console.log(err);
        return res
          .status(STATUS.SERVER_ERROR)
          .json({ error: "Failed to create category" });
      }
    }
  }

  async postEditCategory(req, res) {
    const cId = req.params.id || req.body.cId;
    const { cName, cDescription, cStatus, cImage: cImageBody } = req.body;
    const cImageFile = req.file;
    if (!cId) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ error: "Category id is required" });
    }
    const updates = {};
    if (cName !== undefined && cName !== "") {
      updates.cName = toTitleCase(cName.trim());
    }
    if (cDescription !== undefined) updates.cDescription = cDescription;
    if (cStatus !== undefined) {
      const valid = Object.values(CATEGORY_STATUS);
      if (!valid.includes(cStatus)) {
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ error: `cStatus must be one of: ${valid.join(", ")}` });
      }
      updates.cStatus = cStatus;
    }
    if (cImageBody !== undefined) updates.cImage = cImageBody;
    if (Object.keys(updates).length === 0 && !cImageFile) {
      return res.status(STATUS.BAD_REQUEST).json({
        error:
          "Provide at least one field to update: cName, cDescription, cStatus, cImage (or upload a new image)",
      });
    }
    try {
      const existing = await categoryModel.findById(cId);
      if (!existing) {
        return res
          .status(STATUS.NOT_FOUND)
          .json({ error: "Category not found" });
      }
      if (updates.cName) {
        const duplicate = await categoryModel.findOne({
          cName: updates.cName,
          _id: { $ne: cId },
        });
        if (duplicate) {
          return res
            .status(STATUS.CONFLICT)
            .json({ error: "A category with this name already exists" });
        }
      }
      if (cImageFile) {
        const filename = await uploadImage(cImageFile, "categories");
        updates.cImage = filename;
        if (existing.cImage) {
          try {
            await deleteImage(existing.cImage, "categories");
          } catch (e) {
            console.log("Could not delete old category image:", e);
          }
        }
      }
      const edit = await categoryModel.findByIdAndUpdate(
        cId,
        { ...updates, updatedAt: Date.now() },
        { new: true }
      );
      return res
        .status(STATUS.OK)
        .json({ success: "Category edit successfully", category: edit });
    } catch (err) {
      console.log(err);
      return res
        .status(STATUS.SERVER_ERROR)
        .json({ error: "Failed to edit category" });
    }
  }

  async getDeleteCategory(req, res) {
    const cId = req.params.id || req.body.cId;
    if (!cId) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ error: MSG.REQUIRED_FIELDS });
    } else {
      try {
        let deletedCategoryFile = await categoryModel.findById(cId);
        let deleteCategory = await categoryModel.findByIdAndDelete(cId);
        if (deleteCategory) {
          // Delete Image from Firebase
          await deleteImage(deletedCategoryFile.cImage, "categories");
          return res
            .status(STATUS.OK)
            .json({ success: "Category deleted successfully" });
        }
        return res
          .status(STATUS.NOT_FOUND)
          .json({ error: "Category not found" });
      } catch (err) {
        console.log(err);
        return res
          .status(STATUS.SERVER_ERROR)
          .json({ error: "Failed to delete category" });
      }
    }
  }
}

const categoryController = new Category();
module.exports = categoryController;
