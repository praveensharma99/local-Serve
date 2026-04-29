const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZERPAY_KEY_ID,
  key_secret: process.env.RAZERPAY_KEY_SECRET,
});

module.exports = razorpay;
