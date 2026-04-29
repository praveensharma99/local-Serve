// models/BookingModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('./db');
//const sequelize = require('../config/db'); // Tera DB connection

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  serviceCategory: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  bookingDate: {
    type: DataTypes.DATEONLY, // Sirf date store karega (YYYY-MM-DD)
    allowNull: false,
  },
  bookingSlot: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  customerMobile: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  customerAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  paymentMode: {
    type: DataTypes.ENUM('COD', 'Online'),
    defaultValue: 'COD',
    allowNull: false,
  },
  paymentStatus: {
    type: DataTypes.ENUM('Pending', 'Paid'),
    defaultValue: 'Pending',
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'completed'),
    defaultValue: 'pending',
  }
});

module.exports = Booking;
