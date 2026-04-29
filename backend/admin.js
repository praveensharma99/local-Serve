const bcrypt = require('bcryptjs');
const User = require('./models/UserModel'); // Sequelize Model ka sahi path
const sequelize = require('./models/db');    // Sequelize connection
require('dotenv').config();

const createAdmin = async () => {
    const name = "Admin";
    const email = "admin@gmail.com";
    const password = "admin123"; 
    const role = "admin";

    try {
        // 1. Connection check karo
        await sequelize.authenticate();
        
        // 2. Password hash karo
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Sequelize use karke insert karo
        // firstOrCreate use kar raha hoon taaki agar admin pehle se ho toh error na aaye
        const [admin, created] = await User.findOrCreate({
            where: { email: email },
            defaults: {
                name,
                password: hashedPassword,
                role
            }
        });

        if (created) {
            console.log("✅ Admin Account Created Successfully in Sequelize!");
            console.log("Email:", admin.email);
        } else {
            console.log("⚠️ Admin already exists with this email.");
        }
        
        process.exit(); 
    } catch (err) {
        console.error("❌ Error creating admin:", err.message);
        process.exit(1);
    }
};

createAdmin();