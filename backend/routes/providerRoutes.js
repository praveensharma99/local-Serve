const express = require('express');
const router = express.Router();
const ProviderProfile = require('../models/providerModel');
const User = require('../models/UserModel');
const authMiddleware = require('../middleware/authMiddleware');

// Provider ki apni profile fetch karne ka rasta
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        // req.user.id humein token se milta hai
        const profile = await ProviderProfile.findOne({
            where: { userId: req.user.id },
            include: [{ model: User, as: 'user', attributes: ['name', 'email', 'city', 'state'] }]
        });

        if (!profile) {
            return res.status(404).json({ success: false, message: "Profile not found!" });
        }

        res.json({
            success: true,
            profile: {
                ...profile.toJSON(),
                name: profile.user?.name,
                city: profile.user?.city,
                state: profile.user?.state
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Provider profile update route
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const { name, email, city, state, phone, category, experience, pricePerHour } = req.body;

        // Update User fields
        const user = await User.findByPk(req.user.id);
        if (user) {
            if (name) user.name = name.trim();
            if (email) user.email = email.trim().toLowerCase();
            if (city !== undefined) user.city = city.trim();
            if (state !== undefined) user.state = state.trim();
            await user.save();
        }

        // Update ProviderProfile fields
        const profile = await ProviderProfile.findOne({ where: { userId: req.user.id } });
        if (profile) {
            if (phone) profile.phone = phone.trim();
            if (category) profile.category = category.trim();
            if (experience !== undefined) profile.experience = parseInt(experience);
            if (pricePerHour !== undefined) profile.pricePerHour = parseFloat(pricePerHour);
            await profile.save();
        }

        res.json({ success: true, message: 'Profile updated successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
