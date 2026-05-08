const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

if (process.env.DATABASE_URL) {
  // 👉 Production (Render / Neon PostgreSQL)
  // Ensure DATABASE_URL is the DIRECT connection (no -pooler or pgbouncer)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false, // Set to console.log to debug queries if needed
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Required for Neon
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

// NOTE: DO NOT call sequelize.sync() here.
// Doing so creates a race condition because models are not imported yet.
// Sync is handled securely in server.js.

module.exports = sequelize;