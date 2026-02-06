const orderModel = require("../models/orders");
const productModel = require("../models/products");
const { STATUS, MSG } = require("../utils/http");

class Order {
  async getAllOrders(req, res) {
    try {
      let Orders = await orderModel
        .find({})
        .populate("allProduct.id", "pName pImages pPrice")
        .populate("user", "name email")
        .sort({ _id: -1 });
      if (Orders) {
        return res.status(STATUS.OK).json({ Orders });
      }
      return res.status(STATUS.OK).json({ Orders: [] });
    } catch (err) {
      console.log(err);
      return res
        .status(STATUS.SERVER_ERROR)
        .json({ error: "Failed to fetch orders" });
    }
  }

  async getOrderByUser(req, res) {
    const uId = req.params.id || req.body.uId;
    if (!uId) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ message: MSG.REQUIRED_FIELDS });
    }
    try {
      let Order = await orderModel
        .find({ user: uId })
        .populate("allProduct.id", "pName pImages pPrice")
        .populate("user", "name email")
        .sort({ _id: -1 });
      if (Order) {
        return res.status(STATUS.OK).json({ Order });
      }
      return res.status(STATUS.NOT_FOUND).json({ error: "Order not found" });
    } catch (err) {
      console.log(err);
      return res
        .status(STATUS.SERVER_ERROR)
        .json({ error: "Failed to fetch orders" });
    }
  }

  async postCreateOrder(req, res) {
    let {
      allProduct,
      user,
      amount,
      transactionId,
      address,
      phone,
      snap_token,
    } = req.body;
    if (
      !allProduct ||
      !user ||
      !amount ||
      !transactionId ||
      !address ||
      !phone
    ) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ message: MSG.REQUIRED_FIELDS });
    } else {
      try {
        let newOrder = new orderModel({
          allProduct,
          user,
          amount,
          transactionId,
          address,
          phone,
          snap_token,
        });
        let save = await newOrder.save();
        if (save) {
          // Update Product Inventory
          for (const product of allProduct) {
            await productModel.findByIdAndUpdate(product.id, {
              $inc: { pQuantity: -product.quantitiy, pSold: product.quantitiy },
            });
          }

          return res
            .status(STATUS.CREATED)
            .json({ success: "Order created successfully" });
        }
        return res
          .status(STATUS.SERVER_ERROR)
          .json({ error: "Failed to create order" });
      } catch (err) {
        console.log(err);
        return res
          .status(STATUS.SERVER_ERROR)
          .json({ error: "Failed to create order" });
      }
    }
  }

  async postUpdateOrder(req, res) {
    const oId = req.params.id || req.body.oId;
    const { status } = req.body;
    if (!oId || !status) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ message: MSG.REQUIRED_FIELDS });
    } else {
      let currentOrder = await orderModel.findByIdAndUpdate(oId, {
        status: status,
        updatedAt: Date.now(),
      });
      if (currentOrder) {
        return res
          .status(STATUS.OK)
          .json({ success: "Order updated successfully" });
      }
      return res.status(STATUS.NOT_FOUND).json({ error: "Order not found" });
    }
  }

  async postDeleteOrder(req, res) {
    const oId = req.params.id || req.body.oId;
    if (!oId) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ error: MSG.REQUIRED_FIELDS });
    } else {
      try {
        let deleteOrder = await orderModel.findByIdAndDelete(oId);
        if (deleteOrder) {
          return res
            .status(STATUS.OK)
            .json({ success: "Order deleted successfully" });
        }
        return res.status(STATUS.NOT_FOUND).json({ error: "Order not found" });
      } catch (error) {
        console.log(error);
        return res
          .status(STATUS.SERVER_ERROR)
          .json({ error: "Failed to delete order" });
      }
    }
  }
}

const ordersController = new Order();
module.exports = ordersController;