const sequelize = require('./db');
const User = require('./UserModel');
const ProviderProfile = require('./providerModel');
const Booking = require('./BookingModel');
const Message = require('./MessageModel');
const Service = require('./ServiceModel');
const Otp = require('./OtpModel');
const Payment = require('./PaymentModel');

// --- RELATIONSHIPS ---

User.hasMany(Booking, { foreignKey: 'userId', as: 'myBookings' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'customer' });

ProviderProfile.hasMany(Booking, { foreignKey: 'providerId', as: 'receivedRequests' });
Booking.belongsTo(ProviderProfile, { foreignKey: 'providerId', as: 'provider' });

Booking.hasMany(Message, { foreignKey: 'bookingId', as: 'messages' });
Message.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

User.hasMany(Payment, { foreignKey: 'userId', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'userId', as: 'customer' });

ProviderProfile.hasMany(Payment, { foreignKey: 'providerId', as: 'payments' });
Payment.belongsTo(ProviderProfile, { foreignKey: 'providerId', as: 'provider' });

Booking.hasOne(Payment, { foreignKey: 'bookingId', as: 'payment' });
Payment.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

module.exports = {
  sequelize,
  User,
  ProviderProfile,
  Booking,
  Message,
  Service,
  Otp,
  Payment,
};
