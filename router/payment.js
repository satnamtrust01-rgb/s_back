const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const axios = require("axios");
const crypto = require("crypto");


// Payment initiate route
router.post("/initiate", async (req, res) => {
  try {
    const { amount, mobileNumber, transactionId } = req.body;

    const payload = {
      merchantId: PHONEPE_MERCHANT_ID,
      merchantTransactionId: transactionId,
      merchantUserId: "USER" + Date.now(),
      amount: amount * 100, // in paise
      redirectUrl: `http://localhost:4200/payment-success/${transactionId}`,
      redirectMode: "POST",
      callbackUrl: `http://localhost:3000/api/payment/callback`,
      mobileNumber: mobileNumber,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    const payloadString = JSON.stringify(payload);
    const payloadBase64 = Buffer.from(payloadString).toString("base64");
    const checksum = crypto
      .createHash("sha256")
      .update(payloadBase64 + "/pg/v1/pay" + PHONEPE_SALT_KEY)
      .digest("hex");
    const finalXVerify = checksum + "###" + PHONEPE_SALT_INDEX;

    const response = await axios.post(
      `${PHONEPE_BASE_URL}/pg/v1/pay`,
      { request: payloadBase64 },
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": finalXVerify,
          "X-MERCHANT-ID": PHONEPE_MERCHANT_ID,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Payment initiation failed" });
  }
});

// Payment callback route
router.post("/callback", (req, res) => {
  console.log("PhonePe Callback:", req.body);
  res.redirect("http://localhost:4200/payment-status");
});

module.exports = router;