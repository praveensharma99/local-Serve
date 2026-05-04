require('dotenv').config({path: './.env'});
const ProviderProfile = require('./models/providerModel');
const User = require('./models/UserModel');

async function check() {
  try {
    const profile = await ProviderProfile.findOne({
      where: { userId: 29 },
      include: [{ model: User, as: 'user', attributes: ['name', 'email', 'city', 'state'] }]
    });
    console.log("FOUND PROFILE:", profile ? profile.toJSON() : "NOT FOUND");
  } catch(e) {
    console.error("ERROR:", e.message);
  }
  process.exit();
}
check();
