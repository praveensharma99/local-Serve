const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const razorpay = require('../utils/razorpay');
const authMiddleware = require('../middleware/authMiddleware');
const { Booking, ProviderProfile, Payment } = require('../models');

// @route   POST /api/payments/create-order
// @desc    Create Razorpay order for a booking
router.post('/create-order', authMiddleware, async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (booking.paymentStatus === 'Paid') {
      return res.status(400).json({ success: false, message: 'Payment already completed' });
    }

    // Get provider price
    const provider = await ProviderProfile.findByPk(booking.providerId);
    const amount = provider ? Math.round(provider.pricePerHour * 100) : 10000; // paise, default ₹100

    const options = {
      amount,
      currency: 'INR',
      receipt: `booking_${bookingId.slice(0, 8)}`,
      notes: {
        bookingId: bookingId,
        userId: req.user.id,
        service: booking.serviceCategory,
      },
    };

    const order = await razorpay.orders.create(options);

    res.json({ success: true, order });
  } catch (err) {
    console.error('[Razorpay] Create order error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to create payment order' });
  }
});

// @route   POST /api/payments/verify
// @desc    Verify Razorpay payment signature & update booking
router.post('/verify', authMiddleware, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZERPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Signature valid — update booking payment status
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    booking.paymentMode = 'Online';
    booking.paymentStatus = 'Paid';
    await booking.save();

    const provider = await ProviderProfile.findByPk(booking.providerId);
    const amount = provider ? provider.pricePerHour : 0;

    await Payment.create({
      amount: amount,
      paymentStatus: 'Completed',
      transactionId: razorpay_payment_id,
      paymentMethod: 'Online',
      userId: req.user.id,
      providerId: booking.providerId,
      bookingId: booking.id
    });

    res.json({ success: true, message: 'Payment verified successfully' });
  } catch (err) {
    console.error('[Razorpay] Verify error:', err.message);
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
});

module.exports = router;
