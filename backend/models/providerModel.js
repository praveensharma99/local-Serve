const { DataTypes } = require('sequelize');
const sequelize = require('./db');
const User = require('./UserModel');

const ProviderProfile = sequelize.define('ProviderProfile', {
  phone: { type: DataTypes.STRING(15) },
  category: { type: DataTypes.STRING(50) },
  experience: { type: DataTypes.INTEGER },
  pricePerHour: { type: DataTypes.DECIMAL(10, 2), field: 'price_per_hour' },
  aadharNo: { type: DataTypes.STRING(12), unique: true, field: 'aadhar_no' },
  profilePicUrl: { type: DataTypes.TEXT, field: 'profile_pic_url' },
  aadharPdfUrl: { type: DataTypes.TEXT, field: 'aadhar_pdf_url' },
  status: { type: DataTypes.STRING(20), defaultValue: 'pending' }
}, {
  tableName: 'provider_profiles',
  underscored: true // database mein price_per_hour jaisa dikhega
});

// Relationships
User.hasOne(ProviderProfile, { foreignKey: 'userId', as: 'profile' });
ProviderProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = ProviderProfile;