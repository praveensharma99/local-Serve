const { Booking, ProviderProfile } = require('../models');

async function getAccessibleBooking(bookingId, user) {
  const booking = await Booking.findByPk(bookingId, {
    include: [{ model: ProviderProfile, as: 'provider' }],
  });

  if (!booking) return null;

  const currentUserId = String(user.id);
  const isCustomer = String(booking.userId) === currentUserId;
  const isProvider = String(booking.provider?.userId) === currentUserId;

  if (!isCustomer && !isProvider) return null;

  return booking;
}

module.exports = { getAccessibleBooking };
