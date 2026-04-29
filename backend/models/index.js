const sequelize = require('./db');
const User = require('./UserModel');
const ProviderProfile = require('./providerModel');
const Booking = require('./BookingModel');
const Message = require('./MessageModel');
const Service = require('./ServiceModel');
const Otp = require('./OtpModel');

// --- RELATIONSHIPS ---

User.hasMany(Booking, { foreignKey: 'userId', as: 'myBookings' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'customer' });

ProviderProfile.hasMany(Booking, { foreignKey: 'providerId', as: 'receivedRequests' });
Booking.belongsTo(ProviderProfile, { foreignKey: 'providerId', as: 'provider' });

Booking.hasMany(Message, { foreignKey: 'bookingId', as: 'messages' });
Message.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

module.exports = {
  sequelize,
  User,
  ProviderProfile,
  Booking,
  Message,
  Service,
  Otp,
};
