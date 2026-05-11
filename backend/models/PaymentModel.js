// models/PaymentModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  paymentStatus: {
    type: DataTypes.ENUM('Completed', 'Failed', 'Refunded'),
    defaultValue: 'Completed',
    allowNull: false,
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  paymentMethod: {
    type: DataTypes.ENUM('Online', 'COD'),
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  providerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  bookingId: {
    type: DataTypes.UUID,
    allowNull: false,
  }
});

module.exports = Payment;
