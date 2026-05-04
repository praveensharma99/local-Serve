const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  city: {
  type: DataTypes.STRING,
  allowNull: true, // Kyunki iske bina app ka logic nahi chalega
},
state: {
  type: DataTypes.STRING,
  allowNull: true,
},
  role: { type: DataTypes.STRING, defaultValue: 'user' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }

}, {
  tableName: 'users',
  timestamps: true // created_at aur updated_at apne aap handle honge
});

module.exports = User;