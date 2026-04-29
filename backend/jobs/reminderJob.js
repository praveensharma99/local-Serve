const cron = require('node-cron');
const { Booking, User, ProviderProfile } = require('../models');
const { sendEmail } = require('../utils/email');
const { providerReminderTemplate } = require('../utils/emailTemplates');

function startReminderJob() {
  cron.schedule('0 8 * * *', async () => {
    console.log('[Cron] Running daily booking reminder job...');
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

      for (const booking of bookings) {
        const providerUser = booking.provider?.user;
        const customer = booking.customer;
        if (!booking.provider) {
          console.log(`[Cron] Skipping booking ${booking.id}: no provider found`);
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
          } catch (emailErr) {
            console.error(`[Cron] Failed to send reminder for booking ${booking.id}:`, emailErr.message);
          }
        }
      }

      console.log(`[Cron] Sent ${bookings.length} reminder email(s).`);
    } catch (err) {
      console.error('[Cron] Reminder job error:', err);
    }
  }, {
    scheduled: true,
    timezone: 'Asia/Kolkata',
  });

  console.log('[Cron] Daily reminder job scheduled for 8:00 AM IST.');
}

module.exports = { startReminderJob };
