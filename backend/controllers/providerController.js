const ProviderProfile = require('../models/providerModel'); // Check path

const completeOnboarding = async (req, res) => {
  try {
    const userId = req.user.id;
    const { phone, category, experience, price, aadharNo } = req.body;

    // Check if provider already exists
    const existing = await ProviderProfile.findOne({ where: { aadharNo } });
    if (existing) {
      return res.status(400).json({ success: false, message: "Aadhar number already exists!" });
    }

    const profilePicUrl = req.files['profilePic']?.[0]?.path || null;
    const aadharPdfUrl = req.files['aadharFile']?.[0]?.path || null;

    
    const provider = await ProviderProfile.create({
      userId,
      phone,
      category,
      experience,
      pricePerHour: price,
      aadharNo,
      profilePicUrl,
      aadharPdfUrl,
      status: 'pending'
    });

    res.json({ success: true, data: provider });
  } catch (err) {
    console.error("🔥 Onboarding Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ SABSE IMPORTANT: Ye line aise hi honi chahiye
module.exports = { completeOnboarding };