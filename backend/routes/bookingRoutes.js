const express = require('express');
const router = express.Router();
const { Booking, User, ProviderProfile, Payment } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');
const { sendEmail } = require('../utils/email');
const { bookingAcceptedTemplate, providerReminderTemplate } = require('../utils/emailTemplates');

// @route   POST api/bookings/request
// @desc    User sends a booking request
router.post('/request', authMiddleware, async (req, res) => {
    try {
        const {
            providerId,
            serviceCategory,
            bookingDate,
            bookingSlot,
            customerMobile,
            customerAddress,
            description,
            paymentMode,
        } = req.body;
        const userId = req.user.id;
        const mobile = String(customerMobile || '').trim();
        const address = String(customerAddress || '').trim();
        const slot = String(bookingSlot || '').trim();
        const mode = ['COD', 'Online'].includes(paymentMode) ? paymentMode : 'COD';
        const pStatus = 'Pending';

        if (!bookingDate || !slot || !mobile || !address) {
            return res.status(400).json({
                success: false,
                message: 'Date, slot, mobile number and address are required'
            });
        }

        if (!/^[6-9]\d{9}$/.test(mobile)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid 10 digit mobile number'
            });
        }

        const booking = await Booking.create({
            userId,
            providerId,
            serviceCategory,
            bookingDate,
            bookingSlot: slot,
            customerMobile: mobile,
            customerAddress: address,
            description: description?.trim() || null,
            paymentMode: mode,
            paymentStatus: pStatus,
            status: 'pending'
        });

        res.status(201).json({ success: true, message: 'Request sent!', booking });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   GET api/bookings/my-bookings
// @desc    Get all bookings for the logged-in User
router.get('/my-bookings', authMiddleware, async (req, res) => {
    try {
        const bookings = await Booking.findAll({
            where: { userId: req.user.id },
            include: [{ model: ProviderProfile, as: 'provider', include: [{ model: User, as: 'user', attributes: ['name', 'email'] }] }]
        });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


// Provider ki Bookings laane ke liye 
router.get('/provider-requests', authMiddleware, async (req, res) => {
  try {
    const providerProfile = await ProviderProfile.findOne({
      where: { userId: req.user.id }
    });

    if (!providerProfile) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    const bookings = await Booking.findAll({
      where: { providerId: providerProfile.id },
      include: [{ model: User, as: 'customer', attributes: ['name', 'email'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

//Status badalne ke liye (Approve/Reject)
router.put('/status/:id', authMiddleware, async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ['pending', 'accepted', 'rejected', 'completed'];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid booking status' });
  }

  try {
    const providerProfile = await ProviderProfile.findOne({
      where: { userId: req.user.id }
    });

    if (!providerProfile) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    const booking = await Booking.findOne({
      where: { id: req.params.id, providerId: providerProfile.id }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.status = status;
    await booking.save();

    if (status === 'accepted') {
      try {
        const customer = await User.findByPk(booking.userId);
        const providerUser = await User.findByPk(providerProfile.userId);
        if (customer && customer.email) {
          await sendEmail({
            to: customer.email,
            subject: 'Your Booking Has Been Confirmed!',
            html: bookingAcceptedTemplate({
              userName: customer.name,
              serviceCategory: booking.serviceCategory,
              bookingDate: booking.bookingDate,
              bookingSlot: booking.bookingSlot,
              providerName: providerUser?.name || 'Provider',
              providerMobile: providerProfile.phone || '',
              pricePerHour: providerProfile.pricePerHour || '0',
              customerAddress: booking.customerAddress || '',
              customerMobile: booking.customerMobile || '',
              paymentMode: booking.paymentMode || 'COD',
              paymentStatus: booking.paymentStatus || 'Pending',
            }),
            text: `Hi ${customer.name}, your ${booking.serviceCategory} booking for ${booking.bookingDate} at ${booking.bookingSlot} has been accepted by ${providerUser?.name || 'Provider'}.`,
          });
        }
      } catch (emailErr) {
        console.error('[Email] Booking accepted email failed:', emailErr.message);
      }
    }

    res.json({ success: true, message: `Booking ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT api/bookings/payment/:id
// @desc    User marks payment as completed (for COD bookings)
router.put('/payment/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.paymentStatus === 'Paid') {
      return res.status(400).json({ success: false, message: 'Payment already completed' });
    }

    booking.paymentStatus = 'Paid';
    await booking.save();

    const provider = await ProviderProfile.findByPk(booking.providerId);
    const amount = provider ? provider.pricePerHour : 0;
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);

    await Payment.create({
      amount: amount,
      paymentStatus: 'Completed',
      transactionId: `TXN-COD-${randomSuffix}`,
      paymentMethod: 'COD',
      userId: req.user.id,
      providerId: booking.providerId,
      bookingId: booking.id
    });

    res.json({ success: true, message: 'Payment marked as completed', booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST api/bookings/test/provider-reminder
// @desc    Manually trigger provider reminder emails for today's accepted bookings
router.post('/test/provider-reminder', authMiddleware, async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const bookings = await Booking.findAll({
      where: {
        bookingDate: todayStr,
        status: 'accepted',
      },
      include: [
        { model: User, as: 'customer', attributes: ['name', 'email'] },
        { model: ProviderProfile, as: 'provider', include: [{ model: User, as: 'user', attributes: ['name', 'email'] }] },
      ],
    });

    let sentCount = 0;
    const errors = [];

    for (const booking of bookings) {
      const providerUser = booking.provider?.user;
      const customer = booking.customer;
      if (!booking.provider) {
        errors.push({ bookingId: booking.id, error: 'No provider found' });
        continue;
      }
      if (providerUser && providerUser.email) {
        try {
          await sendEmail({
            to: providerUser.email,
            subject: 'Reminder: You have a booking today!',
            html: providerReminderTemplate({
              providerName: providerUser.name,
              serviceCategory: booking.serviceCategory,
              bookingDate: booking.bookingDate,
              bookingSlot: booking.bookingSlot,
              customerName: customer?.name || 'Customer',
              customerMobile: booking.customerMobile,
              customerAddress: booking.customerAddress,
            }),
            text: `Hi ${providerUser.name}, you have a ${booking.serviceCategory} appointment today at ${booking.bookingSlot}.`,
          });
          sentCount++;
        } catch (emailErr) {
          errors.push({ bookingId: booking.id, error: emailErr.message });
        }
      } else {
        errors.push({ bookingId: booking.id, error: 'Provider has no email' });
      }
    }

    res.json({
      success: true,
      message: `Sent ${sentCount} reminder email(s). Found ${bookings.length} accepted booking(s) for today (${todayStr}).`,
      sentCount,
      totalFound: bookings.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
