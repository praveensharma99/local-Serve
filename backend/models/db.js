const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
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

sequelize.authenticate()
  .then(() => console.log('✅ PostgreSQL connected!'))
  .catch((err) => console.error('❌ DB Connection Error:', err));

module.exports = sequelize;

// const { Sequelize } = require('sequelize');
// require('dotenv').config();

// const sequelize = new Sequelize(
//   process.env.DB_NAME,
//   process.env.DB_USER,
//   process.env.DB_PASSWORD,
//   {
//     host: process.env.DB_HOST,
//     dialect: 'postgres',
//     logging: false, // Console saaf rahega
//   }
// );

// sequelize.authenticate()
//   .then(() => console.log('✅ Sequelize: PostgreSQL connected!'))
//   .catch((err) => console.error('❌ DB Connection Error:', err));

// module.exports = sequelize;