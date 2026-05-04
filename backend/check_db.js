require('dotenv').config({ path: './.env' });
const sequelize = require('./models/db');
const User = require('./models/UserModel');
const ProviderProfile = require('./models/providerModel');
const Booking = require('./models/BookingModel');

async function check() {
  try {
    await sequelize.authenticate();
    const users = await User.count();
    const adminUsers = await User.count({ where: { role: 'admin' }});
    const normalUsers = await User.count({ where: { role: 'user' }});
    
    const providers = await ProviderProfile.count();
    const approved = await ProviderProfile.count({ where: { status: 'approved' }});
    const pendingProviders = await ProviderProfile.count({ where: { status: 'pending' }});
    
    const bookings = await Booking.count();
    const pendingBookings = await Booking.count({ where: { status: 'pending' }});
    const completedBookings = await Booking.count({ where: { status: 'completed' }});
    
    console.log({
      totalUsers: users,
      adminUsers,
      normalUsers,
      totalProviders: providers,
      approvedProviders: approved,
      pendingProviders,
      totalBookings: bookings,
      pendingBookings,
      completedBookings
    });
    process.exit(0);
  } catch(e) {
    console.error(e);
  }
}

check();
