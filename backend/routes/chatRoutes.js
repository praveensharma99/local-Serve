const express = require('express');
const router = express.Router();
const { Op, fn, col } = require('sequelize');
const authMiddleware = require('../middleware/authMiddleware');
const { Booking, Message, ProviderProfile, User } = require('../models');
const { getAccessibleBooking } = require('../utils/chatAccess');

async function getChatBookingIds(userId) {
  const customerBookings = await Booking.findAll({
    where: { userId },
    attributes: ['id'],
  });

  const provider = await ProviderProfile.findOne({ where: { userId } });
  const providerBookings = provider
    ? await Booking.findAll({
        where: { providerId: provider.id },
        attributes: ['id'],
      })
    : [];

  return [...customerBookings, ...providerBookings].map((booking) => booking.id);
}

router.get('/unread-counts', authMiddleware, async (req, res) => {
  try {
    const bookingIds = await getChatBookingIds(req.user.id);
    if (bookingIds.length === 0) {
      return res.json({ success: true, counts: {} });
    }

    const rows = await Message.findAll({
      where: {
        bookingId: { [Op.in]: bookingIds },
        senderId: { [Op.ne]: req.user.id },
        readAt: null,
      },
      attributes: ['bookingId', [fn('COUNT', col('id')), 'count']],
      group: ['bookingId'],
      raw: true,
    });

    const counts = rows.reduce((acc, row) => {
      acc[row.bookingId] = Number(row.count);
      return acc;
    }, {});

    res.json({ success: true, counts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/bookings/:bookingId/messages', authMiddleware, async (req, res) => {
  try {
    const booking = await getAccessibleBooking(req.params.bookingId, req.user);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    const messages = await Message.findAll({
      where: { bookingId: booking.id },
      include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'role'] }],
      order: [['createdAt', 'ASC']],
      limit: 200,
    });

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/bookings/:bookingId/read', authMiddleware, async (req, res) => {
  try {
    const booking = await getAccessibleBooking(req.params.bookingId, req.user);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    const readAt = new Date();
    await Message.update(
      { readAt },
      {
        where: {
          bookingId: booking.id,
          senderId: { [Op.ne]: req.user.id },
          readAt: null,
        },
      },
    );

    res.json({ success: true, bookingId: booking.id, readAt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
