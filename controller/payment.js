const midtransClient = require("midtrans-client");
const {
  MIDTRANS_SERVER_KEY,
  MIDTRANS_CLIENT_KEY,
} = require("../config/config");
const { STATUS } = require("../utils/http");

class Payment {
  constructor() {
    this.snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: MIDTRANS_SERVER_KEY,
      clientKey: MIDTRANS_CLIENT_KEY,
    });
  }

  async processPayment(req, res) {
    const { orderId, amount, user_details } = req.body;

    let parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      credit_card: {
        secure: true,
      },
      customer_details: user_details,
    };

    try {
      const transaction = await this.snap.createTransaction(parameter);
      // transaction token
      let transactionToken = transaction.token;

      console.log("transactionToken:", transactionToken);
      res.json({ clientSecret: transactionToken });
    } catch (error) {
      console.error(error);
      res.status(STATUS.SERVER_ERROR).json({ error: error.message });
    }
  }
}

const paymentController = new Payment();
module.exports = paymentController;