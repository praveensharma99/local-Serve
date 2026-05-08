const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

if (process.env.DATABASE_URL) {
  // 👉 Production (Railway / Render / Vercel backend)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else {
  // 👉 Local development
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: 'postgres',
      logging: false,
    }
  );
}

// Authenticate and Sync Database
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DB Connection has been established successfully.');

    // sync() creates the table if it doesn't exist (and does nothing if it already exists)
    // Use { alter: true } if you want to update tables to match your models without dropping data
    await sequelize.sync({ force: false });
    console.log('✅ All models were synchronized successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
};

connectDB();

module.exports = sequelize;