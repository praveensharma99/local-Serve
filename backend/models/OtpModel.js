const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const Otp = sequelize.define('Otp', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  otp: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    defaultValue: 'register',
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  timestamps: true,
});

module.exports = Otp;
